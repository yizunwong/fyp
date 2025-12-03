import { Text, View } from "react-native";
import type { FarmListRespondDtoVerificationStatus } from "@/api";

type Props = {
  status: FarmListRespondDtoVerificationStatus;
};

const BADGE_STYLES: Record<
  FarmListRespondDtoVerificationStatus,
  { bg: string; border: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    label: "Pending",
  },
  VERIFIED: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    label: "Verified",
  },
  REJECTED: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    label: "Rejected",
  },
};

export function FarmStatusBadge({ status }: Props) {
  const style = BADGE_STYLES[status];

  return (
    <View
      className={`px-3 py-1 rounded-full border ${style.bg} ${style.border}`}
    >
      <Text className={`text-xs font-semibold ${style.text}`}>
        {style.label}
      </Text>
    </View>
  );
}

export default FarmStatusBadge;
