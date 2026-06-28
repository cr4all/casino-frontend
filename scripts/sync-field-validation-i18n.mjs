import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const cachePath = join(root, 'scripts/i18n-validation-data.json');

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

const LANG_TARGETS = {
  af: 'af', am: 'am', ar: 'ar', 'ar-ma': 'ar', 'ar-dz': 'ar', 'ar-tn': 'ar', az: 'az', be: 'be',
  bg: 'bg', bn: 'bn', cs: 'cs', cy: 'cy', da: 'da', de: 'de', 'de-be': 'de', el: 'el', es: 'es',
  et: 'et', fa: 'fa', fi: 'fi', fil: 'tl', fr: 'fr', 'fr-be': 'fr', ga: 'ga', gu: 'gu', ha: 'ha',
  he: 'he', hi: 'hi', hr: 'hr', hu: 'hu', hy: 'hy', id: 'id', ig: 'ig', is: 'is', it: 'it', ja: 'ja',
  ka: 'ka', kk: 'kk', km: 'km', kn: 'kn', ko: 'ko', lb: 'lb', lo: 'lo', lt: 'lt', lv: 'lv', mk: 'mk',
  ml: 'ml', mn: 'mn', mr: 'mr', ms: 'ms', mt: 'mt', my: 'my', ne: 'ne', nl: 'nl', 'nl-be': 'nl',
  no: 'no', pa: 'pa', pl: 'pl', pt: 'pt', 'pt-br': 'pt', ro: 'ro', ru: 'ru', si: 'si', sk: 'sk',
  sl: 'sl', so: 'so', sq: 'sq', sr: 'sr', sv: 'sv', sw: 'sw', ta: 'ta', te: 'te', tg: 'tg', th: 'th',
  tr: 'tr', uk: 'uk', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zh: 'zh-CN', 'zh-tw': 'zh-TW', zu: 'zu',
};

const VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
  'pt-br': 'pt',
};

const VALIDATION_KEYS = [
  'fieldRequired',
  'fieldRequiredGeneric',
  'fieldEmailInvalid',
  'fieldMinLength',
  'fieldPasswordMismatch',
  'fieldSelectRequired',
  'fieldCodeInvalid',
];

const ENGLISH = Object.fromEntries(VALIDATION_KEYS.map((key) => [key, en.common[key]]));

