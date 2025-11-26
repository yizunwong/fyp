import { promises as fs } from "fs";
import path from "path";

type ContractConfig = {
  contractName: string;
  artifactFile: string;
  dashboardEnvKey: string;
  backendEnvKey: string;
  defaultAddress: string;
};

const contracts: ContractConfig[] = [
  {
    contractName: "SubsidyPayout",
    artifactFile: "SubsidyPayout.json",
    dashboardEnvKey: "NEXT_PUBLIC_SUBSIDY_PAYOUT_ADDRESS",
    backendEnvKey: "SUBSIDY_PAYOUT_ADDRESS",
    defaultAddress: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  },
  {
    contractName: "Traceability",
    artifactFile: "Traceability.json",
    dashboardEnvKey: "NEXT_PUBLIC_TRACEABILITY_ADDRESS",
    backendEnvKey: "TRACEABILITY_ADDRESS",
    defaultAddress: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  },
  {
    contractName: "SubsidyPayoutOracleConsumer",
    artifactFile: "SubsidyPayoutOracleConsumer.json",
    dashboardEnvKey: "NEXT_PUBLIC_SUBSIDY_ORACLE_CONSUMER_ADDRESS",
    backendEnvKey: "SUBSIDY_ORACLE_CONSUMER_ADDRESS",
    defaultAddress: "0x9A676e781A523b5d0C0e43731313A708CB607508",
  },
];

async function main() {
  const dashboardAbiDir = path.join(process.cwd(), "../dashboard/abi");
  await fs.mkdir(dashboardAbiDir, { recursive: true });

  const dashboardEnv = path.join(process.cwd(), "../dashboard", ".env");
  const backendEnv = path.join(process.cwd(), "../backend", ".env");

  const addressArgs = process.argv
    .slice(2)
    .filter((arg) => /^0x[a-fA-F0-9]{40}$/.test(arg));

  for (const [index, contract] of contracts.entries()) {
    const artifactPath = path.join(
      process.cwd(),
      "artifacts",
      "contracts",
      `${contract.contractName}.sol`,
      contract.artifactFile
    );

    const artifactRaw = await fs.readFile(artifactPath, "utf-8");
    const artifact = JSON.parse(artifactRaw);
    const address = addressArgs[index] || contract.defaultAddress;

    await fs.writeFile(
      path.join(dashboardAbiDir, contract.artifactFile),
      JSON.stringify(artifact.abi, null, 2),
      "utf-8"
    );

    await updateEnvFile(dashboardEnv, address, contract.dashboardEnvKey);
    await updateEnvFile(backendEnv, address, contract.backendEnvKey);

    console.log(
      `✔️ Exported ${contract.contractName} ABI and updated addresses in env files`
    );
  }

  if (addressArgs.length && addressArgs.length !== contracts.length) {
    console.warn(
      `Received ${addressArgs.length} addresses; expected ${contracts.length}. Falling back to defaults for missing entries.`
    );
  }
}

async function updateEnvFile(envPath: string, address: string, envKey: string) {
  let content = "";
  try {
    content = await fs.readFile(envPath, "utf-8");
  } catch {
    // file may not exist — that's fine
  }

  const line = `${envKey}=${address}`;
  const regex = new RegExp(`^${envKey}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, line);
  } else {
    content = (content ? content.trimEnd() + "\n" : "") + line + "\n";
  }

  await fs.writeFile(envPath, content, "utf-8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
