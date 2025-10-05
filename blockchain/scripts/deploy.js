// ESM script for Hardhat v3
// Deploys the Traceability contract to the selected network.

import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Traceability contract...");

  const factory = await ethers.getContractFactory("Traceability");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`Deployed Traceability contract to: ${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

