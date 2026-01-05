import React from "react";
import {
  CircleCheck as CheckCircle,
  Clock,
  Circle as XCircle,
} from "lucide-react-native";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    case "pending":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
    case "rejected":
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle color="#15803d" size={16} />;
    case "pending":
      return <Clock color="#b45309" size={16} />;
    case "rejected":
      return <XCircle color="#dc2626" size={16} />;
    default:
      return null;
  }
};

export const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    case "processing":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    case "pending":
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  }
};
