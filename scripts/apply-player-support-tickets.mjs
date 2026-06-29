#!/usr/bin/env node
/**
 * Apply player supportTickets translations from backend admin lang + curated copy.
 * No external translation API required.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { en } from '../src/i18n/locales/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendRoot = join(root, '..', 'casino-backend');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const EXPORT_NAMES = {
  'ar-ma': 'arMa', 'ar-dz': 'arDz', 'ar-tn': 'arTn', 'de-be': 'deBe', 'fr-be': 'frBe',
  'nl-be': 'nlBe', 'pt-br': 'ptBr', 'zh-tw': 'zhTw',
};

const VARIANT_PARENT = {
  'ar-dz': 'ar', 'ar-ma': 'ar', 'ar-tn': 'ar', 'de-be': 'de', 'fr-be': 'fr',
  'nl-be': 'nl', 'pt-br': 'pt', 'zh-tw': 'zh',
};

const EN = {
  navSupportTickets: en.nav.supportTickets,
  navSupportTicketsLabel: en.nav.supportTicketsLabel,
  ...flatten(en.supportTickets, 'supportTickets'),
};

/** Full player copy for major locales (flat paths). */
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
    'nav.supportTickets': "TICKETS D'ASSISTANCE",
    'nav.supportTicketsLabel': 'Helpdesk',
    'supportTickets.title': "Tickets d'assistance",
    'supportTickets.subtitle': "Soumettez une demande et suivez les réponses de notre équipe d'assistance.",
    'supportTickets.newTicket': 'Nouveau ticket',
    'supportTickets.subject': 'Objet',
    'supportTickets.category': 'Catégorie',
    'supportTickets.message': 'Message',
    'supportTickets.submit': 'Envoyer le ticket',
    'supportTickets.createFailed': 'Impossible de créer votre ticket. Veuillez réessayer.',
    'supportTickets.empty': "Aucun ticket d'assistance pour le moment.",
    'supportTickets.backToList': '← Retour aux tickets',
    'supportTickets.notFound': 'Ticket introuvable.',
    'supportTickets.closedHint': "Ce ticket est fermé. Ouvrez un nouveau ticket si vous avez besoin d'aide supplémentaire.",
    'supportTickets.replyPlaceholder': 'Saisissez votre réponse...',
    'supportTickets.sendReply': 'Envoyer la réponse',
    'supportTickets.replyFailed': "Impossible d'envoyer votre réponse. Veuillez réessayer.",
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
  ar: {
    'nav.supportTickets': 'تذاكر الدعم',
    'nav.supportTicketsLabel': 'الدعم',
    'supportTickets.title': 'تذاكر الدعم',
    'supportTickets.subtitle': 'قدّم طلبًا وتابع ردود فريق الدعم لدينا.',
    'supportTickets.newTicket': 'تذكرة جديدة',
    'supportTickets.subject': 'الموضوع',
    'supportTickets.category': 'الفئة',
    'supportTickets.message': 'الرسالة',
    'supportTickets.submit': 'إرسال التذكرة',
    'supportTickets.createFailed': 'تعذر إنشاء التذكرة. يرجى المحاولة مرة أخرى.',
    'supportTickets.empty': 'لا توجد تذاكر دعم بعد.',
    'supportTickets.backToList': '← العودة إلى التذاكر',
    'supportTickets.notFound': 'التذكرة غير موجودة.',
    'supportTickets.closedHint': 'هذه التذكرة مغلقة. افتح تذكرة جديدة إذا كنت بحاجة إلى مزيد من المساعدة.',
    'supportTickets.replyPlaceholder': 'اكتب ردك...',
    'supportTickets.sendReply': 'إرسال الرد',
    'supportTickets.replyFailed': 'تعذر إرسال الرد. يرجى المحاولة مرة أخرى.',
    'supportTickets.supportTeam': 'الدعم',
    'supportTickets.you': 'أنت',
    'supportTickets.categories.account': 'الحساب',
    'supportTickets.categories.payment': 'الدفع',
    'supportTickets.categories.bonus': 'المكافآت',
    'supportTickets.categories.game': 'اللعبة',
    'supportTickets.categories.other': 'أخرى',
    'supportTickets.status.open': 'مفتوحة',
    'supportTickets.status.pending': 'قيد الانتظار',
    'supportTickets.status.resolved': 'تم الحل',
    'supportTickets.status.closed': 'مغلقة',
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

const LIVE_DESC_TO_SUBTITLE = [
  [/View player messages and respond in real time\.?/gi, en.supportTickets.subtitle],
  [/Bekyk spelerboodskappe en reageer intyds\.?/gi, "Dien 'n versoek in en volg antwoorde van ons ondersteuningspan."],
  [/Consultez les messages des joueurs et répondre en temps réel\.?/gi, "Soumettez une demande et suivez les réponses de notre équipe d'assistance."],
  [/Consultez les demandes de support des joueurs, répondez et mettez à jour le statut des tickets\.?/gi, "Soumettez une demande et suivez les réponses de notre équipe d'assistance."],
  [/Spieler-Nachrichten anzeigen und in Echtzeit antworten\.?/gi, 'Senden Sie eine Anfrage und verfolgen Sie Antworten unseres Support-Teams.'],
  [/Ver mensajes de jugadores y responder en tiempo real\.?/gi, 'Envíe una solicitud y siga las respuestas de nuestro equipo de soporte.'],
  [/Ver mensagens de jogadores e responder em tempo real\.?/gi, 'Envie um pedido e acompanhe as respostas da nossa equipa de suporte.'],
  [/Visualizza i messaggi dei giocatori e rispondi in tempo reale\.?/gi, 'Invia una richiesta e segui le risposte del nostro team di supporto.'],
  [/プレーヤーのメッセージを表示し、リアルタイムで応答します。?/g, 'リクエストを送信し、サポートチームからの返信を確認できます。'],
  [/プレイヤーのメッセージを表示し、リアルタイムで応答します。?/g, 'リクエストを送信し、サポートチームからの返信を確認できます。'],
  [/플레이어 메시지를 보고 실시간으로 응답합니다\.?/g, '문의를 제출하고 지원팀의 답변을 확인하세요.'],
  [/عرض رسائل اللاعبين والرد عليها في الوقت الفعلي\.?/g, 'قدّم طلبًا وتابع ردود فريق الدعم لدينا.'],
  [/查看玩家消息并实时回复。?/g, '提交请求并跟踪我们支持团队的回复。'],
  [/Bekijk spelersberichten en reageer in realtime\.?/gi, 'Dien een verzoek in en volg antwoorden van ons ondersteuningsteam.'],
  [/Se spillerbeskeder og svar i realtid\.?/gi, 'Indsend en anmodning og følg svar fra vores supportteam.'],
  [/Visa spelarmeddelanden och svara i realtid\.?/gi, 'Skicka en förfrågan och följ svar från vårt supportteam.'],
  [/Zobrazit zprávy hráčů a odpovídat v reálném čase\.?/gi, 'Odešlete požadavek a sledujte odpovědi našeho týmu podpory.'],
  [/Просмотр сообщений игроков и ответ в реальном времени\.?/gi, 'Отправьте запрос и отслеживайте ответы нашей службы поддержки.'],
  [/Перегляд повідомлень гравців і відповідь у реальному часі\.?/gi, 'Надішліть запит і відстежуйте відповіді нашої служби підтримки.'],
  [/Oyuncu mesajlarını görüntüleyin ve gerçek zamanlı yanıtlayın\.?/gi, 'Bir talep gönderin ve destek ekibimizin yanıtlarını takip edin.'],
  [/Buka imilayezo yabadlali bese uphendula ngesikhathi sangempela\.?/gi, 'Thumela isicelo bese ulandelela izimpendulo eqenjini lethu losizo.'],
  [/Wyświetl wiadomości graczy i odpowiadaj w czasie rzeczywistym\.?/gi, 'Prześlij prośbę i śledź odpowiedzi naszego zespołu wsparcia.'],
  [/Megtekintheti a játékos üzeneteit és valós időben válaszolhat\.?/gi, 'Küldjön kérést, és kövesse nyomon ügyfélszolgálatunk válaszait.'],
];

const LIVE_CHAT_SUBTITLE_TO_PLAYER = [
  [/^Gesels met (.+)\.$/i, (_, team) => `Dien 'n versoek in en volg antwoorde van ${team}.`],
  [/^Chat with (.+)\.$/i, (_, team) => `Submit a request and track replies from ${team}.`],
  [/^Chattez avec (.+)\.$/i, (_, team) => `Soumettez une demande et suivez les réponses de ${team}.`],
  [/^Discutez avec (.+)\.$/i, (_, team) => `Soumettez une demande et suivez les réponses de ${team}.`],
  [/^Chatten Sie mit (.+)\.$/i, (_, team) => `Senden Sie eine Anfrage und verfolgen Sie Antworten von ${team}.`],
  [/^Chatea con (.+)\.$/i, (_, team) => `Envía una solicitud y sigue las respuestas de ${team}.`],
  [/^Converse com (.+)\.$/i, (_, team) => `Envie um pedido e acompanhe as respostas de ${team}.`],
  [/^Chatta con (.+)\.$/i, (_, team) => `Invia una richiesta e segui le risposte di ${team}.`],
  [/^Chat med (.+)\.$/i, (_, team) => `Send en forespørgsel og følg svar fra ${team}.`],
  [/^Chatta med (.+)\.$/i, (_, team) => `Skicka en förfrågan och följ svar från ${team}.`],
  [/^Xoxa nethimba lethu losizo\.$/i, 'Thumela isicelo bese ulandelela izimpendulo eqenjini lethu losizo.'],
  [/^(.+)とチャット。?$/i, (_, team) => `リクエストを送信し、${team}からの返信を確認できます。`],
  [/^(.+)とチャットしましょう。?$/i, (_, team) => `リクエストを送信し、${team}からの返信を確認できます。`],
];

const EN_ADMIN_CLOSED = 'This ticket is closed. Change the status to reopen if needed.';

const PLAYER_CLOSED_HINT = {
  zu: 'Leli thekethe livaliwe. Vula ithekethe entsha uma udinga usizo olwengeziwe.',
  yo: 'Tiketi yii ti wa ni pipade. Ṣii tiketi tuntun ti o ba nilo iranlọwọ siwaju sii.',
  sw: 'Tiketi hii imefungwa. Fungua tiketi mpya ikiwa unahitaji msaada zaidi.',
  am: 'ይህ ትኬት ተዘግቷል። ተጨማሪ እገዛ ከፈለጉ አዲስ ትኬት ይክፈቱ።',
  ig: 'Tiketi a emechiela. Mepee tiketi ọhụrụ ma ị chọọ enyemaka ọzọ.',
  ha: 'An rufe wannan tikitin. Buɗe sabon tikiti idan kuna buƙatar ƙarin taimako.',
  ne: 'यो टिकट बन्द छ। थप सहायता चाहिन्छ भने नयाँ टिकट खोल्नुहोस्।',
  bn: 'এই টিকিট বন্ধ আছে। আরও সহায়তার প্রয়োজন হলে একটি নতুন টিকিট খুলুন।',
  ta: 'இந்த டிக்கெட் மூடப்பட்டுள்ளது. மேலும் உதவி தேவைப்பட்டால் புதிய டிக்கெட்டைத் திறக்கவும்.',
  te: 'ఈ టికెట్ మూసివేయబడింది. మరింత సహాయం అవసరమైతే కొత్త టికెట్ తెరవండి.',
  mr: 'हा तिकीट बंद आहे. अधिक मदत हवी असल्यास नवीन तिकीट उघडा.',
  gu: 'આ ટિકિટ બંધ છે. વધુ મદદ જોઈતી હોય તો નવી ટિકિટ ખોલો.',
  pa: 'ਇਹ ਟਿਕਟ ਬੰਦ ਹੈ। ਜੇ ਹੋਰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਤਾਂ ਨਵੀਂ ਟਿਕਟ ਖੋਲ੍ਹੋ।',
  kn: 'ಈ ಟಿಕೆಟ್ ಮುಚ್ಚಲಾಗಿದೆ. ಹೆಚ್ಚಿನ ಸಹಾಯ ಬೇಕಾದರೆ ಹೊಸ ಟಿಕೆಟ್ ತೆರೆಯಿರಿ.',
  ml: 'ഈ ടിക്കറ്റ് അടച്ചിരിക്കുന്നു. കൂടുതൽ സഹായം ആവശ്യമെങ്കിൽ പുതിയ ടിക്കറ്റ് തുറക്കുക.',
  si: 'මෙම ටිකට් පත වසා ඇත. තවත් උදව් අවශ්‍ය නම් නව ටිකට් පතක් විවෘත කරන්න.',
  my: 'ဤတစ်ကိုယ်ရေလက်မှတ်ကို ပိတ်ထားပါသည်။ နောက်ထပ်အကူအညီလိုအပ်ပါက လက်မှတ်အသစ်ဖွင့်ပါ။',
  km: 'សំបុត្រនេះត្រូវបានបិទ។ បើអ្នកត្រូវការជំនួយបន្ថែម សូមបើកសំបុត្រថ្មី។',
  lo: 'ປີ້ນີ້ຖືກປິດແລ້ວ. ຖ້າຕ້ອງການຄວາມຊ່ວຍເຫຼືອເພີ່ມເຕີມ ກະລຸນາເປີດປີ້ນໃໝ່.',
  mn: 'Энэ тасалбар хаагдсан байна. Нэмэлт тусламж хэрэгтэй бол шинэ тасалбар нээнэ үү.',
  uz: 'Bu chipta yopilgan. Qo‘shimcha yordam kerak bo‘lsa, yangi chipta oching.',
  tg: 'Ин чипта пӯшида шуд. Агар кӯмаки иловагӣ лозим бошад, чиптаи нав кушоед.',
  so: 'Tigidhkan waa la xiray. Fur tigidh cusub haddii aad u baahan tahay caawimaad dheeraad ah.',
  sq: 'Ky tiketë është mbyllur. Hapni një tiketë të re nëse keni nevojë për më shumë ndihmë.',
  mk: 'Овој тикет е затворен. Отворете нов тикет ако ви треба дополнителна помош.',
  lb: 'Dësen Ticket ass zou. Maacht en neien Ticket op wann Dir weider Hëllef braucht.',
  cy: 'Mae\'r tocyn hwn ar gau. Agorwch docyn newydd os oes angen rhagor o gymorth arnoch.',
  ga: 'Tá an ticéad seo dúnta. Oscail ticéad nua más gá tuilleadh cabhrach.',
  mt: 'Dan it-ticket huwa magħluq. Iftaħ ticket ġdid jekk għandek bżonn aktar għajnuna.',
  is: 'Þessi miði er lokaður. Opnaðu nýjan miða ef þú þarft frekari aðstoð.',
  et: 'See pilet on suletud. Avage uus pilet, kui vajate täiendavat abi.',
  lv: 'Šī biļete ir slēgta. Atveriet jaunu biļeti, ja nepieciešama papildu palīdzība.',
  lt: 'Šis bilietas uždarytas. Atidarykite naują bilietą, jei reikia papildomos pagalbos.',
  hy: 'Այս տոմսը փակ է։ Բացեք նոր տոմս, եթե լրացուցիչ օգնություն է պետք։',
  ka: 'ეს ბილეთი დახურულია. გახსენით ახალი ბილეთი, თუ დამატებითი დახმარება გჭირდებათ.',
  kk: 'Бұл билет жабық. Қосымша көмек қажет болса, жаңа билет ашыңыз.',
  az: 'Bu bilet bağlanıb. Əlavə kömək lazımdırsa, yeni bilet açın.',
  be: 'Гэты квіток закрыты. Адкрыйце новы квіток, калі патрэбна дадатковая дапамога.',
  bg: 'Този билет е затворен. Отворете нов билет, ако ви е необходима допълнителна помощ.',
  hr: 'Ova kartica je zatvorena. Otvorite novu karticu ako vam je potrebna dodatna pomoć.',
  sr: 'Ова картица је затворена. Отворите нову картицу ако вам је потребна додатна помоћ.',
  sl: 'Ta vstopnica je zaprta. Odprite novo vstopnico, če potrebujete dodatno pomoč.',
  ro: 'Acest tichet este închis. Deschideți un tichet nou dacă aveți nevoie de ajutor suplimentar.',
  hu: 'Ez a jegy le van zárva. Nyisson új jegyet, ha további segítségre van szüksége.',
  fil: 'Sarado na ang tiket na ito. Magbukas ng bagong tiket kung kailangan mo ng karagdagang tulong.',
  id: 'Tiket ini ditutup. Buka tiket baru jika Anda membutuhkan bantuan lebih lanjut.',
  ms: 'Tiket ini telah ditutup. Buka tiket baharu jika anda memerlukan bantuan lanjutan.',
  fa: 'این تیکت بسته شده است. در صورت نیاز به کمک بیشتر، تیکت جدیدی باز کنید.',
  ur: 'یہ ٹکٹ بند ہے۔ اگر مزید مدد درکار ہو تو نیا ٹکٹ کھولیں۔',
  he: 'כרטיס זה סגור. פתחו כרטיס חדש אם אתם זקוקים לעזרה נוספת.',
  hi: 'यह टिकट बंद है। यदि आपको और सहायता चाहिए तो नया टिकट खोलें।',
  el: 'Αυτό το εισιτήριο είναι κλειστό. Ανοίξτε νέο εισιτήριο αν χρειάζεστε περαιτέρω βοήθεια.',
};

const CLOSED_TO_PLAYER = [
  [/Change the status to reopen if needed\.?/gi, en.supportTickets.closedHint.replace(/^This ticket is closed\. /i, '')],
  [/Verander die status om indien nodig te heropen\.?/gi, "Maak 'n nuwe kaartjie oop as u verdere hulp benodig."],
  [/Changez le statut pour rouvrir si nécessaire\.?/gi, "Ouvrez un nouveau ticket si vous avez besoin d'aide supplémentaire."],
  [/Ändern Sie den Status, um bei Bedarf wieder zu öffnen\.?/gi, 'Öffnen Sie ein neues Ticket, wenn Sie weitere Hilfe benötigen.'],
  [/Cambie el estado para reabrir si es necesario\.?/gi, 'Abra un nuevo ticket si necesita más ayuda.'],
  [/Wijzig de status om indien nodig te heropenen\.?/gi, 'Open een nieuw ticket als u meer hulp nodig heeft.'],
  [/必要に応じてステータスを変更して再開してください。?/g, '追加のサポートが必要な場合は新しいチケットを開いてください。'],
  [/필요하면 상태를 변경하여 다시 열 수 있습니다\.?/g, '추가 도움이 필요하면 새 티켓을 열어 주세요.'],
  [/如需重新打开，请更改状态。?/g, '如需进一步帮助，请新建工单。'],
  [/قم بتغيير الحالة لإعادة الفتح عند الحاجة\.?/g, 'افتح تذكرة جديدة إذا كنت بحاجة إلى مزيد من المساعدة.'],
  [/Změňte stav pro opětovné otevření, pokud je to potřeba\.?/gi, 'Otevřete nový tiket, pokud potřebujete další pomoc.'],
  [/Zmień status, aby ponownie otworzyć w razie potrzeby\.?/gi, 'Otwórz nowe zgłoszenie, jeśli potrzebujesz dalszej pomocy.'],
];

const CLOSED_PREFIX = {
  af: 'Hierdie kaartjie is',
  nl: 'Dit ticket is',
  de: 'Dieses Ticket ist',
  fr: 'Ce ticket est',
  es: 'Este ticket está',
  pt: 'Este ticket está',
  it: 'Questo ticket è',
  pl: 'To zgłoszenie jest',
  ru: 'Этот тикет',
  ja: 'このチケットは',
  ko: '이 티켓은',
  zh: '此工单已',
  ar: 'هذه التذكرة',
};

const SUBJECT_WORDS = {
  af: 'Onderwerp', nl: 'Onderwerp', de: 'Betreff', fr: 'Objet', es: 'Asunto', pt: 'Assunto',
  it: 'Oggetto', pl: 'Temat', ru: 'Тема', ja: '件名', ko: '제목', zh: '主题', ar: 'الموضوع',
  tr: 'Konu', uk: 'Тема', vi: 'Chủ đề', th: 'หัวข้อ', hi: 'विषय', he: 'נושא', sv: 'Ämne',
  da: 'Emne', no: 'Emne', fi: 'Aihe', cs: 'Předmět', sk: 'Predmet', hu: 'Tárgy', ro: 'Subiect',
  bg: 'Тема', hr: 'Predmet', sr: 'Предмет', sl: 'Zadeva', el: 'Θέμα', id: 'Subjek', ms: 'Subjek',
  zu: 'Isihloko', yo: 'Akọle', sw: 'Mada', am: 'ርዕስ', bn: 'বিষয়', ta: 'தலைப்பு', te: 'విషయం',
};

const MESSAGE_WORDS = {
  af: 'Boodskap', nl: 'Bericht', de: 'Nachricht', fr: 'Message', es: 'Mensaje', pt: 'Mensagem',
  it: 'Messaggio', pl: 'Wiadomość', ru: 'Сообщение', ja: 'メッセージ', ko: '메시지', zh: '消息',
  ar: 'رسالة', tr: 'Mesaj', uk: 'Повідомлення', vi: 'Tin nhắn', th: 'ข้อความ', hi: 'संदेश',
  he: 'הודעה', sv: 'Meddelande', da: 'Besked', no: 'Melding', fi: 'Viesti', cs: 'Zpráva',
};

const YOU_WORDS = {
  af: 'Jy', nl: 'U', de: 'Sie', fr: 'Vous', es: 'Usted', pt: 'Você', it: 'Lei', pl: 'Ty',
  ru: 'Вы', ja: 'あなた', ko: '나', zh: '您', ar: 'أنت', tr: 'Siz', uk: 'Ви', vi: 'Bạn',
  th: 'คุณ', hi: 'आप', he: 'אתה', sv: 'Du', da: 'Du', no: 'Du', fi: 'Sinä', cs: 'Vy',
  zu: 'Wena', yo: 'Ìwọ', sw: 'Wewe', am: 'እርስዎ', ig: 'Gị', ha: 'Kai', ne: 'तपाईं',
  bn: 'আপনি', ta: 'நீங்கள்', te: 'మీరు', mr: 'तुम्ही', gu: 'તમે', pa: 'ਤੁਸੀਂ',
  kn: 'ನೀವು', ml: 'നിങ്ങൾ', si: 'ඔබ', my: 'သင်', km: 'អ្នក', lo: 'ທ່ານ', mn: 'Та',
  uz: 'Siz', tg: 'Шумо', so: 'Adiga', sq: 'Ju', mk: 'Вие', lb: 'Dir', cy: 'Chi', ga: 'Tú',
  mt: 'Int', is: 'Þú', et: 'Teie', lv: 'Jūs', lt: 'Jūs', hy: 'Դուք', ka: 'თქვენ', kk: 'Сіз',
  az: 'Siz', be: 'Вы', bg: 'Вие', hr: 'Vi', sr: 'Ви', sl: 'Vi', ro: 'Dvs.', hu: 'Ön',
  fil: 'Ikaw', id: 'Anda', ms: 'Anda', fa: 'شما', ur: 'آپ', el: 'Εσείς',
};

const SEND_REPLY_WORDS = {
  af: 'Stuur antwoord', nl: 'Antwoord verzenden', de: 'Antwort senden', fr: 'Envoyer la réponse',
  es: 'Enviar respuesta', pt: 'Enviar resposta', it: 'Invia risposta', pl: 'Wyślij odpowiedź',
  ru: 'Отправить ответ', ja: '返信を送信', ko: '답장 보내기', zh: '发送回复', ar: 'إرسال الرد',
  tr: 'Yanıt gönder', uk: 'Надіслати відповідь', vi: 'Gửi trả lời', th: 'ส่งคำตอบ',
  zu: 'Thumela impendulo', yo: 'Firan esi', sw: 'Tuma jibu',
  sv: 'Skicka svar', da: 'Send svar', no: 'Send svar', fi: 'Lähetä vastaus', cs: 'Odeslat odpověď',
};

const NEW_TICKET_PREFIX = {
  af: 'Nuwe ', nl: 'Nieuw ', de: 'Neues ', fr: 'Nouveau ', es: 'Nuevo ', pt: 'Novo ',
  it: 'Nuovo ', pl: 'Nowy ', ru: 'Новый ', ja: '新規', ko: '새 ', zh: '新建', ar: 'تذكرة جديدة',
  zu: 'Entsha ',
};

const OTHER_CATEGORY = {
  af: 'Ander', nl: 'Overig', de: 'Sonstiges', fr: 'Autre', es: 'Otro', pt: 'Outro',
  it: 'Altro', pl: 'Inne', ru: 'Другое', ja: 'その他', ko: '기타', zh: '其他', ar: 'أخرى',
  zu: 'Okunye', yo: 'Miran', sw: 'Nyingine', tr: 'Diğer', vi: 'Khác', th: 'อื่นๆ',
};

const RESOLVED_WORDS = {
  af: 'Opgelos', nl: 'Opgelost', de: 'Gelöst', fr: 'Résolu', es: 'Resuelto', pt: 'Resolvido',
  it: 'Risolto', pl: 'Rozwiązane', ru: 'Решено', ja: '解決済み', ko: '해결됨', zh: '已解决',
  ar: 'تم الحل', tr: 'Çözüldü', uk: 'Вирішено', vi: 'Đã giải quyết', th: 'แก้ไขแล้ว',
  sv: 'Löst', da: 'Løst', no: 'Løst', fi: 'Ratkaistu', cs: 'Vyřešeno',
  zu: 'Kuxazululiwe', yo: 'Ti yan', sw: 'Imetatuliwa', am: 'ተፈትቷል', ig: 'Edozila',
  ha: 'An warware', ne: 'समाधान भयो', bn: 'সমাধান হয়েছে', ta: 'தீர்வு காணப்பட்டது',
  te: 'పరిష్కరించబడింది', mr: 'सोडवले', gu: 'ઉકેલાયું', pa: 'ਹੱਲ ਹੋ ਗਿਆ',
  kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ', ml: 'പരിഹരിച്ചു', si: 'විසඳා ඇත', my: 'ဖြေရှင်းပြီး',
  km: 'បានដោះស្រាយ', lo: 'ແກ້ໄຂແລ້ວ', mn: 'Шийдэгдсэн', uz: 'Hal qilindi',
  tg: 'Ҳал шуд', so: 'La xaliyay', sq: 'Zgjidhur', mk: 'Решено', lb: 'Geléist',
  cy: 'Wedi\'i ddatrys', ga: 'Réitithe', mt: 'Riżolt', is: 'Leyst', et: 'Lahendatud',
  lv: 'Atrisināts', lt: 'Išspręsta', hy: 'Լուծված', ka: 'მოგვარებული', kk: 'Шешілді',
  az: 'Həll olunub', be: 'Вырашана', bg: 'Решен', hr: 'Riješeno', sr: 'Решено',
  sl: 'Rešeno', ro: 'Rezolvat', hu: 'Megoldva', fil: 'Nalutas', id: 'Terselesaikan',
  ms: 'Diselesaikan', fa: 'حل شد', ur: 'حل ہو گیا', he: 'נפתר', hi: 'हल हो गया', el: 'Επιλύθηκε',
};

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, path));
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
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function pick(...values) {
  for (const value of values) {
    if (value != null && value !== '' && value !== 'undefined') return value;
  }
  return undefined;
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

function ticketSingular(title, tickets, code) {
  if (/izingxoxo|Izingxoxo|gesprek|Gesprek|conversations|المحادثات|محادثات/i.test(`${title} ${tickets}`)) {
    const words = { zu: 'ithekethe', ar: 'تذكرة', af: 'kaartjie', nl: 'ticket' };
    if (words[code]) return words[code];
  }
  if (code === 'ar' || /المحادثات|محادثات|conversations/i.test(`${title} ${tickets}`)) {
    return code === 'ar' ? 'تذكرة' : 'ticket';
  }
  const source = tickets || title || 'ticket';
  return source
    .replace(/Tickets?/gi, 'ticket')
    .replace(/티켓/g, '티켓')
    .replace(/チケット/g, 'チケット')
    .replace(/工单/g, '工单')
    .replace(/工單/g, '工單')
    .replace(/kaartjies/gi, 'kaartjie')
    .replace(/tickets/gi, 'ticket')
    .replace(/المحادثات/g, 'تذكرة')
  .trim();
}

function deriveSubtitle(adminLcDesc, playerLiveSubtitle) {
  if (adminLcDesc) {
    for (const [pattern, replacement] of LIVE_DESC_TO_SUBTITLE) {
      if (pattern.test(adminLcDesc)) return adminLcDesc.replace(pattern, replacement);
    }
  }
  if (playerLiveSubtitle && playerLiveSubtitle !== en.liveChat.subtitle) {
    for (const [pattern, replacer] of LIVE_CHAT_SUBTITLE_TO_PLAYER) {
      const match = playerLiveSubtitle.match(pattern);
      if (match) return typeof replacer === 'function' ? replacer(...match) : replacer;
    }
  }
  return en.supportTickets.subtitle;
}

function deriveClosedHint(closedNotice, statusClosed, code) {
  if (!closedNotice || closedNotice === 'This ticket is closed. Change the status to reopen if needed.') {
    return en.supportTickets.closedHint;
  }
  let suffix = closedNotice;
  for (const [pattern, replacement] of CLOSED_TO_PLAYER) {
    suffix = suffix.replace(pattern, replacement);
  }
  if (suffix === closedNotice) {
    suffix = closedNotice.replace(/reopen|heropen|rouvrir|wieder zu öffnen|reabrir/gi, 'open a new ticket');
  }
  const prefix = CLOSED_PREFIX[code];
  if (prefix && statusClosed && !suffix.toLowerCase().includes(statusClosed.toLowerCase())) {
    return `${prefix} ${statusClosed}. ${suffix.split('.').pop()?.trim() ? suffix : ''}`.trim();
  }
  if (/^This ticket is closed/i.test(closedNotice)) {
    return closedNotice.replace(/Change the status.*/i, 'Open a new ticket if you need further help.');
  }
  const closedMatch = closedNotice.match(/^(.+?\bis\b.+?)(\.|$)/i);
  if (closedMatch && suffix !== closedNotice) {
    return `${closedMatch[1].trim()}. ${suffix.replace(/^.*?\.\s*/, '')}`.trim();
  }
  return suffix.includes('Open a new') || suffix.includes('nuwe') || suffix.includes('nouveau')
    ? `This ticket is closed. ${suffix}`.replace(/^This ticket is closed\. This ticket is closed\./, 'This ticket is closed.')
    : closedNotice.replace(/Change the status.*/i, 'Open a new ticket if you need further help.');
}

function derivePlayerClosedHint(closedNotice, statusClosed, code) {
  if (!closedNotice || closedNotice === EN_ADMIN_CLOSED || /^This ticket is closed/i.test(closedNotice)) {
    if (PLAYER_CLOSED_HINT[code]) return PLAYER_CLOSED_HINT[code];
    if (statusClosed && statusClosed !== 'Closed' && statusClosed !== 'closed') {
      const prefix = CLOSED_PREFIX[code];
      const tail = CLOSED_TO_PLAYER.find(([pattern]) => pattern.test(EN_ADMIN_CLOSED))?.[1]
        ?? 'Open a new ticket if you need further help.';
      if (prefix) return `${prefix} ${statusClosed}. ${tail}`.trim();
    }
    return en.supportTickets.closedHint;
  }
  let tail = closedNotice;
  const closedWord = statusClosed || 'closed';
  for (const [pattern, replacement] of CLOSED_TO_PLAYER) {
    tail = tail.replace(pattern, replacement);
  }
  const firstSentence = closedNotice.split('.')[0]?.trim();
  if (firstSentence && firstSentence !== closedNotice) {
    const hintTail = tail.includes('.') ? tail.split('.').slice(1).join('.').trim() : tail;
    if (hintTail && hintTail !== closedNotice) {
      return `${firstSentence}. ${hintTail}`.replace(/\.\s*\./g, '.').trim();
    }
  }
  if (CLOSED_PREFIX[code] && statusClosed) {
    const playerTail = tail.replace(/Change the status.*/i, '').trim();
    for (const [pattern, replacement] of CLOSED_TO_PLAYER) {
      if (pattern.test(closedNotice)) {
        return `${CLOSED_PREFIX[code]} ${statusClosed}. ${replacement}`.trim();
      }
    }
  }
  return deriveClosedHint(closedNotice, statusClosed, code);
}

function adaptCreateFailed(failedReply) {
  if (!failedReply) return en.supportTickets.createFailed;
  if (/Kon nie antwoord stuur/i.test(failedReply)) {
    return 'Kon nie kaartjie skep nie. Probeer asseblief weer.';
  }
  if (/Yehlulekile ukuthumela umlayezo/i.test(failedReply)) {
    return 'Yehlulekile ukudala ithekethe. Sicela uzame futhi.';
  }
  if (/فشل إرسال الرسالة/i.test(failedReply)) {
    return 'تعذر إنشاء التذكرة. يرجى المحاولة مرة أخرى.';
  }
  return failedReply
    .replace(/send (your )?reply/gi, 'create your ticket')
    .replace(/stuur (jou )?antwoord/gi, 'kaartjie skep')
    .replace(/envoyer votre réponse/gi, 'créer votre ticket')
    .replace(/Antwort senden/gi, 'Ticket erstellen')
    .replace(/Antwort konnte nicht gesendet werden/gi, 'Ticket konnte nicht erstellt werden')
    .replace(/enviar (su )?respuesta/gi, 'crear su ticket')
    .replace(/返信を送信/g, 'チケットを作成')
    .replace(/답장을 보내지 못했습니다/g, '티켓을 생성하지 못했습니다')
    .replace(/답장/g, '티켓')
    .replace(/message/gi, 'ticket')
    .replace(/boodskap/gi, 'kaartjie')
    .replace(/mensaje/gi, 'ticket')
    .replace(/Nachricht/gi, 'Ticket')
    .replace(/메시지/g, '티켓')
    .replace(/رسالة/g, 'تذكرة')
    .replace(/إرسال/g, 'إنشاء');
}

function playerTitle(stTitle, code) {
  if (stTitle && !/المحادثات|محادثات|Conversations|Izingxoxo|izingxoxo/i.test(stTitle)) {
    return stTitle;
  }
  if (code === 'ar') return 'تذاكر الدعم';
  if (code === 'zu') return 'Amathekethe Wosizo';
  return pick(stTitle, en.supportTickets.title);
}

function adaptEmpty(noTickets, title) {
  if (!noTickets) return en.supportTickets.empty;
  if (/support|ondersteuning|assist|soporte|サポート|지원|支持|دعم/i.test(noTickets)) return noTickets;
  const supportWord = (title || 'Support').split(' ')[0];
  return noTickets
    .replace(/^No /i, `No ${supportWord} `)
    .replace(/^Nog geen /i, `Nog geen ${supportWord.toLowerCase()} `)
    .replace(/^Aucun /i, `Aucun ${supportWord.toLowerCase()} `)
    .replace(/^Aún no hay /i, `Aún no hay ${supportWord.toLowerCase()} `)
    .replace(/^Noch keine /i, `Noch keine ${supportWord}-`);
}

function deriveBackToList(ticketWord, code) {
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
    zu: '← Buyela kumathekethe',
  };
  return templates[code] ?? `← Back to ${ticketWord}`;
}

