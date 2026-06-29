#!/usr/bin/env node
/**
 * Apply player supportTickets translations from casino-backend admin lang files
 * plus curated manual strings for player-specific copy.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendRoot = join(root, '..', 'casino-backend');
const localesDir = join(root, 'src/i18n/locales');

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

/** Player-facing strings (may differ from admin copy). */
const MANUAL = {
  ko: {
    navSupportTickets: '지원 티켓',
    navSupportTicketsLabel: '헬프데스크',
    newTicket: '새 티켓',
    subject: '제목',
    message: '메시지',
    submit: '티켓 제출',
    createFailed: '티켓을 생성하지 못했습니다. 다시 시도해 주세요.',
    backToList: '← 티켓 목록으로',
    notFound: '티켓을 찾을 수 없습니다.',
    closedHint: '이 티켓은 종료되었습니다. 추가 도움이 필요하면 새 티켓을 열어 주세요.',
    sendReply: '답장 보내기',
    replyFailed: '답장을 보내지 못했습니다. 다시 시도해 주세요.',
    supportTeam: '지원팀',
    you: '나',
  },
  de: {
    navSupportTickets: 'SUPPORT-TICKETS',
    navSupportTicketsLabel: 'Helpdesk',
    newTicket: 'Neues Ticket',
    subject: 'Betreff',
    message: 'Nachricht',
    submit: 'Ticket senden',
    createFailed: 'Ticket konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
    backToList: '← Zurück zu Tickets',
    notFound: 'Ticket nicht gefunden.',
    closedHint: 'Dieses Ticket ist geschlossen. Öffnen Sie ein neues Ticket, wenn Sie weitere Hilfe benötigen.',
    sendReply: 'Antwort senden',
    replyFailed: 'Antwort konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    supportTeam: 'Support',
    you: 'Sie',
  },
  fr: {
    navSupportTickets: "TICKETS D'ASSISTANCE",
    navSupportTicketsLabel: 'Helpdesk',
    newTicket: 'Nouveau ticket',
    subject: 'Objet',
    message: 'Message',
    submit: 'Envoyer le ticket',
    createFailed: 'Impossible de créer votre ticket. Veuillez réessayer.',
    backToList: '← Retour aux tickets',
    notFound: 'Ticket introuvable.',
    closedHint: "Ce ticket est fermé. Ouvrez un nouveau ticket si vous avez besoin d'aide supplémentaire.",
    sendReply: 'Envoyer la réponse',
    replyFailed: "Impossible d'envoyer votre réponse. Veuillez réessayer.",
    supportTeam: 'Assistance',
    you: 'Vous',
  },
  es: {
    navSupportTickets: 'TICKETS DE SOPORTE',
    navSupportTicketsLabel: 'Help desk',
    newTicket: 'Nuevo ticket',
    subject: 'Asunto',
    message: 'Mensaje',
    submit: 'Enviar ticket',
    createFailed: 'No se pudo crear su ticket. Inténtelo de nuevo.',
    backToList: '← Volver a tickets',
    notFound: 'Ticket no encontrado.',
    closedHint: 'Este ticket está cerrado. Abra un nuevo ticket si necesita más ayuda.',
    sendReply: 'Enviar respuesta',
    replyFailed: 'No se pudo enviar su respuesta. Inténtelo de nuevo.',
    supportTeam: 'Soporte',
    you: 'Usted',
  },
  ja: {
    navSupportTickets: 'サポートチケット',
    navSupportTicketsLabel: 'ヘルプデスク',
    newTicket: '新規チケット',
    subject: '件名',
    message: 'メッセージ',
    submit: 'チケットを送信',
    createFailed: 'チケットを作成できませんでした。もう一度お試しください。',
    backToList: '← チケット一覧に戻る',
    notFound: 'チケットが見つかりません。',
    closedHint: 'このチケットはクローズされています。追加のサポートが必要な場合は新しいチケットを開いてください。',
    sendReply: '返信を送信',
    replyFailed: '返信を送信できませんでした。もう一度お試しください。',
    supportTeam: 'サポート',
    you: 'あなた',
  },
  zh: {
    navSupportTickets: '支持工单',
    navSupportTicketsLabel: '帮助台',
    newTicket: '新建工单',
    subject: '主题',
    message: '消息',
    submit: '提交工单',
    createFailed: '无法创建工单。请重试。',
    backToList: '← 返回工单列表',
    notFound: '未找到工单。',
    closedHint: '此工单已关闭。如需进一步帮助，请新建工单。',
    sendReply: '发送回复',
    replyFailed: '无法发送回复。请重试。',
    supportTeam: '支持',
    you: '您',
  },
  'zh-tw': {
    navSupportTickets: '支援工單',
    navSupportTicketsLabel: '服務台',
    newTicket: '新工單',
    subject: '主旨',
    message: '訊息',
    submit: '提交工單',
    createFailed: '無法建立工單。請再試一次。',
    backToList: '← 返回工單列表',
    notFound: '找不到工單。',
    closedHint: '此工單已關閉。如需進一步協助，請建立新工單。',
    sendReply: '傳送回覆',
    replyFailed: '無法傳送回覆。請再試一次。',
    supportTeam: '支援',
    you: '您',
  },
};

