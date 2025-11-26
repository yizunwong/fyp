// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import "./SubsidyPayout.sol";

/// @title SubsidyPayoutOracleConsumer
/// @notice Uses Chainlink Functions to call https://api.data.gov.my/flood-warning and auto-approve payouts when rainfall crosses a threshold.
/// @dev Set this contract as `oracle` on SubsidyPayout so it can call approveAndPayout/recordTriggerHit.
contract SubsidyPayoutOracleConsumer is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct PendingRequest {
        uint256 policyId;
        uint256 claimId;
        uint256 thresholdMm;
        bool exists;
    }

    address public owner;
    SubsidyPayout public payout;

    uint64 public subscriptionId;
    bytes32 public donId;
    uint32 public gasLimit = 300000;
    string public source; // inline JS for Chainlink Functions

    mapping(bytes32 => PendingRequest) public pendingRequests;

    event OwnerUpdated(address indexed newOwner);
    event ConfigUpdated(uint64 subscriptionId, bytes32 donId, uint32 gasLimit);
    event SourceUpdated(string source);
    event FloodCheckRequested(bytes32 indexed requestId, uint256 indexed policyId, uint256 indexed claimId, uint256 thresholdMm);
    event FloodCheckFulfilled(bytes32 indexed requestId, uint256 rainfallMm, bool triggered);
    event FloodCheckErrored(bytes32 indexed requestId, bytes error);

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
        emit ConfigUpdated(subscriptionId, donId, gasLimit);
        emit SourceUpdated(defaultSource);
    }

    /// @notice Update Chainlink Functions config.
    function updateConfig(uint64 functionsSubscriptionId, bytes32 functionsDonId, uint32 functionsGasLimit) external onlyOwner {
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

    /// @notice Request a flood warning check; if threshold met, this contract will approve and payout the claim.
    /// @dev Ensure this contract is set as `oracle` in SubsidyPayout.
    function requestFloodCheck(uint256 policyId, uint256 claimId, uint256 thresholdMm) external onlyOwner returns (bytes32 requestId) {
        SubsidyPayout.Policy memory policy = payout.getPolicy(policyId);
        require(bytes(policy.name).length != 0, "Policy missing");
        require(policy.status == SubsidyPayout.PolicyStatus.ACTIVE, "Policy inactive");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        pendingRequests[requestId] = PendingRequest({
            policyId: policyId,
            claimId: claimId,
            thresholdMm: thresholdMm,
            exists: true
        });

        emit FloodCheckRequested(requestId, policyId, claimId, thresholdMm);
    }

    /// @notice Chainlink Functions fulfillment callback.
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        PendingRequest memory pending = pendingRequests[requestId];
        require(pending.exists, "Unknown request");
        delete pendingRequests[requestId];

        if (err.length > 0) {
            emit FloodCheckErrored(requestId, err);
            return;
        }

        uint256 rainfallMm = abi.decode(response, (uint256));

        // Record trigger for audit trail
        payout.recordTriggerHit(pending.policyId, _toHexString(requestId), rainfallMm);

        bool triggered = rainfallMm >= pending.thresholdMm;
        if (triggered) {
            payout.approveAndPayout(pending.claimId);
        }

        emit FloodCheckFulfilled(requestId, rainfallMm, triggered);
    }

    /// @dev Helper to convert bytes32 to hex string for event IDs.
    function _toHexString(bytes32 data) private pure returns (string memory) {
        bytes16 alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i * 2] = alphabet[uint8(data[i] >> 4)];
            str[i * 2 + 1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
