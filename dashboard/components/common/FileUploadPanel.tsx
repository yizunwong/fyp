import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { UploadCloud } from "lucide-react-native";

import type { UploadedDocument } from "@/validation/upload";

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export const MAX_UPLOAD_FILES = 10;

const createUploadId = () => {
  try {
    const randomUUID = (globalThis as unknown as { crypto?: Crypto }).crypto?.randomUUID;
    if (randomUUID) {
      return randomUUID();
    }
  } catch {
    // no-op fallthrough to Math.random
  }
  return `upload-${Math.random().toString(36).slice(2, 10)}`;
};

const determineDocumentKind = (mimeType?: string): UploadedDocument["kind"] => {
  if (!mimeType) return "other";
  const lowerMime = mimeType.toLowerCase();
  if (lowerMime.includes("pdf")) {
    return "pdf";
  }
  if (lowerMime.startsWith("image/")) {
    return "image";
  }
  return "other";
};

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) {
    return "Unknown size";
  }
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let current = size;

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }

  return `${current.toFixed(current >= 10 || current % 1 === 0 ? 0 : 1)} ${units[index]}`;
};

export const cleanupUploadedFiles = (files: UploadedDocument[]) => {
  if (Platform.OS !== "web") return;

  files.forEach((file) => {
    if (file.uri && file.uri.startsWith("blob:")) {
      URL.revokeObjectURL(file.uri);
    }
  });
};

export interface FileUploadPanelProps {
  title: string;
  subtitle?: string;
  helperLines?: string[];
  buttonLabel: string;
  files: UploadedDocument[];
  onFilesAdded: (files: UploadedDocument[]) => void;
  onRemoveFile: (fileId: string) => void;
  onUpdateFile?: (fileId: string, patch: Partial<UploadedDocument>) => void;
  renderAccessory?: (
    file: UploadedDocument,
    update: (patch: Partial<UploadedDocument>) => void
  ) => React.ReactNode;
  error?: string;
}

