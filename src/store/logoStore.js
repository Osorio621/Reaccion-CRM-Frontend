import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLogoStore = create(
  persist(
    (set) => ({
      // Default configuration - login usa reaccion, sidebar usa Rv.png
      loginLogoUrl: '/logo-reaccion-crm.png',
      sidebarLogoUrl: '/logo-Rv.png',
      logoAlt: 'Reactivos del Valle',
      logoWidth: 100,
      logoHeight: 'auto',
      logoMaxWidth: '100%',
      logoMaxHeight: 100,

      setLogoConfig: (config) => set(config),
      setLoginLogoUrl: (url) => set({ loginLogoUrl: url }),
      setSidebarLogoUrl: (url) => set({ sidebarLogoUrl: url }),
      setLogoDimensions: (dimensions) => set(dimensions),
      resetLogoConfig: () => set({
        loginLogoUrl: '/logo-reaccion-crm.png',
        sidebarLogoUrl: '/logo-Rv.png',
        logoAlt: 'Reactivos del Valle',
        logoWidth: 100,
        logoHeight: 'auto',
        logoMaxWidth: '100%',
        logoMaxHeight: 100,
      }),
    }),
    {
      name: 'crm-logo-config',
    }
  )
);