#!/usr/bin/env node
/**
 * Sync player supportTickets + nav.supportTickets strings across all locales.
 *
 * Usage:
 *   node scripts/sync-support-tickets-i18n.mjs
 *   node scripts/sync-support-tickets-i18n.mjs --langs=de,fr,ja
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const cachePath = join(root, 'scripts/i18n-support-tickets-data.json');

const require = createRequire(join(root, 'package.json'));

const args = process.argv.slice(2);
const langsArg = args.find((a) => a.startsWith('--langs='));
const onlyLangs = langsArg ? langsArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean) : null;

const SPLIT = '<<|SPLIT|>>';
const LINGVA_HOST = 'https://lingva.ml';
const BATCH_CHAR_LIMIT = 1500;
const REQUEST_DELAY_MS = 1200;

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

const googleLocaleMap = {
  'pt-br': 'pt',
  'zh-tw': 'zh-TW',
  fil: 'tl',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
  'ar-ma': 'ar',
  'ar-dz': 'ar',
  'ar-tn': 'ar',
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

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function buildEnglishPaths() {
  const paths = {
    'nav.supportTickets': en.nav.supportTickets,
    'nav.supportTicketsLabel': en.nav.supportTicketsLabel,
    ...flattenObject(en.supportTickets, 'supportTickets'),
  };
  return paths;
}

const ENGLISH_PATHS = buildEnglishPaths();
const ENGLISH_BY_VALUE = Object.fromEntries(
  Object.entries(ENGLISH_PATHS).map(([, value]) => [value, value]),
);

/** Curated translations (from ko.ts and major locales). */
const MANUAL = {
  ko: {
    'nav.supportTickets': '지원 티켓',
    'nav.supportTicketsLabel': '헬프데스크',
    'supportTickets.title': '지원 티켓',
    'supportTickets.subtitle': '문의를 제출하고 지원팀의 답변을 확인하세요.',
    'supportTickets.newTicket': '새 티켓',
    'supportTickets.subject': '제목',
    'supportTickets.category': '카테고리',
    'supportTickets.message': '메시지',
    'supportTickets.submit': '티켓 제출',
    'supportTickets.createFailed': '티켓을 생성하지 못했습니다. 다시 시도해 주세요.',
    'supportTickets.empty': '지원 티켓이 아직 없습니다.',
    'supportTickets.backToList': '← 티켓 목록으로',
    'supportTickets.notFound': '티켓을 찾을 수 없습니다.',
    'supportTickets.closedHint': '이 티켓은 종료되었습니다. 추가 도움이 필요하면 새 티켓을 열어 주세요.',
    'supportTickets.replyPlaceholder': '답장을 입력하세요...',
    'supportTickets.sendReply': '답장 보내기',
    'supportTickets.replyFailed': '답장을 보내지 못했습니다. 다시 시도해 주세요.',
    'supportTickets.supportTeam': '지원팀',
    'supportTickets.you': '나',
    'supportTickets.categories.account': '계정',
    'supportTickets.categories.payment': '결제',
    'supportTickets.categories.bonus': '보너스',
    'supportTickets.categories.game': '게임',
    'supportTickets.categories.other': '기타',
    'supportTickets.status.open': '열림',
    'supportTickets.status.pending': '대기',
    'supportTickets.status.resolved': '해결됨',
    'supportTickets.status.closed': '종료',
  },
  de: {
    'nav.supportTickets': 'SUPPORT-TICKETS',
    'nav.supportTicketsLabel': 'Helpdesk',
    'supportTickets.title': 'Support-Tickets',
    'supportTickets.subtitle': 'Senden Sie eine Anfrage und verfolgen Sie Antworten unseres Support-Teams.',
    'supportTickets.newTicket': 'Neues Ticket',
    'supportTickets.subject': 'Betreff',
    'supportTickets.category': 'Kategorie',
    'supportTickets.message': 'Nachricht',
    'supportTickets.submit': 'Ticket senden',
    'supportTickets.createFailed': 'Ticket konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
    'supportTickets.empty': 'Noch keine Support-Tickets.',
    'supportTickets.backToList': '← Zurück zu Tickets',
    'supportTickets.notFound': 'Ticket nicht gefunden.',
    'supportTickets.closedHint': 'Dieses Ticket ist geschlossen. Öffnen Sie ein neues Ticket, wenn Sie weitere Hilfe benötigen.',
    'supportTickets.replyPlaceholder': 'Antwort eingeben...',
    'supportTickets.sendReply': 'Antwort senden',
    'supportTickets.replyFailed': 'Antwort konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    'supportTickets.supportTeam': 'Support',
    'supportTickets.you': 'Sie',
    'supportTickets.categories.account': 'Konto',
    'supportTickets.categories.payment': 'Zahlung',
    'supportTickets.categories.bonus': 'Bonus',
    'supportTickets.categories.game': 'Spiel',
    'supportTickets.categories.other': 'Sonstiges',
    'supportTickets.status.open': 'Offen',
    'supportTickets.status.pending': 'Ausstehend',
    'supportTickets.status.resolved': 'Gelöst',
    'supportTickets.status.closed': 'Geschlossen',
  },
  fr: {
    'nav.supportTickets': 'TICKETS D\'ASSISTANCE',
    'nav.supportTicketsLabel': 'Helpdesk',
    'supportTickets.title': 'Tickets d\'assistance',
    'supportTickets.subtitle': 'Soumettez une demande et suivez les réponses de notre équipe d\'assistance.',
    'supportTickets.newTicket': 'Nouveau ticket',
    'supportTickets.subject': 'Objet',
    'supportTickets.category': 'Catégorie',
    'supportTickets.message': 'Message',
    'supportTickets.submit': 'Envoyer le ticket',
    'supportTickets.createFailed': 'Impossible de créer votre ticket. Veuillez réessayer.',
    'supportTickets.empty': 'Aucun ticket d\'assistance pour le moment.',
    'supportTickets.backToList': '← Retour aux tickets',
    'supportTickets.notFound': 'Ticket introuvable.',
    'supportTickets.closedHint': 'Ce ticket est fermé. Ouvrez un nouveau ticket si vous avez besoin d\'aide supplémentaire.',
    'supportTickets.replyPlaceholder': 'Saisissez votre réponse...',
    'supportTickets.sendReply': 'Envoyer la réponse',
    'supportTickets.replyFailed': 'Impossible d\'envoyer votre réponse. Veuillez réessayer.',
    'supportTickets.supportTeam': 'Assistance',
    'supportTickets.you': 'Vous',
    'supportTickets.categories.account': 'Compte',
    'supportTickets.categories.payment': 'Paiement',
    'supportTickets.categories.bonus': 'Bonus',
    'supportTickets.categories.game': 'Jeu',
    'supportTickets.categories.other': 'Autre',
    'supportTickets.status.open': 'Ouvert',
    'supportTickets.status.pending': 'En attente',
    'supportTickets.status.resolved': 'Résolu',
    'supportTickets.status.closed': 'Fermé',
  },
  es: {
    'nav.supportTickets': 'TICKETS DE SOPORTE',
    'nav.supportTicketsLabel': 'Help desk',
    'supportTickets.title': 'Tickets de soporte',
    'supportTickets.subtitle': 'Envíe una solicitud y siga las respuestas de nuestro equipo de soporte.',
    'supportTickets.newTicket': 'Nuevo ticket',
    'supportTickets.subject': 'Asunto',
    'supportTickets.category': 'Categoría',
    'supportTickets.message': 'Mensaje',
    'supportTickets.submit': 'Enviar ticket',
    'supportTickets.createFailed': 'No se pudo crear su ticket. Inténtelo de nuevo.',
    'supportTickets.empty': 'Aún no hay tickets de soporte.',
    'supportTickets.backToList': '← Volver a tickets',
    'supportTickets.notFound': 'Ticket no encontrado.',
    'supportTickets.closedHint': 'Este ticket está cerrado. Abra un nuevo ticket si necesita más ayuda.',
    'supportTickets.replyPlaceholder': 'Escriba su respuesta...',
    'supportTickets.sendReply': 'Enviar respuesta',
    'supportTickets.replyFailed': 'No se pudo enviar su respuesta. Inténtelo de nuevo.',
    'supportTickets.supportTeam': 'Soporte',
    'supportTickets.you': 'Usted',
    'supportTickets.categories.account': 'Cuenta',
    'supportTickets.categories.payment': 'Pago',
    'supportTickets.categories.bonus': 'Bonificación',
    'supportTickets.categories.game': 'Juego',
    'supportTickets.categories.other': 'Otro',
    'supportTickets.status.open': 'Abierto',
    'supportTickets.status.pending': 'Pendiente',
    'supportTickets.status.resolved': 'Resuelto',
    'supportTickets.status.closed': 'Cerrado',
  },
  ja: {
    'nav.supportTickets': 'サポートチケット',
    'nav.supportTicketsLabel': 'ヘルプデスク',
    'supportTickets.title': 'サポートチケット',
    'supportTickets.subtitle': 'リクエストを送信し、サポートチームからの返信を確認できます。',
    'supportTickets.newTicket': '新規チケット',
    'supportTickets.subject': '件名',
    'supportTickets.category': 'カテゴリ',
    'supportTickets.message': 'メッセージ',
    'supportTickets.submit': 'チケットを送信',
    'supportTickets.createFailed': 'チケットを作成できませんでした。もう一度お試しください。',
    'supportTickets.empty': 'サポートチケットはまだありません。',
    'supportTickets.backToList': '← チケット一覧に戻る',
    'supportTickets.notFound': 'チケットが見つかりません。',
    'supportTickets.closedHint': 'このチケットはクローズされています。追加のサポートが必要な場合は新しいチケットを開いてください。',
    'supportTickets.replyPlaceholder': '返信を入力...',
    'supportTickets.sendReply': '返信を送信',
    'supportTickets.replyFailed': '返信を送信できませんでした。もう一度お試しください。',
    'supportTickets.supportTeam': 'サポート',
    'supportTickets.you': 'あなた',
    'supportTickets.categories.account': 'アカウント',
    'supportTickets.categories.payment': '支払い',
    'supportTickets.categories.bonus': 'ボーナス',
    'supportTickets.categories.game': 'ゲーム',
    'supportTickets.categories.other': 'その他',
    'supportTickets.status.open': 'オープン',
    'supportTickets.status.pending': '保留',
    'supportTickets.status.resolved': '解決済み',
    'supportTickets.status.closed': 'クローズ',
  },
  zh: {
    'nav.supportTickets': '支持工单',
    'nav.supportTicketsLabel': '帮助台',
    'supportTickets.title': '支持工单',
    'supportTickets.subtitle': '提交请求并跟踪我们支持团队的回复。',
    'supportTickets.newTicket': '新建工单',
    'supportTickets.subject': '主题',
    'supportTickets.category': '类别',
    'supportTickets.message': '消息',
    'supportTickets.submit': '提交工单',
    'supportTickets.createFailed': '无法创建工单。请重试。',
    'supportTickets.empty': '暂无支持工单。',
    'supportTickets.backToList': '← 返回工单列表',
    'supportTickets.notFound': '未找到工单。',
    'supportTickets.closedHint': '此工单已关闭。如需进一步帮助，请新建工单。',
    'supportTickets.replyPlaceholder': '输入回复...',
    'supportTickets.sendReply': '发送回复',
    'supportTickets.replyFailed': '无法发送回复。请重试。',
    'supportTickets.supportTeam': '支持',
    'supportTickets.you': '您',
    'supportTickets.categories.account': '账户',
    'supportTickets.categories.payment': '支付',
    'supportTickets.categories.bonus': '奖金',
    'supportTickets.categories.game': '游戏',
    'supportTickets.categories.other': '其他',
    'supportTickets.status.open': '开放',
    'supportTickets.status.pending': '待处理',
    'supportTickets.status.resolved': '已解决',
    'supportTickets.status.closed': '已关闭',
  },
  'zh-tw': {
    'nav.supportTickets': '支援工單',
    'nav.supportTicketsLabel': '服務台',
    'supportTickets.title': '支援工單',
    'supportTickets.subtitle': '提交請求並追蹤支援團隊的回覆。',
    'supportTickets.newTicket': '新工單',
    'supportTickets.subject': '主旨',
    'supportTickets.category': '類別',
    'supportTickets.message': '訊息',
    'supportTickets.submit': '提交工單',
    'supportTickets.createFailed': '無法建立工單。請再試一次。',
    'supportTickets.empty': '尚無支援工單。',
    'supportTickets.backToList': '← 返回工單列表',
    'supportTickets.notFound': '找不到工單。',
    'supportTickets.closedHint': '此工單已關閉。如需進一步協助，請建立新工單。',
    'supportTickets.replyPlaceholder': '輸入回覆...',
    'supportTickets.sendReply': '傳送回覆',
    'supportTickets.replyFailed': '無法傳送回覆。請再試一次。',
    'supportTickets.supportTeam': '支援',
    'supportTickets.you': '您',
    'supportTickets.categories.account': '帳戶',
    'supportTickets.categories.payment': '付款',
    'supportTickets.categories.bonus': '獎金',
    'supportTickets.categories.game': '遊戲',
    'supportTickets.categories.other': '其他',
    'supportTickets.status.open': '開啟',
    'supportTickets.status.pending': '待處理',
    'supportTickets.status.resolved': '已解決',
    'supportTickets.status.closed': '已關閉',
  },
};

