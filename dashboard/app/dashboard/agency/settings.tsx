import { View, Text } from "react-native";
import { Shield, Wallet, Link, Bell } from "lucide-react-native";
import WalletSettingsSection from "@/components/wallet/WalletSettingsSection";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

const connectionSteps = [
  "Install MetaMask on web or use the in-app AppKit button on mobile.",
  "Tap “Connect Wallet” and pick the agency account that will sign approvals.",
  "Approve the request in your wallet. Your selected address will be used for on-chain approvals and payouts.",
];

const walletTips = [
  {
    title: "Use official networks",
    description: "Mainnet and Sepolia are supported. Use Hardhat only for sandbox testing.",
    icon: Link,
  },
  {
    title: "Keep approvals secure",
    description: "Only officers with signing permission should connect. Never share seed phrases.",
    icon: Shield,
  },
  {
    title: "Enable notifications",
    description: "Turn on wallet notifications so you don’t miss approval or payout prompts.",
    icon: Bell,
  },
];

const highlightCards = [
  {
    title: "Approvals & subsidies",
    description:
      "Use your connected wallet to sign farm approvals and release subsidy payouts directly on-chain.",
  },
  {
    title: "Traceability",
    description:
      "Every approval leaves an auditable transaction hash so farmers and auditors can verify actions.",
  },
  {
    title: "Role-based access",
    description:
      "Only authenticated agency users inside the portal can trigger wallet requests from this page.",
  },
];

export default function AgencyWalletSettings() {
  const { isDesktop } = useResponsiveLayout();

  useAgencyLayout({
    title: "Wallet settings",
    subtitle: "Link the agency wallet for approvals, payouts, and audit trails",
  });

  return (
    <View className="flex-1">
      <View className={isDesktop ? "px-8 py-6 gap-5" : "px-4 py-4 gap-4"}>
        <WalletSettingsSection
          audience="Agency"
          title="Connect the agency wallet"
          subtitle="Authorize one wallet to sign approvals and payouts. You can switch accounts anytime using the connect button."
          steps={connectionSteps}
          tips={walletTips}
        />

        <View
          className={
            isDesktop ? "flex-row gap-4" : "gap-3"
          }
        >
          {highlightCards.map((card) => (
            <View
              key={card.title}
              className="flex-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
                  <Wallet color="#047857" size={18} />
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
