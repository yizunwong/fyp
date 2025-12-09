// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {
    FunctionsClient
} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {
    FunctionsRequest
} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import "./SubsidyPayout.sol";

/// @title SubsidyPayoutOracleConsumer
/// @notice Uses Chainlink Functions to call the official flood-warning API and auto-create claims for enrolled farmers when danger thresholds are met. A separate call is used to pay approved claims.
/// @dev Set this contract as `oracle` on SubsidyPayout so it can create claims and execute payouts.
contract SubsidyPayoutOracleConsumer is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct PendingRequest {
        uint256 programsId;
        address farmer;
        string state;
        string district;
        string stationId;
        bytes32 metadataHash;
        bool exists;
    }

    address public owner;
    SubsidyPayout public payout;

    address public automationCaller; // authorized Chainlink Automation forwarder
    uint256 public autoProgramId;
    address public autoFarmer;
    string public autoState;
    string public autoDistrict;
    string public autoStationId;
    bytes32 public autoMetadataHash;

    uint64 public subscriptionId;
    bytes32 public donId;
    uint32 public gasLimit = 300000;
    string public source; // inline JS for Chainlink Functions

    mapping(bytes32 => PendingRequest) public pendingRequests;

    event OwnerUpdated(address indexed newOwner);
    event AutomationCallerUpdated(address indexed newCaller);
    event AutomationConfigUpdated(
        uint256 programsId,
        address farmer,
        string state,
        string district,
        string stationId,
        bytes32 metadataHash
    );
    event ConfigUpdated(uint64 subscriptionId, bytes32 donId, uint32 gasLimit);
    event SourceUpdated(string source);
    event WaterLevelCheckRequested(
        bytes32 indexed requestId,
        uint256 indexed programsId,
        address indexed farmer,
        string state,
        string district,
        string stationId,
        bytes32 metadataHash
    );
    event WaterLevelCheckFulfilled(
        bytes32 indexed requestId,
        uint256 indexed programsId,
        address indexed farmer,
        string state,
        string district,
        string stationId,
        uint256 waterLevelCurrent,
        uint256 waterLevelDanger,
        bool triggered,
        bool enrolled,
        uint256 claimId
    );
    event AutoClaimCreationFailed(
        bytes32 indexed requestId,
        uint256 indexed programsId,
        address indexed farmer
    );
    event WaterLevelCheckErrored(bytes32 indexed requestId, bytes error);
    event ApprovedPayoutExecuted(uint256 indexed claimId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address router,
        address payable payoutContract,
        uint64 functionsSubscriptionId,
        bytes32 functionsDonId,
        string memory defaultSource
    ) FunctionsClient(router) {
        owner = msg.sender;
        payout = SubsidyPayout(payoutContract);
        subscriptionId = functionsSubscriptionId;
        donId = functionsDonId;
        source = defaultSource;
        emit OwnerUpdated(msg.sender);
        emit AutomationCallerUpdated(address(0));
        emit AutomationConfigUpdated(0, address(0), "", "", "", 0);
        emit ConfigUpdated(subscriptionId, donId, gasLimit);
        emit SourceUpdated(defaultSource);
    }

    /// @notice Update Chainlink Functions config.
    function updateConfig(
        uint64 functionsSubscriptionId,
        bytes32 functionsDonId,
        uint32 functionsGasLimit
    ) external onlyOwner {
        subscriptionId = functionsSubscriptionId;
        donId = functionsDonId;
        gasLimit = functionsGasLimit;
        emit ConfigUpdated(subscriptionId, donId, gasLimit);
    }

    /// @notice Update the JS source used by Chainlink Functions.
    function updateSource(string calldata newSource) external onlyOwner {
        source = newSource;
        emit SourceUpdated(newSource);
    }

    /// @notice Configure which programs/claim/state/station should be used by Automation performUpkeep.
    function updateAutomationConfig(
        uint256 programsId,
        address farmer,
        string calldata state,
        string calldata district,
        string calldata stationId,
        bytes32 metadataHash
    ) external onlyOwner {
        require(bytes(state).length != 0, "State required");
        require(bytes(district).length != 0, "District required");
        require(bytes(stationId).length != 0, "Station required");
        require(farmer != address(0), "Farmer required");
        require(
            payout.isFarmerEnrolled(programsId, farmer),
            "Farmer not enrolled"
        );
        autoProgramId = programsId;
        autoFarmer = farmer;
        autoState = state;
        autoDistrict = district;
        autoStationId = stationId;
        autoMetadataHash = metadataHash;
        emit AutomationConfigUpdated(
            programsId,
            farmer,
            state,
            district,
            stationId,
            metadataHash
        );
    }

    /// @notice Authorize the Automation caller (e.g. Chainlink Automation forwarder).
    function updateAutomationCaller(address newCaller) external onlyOwner {
        require(newCaller != address(0), "Zero caller");
        automationCaller = newCaller;
        emit AutomationCallerUpdated(newCaller);
    }

    /// @notice Automation entrypoint; triggers the configured programs/claim check.
    /// @dev Meant for Chainlink Automation; reuses requestWaterLevelCheck logic.
    function performUpkeep(bytes calldata) external {
        require(
            msg.sender == automationCaller || msg.sender == owner,
            "Not automation"
        );
        require(
            autoProgramId != 0 && autoFarmer != address(0),
            "Automation config missing"
        );
        require(
            bytes(autoState).length != 0 &&
                bytes(autoDistrict).length != 0 &&
                bytes(autoStationId).length != 0,
            "Automation location missing"
        );
        _requestWaterLevelCheck(
            autoProgramId,
            autoFarmer,
            autoState,
            autoDistrict,
            autoStationId,
            autoMetadataHash
        );
    }

    /// @notice Request a water level danger check; if the API reports danger level reached, this contract will auto-create a claim for the enrolled farmer.
    /// @dev Ensure this contract is set as `oracle` in SubsidyPayout.
    function requestWaterLevelCheck(
        uint256 programsId,
        address farmer,
        string calldata state,
        string calldata district,
        string calldata stationId,
        bytes32 metadataHash
    ) external onlyOwner returns (bytes32 requestId) {
        return
            _requestWaterLevelCheck(
                programsId,
                farmer,
                state,
                district,
                stationId,
                metadataHash
            );
    }

    function _requestWaterLevelCheck(
        uint256 programsId,
        address farmer,
        string memory state,
        string memory district,
        string memory stationId,
        bytes32 metadataHash
    ) internal returns (bytes32 requestId) {
        SubsidyPayout.Program memory programs = payout.getProgram(programsId);
        require(bytes(programs.name).length != 0, "Program missing");
        require(
            programs.status == SubsidyPayout.ProgramStatus.ACTIVE,
            "Program inactive"
        );
        require(bytes(state).length != 0, "State required");
        require(bytes(district).length != 0, "District required");
        require(bytes(stationId).length != 0, "Station required");
        require(farmer != address(0), "Farmer required");
        require(
            payout.isFarmerEnrolled(programsId, farmer),
            "Farmer not enrolled"
        );

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        string[] memory args = new string[](3);
        args[0] = state;
        args[1] = district;
        args[2] = stationId;
        req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );
        pendingRequests[requestId] = PendingRequest({
            programsId: programsId,
            farmer: farmer,
            state: state,
            district: district,
            stationId: stationId,
            metadataHash: metadataHash,
            exists: true
        });

        emit WaterLevelCheckRequested(
            requestId,
            programsId,
            farmer,
            state,
            district,
            stationId,
            metadataHash
        );
    }

    /// @notice Chainlink Functions fulfillment callback.
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        PendingRequest memory pending = pendingRequests[requestId];
        require(pending.exists, "Unknown request");
        delete pendingRequests[requestId];

        if (err.length > 0) {
            emit WaterLevelCheckErrored(requestId, err);
            return;
        }

        // Values are scaled by 1e2 in the JS source to retain two decimals.
        (
            uint256 waterLevelCurrentTimes100,
            uint256 waterLevelDangerTimes100
        ) = abi.decode(response, (uint256, uint256));
        bool triggered = waterLevelDangerTimes100 > 0 &&
            waterLevelCurrentTimes100 >= waterLevelDangerTimes100;
        bool enrolled = payout.isFarmerEnrolled(
            pending.programsId,
            pending.farmer
        );
        uint256 claimId = 0;

        if (triggered && enrolled) {
            try
                payout.autoCreateClaim(
                    pending.programsId,
                    pending.farmer,
                    pending.metadataHash
                )
            returns (uint256 newClaimId) {
                claimId = newClaimId;
            } catch {
                emit AutoClaimCreationFailed(
                    requestId,
                    pending.programsId,
                    pending.farmer
                );
            }
        }

        emit WaterLevelCheckFulfilled(
            requestId,
            pending.programsId,
            pending.farmer,
            pending.state,
            pending.district,
            pending.stationId,
            waterLevelCurrentTimes100,
            waterLevelDangerTimes100,
            triggered,
            enrolled,
            claimId
        );
    }

    /// @notice Execute payout for an already approved claim (government-approved).
    /// @dev This contract must remain set as the oracle on SubsidyPayout.
    function executeApprovedPayout(uint256 claimId) external {
        require(
            msg.sender == automationCaller || msg.sender == owner,
            "Not authorized"
        );
        payout.approveAndPayout(claimId);
        emit ApprovedPayoutExecuted(claimId);
    }
}
