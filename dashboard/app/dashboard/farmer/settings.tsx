import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Sprout,
  ShieldCheck,
  HandCoins,
  Smartphone,
  RefreshCw,
  Wallet,
} from "lucide-react-native";
import WalletSettingsSection from "@/components/wallet/WalletSettingsSection";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import { formatEther } from "viem";
import { formatCurrency } from "@/components/farmer/farm-produce/utils";
import { useEthToMyr } from "@/hooks/useEthToMyr";

const connectionSteps = [
  "Install MetaMask on web or use the built-in AppKit button on mobile.",
  "Tap “Connect Wallet” and select the wallet that will receive subsidies and crop payments.",
  "Approve the request in your wallet to link it to your farmer profile for future transactions.",
];

const walletTips = [
  {
    title: "Keep keys safe",
    description:
      "Never share your recovery phrase. Use biometrics or hardware wallets when possible.",
    icon: ShieldCheck,
  },
  {
    title: "Use one wallet for payouts",
    description:
      "Connecting a single wallet helps keep subsidy payouts consistent and auditable.",
    icon: HandCoins,
  },
  {
    title: "Mobile ready",
    description:
      "On mobile, AppKit opens your installed wallet apps automatically.",
    icon: Smartphone,
  },
];

const highlightCards = [
  {
    title: "Receive subsidies",
    description:
      "Your connected wallet is used for subsidy releases and insurance claims, reducing delays.",
  },
  {
    title: "Sign produce updates",
    description:
      "Use the same wallet to sign important farm updates and batch submissions for traceability.",
  },
  {
    title: "Switch anytime",
    description:
      "Need a different payout wallet? Reconnect with a new address to update your profile.",
  },
];

export default function FarmerWalletSettings() {
  const { isDesktop } = useResponsiveLayout();
  const { walletAddress, publicClient } = useSubsidyPayout();
  const { ethToMyr: ethToMyrRate } = useEthToMyr();
  const [walletBalance, setWalletBalance] = useState<bigint>(0n);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useFarmerLayout({
    title: "Wallet settings",
    subtitle:
      "Connect your wallet for payouts, subsidies, and on-chain updates",
  });

  const loadBalance = async () => {
    if (!walletAddress || !publicClient) {
      setWalletBalance(0n);
      return;
    }
    setIsLoadingBalance(true);
    try {
      const balance = await publicClient.getBalance({
        address: walletAddress,
      });
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error loading wallet balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadBalance();
    // Refresh balance periodically
    const interval = setInterval(loadBalance, 10000); // Every 10 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, publicClient]);

  const balanceEthFormatted = (() => {
    const balance = formatEther(walletBalance);
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return "0.0000";
    return numBalance.toLocaleString("en-MY", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  })();
  const balanceMyr = ethToMyrRate
    ? parseFloat(formatEther(walletBalance)) * ethToMyrRate
    : null;

  return (
    <View className="flex-1">
      <View className={isDesktop ? "px-6 py-5 gap-5" : "px-4 py-4 gap-4"}>
        <WalletSettingsSection
          audience="Farmer"
          title="Connect your farmer wallet"
          subtitle="Link the wallet that will receive subsidies and sign produce updates. You stay in control—keys never leave your device."
          steps={connectionSteps}
          tips={walletTips}
        />

        {/* Wallet Balance Card */}
        <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
              <Wallet color="#047857" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Wallet Balance
              </Text>
              <Text className="text-gray-600 text-sm">
                Your connected wallet&apos;s native ETH balance
              </Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600 text-sm font-medium">
                Your Wallet Balance
              </Text>
              <TouchableOpacity
                onPress={loadBalance}
                disabled={isLoadingBalance}
                className="p-1"
              >
                <RefreshCw
                  color="#6b7280"
                  size={16}
                  style={{
                    transform: [
                      { rotate: isLoadingBalance ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-gray-900 text-2xl font-bold">
                {balanceEthFormatted} ETH
              </Text>
              {balanceMyr && (
                <Text className="text-gray-500 text-sm">
                  ≈ {formatCurrency(balanceMyr)}
                </Text>
              )}
            </View>
            {!walletAddress && (
              <Text className="text-amber-600 text-xs mt-2">
                Connect your wallet to view balance
              </Text>
            )}
          </View>
        </View>

        <View className={isDesktop ? "flex-row gap-4" : "gap-3"}>
          {highlightCards.map((card) => (
            <View
              key={card.title}
              className="flex-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
                  <Sprout color="#047857" size={18} />
                </View>
                <Text className="text-gray-900 text-base font-semibold">
                  {card.title}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm leading-relaxed">
                {card.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
