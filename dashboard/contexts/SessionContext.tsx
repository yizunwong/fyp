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

  const [[isLoadingToken, token], setToken] = useStorageState("access_token");
  const [session, setSession] = useState<SessionData | null>(null);
  const sessionRef = useRef<SessionData | null>(null);
  const hasInitialized = useRef(false);
  const logoutMutation = useLogoutMutation();

  const {
    data: profileResponse,
    isLoading: isProfileQueryLoading,
    isError: isProfileQueryError,
    refetch: refetchProfile,
  } = useAuthControllerProfile({
    query: {
      enabled: isWeb ? true : !!token && !isLoadingToken,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const isCheckingAuth = isWeb ? true : !!token && !isLoadingToken;

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
      return;
    }

    if (!isCheckingAuth) {
      if (!isWeb && !token) {
        setSession(null);
        sessionRef.current = null;
        hasInitialized.current = true;
      }
      return;
    }

    setSession(null);
    sessionRef.current = null;
    hasInitialized.current = true;
  }, [token, isLoadingToken, profileResponse, isProfileQueryLoading, isProfileQueryError, isWeb, isCheckingAuth]);

  const isLoading = isLoadingToken || (isCheckingAuth && isProfileQueryLoading) || (!hasInitialized.current && isWeb);

  const signIn = async (newToken?: string): Promise<SessionData | null> => {
    if (isWeb) {
      const result = await refetchProfile();
      if (result.data?.data) {
        const user = result.data.data;
        const newSession: SessionData = {
          token: "cookie",
          role: user.role,
          userId: user.id,
          email: user.email,
        };
        setSession(newSession);
        hasInitialized.current = true;
        return newSession;
      }
      return null;
    } else {
      if (newToken) {
        setToken(newToken);
        let attempts = 0;
        const maxAttempts = 30;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (sessionRef.current && sessionRef.current.role) {
            return sessionRef.current;
          }
          attempts++;
        }
        return null;
      }
      return null;
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken || isWeb) {
        await logoutMutation.logout({
          refresh_token: refreshToken || "",
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      await clearToken();
      await clearRefreshToken();
      if (!isWeb) {
        setToken(null);
      }

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
