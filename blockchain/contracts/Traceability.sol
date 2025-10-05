// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Traceability - Agricultural Produce Traceability Contract
/// @notice Records produce batches with immutable on-chain proofs for traceability.
/// @dev This contract focuses on clarity and simplicity without inheritance.
contract Traceability {
    /// @notice Represents a single produce batch record.
    /// @dev Strings are used for batchId and hashes to align with off-chain systems.
    struct Produce {
        string batchId;      // Unique identifier for the batch (e.g., UUID or custom code)
        string produceHash;  // Hash of the produce metadata/content (e.g., keccak256/sha256) stored as hex string
        string qrHash;       // Hash encoded in QR or related reference, stored as hex/string
        address farmer;      // Address that recorded the produce (farmer)
        uint256 timestamp;   // Block timestamp when the record was created
    }

    /// @notice Mapping from batchId to the recorded produce.
    mapping(string => Produce) private produces;

    /// @notice Emitted when a new produce batch is recorded on-chain.
    /// @param batchId The unique batch identifier
    /// @param farmer The address that recorded the batch
    /// @param produceHash The hash representing the produce data
    /// @param qrHash The QR-associated hash
    /// @param timestamp The block timestamp when the record was stored
    event ProduceRecorded(
        string batchId,
        address indexed farmer,
        string produceHash,
        string qrHash,
        uint256 timestamp
    );

    /// @notice Records a new produce batch. Reverts if the batchId already exists.
    /// @param batchId The unique batch identifier
    /// @param produceHash The hash representing the produce data (hex or string)
    /// @param qrHash The QR-associated hash (hex or string)
    function recordProduce(
        string memory batchId,
        string memory produceHash,
        string memory qrHash
    ) external {
        // Ensure the batch does not already exist by checking stored batchId length
        require(bytes(produces[batchId].batchId).length == 0, "Batch already recorded");

        // Create the record
        Produce memory p = Produce({
            batchId: batchId,
            produceHash: produceHash,
            qrHash: qrHash,
            farmer: msg.sender,
            timestamp: block.timestamp
        });

        // Persist to storage
        produces[batchId] = p;

        // Emit event for off-chain indexing/monitoring
        emit ProduceRecorded(batchId, msg.sender, produceHash, qrHash, block.timestamp);
    }

    /// @notice Returns the full Produce record for the given batchId.
    /// @dev Reverts if the batch is not found.
    /// @param batchId The unique batch identifier
    /// @return The Produce struct associated with the batchId
    function getProduce(string memory batchId) public view returns (Produce memory) {
        require(bytes(produces[batchId].batchId).length != 0, "Batch not found");
        return produces[batchId];
    }

    /// @notice Verifies whether the provided hash matches the on-chain produceHash for the batch.
    /// @param batchId The unique batch identifier
    /// @param hashToCheck The hash to compare against the stored produceHash
    /// @return True if the hashes match, false otherwise
    function verifyProduce(
        string memory batchId,
        string memory hashToCheck
    ) public view returns (bool) {
        require(bytes(produces[batchId].batchId).length != 0, "Batch not found");
        return keccak256(bytes(produces[batchId].produceHash)) == keccak256(bytes(hashToCheck));
    }
}

