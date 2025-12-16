import { ScrollView, View } from "react-native";
import type { PendingFarmResponseDto } from "@/api";
import { DecisionActions } from "./DecisionActions";
import { DocumentsList } from "./DocumentsList";
import { FarmerInfoCard } from "./FarmerInfoCard";
import { RegistrationHeader } from "./RegistrationHeader";
import { StatusModal } from "./StatusModal";
import type { StatusStyle } from "./RegistrationTypes";

export function RegistrationLayout({
  farm,
  statusStyle,
  onBack,
  onViewDoc,
  onApprove,
  onReject,
  onVerifyDocument,
  onRejectDocument,
  statusModal,
  onCloseModal,
  isUpdating,
  isUpdatingDocument,
  allDocumentsVerified,
}: {
  farm: PendingFarmResponseDto;
  statusStyle: StatusStyle;
  onBack: () => void;
  onViewDoc: (url?: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onVerifyDocument?: (documentId: string) => void;
  onRejectDocument?: (documentId: string) => void;
  statusModal: {
    visible: boolean;
    mode: "loading" | "success";
    message: string;
  };
  onCloseModal: () => void;
  isUpdating?: boolean;
  isUpdatingDocument?: (documentId: string) => boolean;
  allDocumentsVerified?: boolean;
}) {
  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-6 py-6">
          <RegistrationHeader
            farm={farm}
            statusStyle={statusStyle}
            onBack={onBack}
          />
          <FarmerInfoCard farm={farm} />
          <DocumentsList
            documents={farm.farmDocuments}
            onView={onViewDoc}
            onVerify={onVerifyDocument}
            onReject={onRejectDocument}
            isUpdatingDocument={isUpdatingDocument}
          />
          <DecisionActions
            onApprove={onApprove}
            onReject={onReject}
            disabled={isUpdating || !allDocumentsVerified}
            allDocumentsVerified={allDocumentsVerified}
          />
        </View>
      </ScrollView>
      <StatusModal
        visible={statusModal.visible}
        mode={statusModal.mode}
        message={statusModal.message}
        onClose={onCloseModal}
      />
    </>
  );
}
