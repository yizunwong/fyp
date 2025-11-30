// src/components/MobileWalletButton.tsx
import React from "react";
import { AppKitButton } from "@reown/appkit-react-native";

interface MobileWalletButtonProps {
  onConnected?: (address: string | null) => void; // Reserved for future AppKit events
  onDisconnected?: () => void;
}

export default function MobileWalletButton({
  onConnected: _onConnected,
  onDisconnected: _onDisconnected,
}: MobileWalletButtonProps) {
  return (
    <AppKitButton
      label="Connect Wallet"
      loadingLabel="Opening..."
      size="md"
      balance="show"
    />
  );
}
