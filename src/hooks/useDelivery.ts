import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryApi, OrderAction } from '../api/delivery.api';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { toast } from '../store/ui.store';

const POLL_MS = 10000;

export const keys = {
  available: ['orders', 'available'] as const,
  active: ['orders', 'active'] as const,
  history: ['orders', 'history'] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
  summary: ['summary'] as const,
};

export const useAvailableOrders = () =>
  useQuery({ queryKey: keys.available, queryFn: deliveryApi.available, refetchInterval: POLL_MS });

export const useActiveOrders = () =>
  useQuery({ queryKey: keys.active, queryFn: deliveryApi.active, refetchInterval: POLL_MS });

export const useHistory = () => useQuery({ queryKey: keys.history, queryFn: deliveryApi.history });

export const useSummary = () =>
  useQuery({ queryKey: keys.summary, queryFn: deliveryApi.summary, refetchInterval: 30000 });

export const useOrder = (orderId: string) =>
  useQuery({
    queryKey: keys.order(orderId),
    queryFn: () => deliveryApi.order(orderId),
    refetchInterval: POLL_MS,
  });

const ACTION_SUCCESS: Record<OrderAction, { title: string; message: string }> = {
  accept: { title: 'Order assigned to you', message: 'Head to the store for pickup.' },
  release: { title: 'Order released', message: 'Another rider can pick it up now.' },
  pickup: { title: 'Picked up', message: 'Head to the customer.' },
  deliver: { title: 'Delivered', message: 'Great job! Added to today’s summary.' },
};

/** accept / release / pickup / deliver, with list refresh and friendly errors. */
export const useOrderAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action: OrderAction }) =>
      deliveryApi.action(orderId, action),
    onSuccess: (order, { action }) => {
      queryClient.setQueryData(keys.order(order.id), order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: keys.summary });
      toast(ACTION_SUCCESS[action].message, 'success', ACTION_SUCCESS[action].title);
    },
    onError: error => {
      // Someone else may have changed the order (store cancelled, another rider accepted).
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast(getErrorMessage(error), 'error', 'Could not update order');
    },
  });
};

export const useAvailability = () => {
  const setRider = useAuthStore(s => s.setRider);
  return useMutation({
    mutationFn: deliveryApi.setAvailability,
    onSuccess: rider => {
      setRider(rider);
      toast(rider.isOnline ? 'You will now receive new orders.' : 'You will not receive new orders.', 'info', rider.isOnline ? 'You are online' : 'You are offline');
    },
    onError: error => toast(getErrorMessage(error), 'error', 'Could not change status'),
  });
};