let googleTranslate = null;
function getGoogleTranslate() {
  if (!googleTranslate) {
    googleTranslate = require('@vitalets/google-translate-api').translate;
  }
  return googleTranslate;
}

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text
    .replace(/\{\{(\w+)\}\}/g, (match) => {
      const token = `__PH_${tokens.length}__`;
      tokens.push(match);
      return token;
    })
    .replace(/:\w+/g, (match) => {
      const token = `__PH_${tokens.length}__`;
      tokens.push(match);
      return token;
    });
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  let restored = text;
  tokens.forEach((token, index) => {
    restored = restored.replace(`__PH_${index}__`, token);
  });
  return restored;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithLingva(text, to, attempt = 1) {
  const target = googleLocaleMap[to] ?? to;
  const url = `${LINGVA_HOST}/api/v1/en/${target}/${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });

  if (response.status === 429 && attempt <= 6) {
    await sleep(10000 * attempt);
    return translateWithLingva(text, to, attempt + 1);
  }

  if (!response.ok) {
    if (attempt <= 3) {
      await sleep(2000 * attempt);
      return translateWithLingva(text, to, attempt + 1);
    }
    return null;
  }

  const data = await response.json();
  const translated = data?.translation?.trim();
  if (!translated || translated === text) return null;
  return translated;
}

async function translateWithGoogle(text, to) {
  try {
    const target = googleLocaleMap[to] ?? to;
    const { protectedText, tokens } = protectPlaceholders(text);
    const result = await getGoogleTranslate()(protectedText, { from: 'en', to: target, requestOptions: { timeout: 12000 } });
    const translated = restorePlaceholders(result?.text?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateText(text, code) {
  const { protectedText, tokens } = protectPlaceholders(text);
  let translated = await translateWithLingva(protectedText, code);
  if (!translated) {
    translated = await translateWithGoogle(protectedText, code);
  }
  if (!translated) return text;
  return restorePlaceholders(translated, tokens);
}

function buildBatches(entries) {
  const batches = [];
  let current = [];
  let currentLen = 0;

  for (const entry of entries) {
    const len = entry[1].length + SPLIT.length;
    if (current.length > 0 && currentLen + len > BATCH_CHAR_LIMIT) {
      batches.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(entry);
    currentLen += len;
  }

  if (current.length > 0) batches.push(current);
  return batches;
}

async function translateBatchEntries(batch, code) {
  const combined = batch.map(([, value]) => value).join(SPLIT);
  const { protectedText, tokens } = protectPlaceholders(combined);
  let translatedCombined = await translateWithLingva(protectedText, code);
  if (!translatedCombined) {
    translatedCombined = await translateWithGoogle(protectedText, code);
  }
  if (!translatedCombined) {
    return batch.map(([, value]) => value);
  }
  translatedCombined = restorePlaceholders(translatedCombined, tokens);
  const parts = translatedCombined.split(SPLIT);
  if (parts.length !== batch.length) {
    const out = [];
    for (const [, value] of batch) {
      out.push(await translateText(value, code));
      await sleep(300);
    }
    return out;
  }
  return parts;
}

function loadCache() {
  if (!existsSync(cachePath)) return {};
  return JSON.parse(readFileSync(cachePath, 'utf8'));
}

function saveCache(cache) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function needsUpdate(path, current, english) {
  if (current == null || current === '') return true;
  if (current === english) return true;
  return false;
}

function pathsNeedUpdate(locale, pathsToCheck) {
  for (const [path, english] of Object.entries(pathsToCheck)) {
    let current;
    if (path.startsWith('nav.')) {
      current = locale.nav?.[path.slice(4)];
    } else if (path.startsWith('supportTickets.')) {
      const rest = path.slice('supportTickets.'.length);
      const parts = rest.split('.');
      let cur = locale.supportTickets;
      for (const part of parts) {
        cur = cur?.[part];
      }
      current = cur;
    }
    if (needsUpdate(path, current, english)) return true;
  }
  return false;
}

async function resolvePaths(langCode, cache) {
  const parent = VARIANT_PARENT[langCode];
  if (MANUAL[langCode]) return MANUAL[langCode];
  if (parent && MANUAL[parent]) return MANUAL[parent];
  if (cache[langCode]) return cache[langCode];

  const entries = Object.entries(ENGLISH_PATHS);
  const toTranslate = entries.filter(([, english]) => english);
  const batches = buildBatches(toTranslate);
  const resolved = {};

  for (const batch of batches) {
    const values = await translateBatchEntries(batch, langCode);
    batch.forEach(([path], index) => {
      resolved[path] = values[index] ?? batch.find(([, v]) => v)[1];
    });
    await sleep(REQUEST_DELAY_MS);
  }

  cache[langCode] = resolved;
  saveCache(cache);
  return resolved;
}

function applyPathsToLocale(locale, paths) {
  const nav = { ...locale.nav };
  const supportTickets = { ...(locale.supportTickets ?? {}) };

  for (const [path, value] of Object.entries(paths)) {
    if (path.startsWith('nav.')) {
      nav[path.slice(4)] = value;
    } else if (path.startsWith('supportTickets.')) {
      setNested(supportTickets, path.slice('supportTickets.'.length), value);
    }
  }

  return {
    ...locale,
    nav,
    supportTickets,
  };
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

function hasPhraseMap(langCode) {
  return existsSync(join(phraseMapsDir, `${langCode}.json`));
}

function copyRegionalVariants() {
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
}

const cache = loadCache();
let localeCodes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''))
  .filter((code) => !VARIANT_PARENT[code]);

if (onlyLangs) {
  localeCodes = localeCodes.filter((code) => onlyLangs.includes(code));
}

for (const langCode of localeCodes) {
  const locale = await loadLocale(langCode);
  const hasManual = MANUAL[langCode] || (VARIANT_PARENT[langCode] && MANUAL[VARIANT_PARENT[langCode]]);
  const needsWork = hasManual || pathsNeedUpdate(locale, ENGLISH_PATHS);

  if (!needsWork) {
    console.log(`${langCode}: complete`);
    continue;
  }

  const paths = await resolvePaths(langCode, cache);
  const phraseEntries = Object.fromEntries(
    Object.entries(ENGLISH_PATHS).map(([path, english]) => [english, paths[path] ?? english]),
  );

  if (hasPhraseMap(langCode)) {
    const mapPath = join(phraseMapsDir, `${langCode}.json`);
    const map = JSON.parse(readFileSync(mapPath, 'utf8'));
    Object.assign(map, phraseEntries);
    writeFileSync(mapPath, JSON.stringify(map, null, 2));

    const overridePath = join(overridesDir, `${langCode}.json`);
    const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
    const mergedMap = mergePhraseMaps(map, overrides);
    const current = await loadLocale(langCode);
    writeLocaleFile(langCode, {
      ...applyPhraseMapToValues(en, mergedMap),
      affiliate: current.affiliate,
    });
    console.log(`${langCode}: phrase map + locale rebuilt`);
    continue;
  }

  writeLocaleFile(langCode, applyPathsToLocale(locale, paths));
  console.log(`${langCode}: supportTickets patched`);
}

copyRegionalVariants();
console.log('done');
