import { Slot } from "expo-router";
import AgencyLayout, {
  AgencyLayoutProvider,
} from "@/components/layout/AgencyLayout";

export default function AgencyStackLayout() {
  return (
    <AgencyLayoutProvider>
      <AgencyLayout>
        <Slot />
      </AgencyLayout>
    </AgencyLayoutProvider>
  );
}
