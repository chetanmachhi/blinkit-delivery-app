export enum OrderStatus {
  PLACED = 'placed',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Backend envelope used by every module. */
export interface ResponseModel<T = unknown> {
  statusCode: number;
  showMessage: boolean;
  message: string;
  data?: T;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleNumber?: string;
  isOnline: boolean;
}

export interface RiderSummary {
  todayDeliveries: number;
  /** Paise */
  todayCashCollected: number;
  totalDeliveries: number;
  activeCount: number;
}

export interface RiderOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  isMine: boolean;
  createdAt: string;
  estimatedDeliveryAt?: string;
  riderAssignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelReason?: string;
  pickup: {
    storeId: string;
    name: string;
    address: string;
    phone: string;
    lat: number | null;
    lng: number | null;
  };
  drop: {
    customerName: string;
    customerPhone: string | null;
    label?: string;
    addressLine: string;
    landmark?: string;
    lat: number | null;
    lng: number | null;
  };
  distanceKm: number | null;
  items: { name: string; unit: string; quantity: number }[];
  itemCount: number;
  /** Paise */
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Paise. 0 when prepaid. */
  amountToCollect: number;
  notes?: string;
}
