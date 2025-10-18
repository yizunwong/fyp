import { useAuthControllerLogin, LoginDto } from "@/api";

export function useLoginMutation() {
  const mutation = useAuthControllerLogin();

  return {
    ...mutation,
    login: (data: LoginDto) => mutation.mutateAsync({ data }),
  };
}

export default function useAuth() {
  const loginMutation = useLoginMutation();

  return {
    login: loginMutation.login,
    isLoggingIn: loginMutation.isPending,

  };
}
