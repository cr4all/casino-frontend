import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');

const footerTranslations = {
  ar: {
    about: 'من نحن',
    contact: 'اتصل بنا',
    aml: 'سياسة AML',
    faq: 'الأسئلة الشائعة',
  },
  cs: {
    about: 'O nás',
    contact: 'Kontakt',
    aml: 'AML politika',
    faq: 'Často kladené dotazy',
  },
  da: {
    about: 'Om os',
    contact: 'Kontakt os',
    aml: 'AML-politik',
    faq: 'FAQ',
  },
  de: {
    about: 'Über uns',
    contact: 'Kontakt',
    aml: 'AML-Richtlinie',
    faq: 'FAQ',
  },
  el: {
    about: 'Σχετικά με εμάς',
    contact: 'Επικοινωνία',
    aml: 'Πολιτική AML',
    faq: 'FAQ',
  },
  es: {
    about: 'Sobre nosotros',
    contact: 'Contáctanos',
    aml: 'Política AML',
    faq: 'FAQ',
  },
  et: {
    about: 'Meist',
    contact: 'Kontakt',
    aml: 'AML poliitika',
    faq: 'KKK',
  },
  fi: {
    about: 'Tietoa meistä',
    contact: 'Ota yhteyttä',
    aml: 'AML-käytäntö',
    faq: 'UKK',
  },
  fil: {
    about: 'Tungkol sa amin',
    contact: 'Makipag-ugnayan',
    aml: 'Patakaran sa AML',
    faq: 'FAQ',
  },
  fr: {
    about: 'À propos de nous',
    contact: 'Contactez-nous',
    aml: 'Politique AML',
    faq: 'FAQ',
  },
  hi: {
    about: 'हमारे बारे में',
    contact: 'संपर्क करें',
    aml: 'AML नीति',
    faq: 'FAQ',
  },
  hr: {
    about: 'O nama',
    contact: 'Kontaktirajte nas',
    aml: 'AML politika',
    faq: 'FAQ',
  },
  hu: {
    about: 'Rólunk',
    contact: 'Kapcsolat',
    aml: 'AML szabályzat',
    faq: 'GYIK',
  },
  id: {
    about: 'Tentang kami',
    contact: 'Hubungi kami',
    aml: 'Kebijakan AML',
    faq: 'FAQ',
  },
  it: {
    about: 'Chi siamo',
    contact: 'Contattaci',
    aml: 'Politica AML',
    faq: 'FAQ',
  },
  ja: {
    about: '会社概要',
    contact: 'お問い合わせ',
    aml: 'AMLポリシー',
    faq: 'よくある質問',
  },
  lv: {
    about: 'Par mums',
    contact: 'Sazinieties ar mums',
    aml: 'AML politika',
    faq: 'BUJ',
  },
  mk: {
    about: 'За нас',
    contact: 'Контакт',
    aml: 'AML политика',
    faq: 'FAQ',
  },
  no: {
    about: 'Om oss',
    contact: 'Kontakt oss',
    aml: 'AML-policy',
    faq: 'FAQ',
  },
  pl: {
    about: 'O nas',
    contact: 'Kontakt',
    aml: 'Polityka AML',
    faq: 'FAQ',
  },
  pt: {
    about: 'Sobre nós',
    contact: 'Contacte-nos',
    aml: 'Política AML',
    faq: 'FAQ',
  },
  'pt-br': {
    about: 'Sobre nós',
    contact: 'Fale conosco',
    aml: 'Política AML',
    faq: 'FAQ',
  },
  ru: {
    about: 'О нас',
    contact: 'Связаться с нами',
    aml: 'Политика AML',
    faq: 'FAQ',
  },
  sk: {
    about: 'O nás',
    contact: 'Kontakt',
    aml: 'AML politika',
    faq: 'Často kladené otázky',
  },
  sl: {
    about: 'O nas',
    contact: 'Kontaktirajte nas',
    aml: 'AML politika',
    faq: 'FAQ',
  },
  sq: {
    about: 'Rreth nesh',
    contact: 'Na kontaktoni',
    aml: 'Politika AML',
    faq: 'FAQ',
  },
  sr: {
    about: 'O nama',
    contact: 'Kontaktirajte nas',
    aml: 'AML politika',
    faq: 'FAQ',
  },
  tr: {
    about: 'Hakkımızda',
    contact: 'Bize ulaşın',
    aml: 'AML Politikası',
    faq: 'SSS',
  },
  ur: {
    about: 'ہمارے بارے میں',
    contact: 'ہم سے رابطہ کریں',
    aml: 'AML پالیسی',
    faq: 'FAQ',
  },
  zh: {
    about: '关于我们',
    contact: '联系我们',
    aml: 'AML 政策',
    faq: '常见问题',
  },
};

