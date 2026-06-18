import type { LegalContentBundle } from './types';

export function applyPhraseMap(
  bundle: LegalContentBundle,
  phraseMap: Record<string, string>,
): LegalContentBundle {
  const sortedEntries = Object.entries(phraseMap).sort((a, b) => b[0].length - a[0].length);
  const json = JSON.stringify(bundle);

  let translated = json;
  for (const [english, localized] of sortedEntries) {
    if (!english || english === localized) continue;
    translated = translated.split(english).join(localized);
  }

  return JSON.parse(translated) as LegalContentBundle;
}
