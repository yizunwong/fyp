import {
  useAuthControllerLogin,
  LoginDto,
  useAuthControllerGoogleAuth,
} from "@/api";

export function useLoginMutation() {
  const mutation = useAuthControllerLogin();

  return {
    ...mutation,
    login: (data: LoginDto) => mutation.mutateAsync({ data }),
  };
}

export function useGoogleLoginMutation() {
  const mutation = useAuthControllerGoogleAuth();

  return {
    ...mutation,
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