const FileUploadPanel = ({
  title,
  subtitle,
  helperLines,
  buttonLabel,
  files,
  onFilesAdded,
  onRemoveFile,
  onUpdateFile,
  renderAccessory,
  error,
}: FileUploadPanelProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const previousFilesRef = useRef<UploadedDocument[]>(files);
  const isWeb = Platform.OS === "web";

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (!incoming || incoming.length === 0) return;

      if (files.length >= MAX_UPLOAD_FILES) {
        Toast.show({
          type: "info",
          text1: "Upload limit reached",
          text2: `You can attach up to ${MAX_UPLOAD_FILES} files in this section. Remove a file before adding another.`,
        });
        return;
      }

      const nextFiles: UploadedDocument[] = [];
      const rejectedFiles: string[] = [];

      Array.from(incoming).forEach((file) => {
        const kind = determineDocumentKind(file.type);

        if (!ACCEPTED_MIME_TYPES.has(file.type) && kind === "other") {
          rejectedFiles.push(file.name);
          return;
        }

        const previewUri =
          kind === "image" && Platform.OS === "web" ? URL.createObjectURL(file) : undefined;

        nextFiles.push({
          id: createUploadId(),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          uri: previewUri,
          kind,
          file,
        });
      });

      const availableSlots = Math.max(0, MAX_UPLOAD_FILES - files.length);
      const trimmedFiles =
        nextFiles.length > availableSlots ? nextFiles.slice(0, availableSlots) : nextFiles;

      if (trimmedFiles.length) {
        onFilesAdded(trimmedFiles);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      if (rejectedFiles.length) {
        const skippedPreview = rejectedFiles.slice(0, 3).join(", ");
        const hasMoreSkipped = rejectedFiles.length > 3;
        Toast.show({
          type: "error",
          text1: "Unsupported files skipped",
          text2: hasMoreSkipped
            ? `Only JPG, PNG or PDF files are supported. Skipped: ${skippedPreview} (+${
                rejectedFiles.length - 3
              } more).`
            : `Only JPG, PNG or PDF files are supported. Skipped: ${skippedPreview}.`,
        });
      }

      if (nextFiles.length > trimmedFiles.length) {
        Toast.show({
          type: "info",
          text1: "Upload limit reached",
          text2: `Only ${MAX_UPLOAD_FILES} files can be kept at once. Some files were skipped.`,
        });
      }
    },
    [files, onFilesAdded]
  );

  const handleManualSelect = useCallback(() => {
    if (isWeb) {
      inputRef.current?.click();
      return;
    }

    Toast.show({
      type: "info",
      text1: "Upload unavailable",
      text2:
        "File upload is currently supported on the web experience. Please continue from a desktop browser.",
    });
  }, [isWeb]);

  useEffect(() => {
    previousFilesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      cleanupUploadedFiles(previousFilesRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isWeb) return;
    const node = dropZoneRef.current;
    if (!node) return;

    const preventDefault = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDragEnter = (event: DragEvent) => {
      preventDefault(event);
      setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      preventDefault(event);
      setIsDragActive(false);
    };

    const handleDropEvent = (event: DragEvent) => {
      preventDefault(event);
      setIsDragActive(false);
      if (event.dataTransfer?.files?.length) {
        handleFiles(event.dataTransfer.files);
      }
    };

    node.addEventListener("dragenter", handleDragEnter);
    node.addEventListener("dragover", handleDragEnter);
    node.addEventListener("dragleave", handleDragLeave);
    node.addEventListener("drop", handleDropEvent);

    return () => {
      node.removeEventListener("dragenter", handleDragEnter);
      node.removeEventListener("dragover", handleDragEnter);
      node.removeEventListener("dragleave", handleDragLeave);
      node.removeEventListener("drop", handleDropEvent);
    };
  }, [handleFiles, isWeb]);

  return (
    <View className="mb-6">
      <Text className="text-gray-800 text-sm font-semibold">{title}</Text>
      {subtitle ? <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text> : null}
      {helperLines?.length ? (
        <View className="mt-3 gap-1.5">
          {helperLines.map((line) => (
            <Text key={line} className="text-gray-500 text-xs leading-relaxed">
              {line}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="mt-4">
        <View
          ref={dropZoneRef}
          className={`rounded-2xl border border-dashed ${
            isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-gray-50"
          }`}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleManualSelect}
            className="items-center justify-center py-8 px-4"
          >
            <UploadCloud color={isDragActive ? "#059669" : "#6b7280"} size={28} />
            <Text className="text-sm font-semibold text-gray-700 mt-3">{buttonLabel}</Text>
            <Text className="text-xs text-gray-500 mt-1 text-center">
              Drag & drop files here or tap to browse
            </Text>
            <Text className="text-xs text-gray-400 mt-2">
              {`JPG, PNG or PDF - up to ${MAX_UPLOAD_FILES} files`}
            </Text>
          </TouchableOpacity>
          {isWeb ? (
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.heic,.heif,.pdf,image/*,application/pdf"
              style={{ display: "none" }}
              onChange={(event) => {
                if (event.target.files?.length) {
                  handleFiles(event.target.files);
                }
              }}
            />
          ) : null}
        </View>
      </View>

      {files.length ? (
        <View className="mt-4 gap-3">
          {files.map((file) => (
            <View
              key={file.id}
              className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              {file.kind === "image" && file.uri ? (
                <Image
                  source={{ uri: file.uri }}
                  style={{ width: 48, height: 48, borderRadius: 14 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center">
                  <Text className="text-emerald-700 text-xs font-semibold uppercase">
                    {file.kind === "pdf" ? "PDF" : "FILE"}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-gray-800 text-sm font-semibold" numberOfLines={1}>
                  {file.name}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">{formatFileSize(file.size)}</Text>
                {renderAccessory && (
                  <View className="mt-2">
                    {renderAccessory(file, (patch) => onUpdateFile?.(file.id, patch))}
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (file.uri && file.uri.startsWith("blob:") && Platform.OS === "web") {
                    URL.revokeObjectURL(file.uri);
                  }
                  onRemoveFile(file.id);
                }}
                className="px-3 py-1 rounded-lg bg-red-50 border border-red-100"
              >
                <Text className="text-red-500 text-xs font-semibold">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <Text className="text-xs text-gray-500">
            No files uploaded yet. Attach the relevant documents above.
          </Text>
        </View>
      )}

      {error ? <Text className="text-red-500 text-xs mt-2">{error}</Text> : null}
    </View>
  );
};

export default FileUploadPanel;
