import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
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

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, usuario: null, rol: null }),
    }),
    {
      name: 'crm-auth', // clave en localStorage
      // Solo persistir tokens y datos de sesión (no funciones)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        usuario: state.usuario,
        rol: state.rol,
      }),
    }
  )
);