const liveBetFeedTranslations = {
  ar: {
    title: 'الرهانات المباشرة',
    game: 'اللعبة',
    user: 'المستخدم',
    time: 'الوقت',
    betAmount: 'مبلغ الرهان',
    multiplier: 'المضاعف',
    payout: 'العائد',
    hidden: 'مخفي',
  },
  cs: {
    title: 'Živé sázky',
    game: 'Hra',
    user: 'Uživatel',
    time: 'Čas',
    betAmount: 'Výše sázky',
    multiplier: 'Násobitel',
    payout: 'Výplata',
    hidden: 'Skrytý',
  },
  da: {
    title: 'Live bets',
    game: 'Spil',
    user: 'Bruger',
    time: 'Tid',
    betAmount: 'Indsats',
    multiplier: 'Multiplikator',
    payout: 'Udbetaling',
    hidden: 'Skjult',
  },
  de: {
    title: 'Live-Wetten',
    game: 'Spiel',
    user: 'Benutzer',
    time: 'Zeit',
    betAmount: 'Wetteinsatz',
    multiplier: 'Multiplikator',
    payout: 'Auszahlung',
    hidden: 'Verborgen',
  },
  el: {
    title: 'Ζωντανά στοιχήματα',
    game: 'Παιχνίδι',
    user: 'Χρήστης',
    time: 'Ώρα',
    betAmount: 'Ποσό στοιχήματος',
    multiplier: 'Πολλαπλασιαστής',
    payout: 'Πληρωμή',
    hidden: 'Κρυφό',
  },
  es: {
    title: 'Apuestas en vivo',
    game: 'Juego',
    user: 'Usuario',
    time: 'Hora',
    betAmount: 'Importe de apuesta',
    multiplier: 'Multiplicador',
    payout: 'Pago',
    hidden: 'Oculto',
  },
  et: {
    title: 'Reaalajas panused',
    game: 'Mäng',
    user: 'Kasutaja',
    time: 'Aeg',
    betAmount: 'Panuse summa',
    multiplier: 'Kordaja',
    payout: 'Väljamakse',
    hidden: 'Peidetud',
  },
  fi: {
    title: 'Live-vedot',
    game: 'Peli',
    user: 'Käyttäjä',
    time: 'Aika',
    betAmount: 'Panossumma',
    multiplier: 'Kerroin',
    payout: 'Voitto',
    hidden: 'Piilotettu',
  },
  fil: {
    title: 'Live na taya',
    game: 'Laro',
    user: 'User',
    time: 'Oras',
    betAmount: 'Halaga ng taya',
    multiplier: 'Multiplier',
    payout: 'Payout',
    hidden: 'Nakatago',
  },
  fr: {
    title: 'Paris en direct',
    game: 'Jeu',
    user: 'Utilisateur',
    time: 'Heure',
    betAmount: 'Montant du pari',
    multiplier: 'Multiplicateur',
    payout: 'Gain',
    hidden: 'Masqué',
  },
  hi: {
    title: 'लाइव बेट्स',
    game: 'गेम',
    user: 'उपयोगकर्ता',
    time: 'समय',
    betAmount: 'बेट राशि',
    multiplier: 'गुणक',
    payout: 'भुगतान',
    hidden: 'छिपा',
  },
  hr: {
    title: 'Uživo oklade',
    game: 'Igra',
    user: 'Korisnik',
    time: 'Vrijeme',
    betAmount: 'Iznos oklade',
    multiplier: 'Množitelj',
    payout: 'Isplata',
    hidden: 'Skriveno',
  },
  hu: {
    title: 'Élő fogadások',
    game: 'Játék',
    user: 'Felhasználó',
    time: 'Idő',
    betAmount: 'Tét összege',
    multiplier: 'Szorzó',
    payout: 'Kifizetés',
    hidden: 'Rejtett',
  },
  id: {
    title: 'Taruhan langsung',
    game: 'Permainan',
    user: 'Pengguna',
    time: 'Waktu',
    betAmount: 'Jumlah taruhan',
    multiplier: 'Pengganda',
    payout: 'Pembayaran',
    hidden: 'Tersembunyi',
  },
  it: {
    title: 'Scommesse live',
    game: 'Gioco',
    user: 'Utente',
    time: 'Ora',
    betAmount: 'Importo scommessa',
    multiplier: 'Moltiplicatore',
    payout: 'Vincita',
    hidden: 'Nascosto',
  },
  ja: {
    title: 'ライブベット',
    game: 'ゲーム',
    user: 'ユーザー',
    time: '時間',
    betAmount: 'ベット額',
    multiplier: '倍率',
    payout: '払戻金',
    hidden: '非表示',
  },
  lv: {
    title: 'Tiešraides likmes',
    game: 'Spēle',
    user: 'Lietotājs',
    time: 'Laiks',
    betAmount: 'Likmes summa',
    multiplier: 'Reizinātājs',
    payout: 'Izmaksa',
    hidden: 'Paslēpts',
  },
  mk: {
    title: 'Живи обложувања',
    game: 'Игра',
    user: 'Корисник',
    time: 'Време',
    betAmount: 'Износ на обложување',
    multiplier: 'Множител',
    payout: 'Исплата',
    hidden: 'Скриено',
  },
  no: {
    title: 'Live bets',
    game: 'Spill',
    user: 'Bruker',
    time: 'Tid',
    betAmount: 'Innsats',
    multiplier: 'Multiplikator',
    payout: 'Utbetaling',
    hidden: 'Skjult',
  },
  pl: {
    title: 'Zakłady na żywo',
    game: 'Gra',
    user: 'Użytkownik',
    time: 'Czas',
    betAmount: 'Kwota zakładu',
    multiplier: 'Mnożnik',
    payout: 'Wypłata',
    hidden: 'Ukryty',
  },
  pt: {
    title: 'Apostas ao vivo',
    game: 'Jogo',
    user: 'Utilizador',
    time: 'Hora',
    betAmount: 'Valor da aposta',
    multiplier: 'Multiplicador',
    payout: 'Pagamento',
    hidden: 'Oculto',
  },
  'pt-br': {
    title: 'Apostas ao vivo',
    game: 'Jogo',
    user: 'Usuário',
    time: 'Hora',
    betAmount: 'Valor da aposta',
    multiplier: 'Multiplicador',
    payout: 'Pagamento',
    hidden: 'Oculto',
  },
  ru: {
    title: 'Лайв-ставки',
    game: 'Игра',
    user: 'Пользователь',
    time: 'Время',
    betAmount: 'Сумма ставки',
    multiplier: 'Множитель',
    payout: 'Выплата',
    hidden: 'Скрыт',
  },
  sk: {
    title: 'Živé stávky',
    game: 'Hra',
    user: 'Používateľ',
    time: 'Čas',
    betAmount: 'Výška stávky',
    multiplier: 'Násobiteľ',
    payout: 'Výplata',
    hidden: 'Skrytý',
  },
  sl: {
    title: 'Stave v živo',
    game: 'Igra',
    user: 'Uporabnik',
    time: 'Čas',
    betAmount: 'Znesek stave',
    multiplier: 'Množitelj',
    payout: 'Izplačilo',
    hidden: 'Skrito',
  },
  sq: {
    title: 'Bastet live',
    game: 'Lojë',
    user: 'Përdoruesi',
    time: 'Koha',
    betAmount: 'Shuma e bastit',
    multiplier: 'Shumëzuesi',
    payout: 'Pagesa',
    hidden: 'I fshehur',
  },
  sr: {
    title: 'Uživo oklade',
    game: 'Igra',
    user: 'Korisnik',
    time: 'Vreme',
    betAmount: 'Iznos oklade',
    multiplier: 'Množitelj',
    payout: 'Isplata',
    hidden: 'Skriveno',
  },
  tr: {
    title: 'Canlı bahisler',
    game: 'Oyun',
    user: 'Kullanıcı',
    time: 'Zaman',
    betAmount: 'Bahis tutarı',
    multiplier: 'Çarpan',
    payout: 'Ödeme',
    hidden: 'Gizli',
  },
  ur: {
    title: 'لائیو بیٹس',
    game: 'گیم',
    user: 'صارف',
    time: 'وقت',
    betAmount: 'بیٹ کی رقم',
    multiplier: 'ضرب',
    payout: 'ادائیگی',
    hidden: 'پوشیدہ',
  },
  zh: {
    title: '实时投注',
    game: '游戏',
    user: '用户',
    time: '时间',
    betAmount: '投注金额',
    multiplier: '倍数',
    payout: '派彩',
    hidden: '隐藏',
  },
};

