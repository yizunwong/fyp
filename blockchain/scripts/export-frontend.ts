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
    dashboardEnvKey: "EXPO_PUBLIC_SUBSIDY_PAYOUT_ADDRESS",
    backendEnvKey: "SUBSIDY_PAYOUT_ADDRESS",
    defaultAddress: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  },
  {
    contractName: "Traceability",
    artifactFile: "Traceability.json",
    dashboardEnvKey: "EXPO_PUBLIC_TRACEABILITY_ADDRESS",
    backendEnvKey: "TRACEABILITY_ADDRESS",
    defaultAddress: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  },
  {
    contractName: "SubsidyPayoutOracleConsumer",
    artifactFile: "SubsidyPayoutOracleConsumer.json",
    dashboardEnvKey: "EXPO_PUBLIC_SUBSIDY_ORACLE_CONSUMER_ADDRESS",
    backendEnvKey: "SUBSIDY_ORACLE_CONSUMER_ADDRESS",
    defaultAddress: "0x9A676e781A523b5d0C0e43731313A708CB607508",
  },
];

type DeploymentInfo = {
  addresses: Record<string, string>;
  sourcePath: string;
  artifactsDir: string;
};

async function findDeployment(): Promise<DeploymentInfo | null> {
  const deploymentsRoot = path.join(process.cwd(), "ignition", "deployments");
  let entries: string[];
  try {
    entries = await fs.readdir(deploymentsRoot);
  } catch {
    return null;
  }

  const chainDirs = entries
    .filter((dir) => dir.startsWith("chain-"))
    .map((dir) => path.join(deploymentsRoot, dir));

  if (!chainDirs.length) return null;

  const sorted = await Promise.all(
    chainDirs.map(async (dir) => ({
      dir,
      mtime: (await fs.stat(dir)).mtimeMs,
    }))
  );

  sorted.sort((a, b) => b.mtime - a.mtime);

  for (const { dir } of sorted) {
    const deployedPath = path.join(dir, "deployed_addresses.json");
    try {
      const raw = await fs.readFile(deployedPath, "utf-8");
      const addresses = JSON.parse(raw) as Record<string, string>;
      return {
        addresses,
        sourcePath: deployedPath,
        artifactsDir: path.join(dir, "artifacts"),
      };
    } catch {
      continue;
    }
  }

  return null;
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

async function main() {
  const deployment = await findDeployment();
  if (!deployment) {
    console.warn(
      "No deployment addresses found under ignition/deployments; using defaults."
    );
  } else {
    console.log(
      `Using deployment addresses from ${path.relative(
        process.cwd(),
        deployment.sourcePath
      )}`
    );
  }

  const dashboardAbiDir = path.join(process.cwd(), "../dashboard/abi");
  await fs.mkdir(dashboardAbiDir, { recursive: true });

  const dashboardEnv = path.join(process.cwd(), "../dashboard", ".env");
  const backendEnv = path.join(process.cwd(), "../backend", ".env");

  for (const contract of contracts) {
    const deploymentArtifactPath = deployment
      ? path.join(
          deployment.artifactsDir,
          `Deployment#${contract.contractName}.json`
        )
      : null;
    const buildArtifactPath = path.join(
      process.cwd(),
      "artifacts",
      "contracts",
      `${contract.contractName}.sol`,
      contract.artifactFile
    );

    let artifactRaw: string;
    try {
      artifactRaw = deploymentArtifactPath
        ? await fs.readFile(deploymentArtifactPath, "utf-8")
        : await fs.readFile(buildArtifactPath, "utf-8");
    } catch {
      artifactRaw = await fs.readFile(buildArtifactPath, "utf-8");
    }

    const artifact = JSON.parse(artifactRaw);

    const address =
      deployment?.addresses[`Deployment#${contract.contractName}`] ??
      contract.defaultAddress;

    await fs.writeFile(
      path.join(dashboardAbiDir, contract.artifactFile),
      JSON.stringify(artifact.abi, null, 2),
      "utf-8"
    );

    await updateEnvFile(dashboardEnv, address, contract.dashboardEnvKey);
    await updateEnvFile(backendEnv, address, contract.backendEnvKey);

    console.log(
      `Exported ${contract.contractName} ABI and updated addresses in env files (${address})`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
