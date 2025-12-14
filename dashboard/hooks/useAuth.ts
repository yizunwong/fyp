import {
  useAuthControllerLogin,
  useAuthControllerRegister,
  LoginDto,
  AuthControllerRegisterMutationBody,
  useAuthControllerLogout,
  RefreshTokenDto,
  useUserControllerUpdateProfile,
  UpdateProfileDto,
  CreateUserDtoRole,
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

export function useRegisterMutation() {
  const mutation = useAuthControllerRegister();

  return {
    ...mutation,
    register: (
      role: SelectableRegisterRole,
      data: AuthControllerRegisterMutationBody,
    ) => {
      const roleValue =
        role === "agency"
          ? CreateUserDtoRole.GOVERNMENT_AGENCY
          : role === "retailer"
          ? CreateUserDtoRole.RETAILER
          : CreateUserDtoRole.FARMER;

      return mutation.mutateAsync({
        data: {
          ...data,
          role: roleValue,
        },
      });
    },
  };
}

export function useUpdateProfileMutation() {
  const mutation = useUserControllerUpdateProfile();

  return {
    ...mutation,
    updateProfile: (data: UpdateProfileDto) => mutation.mutateAsync({ data }),
  };
}


export default function useAuth() {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  return {
    login: loginMutation.login,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.register,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.logout,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.updateProfile,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}