function patchLocaleFile(lang, filePath) {
  let content = readFileSync(filePath, 'utf8');
  const footer = footerTranslations[lang];
  const liveBet = liveBetFeedTranslations[lang];

  if (footer) {
    content = content.replace(/about: 'About Us',/g, `about: '${footer.about}',`);
    content = content.replace(/contact: 'Contact Us',/g, `contact: '${footer.contact}',`);
    content = content.replace(/aml: 'AML Policy',/g, `aml: '${footer.aml}',`);
    if (footer.faq !== 'FAQ') {
      content = content.replace(/faq: 'FAQ',/g, `faq: '${footer.faq}',`);
    }
  }

  content = content.replace(
    /legal:\s*\{\s*backHome:\s*'[^']*',/,
    (match) => {
      const cookiesMatch = content.match(
        /cookies:\s*\{[\s\S]*?backHome:\s*'((?:\\'|[^'])*)'/,
      );
      const backHome = cookiesMatch?.[1] ?? '← Back to home';
      return `legal: {\n    backHome: '${backHome}',`;
    },
  );

  if (liveBet) {
    for (const [key, value] of Object.entries(liveBet)) {
      const re = new RegExp(`(${key}: )'[^']*'(,)`, 'g');
      const blockMatch = content.match(/liveBetFeed:\s*\{[\s\S]*?\n  \},/);
      if (blockMatch) {
        const block = blockMatch[0];
        const updated = block.replace(re, `$1'${value.replace(/'/g, "\\'")}'$2`);
        content = content.replace(block, updated);
      }
    }
  }

  writeFileSync(filePath, content);
  console.log(`patched ${lang}`);
}

for (const lang of Object.keys(footerTranslations)) {
  const filePath = join(localesDir, `${lang}.ts`);
  patchLocaleFile(lang, filePath);
}
