import "@walletconnect/react-native-compat";
import { createAppKit } from "@reown/appkit-react-native";
import { hardhat, mainnet, sepolia } from "viem/chains";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EthersAdapter } from "@reown/appkit-ethers-react-native";

import { type Storage } from "@reown/appkit-react-native";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import { Platform } from 'react-native';

const storage: Storage = {
  getKeys: async () => {
    return (await AsyncStorage.getAllKeys()) as string[];
  },
  getEntries: async <T = any,>(): Promise<[string, T][]> => {
    const keys = await AsyncStorage.getAllKeys();
    return await Promise.all(
      keys.map(async (key) => [
        key,
        safeJsonParse((await AsyncStorage.getItem(key)) ?? "") as T,
      ])
    );
  },
  setItem: async <T = any,>(key: string, value: T) => {
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any,>(key: string): Promise<T | undefined> => {
    const item = await AsyncStorage.getItem(key);
    if (typeof item === "undefined" || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const metadata = {
  name: "Expo Wallet App",
  description: "Wallet system",
  url: "https://example.com",
  icons: ["https://example.com/icon.png"],
  redirect: {
    native: "myapp://",
    universal: "https://example.com",
  },
};

export function createMobileAppKit() {
  if (Platform.OS === "web") return null;

  return createAppKit({
    projectId,
    metadata,
    adapters: [new EthersAdapter()],
    networks: [mainnet, sepolia, hardhat],
    defaultNetwork: hardhat,
    storage,
  });
}