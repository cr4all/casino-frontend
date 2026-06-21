/**
 * Languages shown first in the picker (pinned order).
 *
 * Keep this file when adding new locales — do NOT rely on LANGUAGE_DEFINITIONS
 * array order in index.ts, which is maintained alphabetically for developer ergonomics.
 */
export const PRIORITY_LANGUAGE_CODES = [
  'en', // English
  'de', // Germany
  'es', // Español
  'it', // Italian
  'pt', // Portugal
  'pt-br', // Brasil
  'ar', // Arabic
  'sq', // Albanian
  'tr', // Turkish
] as const;

export type PriorityLanguageCode = (typeof PRIORITY_LANGUAGE_CODES)[number];
