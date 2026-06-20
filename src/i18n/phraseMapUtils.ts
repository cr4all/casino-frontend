import type { LocaleTree } from './locales/en';

export function applyPhraseMapToValues<T>(
  tree: T,
  phraseMap: Record<string, string>,
): T {
  function walk(node: unknown): unknown {
    if (typeof node === 'string') {
      const localized = phraseMap[node];
      return localized && localized !== node ? localized : node;
    }

    if (Array.isArray(node)) {
      return node.map(walk);
    }

    if (node && typeof node === 'object') {
      const output: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node)) {
        output[key] = walk(value);
      }
      return output;
    }

    return node;
  }

  return walk(tree) as T;
}

export function mergePhraseMaps(
  ...maps: Array<Record<string, string> | undefined>
): Record<string, string> {
  return Object.assign({}, ...maps.filter(Boolean));
}

export function buildLocalizedTree(
  english: LocaleTree,
  phraseMap: Record<string, string>,
): LocaleTree {
  return applyPhraseMapToValues(english, phraseMap);
}
