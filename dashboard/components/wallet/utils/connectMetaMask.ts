
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

  const eth = window.ethereum;

  try {
    // Always request permissions so MetaMask opens even if previously connected.
    await eth.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (err) {
    // Ignore permission errors and try the legacy flow below.
    console.error("MetaMask permission error:", err);
  }

  try {
    const accounts = await eth.request({ method: "eth_requestAccounts" });

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

export async function disconnectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) return;
  try {
    // Best-effort revoke so the next connect re-opens MetaMask.
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (err) {
    console.error("MetaMask disconnect error:", err);
  }
}