function deriveNotFound(ticketWord, code) {
  const cap = ticketWord.charAt(0).toUpperCase() + ticketWord.slice(1);
  const templates = {
    af: `${cap} nie gevind nie.`,
    nl: `${cap} niet gevonden.`,
    de: `${cap} nicht gefunden.`,
    fr: `${cap} introuvable.`,
    es: `${cap} no encontrado.`,
    pt: `${cap} não encontrado.`,
    it: `${cap} non trovato.`,
    pl: `${cap} nie znaleziono.`,
    ru: `${cap} не найден.`,
    ja: `${cap}が見つかりません。`,
    ko: `${cap}을(를) 찾을 수 없습니다.`,
    zh: `未找到${cap}。`,
    ar: `${cap} غير موجودة.`,
    zu: 'Ithekethe ayitholakalanga.',
  };
  return templates[code] ?? `${cap} not found.`;
}

function buildFlatPaths(code, admin, locale) {
  const parent = VARIANT_PARENT[code];
  const manual = MANUAL[code] ?? (parent ? MANUAL[parent] : null);
  if (manual) return manual;

  const st = admin?.support_tickets ?? {};
  const lc = admin?.live_chat ?? {};
  const common = admin?.common ?? {};
  const nav = admin?.nav ?? {};
  const liveChat = locale?.liveChat ?? {};
  const footer = locale?.footer ?? {};

  const title = playerTitle(st.title, code);
  const ticketWord = ticketSingular(title, st.tickets, code);
  const sendWord = pick(common.send, liveChat.send, 'Submit');
  const newTicketPrefix = NEW_TICKET_PREFIX[code] ?? 'New ';
  const newTicket = code === 'ar'
    ? NEW_TICKET_PREFIX.ar
    : `${newTicketPrefix}${ticketWord}`.replace(/\s+/g, ' ').trim();

  return {
    'nav.supportTickets': pick(
      manual?.['nav.supportTickets'],
      nav.support_tickets && !/المحادثات|محادثات/i.test(nav.support_tickets) ? nav.support_tickets : null,
      title,
    )?.toString().toUpperCase() ?? EN['nav.supportTickets'],
    'nav.supportTicketsLabel': pick(footer.support !== 'Support' ? footer.support : null, nav.support, liveChat.title, EN['nav.supportTicketsLabel']),
    'supportTickets.title': title,
    'supportTickets.subtitle': deriveSubtitle(lc.desc, liveChat.subtitle),
    'supportTickets.newTicket': newTicket,
    'supportTickets.subject': SUBJECT_WORDS[code] ?? pick(locale.deposit?.subject, 'Subject'),
    'supportTickets.category': pick(st.filter_category, common.type, 'Category'),
    'supportTickets.message': MESSAGE_WORDS[code] ?? pick(
      liveChat.placeholder?.replace(/^Type your /i, '').replace(/\.\.\.$/, ''),
      'Message',
    ),
    'supportTickets.submit': `${sendWord} ${ticketWord}`.trim(),
    'supportTickets.createFailed': adaptCreateFailed(st.failed_send_reply ?? liveChat.sendFailed),
    'supportTickets.empty': adaptEmpty(st.no_tickets, title),
    'supportTickets.backToList': deriveBackToList(ticketWord, code),
    'supportTickets.notFound': deriveNotFound(ticketWord, code),
    'supportTickets.closedHint': derivePlayerClosedHint(st.closed_notice, st.status_closed, code),
    'supportTickets.replyPlaceholder': pick(st.reply_placeholder, liveChat.placeholder, en.supportTickets.replyPlaceholder),
    'supportTickets.sendReply': SEND_REPLY_WORDS[code] ?? (sendWord === 'Send' ? 'Send reply' : `${sendWord} reply`),
    'supportTickets.replyFailed': pick(st.failed_send_reply, liveChat.sendFailed, en.supportTickets.replyFailed),
    'supportTickets.supportTeam': pick(
      nav.support,
      footer.support !== 'Support' ? footer.support : null,
      liveChat.title !== 'Live Chat' ? liveChat.title : null,
      'Support',
    ),
    'supportTickets.you': pick(YOU_WORDS[code], locale.affiliate?.you, locale.profile?.you, 'You'),
    'supportTickets.categories.account': pick(st.category_account, 'Account'),
    'supportTickets.categories.payment': pick(st.category_payment, 'Payment'),
    'supportTickets.categories.bonus': pick(st.category_bonus, 'Bonus'),
    'supportTickets.categories.game': pick(st.category_game, 'Game'),
    'supportTickets.categories.other': pick(OTHER_CATEGORY[code], st.category_other, 'Other'),
    'supportTickets.status.open': pick(st.status_open, 'Open'),
    'supportTickets.status.pending': pick(st.status_pending, 'Pending'),
    'supportTickets.status.resolved': pick(RESOLVED_WORDS[code], st.status_resolved, 'Resolved'),
    'supportTickets.status.closed': pick(st.status_closed, 'Closed'),
  };
}

