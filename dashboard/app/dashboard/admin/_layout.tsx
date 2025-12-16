import { Slot } from "expo-router";
import AdminLayout, {
  AdminLayoutProvider,
} from "@/components/layout/AdminLayout";

export default function AdminStackLayout() {
  return (
    <AdminLayoutProvider>
      <AdminLayout>
        <Slot />
      </AdminLayout>
    </AdminLayoutProvider>
  );
}

