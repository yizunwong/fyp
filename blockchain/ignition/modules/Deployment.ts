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
const url = "https://api.data.gov.my/flood-warning/?state=" + (args.state || "PAHANG");
const resp = await Functions.makeHttpRequest({ url });
if (!resp || !resp.data) {
  throw Error("No data from flood-warning API");
}

const district = args.district || null;
const stationName = args.stationName || null;

const filteredData = resp.data.filter(item => {
  if (district && item.district !== district) return false;
  if (stationName && item.station_name !== stationName) return false;
  return true;
});

let maxMm = 0;
for (const item of filteredData) {
  const val = Number(item?.rainfall ?? item?.value ?? 0);
  if (!Number.isNaN(val) && val > maxMm) maxMm = val;
}

return Functions.encodeUint256(Math.round(maxMm));
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
