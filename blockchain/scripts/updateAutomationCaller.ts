import { ethers } from "ethers";

// RPC URL for Sepolia
const RPC_URL = "https://sepolia.infura.io/v3/0886163aab7443b7b22b8dda85156f29";

// Signer private key
const PRIVATE_KEY =
  "8ec7b877547c36e4ed38a2ab2d9f2c10e095c0a344197597474093aa1e7b5fbe";

// Contract info
const CONTRACT_ADDRESS = "0xB92E87E8FB2C35eFD3145cb57BDc7533f4F53a85";
const UPKEEP_ADDRESS = "0x9C74891bC8e16D718036Cc9C7A3d0291aBAE0690";

// ABI (only the function you need)
const ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "router",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "payoutContract",
        type: "address",
      },
      {
        internalType: "uint64",
        name: "functionsSubscriptionId",
        type: "uint64",
      },
      {
        internalType: "bytes32",
        name: "functionsDonId",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "defaultSource",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EmptySource",
    type: "error",
  },
  {
    inputs: [],
    name: "NoInlineSecrets",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyRouterCanFulfill",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newCaller",
        type: "address",
      },
    ],
    name: "AutomationCallerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "programsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "thresholdMm",
        type: "uint256",
      },
    ],
    name: "AutomationConfigUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "subscriptionId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "donId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "gasLimit",
        type: "uint32",
      },
    ],
    name: "ConfigUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "error",
        type: "bytes",
      },
    ],
    name: "FloodCheckErrored",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rainfallMm",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "triggered",
        type: "bool",
      },
    ],
    name: "FloodCheckFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "programsId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "thresholdMm",
        type: "uint256",
      },
    ],
    name: "FloodCheckRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "RequestFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "RequestSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "source",
        type: "string",
      },
    ],
    name: "SourceUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "autoClaimId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "autoProgramId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "autoThresholdMm",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "automationCaller",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "donId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gasLimit",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "response",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "err",
        type: "bytes",
      },
    ],
    name: "handleOracleFulfillment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "payout",
    outputs: [
      {
        internalType: "contract SubsidyPayout",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "pendingRequests",
    outputs: [
      {
        internalType: "uint256",
        name: "programsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "thresholdMm",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "performUpkeep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "programsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "thresholdMm",
        type: "uint256",
      },
    ],
    name: "requestFloodCheck",
    outputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "source",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subscriptionId",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newCaller",
        type: "address",
      },
    ],
    name: "updateAutomationCaller",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "programsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "thresholdMm",
        type: "uint256",
      },
    ],
    name: "updateAutomationConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "functionsSubscriptionId",
        type: "uint64",
      },
      {
        internalType: "bytes32",
        name: "functionsDonId",
        type: "bytes32",
      },
      {
        internalType: "uint32",
        name: "functionsGasLimit",
        type: "uint32",
      },
    ],
    name: "updateConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newSource",
        type: "string",
      },
    ],
    name: "updateSource",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  // Connect provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect to the contract
  const consumer = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  // Call the function
  console.log("Updating automation caller...");
  const tx = await consumer.updateAutomationCaller(UPKEEP_ADDRESS);
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log("Automation caller updated successfully!");
}

main().catch(console.error);
