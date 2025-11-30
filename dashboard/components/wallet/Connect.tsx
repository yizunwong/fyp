// src/components/ConnectWalletButton.tsx
import { Platform } from "react-native";
import MobileWalletButton from "./MobileWalletButton";
import WebWalletButton from "./WebWalletButton";

export interface ConnectWalletButtonProps {
  onConnected?: (address: string | null) => void;
  onDisconnected?: () => void;
}

export default function ConnectWalletButton({
  onConnected,
  onDisconnected,
}: ConnectWalletButtonProps) {
  return Platform.OS === "web" ? (
    <WebWalletButton onConnected={onConnected} onDisconnected={onDisconnected} />
  ) : (
    <MobileWalletButton
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    />
  );
}
