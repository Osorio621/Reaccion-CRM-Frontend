import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'es', // por defecto español

      setLang: (lang) => set({ lang }),

      toggleLang: () =>
        set({ lang: get().lang === 'es' ? 'en' : 'es' }),
    }),
    {
      name: 'crm-lang', // clave en localStorage
    }
  )
);
