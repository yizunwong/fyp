import { Slot } from "expo-router";
import RetailerLayout, {
  RetailerLayoutProvider,
} from "@/components/layout/RetailerLayout";

export default function RetailerLayoutRoute() {
  return (
    <RetailerLayoutProvider>
      <RetailerLayout>
        <Slot />
      </RetailerLayout>
    </RetailerLayoutProvider>
  );
}
