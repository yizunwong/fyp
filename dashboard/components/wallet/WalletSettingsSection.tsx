import React, { useEffect, useMemo, useState } from "react";
import { Platform, Text, View } from "react-native";
import { ShieldCheck, Smartphone, Wallet } from "lucide-react-native";
import ConnectWalletButton from "./Connect";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCurrentAddress } from "./utils/connectMetaMask";

type Tip = {
  title: string;
  description: string;
  icon?: typeof Wallet;
};

interface WalletSettingsSectionProps {
  audience: "Agency" | "Farmer";
  title: string;
  subtitle: string;
  steps: string[];
  tips: Tip[];
}

export default function WalletSettingsSection({
  audience,
  title,
  subtitle,
  steps,
  tips,
}: WalletSettingsSectionProps) {
  const { isDesktop } = useResponsiveLayout();
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      setConnectedAddress(getCurrentAddress());
    }
  }, []);

  const statusText = useMemo(() => {
    if (connectedAddress) {
      return `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;
    }
    if (Platform.OS === "web") return "Not connected";
    return "Use the AppKit button to link your wallet";
  }, [connectedAddress]);

  return (
    <View className="gap-4">
      <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <View
          className={
            isDesktop
              ? "flex-row items-start justify-between gap-6"
              : "gap-4"
          }
        >
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <View className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {audience} wallet
                </Text>
              </View>
              <View className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                <Text className="text-gray-700 dark:text-gray-300 text-[11px] font-semibold">
                  Status: {statusText}
                </Text>
              </View>
            </View>
            <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">{title}</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {subtitle}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <ShieldCheck color="#10b981" size={18} />
              <Text className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                On-chain ready • Secure key handling stays with your wallet
              </Text>
            </View>
          </View>

          <View className="self-start">
            <ConnectWalletButton
              onConnected={(addr) => setConnectedAddress(addr)}
              onDisconnected={() => setConnectedAddress(null)}
            />
          </View>
        </View>
      </View>

      <View className={isDesktop ? "flex-row gap-4" : "gap-4"}>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
            Connection steps
          </Text>
          <View className="gap-3">
            {steps.map((step, index) => (
              <View key={step} className="flex-row gap-3 items-start">
                <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 items-center justify-center">
                  <Text className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
            Wallet tips
          </Text>
          <View className="gap-3">
            {tips.map((tip) => {
              const Icon = tip.icon ?? Smartphone;
              return (
                <View
                  key={tip.title}
                  className="flex-row items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
                >
                  <Icon color="#0f766e" size={18} />
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                      {tip.title}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                      {tip.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
