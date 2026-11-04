import { Platform, StyleSheet } from "react-native";

export const colors = {
  primary: "#0E9F6E",
  primaryDark: "#087F56",
  primarySoft: "#E6F6EF",
  headerYellow: "#FFD84D",
  headerYellowLight: "#FFF4C7",
  discountBadge: "#6D4AFF",
  text: "#1F2937",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  surface: "#FFFFFF",
  background: "#F5F6F8",
  danger: "#E5484D",
  dangerSoft: "#FEE2E2",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  success: "#12B76A",
  successSoft: "#D1FAE5",
  black: "#000000",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.5)",
  shimmer: "#E2E8F0",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const typography = {
  xs: {
    fontSize: 11,
    lineHeight: 14,
  },
  sm: {
    fontSize: 13,
    lineHeight: 18,
  },
  base: {
    fontSize: 15,
    lineHeight: 20,
  },
  md: {
    fontSize: 17,
    lineHeight: 22,
  },
  lg: {
    fontSize: 20,
    lineHeight: 26,
  },
  xl: {
    fontSize: 24,
    lineHeight: 30,
  },
  xxl: {
    fontSize: 30,
    lineHeight: 36,
  },
};

export const shadows = {
  subtle: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export default theme;
