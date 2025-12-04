import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { RegistrationLayout, STATUS_STYLES } from "@/components/agency/registration";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { usePendingFarmQuery } from "@/hooks/useFarmReview";
import { useUpdateFarmStatusMutation } from "@/hooks/useFarm";

export default function RegistrationReviewPage() {
  const params = useLocalSearchParams<{ registrationId?: string }>();
  const registrationId = Array.isArray(params.registrationId)
    ? params.registrationId[0]
    : params.registrationId;

  const { data, isLoading, error, refetch } = usePendingFarmQuery(
    registrationId ?? ""
  );
  const farm = data?.data;
  const { updateFarmStatus, isPending: isUpdatingStatus } =
    useUpdateFarmStatusMutation();
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    mode: "loading" | "success";
    message: string;
  }>({ visible: false, mode: "loading", message: "" });

  useAgencyLayout({
    title: farm ? `Review ${farm.name}` : "Review Registration",
    subtitle: "Deep dive into the farm submission and approve or reject",
  });

  const openDocument = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Failed to open document", err);
    }
  };

  const handleStatusChange = async (
    verificationStatus: "VERIFIED" | "REJECTED"
  ) => {
    if (!farm) return;
    try {
      setStatusModal({
        visible: true,
        mode: "loading",
        message:
          verificationStatus === "VERIFIED"
            ? "Approving farm..."
            : "Rejecting farm...",
      });
      await updateFarmStatus(farm.id, { verificationStatus });
      setStatusModal({
        visible: true,
        mode: "success",
        message:
          verificationStatus === "VERIFIED"
            ? "The farm has been approved."
            : "The farm has been rejected.",
      });
    } catch (err) {
      setStatusModal({ visible: false, mode: "loading", message: "" });
      Alert.alert(
        "Action failed",
        (err as Error)?.message ?? "Unable to update farm status"
      );
    }
  };

  if (!registrationId) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  if (error) {
    Alert.alert("Failed to load registration", String(error), [
      { text: "Retry", onPress: () => refetch() },
    ]);
    return null;
  }

  if (!farm) {
    return null;
  }

  const statusStyle = STATUS_STYLES[farm.verificationStatus];

  return (
    <RegistrationLayout
      farm={farm}
      statusStyle={statusStyle}
      onBack={() => router.push("/dashboard/agency/registrations" as never)}
      onViewDoc={openDocument}
      onApprove={() => handleStatusChange("VERIFIED")}
      onReject={() => handleStatusChange("REJECTED")}
      statusModal={statusModal}
      onCloseModal={() =>
        setStatusModal({ visible: false, mode: "loading", message: "" })
      }
      isUpdating={isUpdatingStatus}
    />
  );
}
