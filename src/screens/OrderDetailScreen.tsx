import React from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Check,
  ChevronLeft,
  CircleCheck,
  MapPin,
  Navigation,
  Phone,
  Store,
  Wallet,
} from 'lucide-react-native';
import { OrderStatus, RiderOrder } from '../api/types';
import { getErrorMessage } from '../api/client';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card, ChipButton, EmptyState, FullScreenLoader, Pill } from '../components/ui';
import { colors, radii, shadows, spacing } from '../config/theme';
import { useOrder, useOrderAction } from '../hooks/useDelivery';
import { RootStackParamList } from '../navigation/types';
import { formatPaise, formatTime } from '../utils/format';
import { callPhone, openDirections } from '../utils/links';
import { getRiderStep, getStatusMeta } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const STEPS = ['Assigned', 'Picked up', 'Delivered'];

export const OrderDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params;
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useOrder(orderId);
  const action = useOrderAction();

  const run = (a: 'accept' | 'release' | 'pickup' | 'deliver') =>
    action.mutate({ orderId, action: a });

  const confirmDeliver = (o: RiderOrder) => {
    const cashLine =
      o.amountToCollect > 0
        ? `Collect ${formatPaise(o.amountToCollect)} in cash before handing over.`
        : 'This order is prepaid. Nothing to collect.';
    Alert.alert('Mark as delivered?', cashLine, [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Delivered', onPress: () => run('deliver') },
    ]);
  };

  const confirmRelease = () =>
    Alert.alert('Release this order?', 'Another rider will be able to pick it up.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Release', style: 'destructive', onPress: () => run('release') },
    ]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.back}
        accessibilityLabel="Back"
      >
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <AppText variant="md" weight="bold" style={styles.flex1} numberOfLines={1}>
        {order ? `#${order.orderNumber}` : 'Order'}
      </AppText>
      {order ? <Pill {...getStatusMeta(order)} /> : null}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.flex}>
        {header}
        <FullScreenLoader />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.flex}>
        {header}
        <EmptyState
          icon={<Store size={48} color={colors.textLight} />}
          title="Order unavailable"
          subtitle={`${getErrorMessage(error)}\nIt may have been taken by another rider.`}
        />
        <View style={styles.pad}>
          <Button title="Back to orders" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const isCancelled = order.status === OrderStatus.CANCELLED;
  const isDelivered = order.status === OrderStatus.DELIVERED;
  const isPrePickup =
    order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.PREPARING;
  const step = getRiderStep(order.status);
  // Before pickup the rider is heading to the store, afterwards to the customer.
  const headingToCustomer = order.status === OrderStatus.OUT_FOR_DELIVERY;

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" />
      {header}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            colors={[colors.primary]}
          />
        }
      >
        {isCancelled ? (
          <Card style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
            <AppText weight="bold" color={colors.danger}>
              This order was cancelled
            </AppText>
            {order.cancelReason ? (
              <AppText variant="sm" color={colors.danger}>
                {order.cancelReason}
              </AppText>
            ) : null}
          </Card>
        ) : null}

        {isDelivered ? (
          <Card style={[styles.banner, styles.deliveredBanner]}>
            <CircleCheck size={36} color={colors.success} />
            <AppText variant="md" weight="bold" style={styles.mt8}>
              Delivered at {formatTime(order.deliveredAt)}
            </AppText>
            <AppText variant="sm" color={colors.textMuted}>
              Nice work! This delivery has been added to your summary.
            </AppText>
          </Card>
        ) : null}

        {order.isMine && !isCancelled ? (
          <Card style={styles.section}>
            <View style={styles.steps}>
              {STEPS.map((label, i) => (
                <View key={label} style={styles.step}>
                  <View style={[styles.dot, i <= step && styles.dotDone]}>
                    {i <= step ? <Check size={14} color={colors.white} /> : null}
                  </View>
                  <AppText
                    variant="xs"
                    weight={i === step ? 'bold' : 'regular'}
                    color={i <= step ? colors.text : colors.textLight}
                  >
                    {label}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Pickup */}
        <Card style={[styles.section, !headingToCustomer && !isDelivered && styles.focus]}>
          <View style={styles.row}>
            <Store size={18} color={colors.primary} />
            <AppText variant="xs" weight="bold" color={colors.primary} style={styles.ml8}>
              PICKUP
            </AppText>
          </View>
          <AppText weight="semibold" style={styles.mt8}>
            {order.pickup.name}
          </AppText>
          <AppText variant="sm" color={colors.textMuted}>
            {order.pickup.address}
          </AppText>
          {!isDelivered && !isCancelled ? (
            <View style={[styles.row, styles.mt12]}>
              <ChipButton
                label="Directions"
                icon={<Navigation size={14} color={colors.primaryDark} />}
                onPress={() =>
                  openDirections(order.pickup.lat, order.pickup.lng, order.pickup.address)
                }
              />
              {order.pickup.phone ? (
                <ChipButton
                  label="Call store"
                  icon={<Phone size={14} color={colors.primaryDark} />}
                  onPress={() => callPhone(order.pickup.phone)}
                />
              ) : null}
            </View>
          ) : null}
        </Card>

        {/* Drop */}
        <Card style={[styles.section, headingToCustomer && styles.focus]}>
          <View style={styles.row}>
            <MapPin size={18} color={colors.danger} />
            <AppText variant="xs" weight="bold" color={colors.danger} style={styles.ml8}>
              DROP{order.drop.label ? ` · ${order.drop.label.toUpperCase()}` : ''}
            </AppText>
            {order.distanceKm !== null ? (
              <AppText variant="xs" color={colors.textMuted} style={styles.mlAuto}>
                {order.distanceKm} km from store
              </AppText>
            ) : null}
          </View>
          <AppText weight="semibold" style={styles.mt8}>
            {order.drop.customerName}
          </AppText>
          <AppText variant="sm" color={colors.textMuted}>
            {order.drop.addressLine}
          </AppText>
          {order.drop.landmark ? (
            <AppText variant="sm" color={colors.textMuted}>
              Landmark: {order.drop.landmark}
            </AppText>
          ) : null}
          {!isDelivered && !isCancelled ? (
            <View style={[styles.row, styles.mt12]}>
              <ChipButton
                label="Directions"
                icon={<Navigation size={14} color={colors.primaryDark} />}
                onPress={() =>
                  openDirections(order.drop.lat, order.drop.lng, order.drop.addressLine)
                }
              />
              {order.drop.customerPhone ? (
                <ChipButton
                  label="Call customer"
                  icon={<Phone size={14} color={colors.primaryDark} />}
                  onPress={() => callPhone(order.drop.customerPhone)}
                />
              ) : null}
            </View>
          ) : null}
        </Card>

        {/* Payment */}
        <Card style={[styles.section, styles.row]}>
          <Wallet size={20} color={order.amountToCollect > 0 ? colors.warning : colors.success} />
          <View style={[styles.ml8, styles.flex1]}>
            <AppText weight="semibold">
              {order.amountToCollect > 0
                ? `Collect ${formatPaise(order.amountToCollect)} cash`
                : order.paymentMethod === 'cod'
                ? 'Cash collected'
                : 'Prepaid online'}
            </AppText>
            <AppText variant="xs" color={colors.textMuted}>
              Order total {formatPaise(order.grandTotal)}
            </AppText>
          </View>
        </Card>

        {/* Items */}
        <Card style={styles.section}>
          <AppText weight="semibold" style={styles.mb8}>
            {order.itemCount} item{order.itemCount === 1 ? '' : 's'} in this bag
          </AppText>
          {order.items.map((item, i) => (
            <View key={`${item.name}-${i}`} style={styles.itemRow}>
              <AppText variant="sm" style={styles.flex1} numberOfLines={1}>
                {item.name}
                <AppText variant="sm" color={colors.textMuted}>
                  {' '}
                  · {item.unit}
                </AppText>
              </AppText>
              <AppText variant="sm" weight="semibold">
                ×{item.quantity}
              </AppText>
            </View>
          ))}
          {order.notes ? (
            <View style={styles.note}>
              <AppText variant="xs" color={colors.textMuted}>
                Customer note
              </AppText>
              <AppText variant="sm">{order.notes}</AppText>
            </View>
          ) : null}
        </Card>

        {isPrePickup && order.isMine ? (
          <TouchableOpacity onPress={confirmRelease} style={styles.release}>
            <AppText variant="sm" color={colors.danger} weight="medium">
              Can't do this delivery? Release order
            </AppText>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Primary action */}
      {!isCancelled && !isDelivered ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {!order.isMine ? (
            <Button
              title="Accept delivery"
              size="large"
              loading={action.isPending}
              onPress={() => run('accept')}
            />
          ) : isPrePickup ? (
            <Button
              title="Picked up from store"
              size="large"
              loading={action.isPending}
              onPress={() => run('pickup')}
            />
          ) : (
            <Button
              title="Mark as delivered"
              size="large"
              loading={action.isPending}
              onPress={() => confirmDeliver(order)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  pad: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    ...shadows.subtle,
  },
  back: { padding: spacing.xs, marginRight: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  section: { marginBottom: spacing.md },
  focus: { borderWidth: 1.5, borderColor: colors.primary },
  banner: { marginBottom: spacing.md },
  deliveredBanner: { alignItems: 'center', backgroundColor: colors.successSoft },
  row: { flexDirection: 'row', alignItems: 'center' },
  ml8: { marginLeft: spacing.sm },
  mlAuto: { marginLeft: 'auto' },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: spacing.md },
  mb8: { marginBottom: spacing.sm },
  steps: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { alignItems: 'center', flex: 1 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  note: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
  },
  release: { alignItems: 'center', padding: spacing.md },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.floating,
  },
});
