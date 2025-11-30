
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  selectedAddress?: string | null;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}


export async function connectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    alert("MetaMask not detected.");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts?.[0] ?? null;
  } catch (err) {
    console.error("MetaMask connection error:", err);
    return null;
  }
}

export function getCurrentAddress() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return window.ethereum.selectedAddress || null;
}