const CLOSED_PLAYER_RULES = [
  [/Change the status to reopen if needed\.?/gi, 'Open a new ticket if you need further help.'],
  [/Changez le statut pour rouvrir si nécessaire\.?/gi, "Ouvrez un nouveau ticket si vous avez besoin d'aide supplémentaire."],
  [/Ändern Sie den Status, um bei Bedarf wieder zu öffnen\.?/gi, 'Öffnen Sie ein neues Ticket, wenn Sie weitere Hilfe benötigen.'],
  [/Cambie el estado para reabrir si es necesario\.?/gi, 'Abra un nuevo ticket si necesita más ayuda.'],
  [/必要に応じてステータスを変更して再開してください。?/g, '追加のサポートが必要な場合は新しいチケットを開いてください。'],
  [/필요하면 상태를 변경하여 다시 열 수 있습니다\.?/g, '추가 도움이 필요하면 새 티켓을 열어 주세요.'],
  [/如需重新打开，请更改状态。?/g, '如需进一步帮助，请新建工单。'],
  [/Verander die status om indien nodig te heropen\.?/gi, "Maak 'n nuwe kaartjie oop as u verdere hulp benodig."],
];

const SUBJECT_WORDS = {
  af: 'Onderwerp',
  nl: 'Onderwerp',
  de: 'Betreff',
  fr: 'Objet',
  es: 'Asunto',
  pt: 'Assunto',
  it: 'Oggetto',
  pl: 'Temat',
  ru: 'Тема',
  ja: '件名',
  ko: '제목',
  zh: '主题',
  ar: 'الموضوع',
};

const MESSAGE_WORDS = {
  af: 'Boodskap',
  nl: 'Bericht',
  de: 'Nachricht',
  fr: 'Message',
  es: 'Mensaje',
  pt: 'Mensagem',
  it: 'Messaggio',
  pl: 'Wiadomość',
  ru: 'Сообщение',
  ja: 'メッセージ',
  ko: '메시지',
  zh: '消息',
  ar: 'رسالة',
};

const NEW_TICKET_PREFIX = {
  af: 'Nuwe ',
  nl: 'Nieuw ',
  de: 'Neues ',
  fr: 'Nouveau ',
  es: 'Nuevo ',
  pt: 'Novo ',
  it: 'Nuovo ',
  pl: 'Nowy ',
  ru: 'Новый ',
  ja: '新規',
  ko: '새 ',
  zh: '新建',
  ar: 'تذكرة ',
};

function deriveNotFound(ticketWord, manual, code) {
  if (manual?.notFound) return manual.notFound;
  const capitalized = ticketWord.charAt(0).toUpperCase() + ticketWord.slice(1);
  const templates = {
    af: `${capitalized} nie gevind nie.`,
    nl: `${capitalized} niet gevonden.`,
    de: `${capitalized} nicht gefunden.`,
    fr: `${capitalized} introuvable.`,
    es: `${capitalized} no encontrado.`,
    pt: `${capitalized} não encontrado.`,
    it: `${capitalized} non trovato.`,
    pl: `${capitalized} nie znaleziono.`,
    ru: `${capitalized} не найден.`,
    ja: `${capitalized}が見つかりません。`,
    ko: `${capitalized}을(를) 찾을 수 없습니다.`,
    zh: `未找到${capitalized}。`,
  };
  return templates[code] ?? `${capitalized} not found.`;
}

