import React from "react";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { StyleSheet } from "react-native";

const baseContentStyle = { paddingHorizontal: 16 };

const successToast = (props: ToastConfigParams<any>) => (
  <BaseToast
    {...props}
    style={styles.toastBase}
    contentContainerStyle={baseContentStyle}
    text1Style={styles.textStrong}
    text2Style={styles.textSecondary}
  />
);

const errorToast = (props: ToastConfigParams<any>) => (
  <ErrorToast
    {...props}
    style={styles.toastError}
    contentContainerStyle={baseContentStyle}
    text1Style={styles.textStrong}
    text2Style={styles.textSecondary}
  />
);

const toastConfig: ToastConfig = {
  success: successToast,
  error: errorToast,
};

export default function ToastProvider() {
  return <Toast config={toastConfig} visibilityTime={2000} />;
}

const styles = StyleSheet.create({
  toastBase: {
    borderLeftColor: "#22c55e",
    borderLeftWidth: 6,
    minHeight: 60,
  },
  toastError: {
    borderLeftColor: "#ef4444",
    borderLeftWidth: 6,
    minHeight: 60,
  },
  textStrong: {
    fontSize: 15,
    fontWeight: "700",
  },
  textSecondary: {
    fontSize: 13,
  },
});
