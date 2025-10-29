// src/components/farmer/farm/FarmRegistrationContent.tsx
import React from "react";
import { View } from "react-native";
import FarmFormSection from './FarmFormSection';
import FarmPreviewCard from './FarmPreviewCard';
import FarmSuccessModal from './FarmSuccessModal';

interface FarmRegistrationContentProps {
  isDesktop: boolean;
  form: any;
  formData: any;
  sizeUnits: ("HECTARE" | "ACRE" | "SQUARE_METER")[];
  cropSuggestions: string[];
  submitLabel: string;
  showSuccessModal: boolean;
  successData: any;
  onSubmit: () => void;
  onReset: () => void;
  onBackToDashboard: () => void;
  onRegisterAnother: () => void;
  onCloseSuccess: () => void;
}

export function FarmRegistrationContent({
  isDesktop,
  form,
  formData,
  sizeUnits,
  cropSuggestions,
  submitLabel,
  showSuccessModal,
  successData,
  onSubmit,
  onReset,
  onBackToDashboard,
  onRegisterAnother,
  onCloseSuccess,
}: FarmRegistrationContentProps) {
  return (
    <>
      {isDesktop ? (
        <View className="p-6">
          <View className="flex-row gap-6">
            <View className="flex-1">
              <FarmFormSection
                form={form}
                sizeUnits={sizeUnits}
                cropSuggestions={cropSuggestions}
                onSubmit={onSubmit}
                onReset={onReset}
                submitLabel={submitLabel}
              />
            </View>

            <View className="w-[360px]">
              <FarmPreviewCard formData={formData} />
            </View>
          </View>
        </View>
      ) : (
        <View className="gap-6">
          <FarmFormSection
            form={form}
            sizeUnits={sizeUnits}
            cropSuggestions={cropSuggestions}
            onSubmit={onSubmit}
            onReset={onReset}
            submitLabel={submitLabel}
          />
          <FarmPreviewCard formData={formData} compact />
        </View>
      )}

      <FarmSuccessModal
        visible={showSuccessModal}
        successData={successData}
        onBackToDashboard={onBackToDashboard}
        onRegisterAnother={onRegisterAnother}
        onClose={onCloseSuccess}
      />
    </>
  );
}
