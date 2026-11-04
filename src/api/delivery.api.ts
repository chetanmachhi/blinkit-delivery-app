import { apiClient, unwrap } from './client';
import { ResponseModel, Rider, RiderOrder, RiderSummary } from './types';

type R<T> = { data: ResponseModel<T> };

export const deliveryApi = {
  login: async (phone: string, password: string) =>
    unwrap(
      await apiClient.post<ResponseModel<{ accessToken: string; rider: Rider }>>(
        '/auth/login',
        { phone, password },
      ),
    ),

  me: async () => unwrap<Rider>(await apiClient.get<ResponseModel<Rider>>('/me')),

  setAvailability: async (isOnline: boolean) =>
    unwrap<Rider>(
      await apiClient.patch<ResponseModel<Rider>>('/me/availability', { isOnline }),
    ),

  summary: async () =>
    unwrap<RiderSummary>(await apiClient.get<ResponseModel<RiderSummary>>('/me/summary')),

  available: async () =>
    unwrap<RiderOrder[]>(await apiClient.get<ResponseModel<RiderOrder[]>>('/orders/available')),

  active: async () =>
    unwrap<RiderOrder[]>(await apiClient.get<ResponseModel<RiderOrder[]>>('/orders/active')),

  history: async () =>
    unwrap<RiderOrder[]>(await apiClient.get<ResponseModel<RiderOrder[]>>('/orders/history')),

  order: async (orderId: string) =>
    unwrap<RiderOrder>(await apiClient.get<ResponseModel<RiderOrder>>(`/orders/${orderId}`)),

  /** accept | release | pickup | deliver */
  action: async (orderId: string, action: OrderAction) =>
    unwrap<RiderOrder>(
      (await apiClient.post<ResponseModel<RiderOrder>>(
        `/orders/${orderId}/${action}`,
      )) as R<RiderOrder>,
    ),
};

export type OrderAction = 'accept' | 'release' | 'pickup' | 'deliver';
