import { useState, useMemo } from "react";
import { Alert, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { RegistrationLayout, STATUS_STYLES } from "@/components/agency/registration";
import { usePendingFarmQuery } from "@/hooks/useFarmReview";
import {
  useUpdateFarmStatusMutation,
  useUpdateLandDocumentVerificationStatusMutation,
} from "@/hooks/useFarm";
import Toast from "react-native-toast-message";
import { useAppLayout } from '@/components/layout';
  
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
  const {
    updateDocumentStatus,
    isPending: isUpdatingDocumentStatus,
  } = useUpdateLandDocumentVerificationStatusMutation();
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(
    null
  );
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    mode: "loading" | "success";
    message: string;
  }>({ visible: false, mode: "loading", message: "" });

  // Check if all documents are verified
  const allDocumentsVerified = useMemo(() => {
    if (!farm?.farmDocuments || farm.farmDocuments.length === 0) {
      return false;
    }
    return farm.farmDocuments.every(
      (doc: any) => doc.verificationStatus === "VERIFIED"
    );
  }, [farm?.farmDocuments]);

  useAppLayout({
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

    if (verificationStatus === "VERIFIED" && !allDocumentsVerified) {
      Toast.show({
        type: "error",
        text1: "Cannot approve",
        text2: "All documents must be verified before approving the registration.",
      });
      return;
    }

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
      // Refetch to get updated data
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (err) {
      setStatusModal({ visible: false, mode: "loading", message: "" });
      Alert.alert(
        "Action failed",
        (err as Error)?.message ?? "Unable to update farm status"
      );
    }
  };

  const handleVerifyDocument = async (documentId: string) => {
    if (!farm) return;
    try {
      setUpdatingDocumentId(documentId);
      await updateDocumentStatus(documentId, "VERIFIED", {});
      Toast.show({
        type: "success",
        text1: "Document verified",
        text2: "The document has been marked as verified.",
      });
      refetch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: (err as Error)?.message ?? "Unable to verify document",
      });
    } finally {
      setUpdatingDocumentId(null);
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    if (!farm) return;
    Alert.prompt(
      "Reject Document",
      "Please provide a reason for rejecting this document:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          onPress: async (reason: string | undefined) => {
            if (!reason || reason.trim() === "") {
              Toast.show({
                type: "error",
                text1: "Reason required",
                text2: "Please provide a reason for rejecting the document.",
              });
              return;
            }
            try {
              setUpdatingDocumentId(documentId);
              await updateDocumentStatus(documentId, "REJECTED", {
                rejectionReason: reason.trim(),
              });
              Toast.show({
                type: "success",
                text1: "Document rejected",
                text2: "The document has been rejected.",
              });
              refetch();
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Rejection failed",
                text2: (err as Error)?.message ?? "Unable to reject document",
              });
            } finally {
              setUpdatingDocumentId(null);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const isUpdatingDocument = (documentId: string) => {
    return updatingDocumentId === documentId && isUpdatingDocumentStatus;
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
      onVerifyDocument={handleVerifyDocument}
      onRejectDocument={handleRejectDocument}
      statusModal={statusModal}
      onCloseModal={() =>
        setStatusModal({ visible: false, mode: "loading", message: "" })
      }
      isUpdating={isUpdatingStatus}
      isUpdatingDocument={isUpdatingDocument}
      allDocumentsVerified={allDocumentsVerified}
    />
  );
}
