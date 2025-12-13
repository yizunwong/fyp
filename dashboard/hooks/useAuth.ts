import {
  useAuthControllerLogin,
  useAuthControllerRegister,
  LoginDto,
  AuthControllerRegisterMutationBody,
  useAuthControllerLogout,
  RefreshTokenDto,
  useUserControllerSetupProfile,
  SetupProfileDto,
} from "@/api";
import type { SelectableRegisterRole } from "@/components/auth/register/constants";

export function useLoginMutation() {
  const mutation = useAuthControllerLogin();

  return {
    ...mutation,
    login: (data: LoginDto) => mutation.mutateAsync({ data }),
  };
}

export function useLogoutMutation() {
  const mutation = useAuthControllerLogout();

  return {
    ...mutation,
    logout: (data: RefreshTokenDto) =>
      mutation.mutateAsync({data}),
  };
}

export type RegisterPayload = {
  email: string;
  username?: string;
  password: string;
  phone?: string;
  nric: string;
  role: SelectableRegisterRole;
  company?: string;
  address?: string;
};

export function useRegisterMutation() {
  const mutation = useAuthControllerRegister();

  return {
    ...mutation,
    register: (data: AuthControllerRegisterMutationBody) => {
      return mutation.mutateAsync({ data: data });
    },
  };
}

export function useSetupProfileMutation() {
  const mutation = useUserControllerSetupProfile();

  return {
    ...mutation,
    setupProfile: (data: SetupProfileDto) => mutation.mutateAsync({ data }),
  };
}


export default function useAuth() {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const setupProfileMutation = useSetupProfileMutation();

  return {
    login: loginMutation.login,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.register,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.logout,
    isLoggingOut: logoutMutation.isPending,
    setupProfile: setupProfileMutation.setupProfile,
    isSettingUpProfile: setupProfileMutation.isPending,
  };
}
