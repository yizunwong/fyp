import { FC, ReactNode, useMemo } from "react";
import { View, Image, Text } from "react-native";
import { Camera } from "lucide-react-native";

type CornerSize = "md" | "lg" | "xl" | "full";

type ImagePlaceholderProps = {
  size?: number;
  imageUrl?: string | null;
  icon?: ReactNode | string;
  rounded?: CornerSize;
  border?: boolean;
  backgroundClassName?: string;
  accessibilityLabel?: string;
  alt?: string;
};

const radiusClassMap: Record<CornerSize, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const ImagePlaceholder: FC<ImagePlaceholderProps> = ({
  size = 80,
  imageUrl,
  icon,
  rounded = "xl",
  border = true,
  backgroundClassName = "bg-gray-100",
  accessibilityLabel = "Image placeholder",
  alt,
}) => {
  const radiusClass = useMemo(() => radiusClassMap[rounded] ?? "rounded-xl", [rounded]);
  const borderClass = border ? "border border-gray-200" : "";
  const containerClasses = `overflow-hidden items-center justify-center ${backgroundClassName} ${radiusClass} ${borderClass}`.trim();
  const containerStyle = useMemo(() => ({ width: size, height: size }), [size]);
  const resolvedLabel = imageUrl ? alt ?? "Image preview" : accessibilityLabel;

  const renderFallbackIcon = () => {
    if (typeof icon === "string") {
      return (
        <Text className="text-2xl" accessibilityElementsHidden importantForAccessibility="no">
          {icon}
        </Text>
      );
    }

    if (icon) {
      return icon;
    }

    return <Camera color="#9ca3af" size={28} />;
  };

  return (
    <View
      className={containerClasses}
      style={containerStyle}
      accessible
      accessibilityRole="image"
      accessibilityLabel={resolvedLabel}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          resizeMode="cover"
          className="w-full h-full"
          accessibilityLabel={resolvedLabel}
        />
      ) : (
        renderFallbackIcon()
      )}
    </View>
  );
};

export default ImagePlaceholder;
