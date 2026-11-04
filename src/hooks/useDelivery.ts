import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { deliveryApi, OrderAction } from '../api/delivery.api';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/auth.store';

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

const ACTION_SUCCESS: Record<OrderAction, string> = {
  accept: 'Order assigned to you',
  release: 'Order released',
  pickup: 'Picked up. Head to the customer',
  deliver: 'Delivered. Great job!',
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
      if (action !== 'deliver') {
        // Delivered has its own success screen state; others get a quick confirmation.
        Alert.alert(ACTION_SUCCESS[action]);
      }
    },
    onError: error => {
      // Someone else may have changed the order (store cancelled, another rider accepted).
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Could not update order', getErrorMessage(error));
    },
  });
};

export const useAvailability = () => {
  const setRider = useAuthStore(s => s.setRider);
  return useMutation({
    mutationFn: deliveryApi.setAvailability,
    onSuccess: rider => setRider(rider),
    onError: error => Alert.alert('Could not change status', getErrorMessage(error)),
  });
};
