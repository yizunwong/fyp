import { Slot } from "expo-router";
import FarmerLayout, {
  FarmerLayoutProvider,
} from "@/components/layout/FarmerLayout";

export default function FarmerLayoutRoute() {
  return (
    <FarmerLayoutProvider>
      <FarmerLayout>
        <Slot />
      </FarmerLayout>
    </FarmerLayoutProvider>
  );
}
