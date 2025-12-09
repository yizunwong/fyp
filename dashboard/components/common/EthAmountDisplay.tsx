import { View, Text } from "react-native";
import { formatEth, formatCurrency, ethToMyr } from "@/components/farmer/farm-produce/utils";
import { useEthToMyr } from "@/hooks/useEthToMyr";

interface EthAmountDisplayProps {
  ethAmount: number;
  showMyr?: boolean;
  className?: string;
  textClassName?: string;
  myrClassName?: string;
}

export default function EthAmountDisplay({
  ethAmount,
  showMyr = true,
  className,
  textClassName,
  myrClassName,
}: EthAmountDisplayProps) {
  const { ethToMyr: ethToMyrRate, isLoading } = useEthToMyr();
  const myrAmount = showMyr && ethToMyrRate ? ethToMyr(ethAmount, ethToMyrRate) : null;

  return (
    <View className={className || "flex-row items-center gap-2"}>
      <Text className={textClassName || "text-gray-900 text-sm font-bold"}>
        {formatEth(ethAmount)}
      </Text>
      {showMyr && myrAmount !== null && (
        <Text className={myrClassName || "text-gray-500 text-xs"}>
          ({formatCurrency(myrAmount)})
        </Text>
      )}
      {showMyr && isLoading && myrAmount === null && (
        <Text className={myrClassName || "text-gray-400 text-xs"}>
          (Loading...)
        </Text>
      )}
    </View>
  );
}

