import { View, Text } from "react-native";
import { Sprout, ShieldCheck, HandCoins, Smartphone } from "lucide-react-native";
import WalletSettingsSection from "@/components/wallet/WalletSettingsSection";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

const connectionSteps = [
  "Install MetaMask on web or use the built-in AppKit button on mobile.",
  "Tap “Connect Wallet” and select the wallet that will receive subsidies and crop payments.",
  "Approve the request in your wallet to link it to your farmer profile for future transactions.",
];

const walletTips = [
  {
    title: "Keep keys safe",
    description: "Never share your recovery phrase. Use biometrics or hardware wallets when possible.",
    icon: ShieldCheck,
  },
  {
    title: "Use one wallet for payouts",
    description: "Connecting a single wallet helps keep subsidy payouts consistent and auditable.",
    icon: HandCoins,
  },
  {
    title: "Mobile ready",
    description: "On mobile, AppKit opens your installed wallet apps automatically.",
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

  useFarmerLayout({
    title: "Wallet settings",
    subtitle: "Connect your wallet for payouts, subsidies, and on-chain updates",
  });

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
