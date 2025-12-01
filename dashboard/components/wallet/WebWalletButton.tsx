import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Wallet, CheckCircle2 } from "lucide-react-native";
import { AppKitButton } from "@reown/appkit-react-native";
import {
  connectMetaMask,
  disconnectMetaMask,
  getCurrentAddress,
} from "./utils/connectMetaMask";
import type { ConnectWalletButtonProps } from "./Connect";

interface WebWalletButtonProps extends ConnectWalletButtonProps {}

export default function WebWalletButton({
  onConnected,
  onDisconnected,
}: WebWalletButtonProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    setAddress(getCurrentAddress());

    const eth = (window as any)?.ethereum;
    if (!eth?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0] ?? null;
      setAddress(next);
      if (!next) {
        onDisconnected?.();
      } else {
        onConnected?.(next);
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  async function handleWebConnect() {
    setConnecting(true);
    try {
      const acc = await connectMetaMask();
      setAddress(acc);
      onConnected?.(acc);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    await disconnectMetaMask();
    setAddress(null);
    onDisconnected?.();
  }

  // Use native AppKit button on mobile
  if (Platform.OS !== "web") {
    return (
      <AppKitButton
        label="Connect Wallet"
        loadingLabel="Opening..."
        size="md"
        balance="show"
      />
    );
  }

  // Web version styled to mirror AppKit look
  if (address) {
    return (
      <View className="flex-row items-center gap-3 bg-white border border-emerald-100 rounded-full px-3 py-2 shadow-sm">
        <View className="flex-row items-center gap-2 bg-emerald-50 rounded-full px-3 py-2">
          <CheckCircle2 color="#047857" size={18} />
          <Text className="text-emerald-800 text-sm font-semibold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDisconnect}
          className="px-3 py-1.5 rounded-full border border-emerald-200 bg-white"
        >
          <Text className="text-emerald-700 text-xs font-semibold">
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      disabled={connecting}
      onPress={handleWebConnect}
      className="rounded-full overflow-hidden shadow-md"
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#10b981", "#059669", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-2"
      >
        <View className="flex-row items-center gap-2">
          {connecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Wallet color="#fff" size={18} />
          )}
          <Text className="text-white text-sm font-semibold">
            {connecting ? "Connecting..." : "Connect Wallet"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
