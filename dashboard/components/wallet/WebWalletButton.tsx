import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { AppKitButton } from "@reown/appkit-react-native";
import { connectMetaMask, getCurrentAddress } from "./utils/connectMetaMask";

export default function WebWalletButton() {
  // Web state (hooks must ALWAYS run)
  const [address, setAddress] = useState<string | null>(null);

  // Web: load current address on startup
  useEffect(() => {
    if (Platform.OS === "web") {
      setAddress(getCurrentAddress());
    }
  }, []);

  async function handleWebConnect() {
    const acc = await connectMetaMask();
    setAddress(acc);
  }

  async function handleDisconnect() {
    // For web we just clear local state
    setAddress(null);
  }

  // ---------- RENDER ----------
  if (Platform.OS !== "web") {
    // MOBILE — Reown AppKit button
    return (
      <AppKitButton
        label="Connect Wallet"
        loadingLabel="Opening..."
        size="md"
        balance="show"
      />
    );
  }

  // ---------- WEB ----------
  if (address) {
    return (
      <div>
        <p>
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <button onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={handleWebConnect}>Connect MetaMask</button>;
}