function deriveBackToList(ticketWord, manual, code) {
  if (manual?.backToList) return manual.backToList;
  const templates = {
    af: `← Terug na ${ticketWord}`,
    nl: `← Terug naar ${ticketWord}`,
    de: `← Zurück zu ${ticketWord}`,
    fr: `← Retour aux ${ticketWord}`,
    es: `← Volver a ${ticketWord}`,
    pt: `← Voltar para ${ticketWord}`,
    it: `← Torna ai ${ticketWord}`,
    pl: `← Powrót do ${ticketWord}`,
    ru: `← Назад к ${ticketWord}`,
    ja: '← チケット一覧に戻る',
    ko: '← 티켓 목록으로',
    zh: '← 返回工单列表',
    ar: `← العودة إلى ${ticketWord}`,
  };
  return templates[code] ?? `← Back to ${ticketWord}`;
}

function exportAdminLang(code) {
  const filePath = join(backendRoot, 'lang', code, 'admin.php');
  if (!existsSync(filePath)) return null;
  const result = spawnSync('php', ['-r', `
    $data = require ${JSON.stringify(filePath)};
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
  `], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
}

function parseLocaleTs(langCode) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const source = readFileSync(filePath, 'utf8');
  const match = source.match(/=\s*(\{[\s\S]*\})\s*;\s*$/);
  if (!match) throw new Error(`Failed to parse ${langCode}.ts`);
  return Function(`"use strict"; return (${match[1]});`)();
}

function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  return { exportName, tree: parseLocaleTs(langCode) };
}

