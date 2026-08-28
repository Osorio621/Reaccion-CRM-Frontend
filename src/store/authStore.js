import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  refreshToken: null,
  usuario: null, // { id, nombre, email, rol }
  rol: null, // 'EJECUTIVO' | 'GERENTE' | 'ADMIN'

  setAuth: (data) =>
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      usuario: data.usuario,
      rol: data.usuario.rol,
    }),

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

  logout: () =>
    set({ accessToken: null, refreshToken: null, usuario: null, rol: null }),
}));
