import type { LegalContentBundle } from './types';
import { applyPhraseMapToValues } from '../../i18n/phraseMapUtils';

export function applyPhraseMap(
  bundle: LegalContentBundle,
  phraseMap: Record<string, string>,
): LegalContentBundle {
  const filteredMap = Object.fromEntries(
    Object.entries(phraseMap).filter(
      ([english, localized]) =>
        english && localized && english !== localized && english !== './types',
    ),
  );

  return applyPhraseMapToValues(bundle, filteredMap);
}
