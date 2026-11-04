import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MapPin, Store } from 'lucide-react-native';
import { RiderOrder } from '../api/types';
import { colors, spacing } from '../config/theme';
import { formatPaise, timeAgo } from '../utils/format';
import { getStatusMeta } from '../utils/status';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card, Pill } from './ui';

interface Props {
  order: RiderOrder;
  onPress: () => void;
  /** Shown on the "New" tab for one-tap accept. */
  onAccept?: () => void;
  accepting?: boolean;
  acceptDisabled?: boolean;
}

export const OrderCard: React.FC<Props> = ({
  order,
  onPress,
  onAccept,
  accepting,
  acceptDisabled,
}) => {
  const meta = getStatusMeta(order);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <AppText weight="bold">#{order.orderNumber}</AppText>
          <Pill label={meta.label} color={meta.color} bg={meta.bg} />
        </View>
        <AppText variant="xs" color={colors.textMuted} style={styles.sub}>
          {timeAgo(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
          {order.distanceKm !== null ? ` · ${order.distanceKm} km` : ''}
        </AppText>

        <View style={styles.leg}>
          <Store size={16} color={colors.primary} />
          <AppText variant="sm" numberOfLines={1} style={styles.legText}>
            {order.pickup.name}
          </AppText>
        </View>
        <View style={styles.connector} />
        <View style={styles.leg}>
          <MapPin size={16} color={colors.danger} />
          <AppText variant="sm" numberOfLines={2} style={styles.legText}>
            {order.drop.addressLine}
          </AppText>
        </View>

        <View style={[styles.rowBetween, styles.footer]}>
          {order.amountToCollect > 0 ? (
            <Pill
              label={`Collect ${formatPaise(order.amountToCollect)} cash`}
              color={colors.warning}
              bg={colors.warningSoft}
            />
          ) : (
            <Pill label="Prepaid" color={colors.success} bg={colors.successSoft} />
          )}
          {onAccept ? (
            <Button
              title="Accept"
              size="small"
              onPress={onAccept}
              loading={accepting}
              disabled={acceptDisabled}
              style={styles.accept}
            />
          ) : (
            <AppText variant="sm" weight="semibold">
              {formatPaise(order.grandTotal)}
            </AppText>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sub: { marginTop: 2, marginBottom: spacing.md },
  leg: { flexDirection: 'row', alignItems: 'center' },
  legText: { marginLeft: spacing.sm, flex: 1 },
  connector: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 7,
    marginVertical: 2,
  },
  footer: { marginTop: spacing.md },
  accept: { minWidth: 96 },
});
