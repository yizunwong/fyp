import { Slot } from "expo-router";
import FarmerShell from "@/components/farmer/layout/FarmerShell";
import { FarmerLayoutProvider } from "@/components/farmer/layout/FarmerLayoutContext";

export default function FarmerLayout() {
  return (
    <FarmerLayoutProvider>
      <FarmerShell>
        <Slot />
      </FarmerShell>
    </FarmerLayoutProvider>
  );
}

