import type { Language } from '@/i18n';
import { isLanguage } from '@/i18n';
import { applyPhraseMap } from './applyPhraseMap';
import { legalEn } from './en';
import { legalKo } from './ko';
import type { LegalContentBundle, LegalPageId } from './types';

const phraseMaps = import.meta.glob('./phraseMaps/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

const phraseMapsByLanguage: Partial<Record<Language, Record<string, string>>> = {};

/** Regional variants reuse the parent language legal content. */
const LEGAL_LANGUAGE_FALLBACK: Partial<Record<Language, Language>> = {
  'ar-ma': 'ar',
  'ar-dz': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
};

function resolveLegalLanguage(language: Language): Language {
  return LEGAL_LANGUAGE_FALLBACK[language] ?? language;
}

for (const [path, map] of Object.entries(phraseMaps)) {
  const lang = path.match(/\/([^/]+)\.json$/)?.[1];
  if (!lang || lang === 'ko' || !isLanguage(lang)) continue;
  phraseMapsByLanguage[lang] = map;
}

const bundleCache = new Map<Language, LegalContentBundle>();

function getLegalBundle(language: Language): LegalContentBundle {
  const resolved = resolveLegalLanguage(language);
  if (resolved === 'en') return legalEn;
  if (resolved === 'ko') return legalKo;

  const cached = bundleCache.get(resolved);
  if (cached) return cached;

  const phraseMap = phraseMapsByLanguage[resolved];
  if (!phraseMap) return legalEn;

  const bundle = applyPhraseMap(legalEn, phraseMap);
  bundleCache.set(resolved, bundle);
  return bundle;
}

export function getLegalPageContent(language: Language, pageId: LegalPageId) {
  const bundle = getLegalBundle(language);
  return bundle[pageId] ?? legalEn[pageId];
}

export type { LegalPageId };
