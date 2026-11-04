import { OrderStatus, RiderOrder } from '../api/types';
import { colors } from '../config/theme';

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

export const getStatusMeta = (order: RiderOrder): StatusMeta => {
  switch (order.status) {
    case OrderStatus.ACCEPTED:
      return order.isMine
        ? { label: 'Go to store', color: colors.primaryDark, bg: colors.primarySoft }
        : { label: 'Store accepted', color: colors.primaryDark, bg: colors.primarySoft };
    case OrderStatus.PREPARING:
      return { label: 'Packing', color: colors.warning, bg: colors.warningSoft };
    case OrderStatus.OUT_FOR_DELIVERY:
      return { label: 'On the way', color: colors.discountBadge, bg: '#EDE9FE' };
    case OrderStatus.DELIVERED:
      return { label: 'Delivered', color: colors.success, bg: colors.successSoft };
    case OrderStatus.CANCELLED:
      return { label: 'Cancelled', color: colors.danger, bg: colors.dangerSoft };
    default:
      return { label: 'Placed', color: colors.textMuted, bg: colors.borderLight };
  }
};

/** 0 = assigned, 1 = picked up, 2 = delivered */
export const getRiderStep = (status: OrderStatus): number => {
  if (status === OrderStatus.DELIVERED) return 2;
  if (status === OrderStatus.OUT_FOR_DELIVERY) return 1;
  return 0;
};
