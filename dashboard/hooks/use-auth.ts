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
  //   const registerMutation = useRegisterMutation();
  //   const { logout } = useLogout();

  //   const user = loginMutation.data?.data?.user;
  //   const isAuthenticated = !!user;

  return {
    login: loginMutation.login,
    isLoggingIn: loginMutation.isPending,

    // register: registerMutation.register,
    // isRegistering: registerMutation.isPending,

    // logout,
    // user,
    // isAuthenticated,
  };
}
