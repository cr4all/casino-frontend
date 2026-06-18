import type { Language } from '@/i18n';
import { applyPhraseMap } from './applyPhraseMap';
import { legalEn } from './en';
import { legalKo } from './ko';
import type { LegalContentBundle, LegalPageId } from './types';

const phraseMaps = import.meta.glob('./phraseMaps/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

const bundles: Partial<Record<Language, LegalContentBundle>> = {
  en: legalEn,
  ko: legalKo,
};

for (const [path, map] of Object.entries(phraseMaps)) {
  const match = path.match(/\/([^/]+)\.json$/);
  const lang = match?.[1];
  if (!lang || lang === 'ko') continue;
  bundles[lang as Language] = applyPhraseMap(legalEn, map);
}

export function getLegalPageContent(language: Language, pageId: LegalPageId) {
  const bundle = bundles[language] ?? legalEn;
  return bundle[pageId] ?? legalEn[pageId];
}

export type { LegalPageId };
