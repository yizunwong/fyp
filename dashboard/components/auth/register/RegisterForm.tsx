import React from "react";
import FarmerForm from "@/components/form/FarmerForm";
import RetailerForm from "@/components/form/RetailerForm";
import AgencyForm from "@/components/form/AgencyForm";
import type { RegisterRole } from "@/components/auth/register/constants";

export default function RegisterForm({
  role,
  onSubmit,
}: {
  role: RegisterRole;
  onSubmit: (data: any) => void;
}) {
  if (role === "farmer") return <FarmerForm onSubmit={onSubmit} />;
  if (role === "retailer") return <RetailerForm onSubmit={onSubmit} />;
  return <AgencyForm onSubmit={onSubmit} />;
}

