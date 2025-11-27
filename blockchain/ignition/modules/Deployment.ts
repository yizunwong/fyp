import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys Traceability, SubsidyPayout, and SubsidyPayoutOracleConsumer in one shot.
 *
 * Parameters you likely want to override when running on Sepolia:
 * - functionsRouter: Chainlink Functions Router address for Sepolia.
 * - subscriptionId: Your Chainlink Functions subscription ID (uint64).
 * - donId: DON identifier (bytes32) for Sepolia Functions.
 * - defaultSource: Inline JS for Functions (keeps the flood-warning example by default).
 *
 * Example run (fill in your values):
 * npx hardhat ignition deploy ./ignition/modules/SubsidyStack.ts \
 *   --network sepolia \
 *   --parameters functionsRouter=0xYourFunctionsRouter \
 *                subscriptionId=1234 \
 *                donId=0xYourDonIdBytes32
 */
export default buildModule("Deployment", (m) => {
  // ---------------- Params ----------------
  const functionsRouter = m.getParameter<string>(
    "functionsRouter",
    "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0" // replace with Sepolia Functions router
  );

  const subscriptionId = m.getParameter<number>("subscriptionId", 5971); // Chainlink Functions subId

  const donId = m.getParameter<string>(
    "donId",
    "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000" // bytes32 DON id for Sepolia
  );

  const defaultSource = m.getParameter<string>(
    "defaultSource",
    `
const state = (args && args[0]) || "PAHANG";
const district = (args && args[1]) || "";
const stationId = args && args[2];
if (!district) {
  throw Error("district arg required");
}
if (!stationId) {
  throw Error("stationId arg required");
}

const url =
  "https://api.data.gov.my/flood-warning/?contains=" +
  encodeURIComponent(state + "@state") +
  "&contains=" +
  encodeURIComponent(district + "@district");
const resp = await Functions.makeHttpRequest({ url });
if (!resp || !resp.data) {
  throw Error("No data from flood-warning API");
}

const station = resp.data.find((item) => {
  const matchesDistrict =
    (item.district || "").toLowerCase() === district.toLowerCase();
  const matchesId =
    item.station_id === stationId || item.station_code === stationId;
  return matchesDistrict && matchesId;
});
if (!station) {
  throw Error("Station not found in response");
}

const current = Number(station.water_level_current ?? station.value ?? 0);
const danger = Number(station.water_level_danger_level ?? 0);

const scaledCurrent = Math.round(current * 100); // 2 decimal places
const scaledDanger = Math.round(danger * 100);

const abi = new ethers.AbiCoder();
return abi.encode(["uint256", "uint256"], [scaledCurrent, scaledDanger]);
`.trim()
  );


  // ---------------- Deployments ----------------

  // 1) Traceability (standalone)
  const traceability = m.contract("Traceability");

  // 2) SubsidyPayout (initial oracle = deployer; we update to consumer after consumer deploy)
  const deployer = m.getAccount(0);
  const subsidyPayout = m.contract("SubsidyPayout", [deployer]);

  // 3) Oracle consumer that will auto-approve payouts
  const consumer = m.contract("SubsidyPayoutOracleConsumer", [
    functionsRouter,
    subsidyPayout,
    subscriptionId,
    donId,
    defaultSource,
  ]);

  // Wire the consumer as the oracle on SubsidyPayout
  m.call(subsidyPayout, "updateOracle", [consumer]);

  return { traceability, subsidyPayout, consumer };
});
