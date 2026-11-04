import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "../config/theme";
import { AppText } from "./AppText";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  icon,
}) => {
  const isInteractive = !disabled && !loading;

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.primarySoft;
      case "outline":
        return "transparent";
      case "danger":
        return colors.danger;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textLight;
    switch (variant) {
      case "primary":
      case "danger":
        return colors.white;
      case "secondary":
        return colors.primaryDark;
      case "outline":
        return colors.primary;
    }
  };

  const sizeStyle = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }[size];

  return (
    <TouchableOpacity
      onPress={isInteractive ? onPress : undefined}
      activeOpacity={0.8}
      disabled={!isInteractive}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.button,
        sizeStyle,
        {
          backgroundColor: getBackgroundColor(),
          borderColor:
            variant === "outline"
              ? disabled
                ? colors.border
                : colors.primary
              : "transparent",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" || variant === "outline" ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon}
          <AppText
            variant={size === "small" ? "sm" : "base"}
            weight="semibold"
            color={getTextColor()}
            style={icon ? styles.textWithIcon : undefined}
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
  },
  sizeSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  sizeMedium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  sizeLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
});
