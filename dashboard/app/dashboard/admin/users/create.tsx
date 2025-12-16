import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View } from "react-native";
import { useCreateUser } from "@/hooks/useUserManagement";
import { createUserSchema, type CreateUserFormValues } from "@/validation/user";
import { CreateUserDto, CreateUserDtoRole } from "@/api";
import { parseError } from "@/utils/format-error";
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

export default function CreateUserPage() {
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();

  const isEditMode = false;
  const { createUser, isCreating } = useCreateUser();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: createInitialForm(),
    mode: "onSubmit",
  });

  const { watch, clearErrors, reset } = form;
  const formData = watch();
  const [selectedRole, setSelectedRole] = useState<CreateUserDtoRole>(
    CreateUserDtoRole.FARMER
  );

  const userInitialDataRef = useRef<CreateUserFormValues | null>(null);

  const handleReset = useCallback(() => {
    const baseline = userInitialDataRef.current ?? createInitialForm();
    reset(baseline);
    clearErrors();
  }, [reset, clearErrors]);

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

  const submitForm = handleValidCreate;

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as CreateUserDtoRole);
  };

  const headerTitle = "Create User";
  const headerSubtitle = "Add a new user to the system";

  const layoutMeta = useMemo(
    () => ({
      title: headerTitle,
      subtitle: headerSubtitle,
    }),
    [headerTitle, headerSubtitle]
  );

  useAppLayout(layoutMeta);

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
        isSubmitting={isCreating}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        router={router}
      />
    </>
  );
}
