import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { colors, typography } from "../config/theme";

export interface AppTextProps extends TextProps {
  variant?: keyof typeof typography;
  weight?: "regular" | "medium" | "semibold" | "bold";
  color?: string;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = "base",
  weight = "regular",
  color = colors.text,
  style,
  children,
  ...props
}) => {
  const fontStyle = typography[variant];

  const fontWeight = {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  }[weight];

  return (
    <Text
      maxFontSizeMultiplier={1.2}
      style={[
        styles.base,
        fontStyle,
        { color, fontWeight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
