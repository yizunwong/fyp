import { View } from "react-native";
import type { PendingFarmResponseDto } from "@/api";
import { FarmRegistrationCard } from "./FarmRegistrationCard";

export function FarmRegistrationCardList({ farms }: { farms: PendingFarmResponseDto[] }) {
  return (
    <View>
      {farms.map((farm) => (
        <FarmRegistrationCard key={farm.id} farm={farm} />
      ))}
    </View>
  );
}
