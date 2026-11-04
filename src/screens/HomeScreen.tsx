import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CircleCheck, Inbox, Package, User } from 'lucide-react-native';
import { RiderOrder } from '../api/types';
import { getErrorMessage } from '../api/client';
import { AppText } from '../components/AppText';
import { OrderCard } from '../components/OrderCard';
import { EmptyState } from '../components/ui';
import { colors, radii, shadows, spacing } from '../config/theme';
import {
  useActiveOrders,
  useAvailability,
  useAvailableOrders,
  useHistory,
  useOrderAction,
  useSummary,
} from '../hooks/useDelivery';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/auth.store';
import { formatPaise } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type Tab = 'new' | 'active' | 'done';

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const rider = useAuthStore(s => s.rider);
  const [tab, setTab] = useState<Tab>('new');

  const available = useAvailableOrders();
  const active = useActiveOrders();
  const history = useHistory();
  const summary = useSummary();
  const availability = useAvailability();
  const orderAction = useOrderAction();

  const isOnline = rider?.isOnline !== false;
  const current = tab === 'new' ? available : tab === 'active' ? active : history;
  const data: RiderOrder[] = current.data ?? [];

  const openOrder = (orderId: string) => navigation.navigate('OrderDetail', { orderId });

  const accept = (orderId: string) =>
    orderAction.mutate(
      { orderId, action: 'accept' },
      { onSuccess: () => navigation.navigate('OrderDetail', { orderId }) },
    );

  const onRefresh = () => {
    current.refetch();
    summary.refetch();
  };

  const emptyState = () => {
    if (current.isLoading) return undefined;
    if (current.isError) {
      return (
        <EmptyState
          icon={<Inbox size={48} color={colors.danger} />}
          title="Could not load orders"
          subtitle={`${getErrorMessage(current.error)}\nPull down to retry.`}
        />
      );
    }
    if (tab === 'new') {
      return (
        <EmptyState
          icon={<Inbox size={48} color={colors.textLight} />}
          title="No orders waiting"
          subtitle="Orders show up here once the store accepts them. This list refreshes automatically."
        />
      );
    }
    if (tab === 'active') {
      return (
        <EmptyState
          icon={<Package size={48} color={colors.textLight} />}
          title="No active deliveries"
          subtitle="Accept an order from the New tab to get started."
        />
      );
    }
    return (
      <EmptyState
        icon={<CircleCheck size={48} color={colors.textLight} />}
        title="No completed deliveries yet"
      />
    );
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'new', label: 'New', count: available.data?.length },
    { key: 'active', label: 'Active', count: active.data?.length },
    { key: 'done', label: 'Done' },
  ];

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <AppText variant="lg" weight="bold" numberOfLines={1}>
              Hi, {rider?.name?.split(' ')[0] ?? 'Partner'}
            </AppText>
            <AppText variant="sm" color={colors.text}>
              {isOnline ? 'You are online' : 'You are offline'}
              {rider?.vehicleNumber ? ` · ${rider.vehicleNumber}` : ''}
            </AppText>
          </View>
          <Switch
            value={isOnline}
            onValueChange={v => availability.mutate(v)}
            disabled={availability.isPending}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Online status"
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileBtn}
            accessibilityLabel="Profile"
          >
            <User size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <Stat label="Today" value={String(summary.data?.todayDeliveries ?? 0)} />
          <View style={styles.statDivider} />
          <Stat label="Cash collected" value={formatPaise(summary.data?.todayCashCollected ?? 0)} />
          <View style={styles.statDivider} />
          <Stat label="All time" value={String(summary.data?.totalDeliveries ?? 0)} />
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
          >
            <AppText
              variant="sm"
              weight="semibold"
              color={tab === t.key ? colors.white : colors.textMuted}
            >
              {t.label}
              {t.count ? ` (${t.count})` : ''}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' && !isOnline ? (
        <View style={styles.offlineBanner}>
          <AppText variant="sm" color={colors.warning} weight="medium">
            You are offline. Switch online to accept orders.
          </AppText>
        </View>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={o => o.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={current.isRefetching && !current.isLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={emptyState()}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => openOrder(item.id)}
            onAccept={tab === 'new' ? () => accept(item.id) : undefined}
            accepting={orderAction.isPending && orderAction.variables?.orderId === item.id}
            acceptDisabled={!isOnline || orderAction.isPending}
          />
        )}
      />
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <AppText variant="md" weight="bold">
      {value}
    </AppText>
    <AppText variant="xs" color={colors.textMuted}>
      {label}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerYellow,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  profileBtn: {
    marginLeft: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    ...shadows.subtle,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.borderLight },
  tabs: {
    flexDirection: 'row',
    margin: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.full },
  tabActive: { backgroundColor: colors.primary },
  offlineBanner: {
    backgroundColor: colors.warningSoft,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  list: { padding: spacing.lg, paddingTop: spacing.sm, flexGrow: 1 },
});
