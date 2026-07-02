#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const cachePath = join(root, 'scripts/i18n-announcements-data.json');
const staticPath = join(root, 'scripts/announcements-static-overrides.json');

const EXPORT_NAMES = {
  'ar-ma': 'arMa',
  'ar-dz': 'arDz',
  'ar-tn': 'arTn',
  'de-be': 'deBe',
  'fr-be': 'frBe',
  'nl-be': 'nlBe',
  'pt-br': 'ptBr',
  'zh-tw': 'zhTw',
};

const VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
  'pt-br': 'pt',
  'zh-tw': 'zh',
};

const ENGLISH_PATHS = {
  'nav.notices': en.nav.notices,
  'nav.noticesLabel': en.nav.noticesLabel,
  'announcement.popupBadge': en.announcement.popupBadge,
  'announcement.popupClose': en.announcement.popupClose,
  'announcement.popupConfirm': en.announcement.popupConfirm,
  'announcement.hideForToday': en.announcement.hideForToday,
};

const MANUAL = {
  ko: {
    'nav.notices': '알림',
    'nav.noticesLabel': '알림',
    'announcement.popupBadge': '공지',
    'announcement.popupClose': '닫기',
    'announcement.popupConfirm': '확인',
    'announcement.hideForToday': '하루동안 표시하지 않기',
  },
  de: {
    'nav.notices': 'MITTEILUNGEN',
    'nav.noticesLabel': 'Hinweise',
    'announcement.popupBadge': 'Mitteilung',
    'announcement.popupClose': 'Schließen',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': 'Heute nicht mehr anzeigen',
  },
  fr: {
    'nav.notices': 'AVIS',
    'nav.noticesLabel': 'Avis',
    'announcement.popupBadge': 'Annonce',
    'announcement.popupClose': 'Fermer',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': "Ne plus afficher aujourd'hui",
  },
  es: {
    'nav.notices': 'AVISOS',
    'nav.noticesLabel': 'Avisos',
    'announcement.popupBadge': 'Anuncio',
    'announcement.popupClose': 'Cerrar',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': 'No volver a mostrar hoy',
  },
  ja: {
    'nav.notices': 'お知らせ',
    'nav.noticesLabel': 'お知らせ',
    'announcement.popupBadge': 'お知らせ',
    'announcement.popupClose': '閉じる',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': '今日は再表示しない',
  },
  zh: {
    'nav.notices': '通知',
    'nav.noticesLabel': '通知',
    'announcement.popupBadge': '公告',
    'announcement.popupClose': '关闭',
    'announcement.popupConfirm': '确定',
    'announcement.hideForToday': '今天不再显示',
  },
  'zh-tw': {
    'nav.notices': '通知',
    'nav.noticesLabel': '通知',
    'announcement.popupBadge': '公告',
    'announcement.popupClose': '關閉',
    'announcement.popupConfirm': '確定',
    'announcement.hideForToday': '今天不再顯示',
  },
};

function setNested(obj, pathParts, value) {
  let cur = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!cur[pathParts[i]] || typeof cur[pathParts[i]] !== 'object') {
      cur[pathParts[i]] = {};
    }
    cur = cur[pathParts[i]];
  }
  cur[pathParts[pathParts.length - 1]] = value;
}

function applyPathsToLocale(locale, paths) {
  const next = {
    ...locale,
    nav: { ...locale.nav },
    announcement: { ...(locale.announcement ?? {}) },
  };

  for (const [path, value] of Object.entries(paths)) {
    setNested(next, path.split('.'), value);
  }

  return next;
}

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return mod[exportName];
}

function resolvePaths(langCode, cache, staticOverrides) {
  const parent = VARIANT_PARENT[langCode];
  const manual = MANUAL[langCode] ?? (parent ? MANUAL[parent] : null);
  const staticPaths = staticOverrides[langCode] ?? (parent ? staticOverrides[parent] : null);
  const resolved = {};

  for (const [path, english] of Object.entries(ENGLISH_PATHS)) {
    if (manual?.[path]) {
      resolved[path] = manual[path];
      continue;
    }

    if (staticPaths?.[path]) {
      resolved[path] = staticPaths[path];
      continue;
    }

    const cached = cache[langCode]?.[path];
    if (cached && cached !== english) {
      resolved[path] = cached;
    }
  }

  return resolved;
}

const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const staticOverrides = existsSync(staticPath) ? JSON.parse(readFileSync(staticPath, 'utf8')) : {};

for (const langCode of [...new Set([...Object.keys(cache), ...Object.keys(staticOverrides), ...Object.keys(MANUAL)])]) {
  if (VARIANT_PARENT[langCode]) continue;
  const paths = resolvePaths(langCode, cache, staticOverrides);
  if (Object.keys(paths).length === 0) continue;
  const locale = await loadLocale(langCode);
  writeLocaleFile(langCode, applyPathsToLocale(locale, paths));
  console.log(`${langCode}: applied ${Object.keys(paths).length} paths`);
}

for (const langCode of Object.keys(MANUAL)) {
  if (cache[langCode]) continue;
  const locale = await loadLocale(langCode);
  writeLocaleFile(langCode, applyPathsToLocale(locale, MANUAL[langCode]));
  console.log(`${langCode}: applied manual`);
}

for (const [child, parent] of Object.entries(VARIANT_PARENT)) {
  const parentPath = join(localesDir, `${parent}.ts`);
  const childPath = join(localesDir, `${child}.ts`);
  if (existsSync(parentPath)) {
    writeFileSync(childPath, readFileSync(parentPath, 'utf8').replace(
      new RegExp(`export const ${EXPORT_NAMES[parent] ?? parent.replace(/-/g, '')}`),
      `export const ${EXPORT_NAMES[child] ?? child.replace(/-/g, '')}`,
    ));
    console.log(`${child}: copied from ${parent}`);
  }
}

console.log('done');
