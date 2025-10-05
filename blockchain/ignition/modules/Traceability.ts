// ignition/modules/Traceability.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TraceabilityDeployment", (m) => {
  // Deploy the Traceability contract (no constructor args)
  const traceability = m.contract("Traceability");

  // Export contract reference
  return { traceability };
});
