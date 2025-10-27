import type { FC } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const FarmProduceLoadingState: FC = () => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <ActivityIndicator size="large" color="#059669" />
    <Text className="mt-3 text-gray-600">Preparing farm produce data...</Text>
  </View>
);

type FarmProduceMissingFarmStateProps = {
  onBack: () => void;
};

export const FarmProduceMissingFarmState: FC<FarmProduceMissingFarmStateProps> = ({
  onBack,
}) => (
  <View className="flex-1 items-center justify-center bg-gray-50 px-8">
    <Text className="text-gray-900 font-semibold mb-2">Farm not selected</Text>
    <Text className="text-gray-600 text-center mb-4">
      Please choose a farm from the produce overview to see batch details.
    </Text>
    <TouchableOpacity
      onPress={onBack}
      className="bg-emerald-600 px-5 py-3 rounded-lg"
    >
      <Text className="text-white font-semibold">Back to Produce Overview</Text>
    </TouchableOpacity>
  </View>
);

type FarmProduceErrorStateProps = {
  message: string;
  onBack: () => void;
  onRetry?: () => void;
};

export const FarmProduceErrorState: FC<FarmProduceErrorStateProps> = ({
  message,
  onBack,
  onRetry,
}) => (
  <View className="flex-1 items-center justify-center bg-gray-50 px-8">
    <Text className="text-red-600 font-semibold mb-2">
      Unable to load farm produce
    </Text>
    <Text className="text-gray-600 text-center mb-4">{message}</Text>
    <View className="flex-row gap-3">
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-emerald-600 px-5 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={onBack}
        className="bg-gray-200 px-5 py-3 rounded-lg"
      >
        <Text className="text-gray-800 font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  </View>
);
