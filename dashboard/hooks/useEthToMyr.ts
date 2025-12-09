import { useEffect, useState } from "react";

const CACHE_KEY = "eth_to_myr_price";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  price: number;
  timestamp: number;
}

const getCachedPrice = (): number | null => {
  try {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 5 minutes)
    if (now - data.timestamp < CACHE_DURATION) {
      return data.price;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const setCachedPrice = (price: number): void => {
  try {
    if (typeof window === "undefined") return;
    const data: CacheData = {
      price,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
};

export function useEthToMyr() {
  const [price, setPrice] = useState<number | null>(() => getCachedPrice());
  const [isLoading, setIsLoading] = useState(!price); // Only loading if no cached price
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const fetchEthToMyr = async () => {
    // Prevent fetching too frequently (at least 1 minute between requests)
    const now = Date.now();
    if (lastFetchTime && now - lastFetchTime < 60000) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLastFetchTime(now);

      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr"
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const newPrice = data.ethereum?.myr ?? null;
      
      if (newPrice !== null) {
        setPrice(newPrice);
        setCachedPrice(newPrice);
      }
    } catch (err) {
      console.error("Error fetching ETH→MYR:", err);
      setError(err as Error);
      // Don't clear the cached price on error, keep using it
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load from cache first
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      setPrice(cachedPrice);
      setIsLoading(false);
    } else {
      // No cache, fetch immediately
      fetchEthToMyr();
    }

    // Set up interval to fetch every 5 minutes
    const interval = setInterval(fetchEthToMyr, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return {
    ethToMyr: price,
    isLoading,
    error,
    refetch: fetchEthToMyr,
  };
}

