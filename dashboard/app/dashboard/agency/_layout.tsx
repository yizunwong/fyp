import { Slot } from "expo-router";
import AgencyLayout from "@/components/agency/layout/AgencyLayout";
import { AgencyLayoutProvider } from "@/components/agency/layout/AgencyLayoutContext";

export default function AgencyStackLayout() {
  return (
    <AgencyLayoutProvider>
      <AgencyLayout>
        <Slot />
      </AgencyLayout>
    </AgencyLayoutProvider>
  );
}