/** Curated translations for major locales (placeholders preserved). */
const MANUAL = {
  de: {
    fieldRequired: 'Bitte {{field}} eingeben.',
    fieldRequiredGeneric: 'Dieses Feld ist erforderlich.',
    fieldEmailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    fieldMinLength: 'Mindestens {{count}} Zeichen erforderlich.',
    fieldPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
    fieldSelectRequired: 'Bitte wählen Sie {{field}}.',
    fieldCodeInvalid: 'Bitte geben Sie den 6-stelligen Bestätigungscode ein.',
  },
  fr: {
    fieldRequired: 'Veuillez saisir {{field}}.',
    fieldRequiredGeneric: 'Ce champ est obligatoire.',
    fieldEmailInvalid: 'Veuillez saisir une adresse e-mail valide.',
    fieldMinLength: 'Au moins {{count}} caractères requis.',
    fieldPasswordMismatch: 'Les mots de passe ne correspondent pas.',
    fieldSelectRequired: 'Veuillez sélectionner {{field}}.',
    fieldCodeInvalid: 'Veuillez saisir le code de vérification à 6 chiffres.',
  },
  es: {
    fieldRequired: 'Introduzca {{field}}.',
    fieldRequiredGeneric: 'Este campo es obligatorio.',
    fieldEmailInvalid: 'Introduzca una dirección de correo electrónico válida.',
    fieldMinLength: 'Debe tener al menos {{count}} caracteres.',
    fieldPasswordMismatch: 'Las contraseñas no coinciden.',
    fieldSelectRequired: 'Seleccione {{field}}.',
    fieldCodeInvalid: 'Introduzca el código de verificación de 6 dígitos.',
  },
  it: {
    fieldRequired: 'Inserisci {{field}}.',
    fieldRequiredGeneric: 'Questo campo è obbligatorio.',
    fieldEmailInvalid: 'Inserisci un indirizzo email valido.',
    fieldMinLength: 'Deve contenere almeno {{count}} caratteri.',
    fieldPasswordMismatch: 'Le password non corrispondono.',
    fieldSelectRequired: 'Seleziona {{field}}.',
    fieldCodeInvalid: 'Inserisci il codice di verifica a 6 cifre.',
  },
  pt: {
    fieldRequired: 'Introduza {{field}}.',
    fieldRequiredGeneric: 'Este campo é obrigatório.',
    fieldEmailInvalid: 'Introduza um endereço de e-mail válido.',
    fieldMinLength: 'Deve ter pelo menos {{count}} caracteres.',
    fieldPasswordMismatch: 'As palavras-passe não coincidem.',
    fieldSelectRequired: 'Selecione {{field}}.',
    fieldCodeInvalid: 'Introduza o código de verificação de 6 dígitos.',
  },
  nl: {
    fieldRequired: 'Voer {{field}} in.',
    fieldRequiredGeneric: 'Dit veld is verplicht.',
    fieldEmailInvalid: 'Voer een geldig e-mailadres in.',
    fieldMinLength: 'Moet minimaal {{count}} tekens bevatten.',
    fieldPasswordMismatch: 'Wachtwoorden komen niet overeen.',
    fieldSelectRequired: 'Selecteer {{field}}.',
    fieldCodeInvalid: 'Voer de 6-cijferige verificatiecode in.',
  },
  pl: {
    fieldRequired: 'Wprowadź {{field}}.',
    fieldRequiredGeneric: 'To pole jest wymagane.',
    fieldEmailInvalid: 'Wprowadź prawidłowy adres e-mail.',
    fieldMinLength: 'Wymagane co najmniej {{count}} znaków.',
    fieldPasswordMismatch: 'Hasła nie są zgodne.',
    fieldSelectRequired: 'Wybierz {{field}}.',
    fieldCodeInvalid: 'Wprowadź 6-cyfrowy kod weryfikacyjny.',
  },
  ru: {
    fieldRequired: 'Введите {{field}}.',
    fieldRequiredGeneric: 'Это поле обязательно.',
    fieldEmailInvalid: 'Введите действительный адрес электронной почты.',
    fieldMinLength: 'Минимум {{count}} символов.',
    fieldPasswordMismatch: 'Пароли не совпадают.',
    fieldSelectRequired: 'Выберите {{field}}.',
    fieldCodeInvalid: 'Введите 6-значный код подтверждения.',
  },
  tr: {
    fieldRequired: 'Lütfen {{field}} girin.',
    fieldRequiredGeneric: 'Bu alan zorunludur.',
    fieldEmailInvalid: 'Lütfen geçerli bir e-posta adresi girin.',
    fieldMinLength: 'En az {{count}} karakter olmalıdır.',
    fieldPasswordMismatch: 'Şifreler eşleşmiyor.',
    fieldSelectRequired: 'Lütfen {{field}} seçin.',
    fieldCodeInvalid: 'Lütfen 6 haneli doğrulama kodunu girin.',
  },
  ja: {
    fieldRequired: '{{field}}を入力してください。',
    fieldRequiredGeneric: 'この項目は必須です。',
    fieldEmailInvalid: '有効なメールアドレスを入力してください。',
    fieldMinLength: '{{count}}文字以上入力してください。',
    fieldPasswordMismatch: 'パスワードが一致しません。',
    fieldSelectRequired: '{{field}}を選択してください。',
    fieldCodeInvalid: '6桁の確認コードを入力してください。',
  },
  zh: {
    fieldRequired: '请输入{{field}}。',
    fieldRequiredGeneric: '此字段为必填项。',
    fieldEmailInvalid: '请输入有效的电子邮件地址。',
    fieldMinLength: '至少需要 {{count}} 个字符。',
    fieldPasswordMismatch: '密码不匹配。',
    fieldSelectRequired: '请选择{{field}}。',
    fieldCodeInvalid: '请输入6位验证码。',
  },
  'zh-tw': {
    fieldRequired: '請輸入{{field}}。',
    fieldRequiredGeneric: '此欄位為必填。',
    fieldEmailInvalid: '請輸入有效的電子郵件地址。',
    fieldMinLength: '至少需要 {{count}} 個字元。',
    fieldPasswordMismatch: '密碼不一致。',
    fieldSelectRequired: '請選擇{{field}}。',
    fieldCodeInvalid: '請輸入6位數驗證碼。',
  },
  ko: {
    fieldRequired: '{{field}}을(를) 입력해 주세요.',
    fieldRequiredGeneric: '필수 입력 항목입니다.',
    fieldEmailInvalid: '올바른 이메일 주소를 입력해 주세요.',
    fieldMinLength: '최소 {{count}}자 이상 입력해 주세요.',
    fieldPasswordMismatch: '비밀번호가 일치하지 않습니다.',
    fieldSelectRequired: '{{field}}을(를) 선택해 주세요.',
    fieldCodeInvalid: '6자리 인증 코드를 입력해 주세요.',
  },
  ar: {
    fieldRequired: 'يرجى إدخال {{field}}.',
    fieldRequiredGeneric: 'هذا الحقل مطلوب.',
    fieldEmailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صالح.',
    fieldMinLength: 'يجب أن يكون {{count}} أحرف على الأقل.',
    fieldPasswordMismatch: 'كلمات المرور غير متطابقة.',
    fieldSelectRequired: 'يرجى اختيار {{field}}.',
    fieldCodeInvalid: 'يرجى إدخال رمز التحقق المكون من 6 أرقام.',
  },
  sv: {
    fieldRequired: 'Ange {{field}}.',
    fieldRequiredGeneric: 'Detta fält är obligatoriskt.',
    fieldEmailInvalid: 'Ange en giltig e-postadress.',
    fieldMinLength: 'Minst {{count}} tecken krävs.',
    fieldPasswordMismatch: 'Lösenorden matchar inte.',
    fieldSelectRequired: 'Välj {{field}}.',
    fieldCodeInvalid: 'Ange den 6-siffriga verifieringskoden.',
  },
  da: {
    fieldRequired: 'Indtast {{field}}.',
    fieldRequiredGeneric: 'Dette felt er påkrævet.',
    fieldEmailInvalid: 'Indtast en gyldig e-mailadresse.',
    fieldMinLength: 'Skal være mindst {{count}} tegn.',
    fieldPasswordMismatch: 'Adgangskoderne matcher ikke.',
    fieldSelectRequired: 'Vælg {{field}}.',
    fieldCodeInvalid: 'Indtast den 6-cifrede bekræftelseskode.',
  },
  no: {
    fieldRequired: 'Skriv inn {{field}}.',
    fieldRequiredGeneric: 'Dette feltet er påkrevd.',
    fieldEmailInvalid: 'Skriv inn en gyldig e-postadresse.',
    fieldMinLength: 'Må være minst {{count}} tegn.',
    fieldPasswordMismatch: 'Passordene stemmer ikke overens.',
    fieldSelectRequired: 'Velg {{field}}.',
    fieldCodeInvalid: 'Skriv inn den 6-sifrede bekreftelseskoden.',
  },
  fi: {
    fieldRequired: 'Syötä {{field}}.',
    fieldRequiredGeneric: 'Tämä kenttä on pakollinen.',
    fieldEmailInvalid: 'Syötä kelvollinen sähköpostiosoite.',
    fieldMinLength: 'Vähintään {{count}} merkkiä.',
    fieldPasswordMismatch: 'Salasanat eivät täsmää.',
    fieldSelectRequired: 'Valitse {{field}}.',
    fieldCodeInvalid: 'Syötä 6-numeroinen vahvistuskoodi.',
  },
  cs: {
    fieldRequired: 'Zadejte {{field}}.',
    fieldRequiredGeneric: 'Toto pole je povinné.',
    fieldEmailInvalid: 'Zadejte platnou e-mailovou adresu.',
    fieldMinLength: 'Musí mít alespoň {{count}} znaků.',
    fieldPasswordMismatch: 'Hesla se neshodují.',
    fieldSelectRequired: 'Vyberte {{field}}.',
    fieldCodeInvalid: 'Zadejte 6místný ověřovací kód.',
  },
  hu: {
    fieldRequired: 'Adja meg: {{field}}.',
    fieldRequiredGeneric: 'Ez a mező kötelező.',
    fieldEmailInvalid: 'Adjon meg érvényes e-mail-címet.',
    fieldMinLength: 'Legalább {{count}} karakter szükséges.',
    fieldPasswordMismatch: 'A jelszavak nem egyeznek.',
    fieldSelectRequired: 'Válassza ki: {{field}}.',
    fieldCodeInvalid: 'Adja meg a 6 számjegyű ellenőrző kódot.',
  },
  ro: {
    fieldRequired: 'Introduceți {{field}}.',
    fieldRequiredGeneric: 'Acest câmp este obligatoriu.',
    fieldEmailInvalid: 'Introduceți o adresă de e-mail validă.',
    fieldMinLength: 'Trebuie să aibă cel puțin {{count}} caractere.',
    fieldPasswordMismatch: 'Parolele nu se potrivesc.',
    fieldSelectRequired: 'Selectați {{field}}.',
    fieldCodeInvalid: 'Introduceți codul de verificare din 6 cifre.',
  },
  uk: {
    fieldRequired: 'Введіть {{field}}.',
    fieldRequiredGeneric: 'Це поле обовʼязкове.',
    fieldEmailInvalid: 'Введіть дійсну адресу електронної пошти.',
    fieldMinLength: 'Мінімум {{count}} символів.',
    fieldPasswordMismatch: 'Паролі не збігаються.',
    fieldSelectRequired: 'Виберіть {{field}}.',
    fieldCodeInvalid: 'Введіть 6-значний код підтвердження.',
  },
  vi: {
    fieldRequired: 'Vui lòng nhập {{field}}.',
    fieldRequiredGeneric: 'Trường này là bắt buộc.',
    fieldEmailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ.',
    fieldMinLength: 'Phải có ít nhất {{count}} ký tự.',
    fieldPasswordMismatch: 'Mật khẩu không khớp.',
    fieldSelectRequired: 'Vui lòng chọn {{field}}.',
    fieldCodeInvalid: 'Vui lòng nhập mã xác minh 6 chữ số.',
  },
  th: {
    fieldRequired: 'กรุณากรอก {{field}}',
    fieldRequiredGeneric: 'ช่องนี้จำเป็นต้องกรอก',
    fieldEmailInvalid: 'กรุณากรอกที่อยู่อีเมลที่ถูกต้อง',
    fieldMinLength: 'ต้องมีอย่างน้อย {{count}} ตัวอักษร',
    fieldPasswordMismatch: 'รหัสผ่านไม่ตรงกัน',
    fieldSelectRequired: 'กรุณาเลือก {{field}}',
    fieldCodeInvalid: 'กรุณากรอกรหัสยืนยัน 6 หลัก',
  },
  id: {
    fieldRequired: 'Masukkan {{field}}.',
    fieldRequiredGeneric: 'Bidang ini wajib diisi.',
    fieldEmailInvalid: 'Masukkan alamat email yang valid.',
    fieldMinLength: 'Minimal {{count}} karakter.',
    fieldPasswordMismatch: 'Kata sandi tidak cocok.',
    fieldSelectRequired: 'Pilih {{field}}.',
    fieldCodeInvalid: 'Masukkan kode verifikasi 6 digit.',
  },
  hi: {
    fieldRequired: 'कृपया {{field}} दर्ज करें।',
    fieldRequiredGeneric: 'यह फ़ील्ड आवश्यक है।',
    fieldEmailInvalid: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
    fieldMinLength: 'कम से कम {{count}} अक्षर होने चाहिए।',
    fieldPasswordMismatch: 'पासवर्ड मेल नहीं खाते।',
    fieldSelectRequired: 'कृपया {{field}} चुनें।',
    fieldCodeInvalid: 'कृपया 6 अंकों का सत्यापन कोड दर्ज करें।',
  },
  el: {
    fieldRequired: 'Εισαγάγετε {{field}}.',
    fieldRequiredGeneric: 'Αυτό το πεδίο είναι υποχρεωτικό.',
    fieldEmailInvalid: 'Εισαγάγετε έγκυρη διεύθυνση email.',
    fieldMinLength: 'Πρέπει να έχει τουλάχιστον {{count}} χαρακτήρες.',
    fieldPasswordMismatch: 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.',
    fieldSelectRequired: 'Επιλέξτε {{field}}.',
    fieldCodeInvalid: 'Εισαγάγετε τον 6ψήφιο κωδικό επαλήθευσης.',
  },
  he: {
    fieldRequired: 'נא להזין {{field}}.',
    fieldRequiredGeneric: 'שדה זה נדרש.',
    fieldEmailInvalid: 'נא להזין כתובת דוא"ל תקינה.',
    fieldMinLength: 'נדרשים לפחות {{count}} תווים.',
    fieldPasswordMismatch: 'הסיסמאות אינן תואמות.',
    fieldSelectRequired: 'נא לבחור {{field}}.',
    fieldCodeInvalid: 'נא להזין את קוד האימות בן 6 הספרות.',
  },
};

