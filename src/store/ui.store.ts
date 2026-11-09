import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Highlighted line, e.g. the cash amount to collect */
  highlight?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'primary' | 'danger';
}

interface UiState {
  toast: ToastState | null;
  confirm: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null;
  showToast: (message: string, type?: ToastType, title?: string) => void;
  hideToast: () => void;
  askConfirm: (options: ConfirmOptions) => Promise<boolean>;
  closeConfirm: (ok: boolean) => void;
}

let toastSeq = 0;

/**
 * In-app replacements for the native Alert dialog, so feedback looks like part
 * of the app (branded toast + bottom-sheet confirmation) instead of a system popup.
 */
export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  confirm: null,

  showToast: (message, type = 'success', title) => set({ toast: { id: ++toastSeq, message, type, title } }),
  hideToast: () => set({ toast: null }),

  askConfirm: options =>
    new Promise<boolean>(resolve => {
      get().confirm?.resolve(false);
      set({ confirm: { ...options, resolve } });
    }),
  closeConfirm: ok => {
    get().confirm?.resolve(ok);
    set({ confirm: null });
  },
}));

/** Usable outside React components (hooks, utils). */
export const toast = (message: string, type?: ToastType, title?: string) =>
  useUiStore.getState().showToast(message, type, title);

export const confirmAsync = (options: ConfirmOptions) => useUiStore.getState().askConfirm(options);
