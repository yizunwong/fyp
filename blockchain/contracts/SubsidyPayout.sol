// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SubsidyPayout - Automated subsidy disbursement aligned with policy schema
/// @notice Mirrors the backend policy schema (policy, eligibility, payout rule) and executes payouts once an oracle approves claims.
contract SubsidyPayout {
    enum PolicyType {
        DROUGHT,
        FLOOD,
        CROP_LOSS,
        MANUAL
    }

    enum PolicyStatus {
        DRAFT,
        ACTIVE,
        ARCHIVED
    }

    enum PayoutFrequency {
        PER_TRIGGER,
        ANNUAL,
        MONTHLY
    }

    enum BeneficiaryCategory {
        ALL_FARMERS,
        SMALL_MEDIUM_FARMERS,
        ORGANIC_FARMERS,
        CERTIFIED_FARMERS
    }

    enum ClaimStatus {
        PendingReview,
        Approved,
        Rejected,
        Paid
    }

    struct Eligibility {
        bool hasMinFarmSize;
        bool hasMaxFarmSize;
        uint256 minFarmSize;
        uint256 maxFarmSize;
        string[] states;
        string[] districts;
        string[] cropTypes;
        string[] certifications;
    }

    struct PayoutRule {
        uint256 amount; // fixed payout per claim (wei)
        uint256 maxCap; // total cap for the policy (0 = uncapped)
        PayoutFrequency frequency;
        BeneficiaryCategory beneficiaryCategory;
    }

    struct Policy {
        string name;
        string description;
        PolicyType policyType;
        PolicyStatus status;
        uint256 startDate;
        uint256 endDate;
        string createdBy; // mirrors prisma createdBy string
        bytes32 metadataHash; // hash/pointer to full off-chain policy config
        PayoutRule payoutRule;
        Eligibility eligibility;
        uint256 totalDisbursed;
    }

    struct Claim {
        uint256 policyId;
        address farmer;
        uint256 amount;
        ClaimStatus status;
        bytes32 metadataHash; // hash/pointer to off-chain claim metadata
        uint256 submittedAt;
        string rejectionReason;
    }

    address public owner;
    address public oracle; // trusted oracle/approver for automatic payouts
    mapping(address => bool) public isGovernment; // multiple government addresses

    uint256 public nextPolicyId = 1;
    uint256 public nextClaimId = 1;

    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public enrolledPolicies; // farmer => list of policyIds
    mapping(uint256 => mapping(address => bool)) public isFarmerEnrolled; // policyId => farmer enrolled

    bool private reentrancyLock;

    event OwnerUpdated(address indexed owner);
    event OracleUpdated(address indexed oracle);
    event GovernmentRoleGranted(address indexed account);
    event GovernmentRoleRevoked(address indexed account);
    event FundsDeposited(address indexed from, uint256 amount);
    event PolicyCreated(
        uint256 indexed policyId,
        string name,
        PolicyType policyType,
        PolicyStatus status,
        uint256 startDate,
        uint256 endDate,
        bytes32 metadataHash,
        uint256 payoutAmount,
        uint256 payoutMaxCap,
        PayoutFrequency frequency,
        BeneficiaryCategory beneficiaryCategory
    );
    event PolicyStatusUpdated(uint256 indexed policyId, PolicyStatus status);
    event PolicyUpdated(
        uint256 indexed policyId,
        uint256 payoutAmount,
        uint256 payoutMaxCap,
        PayoutFrequency frequency,
        BeneficiaryCategory beneficiaryCategory
    );
    event EligibilityUpdated(uint256 indexed policyId);
    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed farmer,
        uint256 amount,
        bytes32 metadataHash
    );
    event FarmerEnrolled(address indexed farmer, uint256 indexed policyId);
    event AutoClaimCreated(uint256 indexed claimId, uint256 indexed policyId, address indexed farmer);
    event ClaimApproved(uint256 indexed claimId, uint256 indexed policyId, address indexed farmer, uint256 amount);
    event ClaimPaid(uint256 indexed claimId, uint256 indexed policyId, address indexed farmer, uint256 amount);
    event ClaimRejected(uint256 indexed claimId, uint256 indexed policyId, address indexed farmer, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGovernment() {
        require(msg.sender == owner || isGovernment[msg.sender], "Not government");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == owner, "Not oracle");
        _;
    }

    modifier nonReentrant() {
        require(!reentrancyLock, "Reentrancy blocked");
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    constructor(address initialOracle) {
        owner = msg.sender;
        isGovernment[msg.sender] = true;
        oracle = initialOracle;
        emit OwnerUpdated(msg.sender);
        emit GovernmentRoleGranted(msg.sender);
        emit OracleUpdated(initialOracle);
    }

    // ---- Admin/oracle management ----

    function updateOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero owner");
        owner = newOwner;
        emit OwnerUpdated(newOwner);
    }

    /// @notice Grant government role to an address.
    function grantGovernmentRole(address account) external onlyOwner {
        require(account != address(0), "Zero account");
        require(!isGovernment[account], "Already government");
        isGovernment[account] = true;
        emit GovernmentRoleGranted(account);
    }

    /// @notice Revoke government role from an address (owner remains implicit government).
    function revokeGovernmentRole(address account) external onlyOwner {
        require(account != address(0), "Zero account");
        require(account != owner, "Cannot revoke owner");
        require(isGovernment[account], "Not government");
        isGovernment[account] = false;
        emit GovernmentRoleRevoked(account);
    }

    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Zero oracle");
        oracle = newOracle;
        emit OracleUpdated(newOracle);
    }

    // ---- Funding ----

    function deposit() external payable {
        require(msg.value > 0, "No value");
        emit FundsDeposited(msg.sender, msg.value);
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    // ---- Policy lifecycle ----

    function createPolicy(
        string calldata name,
        string calldata description,
        PolicyType policyType,
        PolicyStatus status,
        uint256 startDate,
        uint256 endDate,
        string calldata createdBy,
        bytes32 metadataHash,
        PayoutRule calldata payoutRule,
        Eligibility calldata eligibility
    ) external onlyGovernment returns (uint256 policyId) {
        require(bytes(name).length > 0, "Name required");
        require(payoutRule.amount > 0, "Payout must be > 0");
        require(startDate < endDate, "Invalid dates");

        policyId = nextPolicyId++;

        // store eligibility arrays in memory to storage
        Eligibility storage e = policies[policyId].eligibility;
        _setEligibility(e, eligibility);

        policies[policyId].name = name;
        policies[policyId].description = description;
        policies[policyId].policyType = policyType;
        policies[policyId].status = status;
        policies[policyId].startDate = startDate;
        policies[policyId].endDate = endDate;
        policies[policyId].createdBy = createdBy;
        policies[policyId].metadataHash = metadataHash;
        policies[policyId].payoutRule = payoutRule;
        policies[policyId].totalDisbursed = 0;

        emit PolicyCreated(
            policyId,
            name,
            policyType,
            status,
            startDate,
            endDate,
            metadataHash,
            payoutRule.amount,
            payoutRule.maxCap,
            payoutRule.frequency,
            payoutRule.beneficiaryCategory
        );
    }

    function updatePolicyStatus(uint256 policyId, PolicyStatus status) external onlyGovernment {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        p.status = status;
        emit PolicyStatusUpdated(policyId, status);
    }

    function updatePayoutRule(uint256 policyId, PayoutRule calldata payoutRule) external onlyGovernment {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        require(payoutRule.amount > 0, "Payout must be > 0");
        p.payoutRule = payoutRule;
        emit PolicyUpdated(
            policyId,
            payoutRule.amount,
            payoutRule.maxCap,
            payoutRule.frequency,
            payoutRule.beneficiaryCategory
        );
    }

    function updateEligibility(uint256 policyId, Eligibility calldata eligibility) external onlyGovernment {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        _clearEligibilityArrays(p.eligibility);
        _setEligibility(p.eligibility, eligibility);
        emit EligibilityUpdated(policyId);
    }

    // ---- Claims ----

    /// @notice Farmer opts into a policy before any automated claim generation.
    function enrollInPolicy(uint256 policyId) external {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        require(p.status == PolicyStatus.ACTIVE, "Policy not active");
        require(block.timestamp <= p.endDate, "Policy ended");
        require(!isFarmerEnrolled[policyId][msg.sender], "Already enrolled");

        isFarmerEnrolled[policyId][msg.sender] = true;
        enrolledPolicies[msg.sender].push(policyId);
        emit FarmerEnrolled(msg.sender, policyId);
    }

    /// @notice Farmers submit a claim for a policy; amount is derived from policy payout rule.
    function submitClaim(uint256 policyId, bytes32 metadataHash) external returns (uint256 claimId) {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        require(p.status == PolicyStatus.ACTIVE, "Policy inactive");
        require(block.timestamp >= p.startDate && block.timestamp <= p.endDate, "Outside window");
        require(isFarmerEnrolled[policyId][msg.sender], "Farmer not enrolled");

        claimId = nextClaimId++;
        claims[claimId] = Claim({
            policyId: policyId,
            farmer: msg.sender,
            amount: p.payoutRule.amount,
            status: ClaimStatus.PendingReview,
            metadataHash: metadataHash,
            submittedAt: block.timestamp,
            rejectionReason: ""
        });

        emit ClaimSubmitted(claimId, policyId, msg.sender, p.payoutRule.amount, metadataHash);
    }

    /// @notice Oracle automation creates claims for all enrolled farmers when the hazard trigger occurs.
    function autoCreateClaim(uint256 policyId, address farmer, bytes32 metadataHash) external onlyOracle returns (uint256 claimId) {
        Policy storage p = policies[policyId];
        require(bytes(p.name).length != 0, "Policy missing");
        require(p.status == PolicyStatus.ACTIVE, "Policy inactive");
        require(block.timestamp >= p.startDate && block.timestamp <= p.endDate, "Outside window");
        require(isFarmerEnrolled[policyId][farmer], "Farmer not enrolled");

        claimId = nextClaimId++;
        claims[claimId] = Claim({
            policyId: policyId,
            farmer: farmer,
            amount: p.payoutRule.amount,
            status: ClaimStatus.PendingReview,
            metadataHash: metadataHash,
            submittedAt: block.timestamp,
            rejectionReason: ""
        });

        emit ClaimSubmitted(claimId, policyId, farmer, p.payoutRule.amount, metadataHash);
        emit AutoClaimCreated(claimId, policyId, farmer);
    }

    /// @notice Oracle approves and pays out a claim in a single step (kept for compatibility).
    function approveAndPayout(uint256 claimId) external onlyOracle nonReentrant {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.Approved, "Not approved");
        Policy storage p = policies[c.policyId];
        _payoutApprovedClaim(claimId, c, p);
    }

    function rejectClaim(uint256 claimId, string calldata reason) external onlyGovernment {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.PendingReview, "Not pending");
        c.status = ClaimStatus.Rejected;
        c.rejectionReason = reason;
        emit ClaimRejected(claimId, c.policyId, c.farmer, reason);
    }

    function approveClaim(uint256 claimId) external onlyGovernment nonReentrant {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.PendingReview, "Not pending");
        Policy storage p = policies[c.policyId];
        require(p.status == PolicyStatus.ACTIVE, "Policy inactive");
        c.status = ClaimStatus.Approved;
        emit ClaimApproved(claimId, c.policyId, c.farmer, c.amount);
        _payoutApprovedClaim(claimId, c, p);
    }

    // ---- Views ----

    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        return policies[policyId];
    }

    function getClaim(uint256 claimId) external view returns (Claim memory) {
        return claims[claimId];
    }

    // ---- internal helpers ----

    function _payoutApprovedClaim(uint256 claimId, Claim storage c, Policy storage p) private {
        require(p.status == PolicyStatus.ACTIVE, "Policy inactive");
        if (p.payoutRule.maxCap > 0) {
            require(p.totalDisbursed + c.amount <= p.payoutRule.maxCap, "Policy cap exceeded");
        }
        require(address(this).balance >= c.amount, "Insufficient contract balance");

        p.totalDisbursed += c.amount;
        c.status = ClaimStatus.Paid;

        (bool ok, ) = c.farmer.call{value: c.amount}("");
        require(ok, "Transfer failed");

        emit ClaimPaid(claimId, c.policyId, c.farmer, c.amount);
    }

    function _setEligibility(Eligibility storage dest, Eligibility calldata src) private {
        dest.hasMinFarmSize = src.hasMinFarmSize;
        dest.hasMaxFarmSize = src.hasMaxFarmSize;
        dest.minFarmSize = src.minFarmSize;
        dest.maxFarmSize = src.maxFarmSize;

        for (uint256 i = 0; i < src.states.length; i++) {
            dest.states.push(src.states[i]);
        }
        for (uint256 i = 0; i < src.districts.length; i++) {
            dest.districts.push(src.districts[i]);
        }
        for (uint256 i = 0; i < src.cropTypes.length; i++) {
            dest.cropTypes.push(src.cropTypes[i]);
        }
        for (uint256 i = 0; i < src.certifications.length; i++) {
            dest.certifications.push(src.certifications[i]);
        }
    }

    function _clearEligibilityArrays(Eligibility storage e) private {
        delete e.states;
        delete e.districts;
        delete e.cropTypes;
        delete e.certifications;
    }
}
