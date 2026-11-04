import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Rider } from '../api/types';

const TOKEN_KEY = 'delivery.accessToken';
const RIDER_KEY = 'delivery.rider';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  rider: Rider | null;
  /** Restores a saved session on app start. */
  bootstrap: () => Promise<void>;
  signIn: (token: string, rider: Rider) => Promise<void>;
  setRider: (rider: Rider) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  token: null,
  rider: null,

  bootstrap: async () => {
    try {
      const [token, riderJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(RIDER_KEY),
      ]);
      if (token && riderJson) {
        set({ status: 'signedIn', token, rider: JSON.parse(riderJson) as Rider });
        return;
      }
    } catch {
      // Corrupt storage: fall through to signed out.
    }
    set({ status: 'signedOut', token: null, rider: null });
  },

  signIn: async (token, rider) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [RIDER_KEY, JSON.stringify(rider)],
    ]);
    set({ status: 'signedIn', token, rider });
  },

  setRider: rider => {
    AsyncStorage.setItem(RIDER_KEY, JSON.stringify(rider)).catch(() => {});
    set({ rider });
  },

  signOut: async () => {
    if (get().status === 'signedOut') return;
    await AsyncStorage.multiRemove([TOKEN_KEY, RIDER_KEY]).catch(() => {});
    set({ status: 'signedOut', token: null, rider: null });
  },
}));