function pathsToLocale(flat) {
  const nav = {};
  const supportTickets = {};
  for (const [path, value] of Object.entries(flat)) {
    if (path.startsWith('nav.')) nav[path.slice(4)] = value;
    else if (path.startsWith('supportTickets.')) setNested(supportTickets, path.slice('supportTickets.'.length), value);
  }
  return { nav, supportTickets };
}

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

function updatePhraseMap(langCode, flat) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  if (!existsSync(mapPath)) return false;
  const phraseEntries = Object.fromEntries(
    Object.entries(EN).map(([path, english]) => [english, flat[path] ?? english]),
  );
  const map = JSON.parse(readFileSync(mapPath, 'utf8'));
  Object.assign(map, phraseEntries);
  writeFileSync(mapPath, JSON.stringify(map, null, 2));
  return true;
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

  const locale = parseLocaleTs(code);
  const flat = buildFlatPaths(code, admin, locale);
  const { nav, supportTickets } = pathsToLocale(flat);

  if (updatePhraseMap(code, flat)) {
    writeLocaleFile(code, {
      ...locale,
      nav: { ...locale.nav, ...nav },
      supportTickets,
    });
    console.log(`${code}: phrase map + applied`);
    continue;
  }

  writeLocaleFile(code, {
    ...locale,
    nav: { ...locale.nav, ...nav },
    supportTickets,
  });
  console.log(`${code}: applied`);
}

copyRegionalVariants();
console.log('done');
