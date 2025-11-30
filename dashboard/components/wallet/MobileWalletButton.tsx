  // src/components/MobileWalletButton.tsx
  import React from "react";
  import { AppKitButton } from "@reown/appkit-react-native";

  export default function MobileWalletButton() {
    return (
      <AppKitButton
        label="Connect Wallet"
        loadingLabel="Opening..."
        size="md"
        balance="show"
      />
    );
  }
