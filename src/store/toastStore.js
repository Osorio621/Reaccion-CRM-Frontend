import { create } from 'zustand';

let nextId = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const t = { id: ++nextId, message, tone };
    set((s) => ({ toasts: [...s.toasts, t] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) }));
    }, 4000);
  },
}));

export const toast = {
  success: (message) => useToastStore.getState().push(message, 'success'),
  error: (message) => useToastStore.getState().push(message, 'error'),
};
