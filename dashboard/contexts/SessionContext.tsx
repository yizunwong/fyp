import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
  useRef,
} from "react";
import { useStorageState } from "@/lib/useStorageState";
import { clearToken, clearRefreshToken, getRefreshToken } from "@/lib/auth";
import { useAuthControllerProfile } from "@/api";
import { useLogoutMutation } from "@/hooks/useAuth";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

export interface SessionData {
  token: string | null;
  role?: string;
  userId?: string;
  email?: string;
}

const AuthContext = createContext<{
  signIn: (token?: string) => Promise<SessionData | null>;
  signOut: () => Promise<void>;
  session: SessionData | null;
  isLoading: boolean;
} | null>(null);

// Use this hook to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const isWeb = Platform.OS === "web";
  const queryClient = useQueryClient();

  // On web: tokens are in HttpOnly cookies, so we don't use storage state
  // On native: we use SecureStore to persist tokens
  const [[isLoadingToken, token], setToken] = useStorageState("access_token");
  const [session, setSession] = useState<SessionData | null>(null);
  const sessionRef = useRef<SessionData | null>(null);
  const hasInitialized = useRef(false);
  const logoutMutation = useLogoutMutation();

  // On web: always try to fetch profile (cookies sent automatically)
  // On native: only fetch if we have a token stored
  const {
    data: profileResponse,
    isLoading: isProfileQueryLoading,
    refetch: refetchProfile,
  } = useAuthControllerProfile({
    query: {
      enabled: isWeb ? true : !!token && !isLoadingToken,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  // Update session when profile data changes
  useEffect(() => {
    if (isLoadingToken || isProfileQueryLoading) {
      return;
    }

    if (profileResponse?.data) {
      const user = profileResponse.data;
      const newSession: SessionData = {
        token: isWeb ? "cookie" : token || null,
        role: user.role,
        userId: user.id,
        email: user.email,
      };
      setSession(newSession);
      sessionRef.current = newSession;
      hasInitialized.current = true;
    } else if (hasInitialized.current || !isProfileQueryLoading) {
      if (isWeb || !token) {
        setSession(null);
        sessionRef.current = null;
        hasInitialized.current = true;
      }
    }
  }, [token, isLoadingToken, profileResponse, isProfileQueryLoading, isWeb]);

  // Loading state: true if we're still checking initial auth status or actively loading
  const isLoading = isLoadingToken || isProfileQueryLoading;

  const signIn = async (newToken?: string): Promise<SessionData | null> => {
    if (isWeb) {
      // On web, cookies are set by backend, just refetch profile
      const result = await refetchProfile();
      if (result.data?.data) {
        const user = result.data.data;
        const newSession: SessionData = {
          token: "cookie",
          role: user.role,
          userId: user.id,
          email: user.email,
        };
        // Update session immediately
        setSession(newSession);
        hasInitialized.current = true;
        return newSession;
      }
      return null;
    } else {
      // On native, save token and it will trigger profile fetch via enabled condition
      if (newToken) {
        setToken(newToken);
        // Wait for profile to be fetched - poll until we get the session data
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max wait
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Check if session was set by useEffect (via sessionRef)
          if (sessionRef.current && sessionRef.current.role) {
            return sessionRef.current;
          }
          attempts++;
        }
        // If session wasn't set in time, return null
        // The useEffect will set the session later, and the caller can use decoded role
        return null;
      }
      return null;
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = await getRefreshToken();

      // Call logout endpoint to clear cookies (web) or invalidate tokens (native)
      if (refreshToken || isWeb) {
        await logoutMutation.logout({
          refresh_token: refreshToken || "",
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local storage
      await clearToken();
      await clearRefreshToken();
      if (!isWeb) {
        setToken(null);
      }

      // Clear session and query cache
      setSession(null);
      sessionRef.current = null;
      queryClient.clear();
      hasInitialized.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