function writeLocaleFile(langCode, exportName, tree) {
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

function pick(...values) {
  for (const value of values) {
    if (value != null && value !== '' && value !== 'undefined') return value;
  }
  return undefined;
}

function ticketSingular(title, tickets) {
  const source = tickets || title || 'ticket';
  return source
    .replace(/Tickets?/i, 'ticket')
    .replace(/티켓/i, '티켓')
    .replace(/チケット/i, 'チケット')
    .replace(/工单/i, '工单')
    .replace(/工單/i, '工單')
    .replace(/kaartjies/i, 'kaartjie')
    .replace(/Tickets/i, 'Ticket')
    .trim();
}

function playerClosedHint(adminClosed, manual) {
  if (manual?.closedHint) return manual.closedHint;
  if (!adminClosed) return 'This ticket is closed. Open a new ticket if you need further help.';
  let result = adminClosed;
  for (const [pattern, replacement] of CLOSED_PLAYER_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function adaptFailedCreate(failedReply, manual, code) {
  if (manual?.createFailed) return manual.createFailed;
  if (!failedReply) return 'Could not create your ticket. Please try again.';
  return failedReply
    .replace(/reply/gi, 'ticket')
    .replace(/antwoord/gi, 'kaartjie')
    .replace(/réponse/gi, 'ticket')
    .replace(/Antwort/gi, 'Ticket')
    .replace(/respuesta/gi, 'ticket')
    .replace(/返信/g, 'チケット')
    .replace(/답장/g, '티켓')
    .replace(/send/gi, 'create')
    .replace(/stuur/gi, 'skep')
    .replace(/envoyer/gi, 'créer')
    .replace(/senden/gi, 'erstellen');
}

function deriveSubject(locale, manual) {
  if (manual?.subject) return manual.subject;
  const deposit = locale.deposit ?? {};
  return pick(
    deposit.subject,
    locale.profile?.subject,
    locale.common?.subject,
  );
}

function deriveMessage(locale, manual, adminSt) {
  if (manual?.message) return manual.message;
  return pick(
    adminSt?.filter_category && adminSt.filter_category !== 'Category' ? undefined : undefined,
    locale.liveChat?.placeholder?.replace(/^Type your /i, '').replace(/\.\.\.$/, ''),
  ) ?? 'Message';
}

function deriveYou(locale, manual) {
  if (manual?.you) return manual.you;
  return pick(locale.affiliate?.you, locale.profile?.you) ?? 'You';
}

function buildSupportTickets(code, admin, locale) {
  const parent = VARIANT_PARENT[code];
  const manual = MANUAL[code] ?? (parent ? MANUAL[parent] : null);
  const st = admin?.support_tickets ?? {};
  const nav = admin?.nav ?? {};
  const liveChat = locale.liveChat ?? {};
  const ticketWord = ticketSingular(st.title, st.tickets);
  const failedReply = st.failed_send_reply || liveChat.sendFailed;

  const subject = manual?.subject ?? deriveSubject(locale, manual) ?? SUBJECT_WORDS[code] ?? 'Subject';

  const message = manual?.message ?? MESSAGE_WORDS[code] ?? deriveMessage(locale, manual, st) ?? 'Message';

  const newTicket = manual?.newTicket ?? `${NEW_TICKET_PREFIX[code] ?? 'New '}${ticketWord}`;
  const backToList = deriveBackToList(ticketWord, manual, code);

  const navLabel = manual?.navSupportTicketsLabel
    ?? pick(nav.support, liveChat.title, 'Help desk');

  return {
    navLabel,
    supportTickets: {
      title: st.title || manual?.navSupportTickets || 'Support Tickets',
      subtitle: st.desc || 'Submit a request and track replies from our support team.',
      newTicket,
      subject,
      category: st.filter_category || 'Category',
      message,
      submit: manual?.submit ?? `${liveChat.send || 'Submit'} ${ticketWord}`.trim(),
      createFailed: adaptFailedCreate(failedReply, manual, code),
      empty: st.no_tickets || 'No support tickets yet.',
      backToList,
      notFound: deriveNotFound(ticketWord, manual, code),
      closedHint: playerClosedHint(st.closed_notice, manual),
      replyPlaceholder: st.reply_placeholder || liveChat.placeholder || 'Type your reply...',
      sendReply: manual?.sendReply ?? (liveChat.send ? `${liveChat.send}` : 'Send reply'),
      replyFailed: manual?.replyFailed ?? failedReply ?? 'Could not send your reply. Please try again.',
      supportTeam: manual?.supportTeam ?? nav.support ?? liveChat.title ?? 'Support',
      you: deriveYou(locale, manual),
      categories: {
        account: st.category_account || 'Account',
        payment: st.category_payment || 'Payment',
        bonus: st.category_bonus || 'Bonus',
        game: st.category_game || 'Game',
        other: st.category_other || 'Other',
      },
      status: {
        open: st.status_open || 'Open',
        pending: st.status_pending || 'Pending',
        resolved: st.status_resolved || 'Resolved',
        closed: st.status_closed || 'Closed',
      },
    },
  };
}

function copyRegionalVariants() {
  for (const [child, parent] of Object.entries(VARIANT_PARENT)) {
    const parentPath = join(localesDir, `${parent}.ts`);
    const childPath = join(localesDir, `${child}.ts`);
    if (!existsSync(parentPath)) continue;
    const parentExport = EXPORT_NAMES[parent] ?? parent.replace(/-/g, '');
    const childExport = EXPORT_NAMES[child] ?? child.replace(/-/g, '');
    writeFileSync(
      childPath,
      readFileSync(parentPath, 'utf8').replace(
        `export const ${parentExport}`,
        `export const ${childExport}`,
      ),
    );
    console.log(`${child}: copied from ${parent}`);
  }
}

const localeCodes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''))
  .filter((code) => !VARIANT_PARENT[code]);

for (const code of localeCodes) {
  const admin = exportAdminLang(code);
  if (!admin) {
    console.log(`${code}: skip (no admin lang)`);
    continue;
  }

  const { exportName, tree } = loadLocale(code);
  const { supportTickets, navLabel } = buildSupportTickets(code, admin, tree);
  const navSupportTickets = MANUAL[code]?.navSupportTickets
    ?? MANUAL[VARIANT_PARENT[code]]?.navSupportTickets
    ?? (admin.nav?.support_tickets || supportTickets.title).toString().toUpperCase();

  writeLocaleFile(code, exportName, {
    ...tree,
    nav: {
      ...tree.nav,
      supportTickets: navSupportTickets,
      supportTicketsLabel: navLabel,
    },
    supportTickets,
  });
  console.log(`${code}: applied`);
}

copyRegionalVariants();
console.log('done');
