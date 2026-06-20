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

for (const [path, map] of Object.entries(phraseMaps)) {
  const lang = path.match(/\/([^/]+)\.json$/)?.[1];
  if (!lang || lang === 'ko' || !isLanguage(lang)) continue;
  phraseMapsByLanguage[lang] = map;
}

const bundleCache = new Map<Language, LegalContentBundle>();

function getLegalBundle(language: Language): LegalContentBundle {
  if (language === 'en') return legalEn;
  if (language === 'ko') return legalKo;

  const cached = bundleCache.get(language);
  if (cached) return cached;

  const phraseMap = phraseMapsByLanguage[language];
  if (!phraseMap) return legalEn;

  const bundle = applyPhraseMap(legalEn, phraseMap);
  bundleCache.set(language, bundle);
  return bundle;
}

export function getLegalPageContent(language: Language, pageId: LegalPageId) {
  const bundle = getLegalBundle(language);
  return bundle[pageId] ?? legalEn[pageId];
}

export type { LegalPageId };
