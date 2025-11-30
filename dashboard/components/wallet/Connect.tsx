// src/components/ConnectWalletButton.tsx
import { Platform } from "react-native";
import MobileWalletButton from './MobileWalletButton';
import WebWalletButton from './WebWalletButton';

export default function ConnectWalletButton() {
  return Platform.OS === "web" ? <WebWalletButton /> : <MobileWalletButton />;
}
