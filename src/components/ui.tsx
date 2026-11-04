import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../config/theme';
import { AppText } from './AppText';

export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[styles.card, style]}>{children}</View>;

export const Pill: React.FC<{ label: string; color: string; bg: string }> = ({
  label,
  color,
  bg,
}) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <AppText variant="xs" weight="semibold" color={color}>
      {label}
    </AppText>
  </View>
);

/** Small outlined button with an icon: "Directions", "Call". */
export const ChipButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}> = ({ label, icon, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.chip, disabled && styles.chipDisabled]}
  >
    {icon}
    <AppText variant="sm" weight="semibold" color={colors.primaryDark} style={styles.chipText}>
      {label}
    </AppText>
  </TouchableOpacity>
);

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <View style={styles.empty}>
    {icon}
    <AppText variant="md" weight="semibold" style={styles.emptyTitle}>
      {title}
    </AppText>
    {subtitle ? (
      <AppText variant="sm" color={colors.textMuted} style={styles.center}>
        {subtitle}
      </AppText>
    ) : null}
  </View>
);

export const FullScreenLoader: React.FC = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { marginLeft: 6 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: { marginTop: spacing.md, marginBottom: spacing.xs, textAlign: 'center' },
  center: { textAlign: 'center' },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
