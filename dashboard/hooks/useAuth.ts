import {
  useAuthControllerLogin,
  useAuthControllerRegister,
  LoginDto,
  AuthControllerRegisterMutationBody,
} from "@/api";
import type { SelectableRegisterRole } from "@/components/auth/register/constants";

export function useLoginMutation() {
  const mutation = useAuthControllerLogin();

  return {
    ...mutation,
    login: (data: LoginDto) => mutation.mutateAsync({ data }),
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

export default function useAuth() {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  return {
    login: loginMutation.login,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.register,
    isRegistering: registerMutation.isPending,
  };
}
