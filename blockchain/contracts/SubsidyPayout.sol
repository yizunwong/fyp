// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SubsidyPayout - Automated subsidy disbursement aligned with programs schema
/// @notice Mirrors the backend programs schema (programs, eligibility, payout rule) and executes payouts once an oracle approves claims.
contract SubsidyPayout {
    enum ProgramType {
        DROUGHT,
        FLOOD,
        CROP_LOSS,
        MANUAL
    }

    enum ProgramStatus {
        DRAFT,
        ACTIVE
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
        uint256 maxCap; // total cap for the programs (0 = uncapped)
    }

    struct Program {
        string name;
        string description;
        ProgramType programsType;
        ProgramStatus status;
        uint256 startDate;
        uint256 endDate;
        string createdBy; // mirrors prisma createdBy string
        bytes32 metadataHash; // hash/pointer to full off-chain programs config
        PayoutRule payoutRule;
        Eligibility eligibility;
        uint256 totalDisbursed;
    }

    struct Claim {
        uint256 programsId;
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

    uint256 public nextProgramId = 1;
    uint256 public nextClaimId = 1;

    mapping(uint256 => Program) public programs;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public enrolledPrograms; // farmer => list of programsIds
    mapping(uint256 => mapping(address => bool)) public isFarmerEnrolled; // programsId => farmer enrolled
    mapping(address => uint256) public agencyFunds; // agency address => balance (wei)

    bool private reentrancyLock;

    event OwnerUpdated(address indexed owner);
    event OracleUpdated(address indexed oracle);
    event GovernmentRoleGranted(address indexed account);
    event GovernmentRoleRevoked(address indexed account);
    event FundsDeposited(address indexed from, uint256 amount);
    event ContractFunded(address indexed agency, uint256 amount);
    event ProgramCreated(
        uint256 indexed programsId,
        string name,
        ProgramType programsType,
        ProgramStatus status,
        uint256 startDate,
        uint256 endDate,
        bytes32 metadataHash,
        uint256 payoutAmount,
        uint256 payoutMaxCap
    );
    event ProgramStatusUpdated(
        uint256 indexed programsId,
        ProgramStatus status
    );
    event ProgramUpdated(
        uint256 indexed programsId,
        uint256 payoutAmount,
        uint256 payoutMaxCap
    );
    event EligibilityUpdated(uint256 indexed programsId);
    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer,
        uint256 amount,
        bytes32 metadataHash
    );
    event FarmerEnrolled(address indexed farmer, uint256 indexed programsId);
    event AutoClaimCreated(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer
    );
    event ClaimApproved(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer,
        uint256 amount
    );
    event ClaimPaid(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer,
        uint256 amount
    );
    event ClaimRejected(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer,
        string reason
    );
    event ClaimDisbursed(
        uint256 indexed claimId,
        uint256 indexed programsId,
        address indexed farmer,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGovernment() {
        require(
            msg.sender == owner || isGovernment[msg.sender],
            "Not government"
        );
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

    /// @notice Deposit funds to agency's internal balance
    function deposit() external payable {
        require(msg.value > 0, "No ETH");
        agencyFunds[msg.sender] += msg.value;
        emit ContractFunded(msg.sender, msg.value);
        emit FundsDeposited(msg.sender, msg.value);
    }

    receive() external payable {
        agencyFunds[msg.sender] += msg.value;
        emit ContractFunded(msg.sender, msg.value);
        emit FundsDeposited(msg.sender, msg.value);
    }

    /// @notice Get agency's internal balance
    function getAgencyBalance(address agency) external view returns (uint256) {
        return agencyFunds[agency];
    }

    // ---- Program lifecycle ----

    function createProgram(
        string calldata name,
        string calldata description,
        ProgramType programsType,
        ProgramStatus status,
        uint256 startDate,
        uint256 endDate,
        string calldata createdBy,
        bytes32 metadataHash,
        PayoutRule calldata payoutRule,
        Eligibility calldata eligibility
    ) external returns (uint256 programsId) {
        require(bytes(name).length > 0, "Name required");
        require(payoutRule.amount > 0, "Payout must be > 0");
        require(startDate < endDate, "Invalid dates");

        programsId = nextProgramId++;

        // store eligibility arrays in memory to storage
        Eligibility storage e = programs[programsId].eligibility;
        _setEligibility(e, eligibility);

        programs[programsId].name = name;
        programs[programsId].description = description;
        programs[programsId].programsType = programsType;
        programs[programsId].status = status;
        programs[programsId].startDate = startDate;
        programs[programsId].endDate = endDate;
        programs[programsId].createdBy = createdBy;
        programs[programsId].metadataHash = metadataHash;
        programs[programsId].payoutRule = payoutRule;
        programs[programsId].totalDisbursed = 0;

        emit ProgramCreated(
            programsId,
            name,
            programsType,
            status,
            startDate,
            endDate,
            metadataHash,
            payoutRule.amount,
            payoutRule.maxCap
        );
    }

    function updateProgramStatus(
        uint256 programsId,
        ProgramStatus status
    ) external {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        p.status = status;
        emit ProgramStatusUpdated(programsId, status);
    }

    function updatePayoutRule(
        uint256 programsId,
        PayoutRule calldata payoutRule
    ) external {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(payoutRule.amount > 0, "Payout must be > 0");
        p.payoutRule = payoutRule;
        emit ProgramUpdated(programsId, payoutRule.amount, payoutRule.maxCap);
    }

    function updateEligibility(
        uint256 programsId,
        Eligibility calldata eligibility
    ) external {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        _clearEligibilityArrays(p.eligibility);
        _setEligibility(p.eligibility, eligibility);
        emit EligibilityUpdated(programsId);
    }

    // ---- Claims ----

    /// @notice Farmer opts into a programs before any automated claim generation.
    function enrollInProgram(uint256 programsId) external {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program not active");
        require(block.timestamp <= p.endDate, "Program ended");
        require(!isFarmerEnrolled[programsId][msg.sender], "Already enrolled");

        isFarmerEnrolled[programsId][msg.sender] = true;
        enrolledPrograms[msg.sender].push(programsId);
        emit FarmerEnrolled(msg.sender, programsId);
    }

    /// @notice Farmers submit a claim for a programs; amount is derived from programs payout rule.
    function submitClaim(
        uint256 programsId,
        bytes32 metadataHash
    ) external returns (uint256 claimId) {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");
        require(
            block.timestamp >= p.startDate && block.timestamp <= p.endDate,
            "Outside window"
        );
        require(
            isFarmerEnrolled[programsId][msg.sender],
            "Farmer not enrolled"
        );

        claimId = nextClaimId++;
        claims[claimId] = Claim({
            programsId: programsId,
            farmer: msg.sender,
            amount: p.payoutRule.amount,
            status: ClaimStatus.PendingReview,
            metadataHash: metadataHash,
            submittedAt: block.timestamp,
            rejectionReason: ""
        });

        emit ClaimSubmitted(
            claimId,
            programsId,
            msg.sender,
            p.payoutRule.amount,
            metadataHash
        );
    }

    /// @notice Oracle automation creates claims for all enrolled farmers when the hazard trigger occurs.
    function autoCreateClaim(
        uint256 programsId,
        address farmer,
        bytes32 metadataHash
    ) external onlyOracle returns (uint256 claimId) {
        Program storage p = programs[programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");
        require(
            block.timestamp >= p.startDate && block.timestamp <= p.endDate,
            "Outside window"
        );
        require(isFarmerEnrolled[programsId][farmer], "Farmer not enrolled");

        claimId = nextClaimId++;
        claims[claimId] = Claim({
            programsId: programsId,
            farmer: farmer,
            amount: p.payoutRule.amount,
            status: ClaimStatus.PendingReview,
            metadataHash: metadataHash,
            submittedAt: block.timestamp,
            rejectionReason: ""
        });

        emit ClaimSubmitted(
            claimId,
            programsId,
            farmer,
            p.payoutRule.amount,
            metadataHash
        );
        emit AutoClaimCreated(claimId, programsId, farmer);
    }

    /// @notice Oracle approves and pays out a claim in a single step (kept for backward compatibility).
    /// @notice Note: For new implementations, use approveClaim() then disburseClaim() separately.
    function approveAndPayout(
        uint256 claimId
    ) external onlyOracle nonReentrant {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.PendingReview, "Must be pending");
        Program storage p = programs[c.programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");
        // Oracle uses contract balance, not agency funds
        require(
            address(this).balance >= c.amount,
            "Insufficient contract balance"
        );

        // Approve first
        c.status = ClaimStatus.Approved;
        emit ClaimApproved(claimId, c.programsId, c.farmer, c.amount);

        // Then disburse
        _payoutApprovedClaim(claimId, c, p, address(0));
        emit ClaimDisbursed(claimId, c.programsId, c.farmer, c.amount);
    }

    /// @notice Reject a claim (archives it by changing status to Rejected)
    /// @param claimId The ID of the claim to reject
    /// @param reason The reason for rejection
    function rejectClaim(
        uint256 claimId,
        string calldata reason
    ) external onlyGovernment {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.PendingReview, "Not pending");
        c.status = ClaimStatus.Rejected;
        c.rejectionReason = reason;
        emit ClaimRejected(claimId, c.programsId, c.farmer, reason);
    }

    /// @notice Approve a claim (changes status to Approved, does NOT disburse funds)
    /// @param claimId The ID of the claim to approve
    function approveClaim(uint256 claimId) external onlyGovernment {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.PendingReview, "Claim must be pending");
        Program storage p = programs[c.programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");

        c.status = ClaimStatus.Approved;
        emit ClaimApproved(claimId, c.programsId, c.farmer, c.amount);
    }

    /// @notice Disburse funds for an approved claim
    /// @param claimId The ID of the approved claim to disburse
    function disburseClaim(
        uint256 claimId
    ) external onlyGovernment nonReentrant {
        Claim storage c = claims[claimId];
        require(c.status == ClaimStatus.Approved, "Claim must be approved");

        Program storage p = programs[c.programsId];
        require(bytes(p.name).length != 0, "Program missing");
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");

        // Check if agency has sufficient funds (government can use their agency funds)
        require(
            agencyFunds[msg.sender] >= c.amount,
            "Agency insufficient balance"
        );

        _payoutApprovedClaim(claimId, c, p, msg.sender);
        emit ClaimDisbursed(claimId, c.programsId, c.farmer, c.amount);
    }

    // ---- Views ----

    function getProgram(
        uint256 programsId
    ) external view returns (Program memory) {
        return programs[programsId];
    }

    function getClaim(uint256 claimId) external view returns (Claim memory) {
        return claims[claimId];
    }

    // ---- internal helpers ----

    function _payoutApprovedClaim(
        uint256 claimId,
        Claim storage c,
        Program storage p,
        address agency
    ) private {
        require(p.status == ProgramStatus.ACTIVE, "Program inactive");
        if (p.payoutRule.maxCap > 0) {
            require(
                p.totalDisbursed + c.amount <= p.payoutRule.maxCap,
                "Program cap exceeded"
            );
        }

        // If agency is provided, use agency funds; otherwise use contract balance (for oracle)
        if (agency != address(0)) {
            require(
                agencyFunds[agency] >= c.amount,
                "Agency insufficient balance"
            );
            agencyFunds[agency] -= c.amount;
        } else {
            require(
                address(this).balance >= c.amount,
                "Insufficient contract balance"
            );
        }

        p.totalDisbursed += c.amount;
        c.status = ClaimStatus.Paid;

        (bool ok, ) = c.farmer.call{value: c.amount}("");
        require(ok, "Transfer failed");

        emit ClaimPaid(claimId, c.programsId, c.farmer, c.amount);
    }

    function _setEligibility(
        Eligibility storage dest,
        Eligibility calldata src
    ) private {
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
