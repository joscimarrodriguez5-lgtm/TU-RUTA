import { es } from './es';
import { en } from './en';
import { pt } from './pt';
import { fr } from './fr';
import type { Language } from '../types';

export const translations = { es, en, pt, fr };

export type TranslationKey = keyof typeof es;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations['es'][key] ?? key;
}

export { es, en, pt, fr };
