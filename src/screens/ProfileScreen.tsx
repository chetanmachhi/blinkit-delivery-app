import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bike, ChevronLeft, LogOut } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/ui';
import { env } from '../config/env';
import { colors, spacing } from '../config/theme';
import { useSummary } from '../hooks/useDelivery';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/auth.store';
import { formatPaise } from '../utils/format';
import { confirmAsync } from '../store/ui.store';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const rider = useAuthStore(s => s.rider);
  const signOut = useAuthStore(s => s.signOut);
  const queryClient = useQueryClient();
  const { data: summary } = useSummary();

  const logout = async () => {
    const ok = await confirmAsync({
      title: 'Log out?',
      message: 'You will stop receiving orders on this device until you log in again.',
      confirmText: 'Log out',
      tone: 'danger',
    });
    if (!ok) return;
    queryClient.clear();
    await signOut();
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText variant="md" weight="bold" style={styles.ml8}>
          Profile
        </AppText>
      </View>

      <View style={styles.content}>
        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Bike size={32} color={colors.text} />
          </View>
          <AppText variant="lg" weight="bold" style={styles.mt8}>
            {rider?.name}
          </AppText>
          <AppText color={colors.textMuted}>{rider?.phone}</AppText>
          {rider?.vehicleNumber ? (
            <AppText variant="sm" color={colors.textMuted}>
              {rider.vehicleNumber}
            </AppText>
          ) : null}
        </Card>

        <Card style={styles.section}>
          <Row label="Deliveries today" value={String(summary?.todayDeliveries ?? 0)} />
          <Row label="Cash collected today" value={formatPaise(summary?.todayCashCollected ?? 0)} />
          <Row label="Total deliveries" value={String(summary?.totalDeliveries ?? 0)} />
          <Row label="In progress" value={String(summary?.activeCount ?? 0)} />
        </Card>

        <AppText variant="xs" color={colors.textLight} style={styles.server}>
          Server: {env.API_ORIGIN}
        </AppText>

        <Button
          title="Log out"
          variant="outline"
          onPress={logout}
          icon={<LogOut size={18} color={colors.primary} />}
        />
      </View>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <AppText color={colors.textMuted}>{label}</AppText>
    <AppText weight="semibold">{value}</AppText>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  ml8: { marginLeft: spacing.sm },
  mt8: { marginTop: spacing.sm },
  content: { paddingHorizontal: spacing.lg },
  profile: { alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.headerYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  server: { textAlign: 'center', marginBottom: spacing.md },
});
