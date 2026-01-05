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
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-400",
    label: "Pending",
  },
  VERIFIED: {
    bg: "bg-emerald-50 dark:bg-emerald-700/30",
    border: "border-emerald-200 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Verified",
  },
  REJECTED: {
    bg: "bg-rose-50 dark:bg-rose-900/30",
    border: "border-rose-200 dark:border-rose-700",
    text: "text-rose-700 dark:text-rose-400",
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
