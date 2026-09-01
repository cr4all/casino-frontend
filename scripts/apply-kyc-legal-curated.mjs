/**
 * Apply curated translations for new KYC/Terms titles & key phrases
 * into legal phraseMaps (no external MT — API quotas exhausted).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legalMapsDir = join(root, 'src/content/legal/phraseMaps');

/** Shared curated phrases — titles and short labels most visible from Footer → Legal */
const SHARED = {
  'KYC Policy': {
    de: 'KYC-Richtlinie',
    'de-be': 'KYC-Richtlinie',
    fr: 'Politique KYC',
    'fr-be': 'Politique KYC',
    es: 'Política KYC',
    it: 'Politica KYC',
    pt: 'Política KYC',
    'pt-br': 'Política KYC',
    nl: 'KYC-beleid',
    'nl-be': 'KYC-beleid',
    pl: 'Polityka KYC',
    ru: 'Политика KYC',
    uk: 'Політика KYC',
    tr: 'KYC Politikası',
    vi: 'Chính sách KYC',
    th: 'นโยบาย KYC',
    id: 'Kebijakan KYC',
    ms: 'Dasar KYC',
    ja: 'KYCポリシー',
    zh: 'KYC 政策',
    'zh-tw': 'KYC 政策',
    ar: 'سياسة KYC',
    he: 'מדיניות KYC',
    fa: 'سیاست KYC',
    hi: 'KYC नीति',
    bn: 'KYC নীতি',
    sv: 'KYC-policy',
    no: 'KYC-policy',
    da: 'KYC-politik',
    fi: 'KYC-käytäntö',
    cs: 'KYC politika',
    sk: 'KYC politika',
    ro: 'Politica KYC',
    hu: 'KYC szabályzat',
    el: 'Πολιτική KYC',
    bg: 'Политика за KYC',
    sr: 'KYC политика',
    hr: 'KYC politika',
    sl: 'KYC politika',
    mk: 'KYC политика',
    sq: 'Politika KYC',
    lv: 'KYC politika',
    lt: 'KYC politika',
    et: 'KYC poliitika',
    af: 'KYC-beleid',
    is: 'Reglur um KYC',
    fil: 'Patakaran sa KYC',
    uz: 'KYC siyosati',
    kk: 'KYC саясаты',
    az: 'KYC Siyasəti',
    ka: 'KYC პოლიტიკა',
    mn: 'KYC бодлого',
    ne: 'KYC नीति',
    pa: 'KYC ਨੀਤੀ',
    ta: 'KYC கொள்கை',
    te: 'KYC విధానం',
    ur: 'KYC پالیسی',
    sw: 'Sera ya KYC',
    so: 'Siyaasadda KYC',
    yo: 'Ìlànà KYC',
    zu: 'Inqubomgomo ye-KYC',
    tg: 'Сиёсати KYC',
    hy: 'KYC Քաղաքականություն',
    km: 'គោលការណ៍ KYC',
    am: 'KYC ፖሊሲ',
    be: 'Палітыка KYC',
    cy: 'Polisi KYC',
    ga: 'Beartas KYC',
    gu: 'KYC નીતિ',
    ha: 'Manufar KYC',
    ig: 'Iwu KYC',
    kn: 'KYC ನೀತಿ',
    lb: 'KYC-Politik',
    lo: 'ນະໂຍບາຍ KYC',
    ml: 'KYC നയം',
    mr: 'KYC धोरण',
    mt: 'Politika KYC',
    my: 'KYC မူဝါဒ',
    si: 'KYC ප්‍රතිපත්තිය',
  },
  Purpose: {
    de: 'Zweck', fr: 'Objectif', es: 'Propósito', it: 'Scopo', pt: 'Finalidade', 'pt-br': 'Finalidade',
    nl: 'Doel', pl: 'Cel', ru: 'Цель', uk: 'Мета', tr: 'Amaç', vi: 'Mục đích', th: 'วัตถุประสงค์',
    id: 'Tujuan', ja: '目的', zh: '目的', 'zh-tw': '目的', ar: 'الغرض', he: 'מטרה', hi: 'उद्देश्य',
    sv: 'Syfte', no: 'Formål', da: 'Formål', fi: 'Tarkoitus', cs: 'Účel', ro: 'Scop', hu: 'Cél',
    el: 'Σκοπός', bg: 'Цел', fil: 'Layunin', ms: 'Tujuan',
  },
  Contact: {
    de: 'Kontakt', fr: 'Contact', es: 'Contacto', it: 'Contatto', pt: 'Contacto', 'pt-br': 'Contato',
    nl: 'Contact', pl: 'Kontakt', ru: 'Контакты', uk: 'Контакт', tr: 'İletişim', vi: 'Liên hệ', th: 'ติดต่อ',
    id: 'Kontak', ja: 'お問い合わせ', zh: '联系方式', 'zh-tw': '聯絡方式', ar: 'اتصل بنا', he: 'יצירת קשר',
    hi: 'संपर्क', sv: 'Kontakt', no: 'Kontakt', da: 'Kontakt', fi: 'Yhteystiedot', cs: 'Kontakt',
    ro: 'Contact', hu: 'Kapcsolat', el: 'Επικοινωνία', bg: 'Контакт', fil: 'Makipag-ugnayan', ms: 'Hubungi',
  },
  'Non-compliance': {
    de: 'Nichteinhaltung', fr: 'Non-conformité', es: 'Incumplimiento', it: 'Mancata conformità',
    pt: 'Incumprimento', 'pt-br': 'Não conformidade', nl: 'Nalevingstekort', pl: 'Niezgodność',
    ru: 'Несоблюдение', uk: 'Недотримання', tr: 'Uyumsuzluk', vi: 'Không tuân thủ', th: 'การไม่ปฏิบัติตาม',
    id: 'Ketidakpatuhan', ja: '未遵守', zh: '未遵守', 'zh-tw': '未遵守', ar: 'عدم الامتثال',
    he: 'אי-ציות', hi: 'अनुपालन न करना', sv: 'Bristande efterlevnad', fil: 'Hindi pagsunod', ms: 'Ketidakpatuhan',
  },
  'Data protection': {
    de: 'Datenschutz', fr: 'Protection des données', es: 'Protección de datos', it: 'Protezione dei dati',
    pt: 'Proteção de dados', 'pt-br': 'Proteção de dados', nl: 'Gegevensbescherming', pl: 'Ochrona danych',
    ru: 'Защита данных', uk: 'Захист даних', tr: 'Veri koruma', vi: 'Bảo vệ dữ liệu', th: 'การคุ้มครองข้อมูล',
    id: 'Perlindungan data', ja: 'データ保護', zh: '数据保护', 'zh-tw': '資料保護', ar: 'حماية البيانات',
    he: 'הגנת מידע', hi: 'डेटा सुरक्षा', sv: 'Dataskydd', fil: 'Proteksyon ng data', ms: 'Perlindungan data',
  },
  'Withdrawal limits': {
    de: 'Auszahlungslimits', fr: 'Limites de retrait', es: 'Límites de retiro', it: 'Limiti di prelievo',
    pt: 'Limites de levantamento', 'pt-br': 'Limites de saque', nl: 'Opnamelimieten', pl: 'Limity wypłat',
    ru: 'Лимиты вывода', uk: 'Ліміти виведення', tr: 'Çekim limitleri', vi: 'Hạn mức rút tiền',
    th: 'วงเงินถอน', id: 'Batas penarikan', ja: '出金限度額', zh: '提款限额', 'zh-tw': '提款限額',
    ar: 'حدود السحب', he: 'מגבלות משיכה', hi: 'निकासी सीमाएँ', sv: 'Uttagsgränser',
    fil: 'Mga limitasyon sa withdrawal', ms: 'Had pengeluaran',
  },
  'Verification process': {
    de: 'Verifizierungsprozess', fr: 'Processus de vérification', es: 'Proceso de verificación',
    it: 'Processo di verifica', pt: 'Processo de verificação', 'pt-br': 'Processo de verificação',
    nl: 'Verificatieproces', pl: 'Proces weryfikacji', ru: 'Процесс верификации', uk: 'Процес верифікації',
    tr: 'Doğrulama süreci', vi: 'Quy trình xác minh', th: 'กระบวนการยืนยันตัวตน', id: 'Proses verifikasi',
    ja: '本人確認の流れ', zh: '验证流程', 'zh-tw': '驗證流程', ar: 'عملية التحقق', he: 'תהליך אימות',
    hi: 'सत्यापन प्रक्रिया', sv: 'Verifieringsprocess', fil: 'Proseso ng beripikasyon', ms: 'Proses pengesahan',
  },
  'Documents we may request': {
    de: 'Dokumente, die wir anfordern können', fr: 'Documents que nous pouvons demander',
    es: 'Documentos que podemos solicitar', it: 'Documenti che possiamo richiedere',
    pt: 'Documentos que podemos solicitar', 'pt-br': 'Documentos que podemos solicitar',
    nl: 'Documenten die we kunnen opvragen', pl: 'Dokumenty, o które możemy poprosić',
    ru: 'Документы, которые мы можем запросить', uk: 'Документи, які ми можемо запросити',
    tr: 'Talep edebileceğimiz belgeler', vi: 'Tài liệu chúng tôi có thể yêu cầu',
    th: 'เอกสารที่เราอาจขอ', id: 'Dokumen yang dapat kami minta', ja: 'ご提出いただく書類',
    zh: '我们可能要求的文件', 'zh-tw': '我們可能要求的文件', ar: 'المستندات التي قد نطلبها',
    he: 'מסמכים שעשויים להידרש', hi: 'वे दस्तावेज़ जिनकी हम माँग सकते हैं', sv: 'Dokument vi kan begära',
    fil: 'Mga dokumentong maaari naming hingin', ms: 'Dokumen yang mungkin kami minta',
  },
  'When verification is required': {
    de: 'Wann eine Verifizierung erforderlich ist', fr: 'Quand la vérification est requise',
    es: 'Cuándo se requiere la verificación', it: 'Quando è richiesta la verifica',
    pt: 'Quando a verificação é necessária', 'pt-br': 'Quando a verificação é necessária',
    nl: 'Wanneer verificatie vereist is', pl: 'Kiedy wymagana jest weryfikacja',
    ru: 'Когда требуется верификация', uk: 'Коли потрібна верифікація',
    tr: 'Doğrulamanın ne zaman gerekli olduğu', vi: 'Khi nào cần xác minh',
    th: 'เมื่อใดที่ต้องยืนยันตัวตน', id: 'Kapan verifikasi diperlukan', ja: '本人確認が必要な場合',
    zh: '何时需要验证', 'zh-tw': '何時需要驗證', ar: 'متى تكون عملية التحقق مطلوبة',
    he: 'מתי נדרש אימות', hi: 'सत्यापन कब आवश्यक है', sv: 'När verifiering krävs',
    fil: 'Kailan kinakailangan ang beripikasyon', ms: 'Bila pengesahan diperlukan',
  },
  'Identity verification (KYC)': {
    de: 'Identitätsprüfung (KYC)', fr: 'Vérification d’identité (KYC)', es: 'Verificación de identidad (KYC)',
    it: 'Verifica dell’identità (KYC)', pt: 'Verificação de identidade (KYC)', 'pt-br': 'Verificação de identidade (KYC)',
    nl: 'Identiteitsverificatie (KYC)', pl: 'Weryfikacja tożsamości (KYC)', ru: 'Проверка личности (KYC)',
    uk: 'Перевірка особи (KYC)', tr: 'Kimlik doğrulama (KYC)', vi: 'Xác minh danh tính (KYC)',
    th: 'การยืนยันตัวตน (KYC)', id: 'Verifikasi identitas (KYC)', ja: '本人確認（KYC）',
    zh: '身份验证（KYC）', 'zh-tw': '身分驗證（KYC）', ar: 'التحقق من الهوية (KYC)',
    he: 'אימות זהות (KYC)', hi: 'पहचान सत्यापन (KYC)', sv: 'Identitetsverifiering (KYC)',
    fil: 'Pagberipika ng pagkakakilanlan (KYC)', ms: 'Pengesahan identiti (KYC)',
  },
  'Fair play & prohibited conduct': {
    de: 'Faires Spiel und verbotenes Verhalten', fr: 'Jeu équitable et conduites interdites',
    es: 'Juego limpio y conducta prohibida', it: 'Fair play e condotte vietate',
    pt: 'Jogo justo e conduta proibida', 'pt-br': 'Jogo limpo e conduta proibida',
    nl: 'Fair play en verboden gedrag', pl: 'Fair play i zabronione zachowania',
    ru: 'Честная игра и запрещённое поведение', uk: 'Чесна гра та заборонена поведінка',
    tr: 'Adil oyun ve yasak davranışlar', vi: 'Chơi công bằng và hành vi bị cấm',
    th: 'การเล่นอย่างยุติธรรมและพฤติกรรมต้องห้าม', id: 'Fair play dan perilaku terlarang',
    ja: 'フェアプレイと禁止行為', zh: '公平游戏与禁止行为', 'zh-tw': '公平遊戲與禁止行為',
    ar: 'اللعب النزيه والسلوك المحظور', he: 'משחק הוגן והתנהגות אסורה',
    hi: 'निष्पक्ष खेल और निषिद्ध आचरण', sv: 'Fair play och förbjudet beteende',
    fil: 'Fair play at ipinagbabawal na pag-uugali', ms: 'Fair play dan kelakuan dilarang',
  },
  'Games & malfunctions': {
    de: 'Spiele und Störungen', fr: 'Jeux et dysfonctionnements', es: 'Juegos y fallos',
    it: 'Giochi e malfunzionamenti', pt: 'Jogos e avarias', 'pt-br': 'Jogos e falhas',
    nl: 'Spellen en storingen', pl: 'Gry i awarie', ru: 'Игры и сбои', uk: 'Ігри та збої',
    tr: 'Oyunlar ve arızalar', vi: 'Trò chơi và sự cố', th: 'เกมและความผิดพลาด',
    id: 'Permainan dan gangguan', ja: 'ゲームと障害', zh: '游戏与故障', 'zh-tw': '遊戲與故障',
    ar: 'الألعاب والأعطال', he: 'משחקים ותקלות', hi: 'गेम और खराबी', sv: 'Spel och fel',
    fil: 'Mga laro at malfunction', ms: 'Permainan dan kerosakan',
  },
  'Inactive accounts': {
    de: 'Inaktive Konten', fr: 'Comptes inactifs', es: 'Cuentas inactivas', it: 'Account inattivi',
    pt: 'Contas inativas', 'pt-br': 'Contas inativas', nl: 'Inactieve accounts', pl: 'Nieaktywne konta',
    ru: 'Неактивные аккаунты', uk: 'Неактивні акаунти', tr: 'Pasif hesaplar', vi: 'Tài khoản không hoạt động',
    th: 'บัญชีที่ไม่ได้ใช้งาน', id: 'Akun tidak aktif', ja: '休止アカウント', zh: '休眠账户', 'zh-tw': '休眠帳戶',
    ar: 'الحسابات غير النشطة', he: 'חשבונות לא פעילים', hi: 'निष्क्रिय खाते', sv: 'Inaktiva konton',
    fil: 'Mga hindi aktibong account', ms: 'Akaun tidak aktif',
  },
};

let updatedMaps = 0;
let updatedKeys = 0;

for (const file of readdirSync(legalMapsDir).filter((f) => f.endsWith('.json') && f !== 'ko.json')) {
  const code = file.replace(/\.json$/, '');
  const filePath = join(legalMapsDir, file);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  let changed = false;

  for (const [english, byLang] of Object.entries(SHARED)) {
    const localized = byLang[code];
    if (!localized) continue;
    if (map[english] === localized) continue;
    // Only overwrite if missing or still English
    if (!map[english] || map[english] === english) {
      map[english] = localized;
      changed = true;
      updatedKeys += 1;
    }
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
    updatedMaps += 1;
  }
}

console.log(`updatedMaps=${updatedMaps} updatedKeys=${updatedKeys}`);
