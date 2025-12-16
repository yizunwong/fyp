import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View } from "react-native";
import {
  useUser,
  useCreateUser,
  useUpdateUser,
} from "@/hooks/useUserManagement";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/validation/user";
import { CreateUserDto, UpdateUserDto, CreateUserDtoRole } from "@/api";
import { parseError } from "@/utils/format-error";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { UserRegistrationContent } from "@/components/admin/users/UserRegistrationContent";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useAppLayout } from "@/components/layout/AppLayoutContext";

const createInitialForm = (): CreateUserFormValues => ({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  nric: "",
  phone: "",
  role: CreateUserDtoRole.FARMER,
  companyName: "",
  businessAddress: "",
  agencyName: "",
  department: "",
});

const editInitialForm = (): EditUserFormValues => ({
  email: "",
  username: "",
  nric: "",
  phone: "",
  role: CreateUserDtoRole.FARMER,
  companyName: "",
  businessAddress: "",
  agencyName: "",
  department: "",
});

export default function UserFormPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { isDesktop } = useResponsiveLayout();

  // Handle both /create and /[id] routes
  // If id is "create", treat as create mode, otherwise use the id for edit mode
  const userId = params.id === "create" ? undefined : params.id;
  const isEditMode = Boolean(userId);

  const {
    user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser(userId || null);
  const { createUser, isCreating } = useCreateUser();
  const { updateUser, isUpdating } = useUpdateUser();

  const form = useForm<CreateUserFormValues | EditUserFormValues>({
    resolver: zodResolver(isEditMode ? editUserSchema : createUserSchema),
    defaultValues: isEditMode ? editInitialForm() : createInitialForm(),
    mode: "onSubmit",
  });

  const { watch, clearErrors, reset } = form;
  const formData = watch();

  const [selectedRole, setSelectedRole] = useState<CreateUserDtoRole>(
    CreateUserDtoRole.FARMER
  );

  const userInitialDataRef = useRef<
    CreateUserFormValues | EditUserFormValues | null
  >(null);
  const previousUserSnapshotRef = useRef<string | null>(null);

  // Load existing user if in edit mode
  useEffect(() => {
    if (!isEditMode) {
      userInitialDataRef.current = null;
      previousUserSnapshotRef.current = null;
      return;
    }

    const userData = user;
    if (!userData) return;

    const snapshot = JSON.stringify(userData);
    if (previousUserSnapshotRef.current === snapshot) return;

    previousUserSnapshotRef.current = snapshot;
    const mappedUser: EditUserFormValues = {
      email: userData.email,
      username: userData.username,
      nric: userData.nric || "",
      phone: userData.phone || "",
      role: userData.role as CreateUserDtoRole,
      companyName: userData.retailer?.companyName || "",
      businessAddress: userData.retailer?.businessAddress || "",
      agencyName: userData.agency?.agencyName || "",
      department: userData.agency?.department || "",
    };

    userInitialDataRef.current = mappedUser;
    reset(mappedUser);
    setSelectedRole(userData.role as CreateUserDtoRole);
    clearErrors();
  }, [isEditMode, user, reset, clearErrors]);

  // Toast error if fetching fails
  useEffect(() => {
    if (!userError) return;
    Toast.show({
      type: "error",
      text1: "Unable to load user",
      text2: parseError(userError) ?? "Failed to fetch user details.",
    });
  }, [userError]);

  const handleReset = useCallback(() => {
    const baseline =
      userInitialDataRef.current ??
      (isEditMode ? editInitialForm() : createInitialForm());
    reset(baseline);
    clearErrors();
  }, [reset, clearErrors, isEditMode]);

  const handleInvalidSubmit = useCallback(() => {
    Toast.show({
      type: "error",
      text1: "Missing information",
      text2: "Please complete the highlighted fields to continue.",
    });
  }, []);

  const handleValidCreate = useCallback(
    async (values: CreateUserFormValues) => {
      try {
        const payload: CreateUserDto = {
          email: values.email,
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword as any,
          nric: values.nric,
          phone: values.phone || undefined,
          role: values.role,
          companyName: values.companyName || undefined,
          businessAddress: values.businessAddress || undefined,
          agencyName: values.agencyName || undefined,
          department: values.department || undefined,
        };

        await createUser(payload);
        Toast.show({
          type: "success",
          text1: "User created",
          text2: "User has been created successfully",
        });
        router.back();
      } catch (error) {
        const message = parseError(error) || "Failed to create user.";
        form.setError("root", { message });
        Toast.show({
          type: "error",
          text1: "Creation failed",
          text2: message,
        });
      }
    },
    [createUser, form, router]
  );

  const handleValidUpdate = useCallback(
    async (values: EditUserFormValues) => {
      try {
        const payload: UpdateUserDto = {
          email: values.email,
          username: values.username,
          nric: values.nric,
          phone: values.phone || undefined,
          role: values.role,
          companyName: values.companyName || undefined,
          businessAddress: values.businessAddress || undefined,
          agencyName: values.agencyName || undefined,
          department: values.department || undefined,
        };

        await updateUser(userId!, payload);
        Toast.show({
          type: "success",
          text1: "User updated",
          text2: "User has been updated successfully",
        });
        router.back();
      } catch (error) {
        const message = parseError(error) || "Failed to update user.";
        form.setError("root", { message });
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: message,
        });
      }
    },
    [updateUser, userId, form, router]
  );

  const submitForm = useCallback(
    (values: CreateUserFormValues | EditUserFormValues) => {
      if (isEditMode) {
        handleValidUpdate(values as EditUserFormValues);
      } else {
        handleValidCreate(values as CreateUserFormValues);
      }
    },
    [isEditMode, handleValidUpdate, handleValidCreate]
  );

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as CreateUserDtoRole);
  };

  const headerTitle = isEditMode ? "Edit User" : "Create User";
  const headerSubtitle = isEditMode
    ? "Update user details and permissions"
    : "Add a new user to the system";

  const layoutMeta = useMemo(
    () => ({
      title: headerTitle,
      subtitle: headerSubtitle,
    }),
    [headerTitle, headerSubtitle]
  );

  useAppLayout(layoutMeta);

  if (isEditMode && isLoadingUser) {
    return (
      <View className="flex-1 bg-gray-50">
        <LoadingState message="Loading user details..." />
      </View>
    );
  }

  if (isEditMode && (userError || !user)) {
    return (
      <View className="flex-1 bg-gray-50">
        <ErrorState
          message={parseError(userError) || "User not found"}
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  return (
    <>
      <UserRegistrationContent
        isDesktop={isDesktop}
        form={form}
        formData={formData}
        isEditMode={isEditMode}
        onSubmit={submitForm}
        onReset={handleReset}
        onCancel={() => router.back()}
        isSubmitting={isCreating || isUpdating}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        router={router}
      />
    </>
  );
}
