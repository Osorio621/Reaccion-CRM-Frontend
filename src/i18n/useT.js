import { useLanguageStore } from '../store/languageStore';
import es from './es';
import en from './en';

const translations = { es, en };

/**
 * Hook principal de traducciones.
 * Uso: const { t, lang, setLang } = useT();
 *      t('nav.clientes') => 'Clientes' | 'Clients'
 */
export function useT() {
  // Selector explícito para que Zustand detecte correctamente el cambio de lang
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const toggleLang = useLanguageStore((s) => s.toggleLang);

  const dict = translations[lang] ?? translations.es;

  /**
   * Resuelve una clave con notación de punto, ej: 'nav.clientes'
   * Si la clave no existe, devuelve el fallback o la clave misma.
   */
  const t = (key, fallback) => {
    const parts = key.split('.');
    let value = dict;
    for (const part of parts) {
      if (value == null || typeof value !== 'object') {
        return fallback ?? key;
      }
      value = value[part];
    }
    if (value == null || typeof value === 'object') {
      return fallback ?? key;
    }
    return value;
  };

  return { t, lang, setLang, toggleLang };
}