function protectPlaceholders(text) {
  return text
    .replace(/\{\{field\}\}/g, '<<<FIELD>>>')
    .replace(/\{\{count\}\}/g, '<<<COUNT>>>');
}

function restorePlaceholders(text) {
  return text
    .replace(/<<<FIELD>>>/g, '{{field}}')
    .replace(/<<<COUNT>>>/g, '{{count}}')
    .replace(/\{\{\s*field\s*\}\}/gi, '{{field}}')
    .replace(/\{\{\s*count\s*\}\}/gi, '{{count}}');
}

async function translatePhrase(text, targetLang, attempt = 1) {
  const protectedText = protectPlaceholders(text);
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', protectedText.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const translated = data?.responseData?.translatedText?.trim();
    if (!translated || translated === protectedText) return null;
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    return restorePlaceholders(translated);
  } catch {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1200 * attempt));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return null;
  }
}

function loadCache() {
  if (!existsSync(cachePath)) return {};
  return JSON.parse(readFileSync(cachePath, 'utf8'));
}

function saveCache(cache) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

async function resolveValidationStrings(langCode, cache) {
  const parent = VARIANT_PARENT[langCode];
  if (MANUAL[langCode]) return MANUAL[langCode];
  if (parent && MANUAL[parent]) return MANUAL[parent];
  if (cache[langCode]) return cache[langCode];

  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const resolved = {};
  for (const key of VALIDATION_KEYS) {
    const english = ENGLISH[key];
    const translated = await translatePhrase(english, targetLang);
    resolved[key] = translated ?? english;
    await new Promise((r) => setTimeout(r, 150));
  }

  cache[langCode] = resolved;
  saveCache(cache);
  return resolved;
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

const cache = loadCache();
const localeCodes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''));

for (const langCode of localeCodes) {
  const strings = await resolveValidationStrings(langCode, cache);
  const phraseEntries = Object.fromEntries(
    VALIDATION_KEYS.map((key) => [ENGLISH[key], strings[key]]),
  );

  if (hasPhraseMap(langCode)) {
    const mapPath = join(phraseMapsDir, `${langCode}.json`);
    const map = JSON.parse(readFileSync(mapPath, 'utf8'));
    Object.assign(map, phraseEntries);
    writeFileSync(mapPath, JSON.stringify(map, null, 2));

    const overridePath = join(overridesDir, `${langCode}.json`);
    const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
    const mergedMap = mergePhraseMaps(map, overrides);
    const locale = await loadLocale(langCode);
    writeLocaleFile(langCode, {
      ...applyPhraseMapToValues(en, mergedMap),
      affiliate: locale.affiliate,
    });
    console.log(`${langCode}: phrase map + locale rebuilt`);
    continue;
  }

  const locale = await loadLocale(langCode);
  writeLocaleFile(langCode, {
    ...locale,
    common: {
      ...locale.common,
      ...strings,
    },
  });
  console.log(`${langCode}: common.* validation keys patched`);
}

console.log('done');
