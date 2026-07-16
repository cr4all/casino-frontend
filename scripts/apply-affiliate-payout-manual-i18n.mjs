/**
 * Apply existing phraseMaps to affiliate payout keys in locale files (no MT).
 * Also applies MANUAL translations for priority languages.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const PAYOUT_KEYS = Object.keys(en.affiliate).filter((key) => {
  const markers = [
    'availablePayout', 'accruingCommission', 'payouts', 'payoutDetails', 'payoutHistory',
    'accountWalletId', 'note', 'payoutMethod', 'requestPayout', 'payoutRequested',
    'payoutRequestFailed', 'payoutDetailsSaved', 'payoutDetailsSaveFailed', 'savePayoutDetails',
    'minPayout', 'periodEnd', 'noPayouts', 'cannotRequestReason', 'methodBank', 'methodCrypto',
    'methodEwallet', 'methodOther', 'accountName', 'bankName', 'accountNumber', 'swiftBic',
    'iban', 'country', 'walletAddress', 'network', 'cryptoCurrency', 'ewalletProvider',
    'ewalletAccountId', 'payoutInstructions', 'notes', 'rejectionReason',
  ];
  return markers.some((m) => key === m || key.startsWith(m));
});

const EXPORT_NAMES = {
  'ar-ma': 'arMa', 'ar-dz': 'arDz', 'ar-tn': 'arTn', 'de-be': 'deBe', 'fr-be': 'frBe',
  'nl-be': 'nlBe', 'pt-br': 'ptBr', 'zh-tw': 'zhTw',
};

const PARENT = {
  'ar-dz': 'ar', 'ar-ma': 'ar', 'ar-tn': 'ar', 'de-be': 'de', 'fr-be': 'fr',
  'nl-be': 'nl', 'pt-br': 'pt', 'zh-tw': 'zh',
};

/** Curated translations for priority + high-traffic locales */
const MANUAL = {
  it: {
    availablePayout: 'Disponibile per il prelievo',
    accruingCommission: 'In accumulo (mese corrente)',
    payouts: 'Pagamenti',
    payoutDetails: 'Dettagli di pagamento',
    payoutHistory: 'Cronologia pagamenti',
    accountWalletId: 'Conto / ID portafoglio',
    note: 'Nota',
    payoutMethod: 'Metodo di pagamento',
    requestPayout: 'Richiedi pagamento',
    payoutRequested: 'Richiesta di pagamento inviata.',
    payoutRequestFailed: 'Richiesta di pagamento non riuscita.',
    payoutDetailsSaved: 'Dettagli di pagamento salvati.',
    payoutDetailsSaveFailed: 'Salvataggio dei dettagli di pagamento non riuscito.',
    savePayoutDetails: 'Salva dettagli di pagamento',
    minPayout: 'Pagamento minimo',
    periodEnd: 'Disponibile fino a',
    noPayouts: 'Nessuna richiesta di pagamento ancora.',
    cannotRequestReasonDetails: 'Aggiungi i dettagli di pagamento prima di richiedere un pagamento.',
    cannotRequestReasonPending: 'Una richiesta di pagamento è già in sospeso.',
    cannotRequestReasonBalance: 'Nessuna commissione del mese chiuso ancora disponibile.',
    cannotRequestReasonMinimum: 'La commissione disponibile è inferiore all\'importo minimo di pagamento.',
    methodBank: 'Bonifico bancario',
    methodCrypto: 'Crypto',
    methodEwallet: 'E-wallet',
    methodOther: 'Altro',
    accountName: 'Intestatario',
    bankName: 'Nome banca',
    accountNumber: 'Numero di conto',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Paese',
    walletAddress: 'Indirizzo wallet',
    network: 'Rete',
    cryptoCurrency: 'Valuta',
    ewalletProvider: 'Provider',
    ewalletAccountId: 'ID account',
    payoutInstructions: 'Istruzioni di pagamento',
    notes: 'Note',
    rejectionReason: 'Motivo del rifiuto',
  },
  pt: {
    availablePayout: 'Disponível para levantamento',
    accruingCommission: 'A acumular (mês atual)',
    payouts: 'Pagamentos',
    payoutDetails: 'Detalhes do pagamento',
    payoutHistory: 'Histórico de pagamentos',
    accountWalletId: 'Conta / ID da carteira',
    note: 'Nota',
    payoutMethod: 'Método de pagamento',
    requestPayout: 'Solicitar pagamento',
    payoutRequested: 'Pedido de pagamento enviado.',
    payoutRequestFailed: 'Falha ao solicitar pagamento.',
    payoutDetailsSaved: 'Detalhes do pagamento guardados.',
    payoutDetailsSaveFailed: 'Falha ao guardar detalhes do pagamento.',
    savePayoutDetails: 'Guardar detalhes do pagamento',
    minPayout: 'Pagamento mínimo',
    periodEnd: 'Disponível até',
    noPayouts: 'Ainda sem pedidos de pagamento.',
    cannotRequestReasonDetails: 'Adicione os detalhes de pagamento antes de solicitar um pagamento.',
    cannotRequestReasonPending: 'Já existe um pedido de pagamento pendente.',
    cannotRequestReasonBalance: 'Ainda sem comissão de mês fechado disponível.',
    cannotRequestReasonMinimum: 'A comissão disponível está abaixo do valor mínimo de pagamento.',
    methodBank: 'Transferência bancária',
    methodCrypto: 'Crypto',
    methodEwallet: 'Carteira eletrónica',
    methodOther: 'Outro',
    accountName: 'Nome da conta',
    bankName: 'Nome do banco',
    accountNumber: 'Número da conta',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'País',
    walletAddress: 'Endereço da carteira',
    network: 'Rede',
    cryptoCurrency: 'Moeda',
    ewalletProvider: 'Fornecedor',
    ewalletAccountId: 'ID da conta',
    payoutInstructions: 'Instruções de pagamento',
    notes: 'Notas',
    rejectionReason: 'Motivo da rejeição',
  },
  tr: {
    availablePayout: 'Çekilebilir tutar',
    accruingCommission: 'Biriken (bu ay)',
    payouts: 'Ödemeler',
    payoutDetails: 'Ödeme bilgileri',
    payoutHistory: 'Ödeme geçmişi',
    accountWalletId: 'Hesap / Cüzdan ID',
    note: 'Not',
    payoutMethod: 'Ödeme yöntemi',
    requestPayout: 'Ödeme talep et',
    payoutRequested: 'Ödeme talebi gönderildi.',
    payoutRequestFailed: 'Ödeme talebi başarısız.',
    payoutDetailsSaved: 'Ödeme bilgileri kaydedildi.',
    payoutDetailsSaveFailed: 'Ödeme bilgileri kaydedilemedi.',
    savePayoutDetails: 'Ödeme bilgilerini kaydet',
    minPayout: 'Minimum ödeme',
    periodEnd: 'Şu tarihe kadar kullanılabilir',
    noPayouts: 'Henüz ödeme talebi yok.',
    cannotRequestReasonDetails: 'Ödeme talep etmeden önce ödeme bilgilerini ekleyin.',
    cannotRequestReasonPending: 'Zaten bekleyen bir ödeme talebi var.',
    cannotRequestReasonBalance: 'Henüz çekilebilir kapanmış ay komisyonu yok.',
    cannotRequestReasonMinimum: 'Kullanılabilir komisyon minimum ödeme tutarının altında.',
    methodBank: 'Banka transferi',
    methodCrypto: 'Kripto',
    methodEwallet: 'E-cüzdan',
    methodOther: 'Diğer',
    accountName: 'Hesap adı',
    bankName: 'Banka adı',
    accountNumber: 'Hesap numarası',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Ülke',
    walletAddress: 'Cüzdan adresi',
    network: 'Ağ',
    cryptoCurrency: 'Para birimi',
    ewalletProvider: 'Sağlayıcı',
    ewalletAccountId: 'Hesap ID',
    payoutInstructions: 'Ödeme talimatları',
    notes: 'Notlar',
    rejectionReason: 'Red nedeni',
  },
  sq: {
    availablePayout: 'E disponueshme për tërheqje',
    accruingCommission: 'Në akumulim (muaji aktual)',
    payouts: 'Pagesat',
    payoutDetails: 'Detajet e pagesës',
    payoutHistory: 'Historiku i pagesave',
    accountWalletId: 'Llogaria / ID e portofolit',
    note: 'Shënim',
    payoutMethod: 'Metoda e pagesës',
    requestPayout: 'Kërko pagesë',
    payoutRequested: 'Kërkesa për pagesë u dërgua.',
    payoutRequestFailed: 'Kërkesa për pagesë dështoi.',
    payoutDetailsSaved: 'Detajet e pagesës u ruajtën.',
    payoutDetailsSaveFailed: 'Ruajtja e detajeve të pagesës dështoi.',
    savePayoutDetails: 'Ruaj detajet e pagesës',
    minPayout: 'Pagesa minimale',
    periodEnd: 'E disponueshme deri',
    noPayouts: 'Ende nuk ka kërkesa pagese.',
    cannotRequestReasonDetails: 'Shtoni detajet e pagesës para se të kërkoni pagesë.',
    cannotRequestReasonPending: 'Një kërkesë pagese është tashmë në pritje.',
    cannotRequestReasonBalance: 'Ende nuk ka komision të muajit të mbyllur të disponueshëm.',
    cannotRequestReasonMinimum: 'Komisioni i disponueshëm është nën shumën minimale të pagesës.',
    methodBank: 'Transfer bankar',
    methodCrypto: 'Kripto',
    methodEwallet: 'E-portofol',
    methodOther: 'Tjetër',
    accountName: 'Emri i llogarisë',
    bankName: 'Emri i bankës',
    accountNumber: 'Numri i llogarisë',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Shteti',
    walletAddress: 'Adresa e portofolit',
    network: 'Rrjeti',
    cryptoCurrency: 'Valuta',
    ewalletProvider: 'Ofruesi',
    ewalletAccountId: 'ID e llogarisë',
    payoutInstructions: 'Udhëzimet e pagesës',
    notes: 'Shënime',
    rejectionReason: 'Arsyeja e refuzimit',
  },
  ja: {
    availablePayout: '出金可能額',
    accruingCommission: '積立中（今月）',
    payouts: '支払い',
    payoutDetails: '支払い情報',
    payoutHistory: '支払い履歴',
    accountWalletId: '口座 / ウォレットID',
    note: 'メモ',
    payoutMethod: '支払い方法',
    requestPayout: '支払いを申請',
    payoutRequested: '支払い申請を送信しました。',
    payoutRequestFailed: '支払い申請に失敗しました。',
    payoutDetailsSaved: '支払い情報を保存しました。',
    payoutDetailsSaveFailed: '支払い情報の保存に失敗しました。',
    savePayoutDetails: '支払い情報を保存',
    minPayout: '最低支払額',
    periodEnd: '利用可能期間',
    noPayouts: 'まだ支払い申請はありません。',
    cannotRequestReasonDetails: '支払いを申請する前に支払い情報を登録してください。',
    cannotRequestReasonPending: '既に保留中の支払い申請があります。',
    cannotRequestReasonBalance: 'まだ出金可能な締め月のコミッションがありません。',
    cannotRequestReasonMinimum: '出金可能コミッションが最低支払額を下回っています。',
    methodBank: '銀行振込',
    methodCrypto: '暗号資産',
    methodEwallet: '電子ウォレット',
    methodOther: 'その他',
    accountName: '口座名義',
    bankName: '銀行名',
    accountNumber: '口座番号',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: '国',
    walletAddress: 'ウォレットアドレス',
    network: 'ネットワーク',
    cryptoCurrency: '通貨',
    ewalletProvider: 'プロバイダー',
    ewalletAccountId: 'アカウントID',
    payoutInstructions: '支払い手順',
    notes: 'メモ',
    rejectionReason: '却下理由',
  },
  zh: {
    availablePayout: '可提现金额',
    accruingCommission: '累计中（本月）',
    payouts: '付款',
    payoutDetails: '付款详情',
    payoutHistory: '付款记录',
    accountWalletId: '账户 / 钱包 ID',
    note: '备注',
    payoutMethod: '付款方式',
    requestPayout: '申请付款',
    payoutRequested: '付款申请已提交。',
    payoutRequestFailed: '付款申请失败。',
    payoutDetailsSaved: '付款详情已保存。',
    payoutDetailsSaveFailed: '保存付款详情失败。',
    savePayoutDetails: '保存付款详情',
    minPayout: '最低付款金额',
    periodEnd: '可用至',
    noPayouts: '暂无付款申请。',
    cannotRequestReasonDetails: '申请付款前请先填写付款详情。',
    cannotRequestReasonPending: '已有待处理的付款申请。',
    cannotRequestReasonBalance: '暂无已结算月份的可提现佣金。',
    cannotRequestReasonMinimum: '可提现佣金低于最低付款金额。',
    methodBank: '银行转账',
    methodCrypto: '加密货币',
    methodEwallet: '电子钱包',
    methodOther: '其他',
    accountName: '账户名',
    bankName: '银行名称',
    accountNumber: '账号',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: '国家',
    walletAddress: '钱包地址',
    network: '网络',
    cryptoCurrency: '币种',
    ewalletProvider: '服务商',
    ewalletAccountId: '账户 ID',
    payoutInstructions: '付款说明',
    notes: '备注',
    rejectionReason: '拒绝原因',
  },
  ru: {
    availablePayout: 'Доступно к выводу',
    accruingCommission: 'Начисление (текущий месяц)',
    payouts: 'Выплаты',
    payoutDetails: 'Реквизиты выплаты',
    payoutHistory: 'История выплат',
    accountWalletId: 'Счёт / ID кошелька',
    note: 'Заметка',
    payoutMethod: 'Способ выплаты',
    requestPayout: 'Запросить выплату',
    payoutRequested: 'Запрос на выплату отправлен.',
    payoutRequestFailed: 'Не удалось запросить выплату.',
    payoutDetailsSaved: 'Реквизиты выплаты сохранены.',
    payoutDetailsSaveFailed: 'Не удалось сохранить реквизиты выплаты.',
    savePayoutDetails: 'Сохранить реквизиты',
    minPayout: 'Минимальная выплата',
    periodEnd: 'Доступно до',
    noPayouts: 'Запросов на выплату пока нет.',
    cannotRequestReasonDetails: 'Добавьте реквизиты выплаты перед запросом.',
    cannotRequestReasonPending: 'Запрос на выплату уже ожидает обработки.',
    cannotRequestReasonBalance: 'Пока нет доступной комиссии за закрытый месяц.',
    cannotRequestReasonMinimum: 'Доступная комиссия ниже минимальной суммы выплаты.',
    methodBank: 'Банковский перевод',
    methodCrypto: 'Крипто',
    methodEwallet: 'Электронный кошелёк',
    methodOther: 'Другое',
    accountName: 'Имя владельца счёта',
    bankName: 'Название банка',
    accountNumber: 'Номер счёта',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Страна',
    walletAddress: 'Адрес кошелька',
    network: 'Сеть',
    cryptoCurrency: 'Валюта',
    ewalletProvider: 'Провайдер',
    ewalletAccountId: 'ID аккаунта',
    payoutInstructions: 'Инструкции по оплате',
    notes: 'Заметки',
    rejectionReason: 'Причина отклонения',
  },
  nl: {
    availablePayout: 'Beschikbaar om op te nemen',
    accruingCommission: 'Opbouwend (huidige maand)',
    payouts: 'Uitbetalingen',
    payoutDetails: 'Uitbetalingsgegevens',
    payoutHistory: 'Uitbetalingsgeschiedenis',
    accountWalletId: 'Rekening / Wallet-ID',
    note: 'Notitie',
    payoutMethod: 'Uitbetalingsmethode',
    requestPayout: 'Uitbetaling aanvragen',
    payoutRequested: 'Uitbetalingsverzoek ingediend.',
    payoutRequestFailed: 'Uitbetalingsverzoek mislukt.',
    payoutDetailsSaved: 'Uitbetalingsgegevens opgeslagen.',
    payoutDetailsSaveFailed: 'Opslaan van uitbetalingsgegevens mislukt.',
    savePayoutDetails: 'Uitbetalingsgegevens opslaan',
    minPayout: 'Minimumuitbetaling',
    periodEnd: 'Beschikbaar tot',
    noPayouts: 'Nog geen uitbetalingsverzoeken.',
    cannotRequestReasonDetails: 'Voeg uitbetalingsgegevens toe voordat u een uitbetaling aanvraagt.',
    cannotRequestReasonPending: 'Er staat al een uitbetalingsverzoek open.',
    cannotRequestReasonBalance: 'Nog geen commissie van een afgesloten maand beschikbaar.',
    cannotRequestReasonMinimum: 'Beschikbare commissie ligt onder het minimumbedrag.',
    methodBank: 'Bankoverschrijving',
    methodCrypto: 'Crypto',
    methodEwallet: 'E-wallet',
    methodOther: 'Overig',
    accountName: 'Rekeningnaam',
    bankName: 'Banknaam',
    accountNumber: 'Rekeningnummer',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Land',
    walletAddress: 'Walletadres',
    network: 'Netwerk',
    cryptoCurrency: 'Valuta',
    ewalletProvider: 'Provider',
    ewalletAccountId: 'Account-ID',
    payoutInstructions: 'Betaalinstructies',
    notes: 'Notities',
    rejectionReason: 'Reden van afwijzing',
  },
  pl: {
    availablePayout: 'Dostępne do wypłaty',
    accruingCommission: 'Naliczane (bieżący miesiąc)',
    payouts: 'Wypłaty',
    payoutDetails: 'Dane wypłaty',
    payoutHistory: 'Historia wypłat',
    accountWalletId: 'Konto / ID portfela',
    note: 'Notatka',
    payoutMethod: 'Metoda wypłaty',
    requestPayout: 'Poproś o wypłatę',
    payoutRequested: 'Wniosek o wypłatę został wysłany.',
    payoutRequestFailed: 'Nie udało się złożyć wniosku o wypłatę.',
    payoutDetailsSaved: 'Dane wypłaty zostały zapisane.',
    payoutDetailsSaveFailed: 'Nie udało się zapisać danych wypłaty.',
    savePayoutDetails: 'Zapisz dane wypłaty',
    minPayout: 'Minimalna wypłata',
    periodEnd: 'Dostępne do',
    noPayouts: 'Brak wniosków o wypłatę.',
    cannotRequestReasonDetails: 'Dodaj dane wypłaty przed złożeniem wniosku.',
    cannotRequestReasonPending: 'Wniosek o wypłatę jest już oczekujący.',
    cannotRequestReasonBalance: 'Brak dostępnej prowizji z zamkniętego miesiąca.',
    cannotRequestReasonMinimum: 'Dostępna prowizja jest poniżej minimalnej kwoty wypłaty.',
    methodBank: 'Przelew bankowy',
    methodCrypto: 'Krypto',
    methodEwallet: 'E-portfel',
    methodOther: 'Inne',
    accountName: 'Nazwa konta',
    bankName: 'Nazwa banku',
    accountNumber: 'Numer konta',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Kraj',
    walletAddress: 'Adres portfela',
    network: 'Sieć',
    cryptoCurrency: 'Waluta',
    ewalletProvider: 'Dostawca',
    ewalletAccountId: 'ID konta',
    payoutInstructions: 'Instrukcje płatności',
    notes: 'Notatki',
    rejectionReason: 'Powód odrzucenia',
  },
  vi: {
    availablePayout: 'Có thể rút',
    accruingCommission: 'Đang tích lũy (tháng hiện tại)',
    payouts: 'Thanh toán',
    payoutDetails: 'Chi tiết thanh toán',
    payoutHistory: 'Lịch sử thanh toán',
    accountWalletId: 'Tài khoản / ID ví',
    note: 'Ghi chú',
    payoutMethod: 'Phương thức thanh toán',
    requestPayout: 'Yêu cầu thanh toán',
    payoutRequested: 'Đã gửi yêu cầu thanh toán.',
    payoutRequestFailed: 'Yêu cầu thanh toán thất bại.',
    payoutDetailsSaved: 'Đã lưu chi tiết thanh toán.',
    payoutDetailsSaveFailed: 'Lưu chi tiết thanh toán thất bại.',
    savePayoutDetails: 'Lưu chi tiết thanh toán',
    minPayout: 'Thanh toán tối thiểu',
    periodEnd: 'Có sẵn đến',
    noPayouts: 'Chưa có yêu cầu thanh toán.',
    cannotRequestReasonDetails: 'Thêm chi tiết thanh toán trước khi yêu cầu thanh toán.',
    cannotRequestReasonPending: 'Đã có yêu cầu thanh toán đang chờ.',
    cannotRequestReasonBalance: 'Chưa có hoa hồng tháng đã chốt để rút.',
    cannotRequestReasonMinimum: 'Hoa hồng khả dụng thấp hơn mức thanh toán tối thiểu.',
    methodBank: 'Chuyển khoản ngân hàng',
    methodCrypto: 'Crypto',
    methodEwallet: 'Ví điện tử',
    methodOther: 'Khác',
    accountName: 'Tên tài khoản',
    bankName: 'Tên ngân hàng',
    accountNumber: 'Số tài khoản',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Quốc gia',
    walletAddress: 'Địa chỉ ví',
    network: 'Mạng',
    cryptoCurrency: 'Tiền tệ',
    ewalletProvider: 'Nhà cung cấp',
    ewalletAccountId: 'ID tài khoản',
    payoutInstructions: 'Hướng dẫn thanh toán',
    notes: 'Ghi chú',
    rejectionReason: 'Lý do từ chối',
  },
  th: {
    availablePayout: 'ถอนได้',
    accruingCommission: 'กำลังสะสม (เดือนปัจจุบัน)',
    payouts: 'การจ่ายเงิน',
    payoutDetails: 'รายละเอียดการจ่ายเงิน',
    payoutHistory: 'ประวัติการจ่ายเงิน',
    accountWalletId: 'บัญชี / รหัสกระเป๋า',
    note: 'หมายเหตุ',
    payoutMethod: 'วิธีการจ่ายเงิน',
    requestPayout: 'ขอรับเงิน',
    payoutRequested: 'ส่งคำขอรับเงินแล้ว',
    payoutRequestFailed: 'ขอรับเงินไม่สำเร็จ',
    payoutDetailsSaved: 'บันทึกรายละเอียดการจ่ายเงินแล้ว',
    payoutDetailsSaveFailed: 'บันทึกรายละเอียดการจ่ายเงินไม่สำเร็จ',
    savePayoutDetails: 'บันทึกรายละเอียดการจ่ายเงิน',
    minPayout: 'ยอดจ่ายขั้นต่ำ',
    periodEnd: 'ใช้ได้ถึง',
    noPayouts: 'ยังไม่มีคำขอรับเงิน',
    cannotRequestReasonDetails: 'เพิ่มรายละเอียดการจ่ายเงินก่อนขอรับเงิน',
    cannotRequestReasonPending: 'มีคำขอรับเงินที่รอดำเนินการอยู่แล้ว',
    cannotRequestReasonBalance: 'ยังไม่มีคอมมิชชันเดือนที่ปิดแล้วให้ถอน',
    cannotRequestReasonMinimum: 'คอมมิชชันที่ใช้ได้อยู่ต่ำกว่ายอดจ่ายขั้นต่ำ',
    methodBank: 'โอนเงินผ่านธนาคาร',
    methodCrypto: 'คริปโต',
    methodEwallet: 'กระเป๋าเงินอิเล็กทรอนิกส์',
    methodOther: 'อื่นๆ',
    accountName: 'ชื่อบัญชี',
    bankName: 'ชื่อธนาคาร',
    accountNumber: 'เลขที่บัญชี',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'ประเทศ',
    walletAddress: 'ที่อยู่กระเป๋า',
    network: 'เครือข่าย',
    cryptoCurrency: 'สกุลเงิน',
    ewalletProvider: 'ผู้ให้บริการ',
    ewalletAccountId: 'รหัสบัญชี',
    payoutInstructions: 'คำแนะนำการชำระเงิน',
    notes: 'หมายเหตุ',
    rejectionReason: 'เหตุผลที่ปฏิเสธ',
  },
  id: {
    availablePayout: 'Tersedia untuk ditarik',
    accruingCommission: 'Sedang terkumpul (bulan ini)',
    payouts: 'Pembayaran',
    payoutDetails: 'Detail pembayaran',
    payoutHistory: 'Riwayat pembayaran',
    accountWalletId: 'Akun / ID dompet',
    note: 'Catatan',
    payoutMethod: 'Metode pembayaran',
    requestPayout: 'Ajukan pembayaran',
    payoutRequested: 'Permintaan pembayaran dikirim.',
    payoutRequestFailed: 'Gagal mengajukan pembayaran.',
    payoutDetailsSaved: 'Detail pembayaran disimpan.',
    payoutDetailsSaveFailed: 'Gagal menyimpan detail pembayaran.',
    savePayoutDetails: 'Simpan detail pembayaran',
    minPayout: 'Pembayaran minimum',
    periodEnd: 'Tersedia hingga',
    noPayouts: 'Belum ada permintaan pembayaran.',
    cannotRequestReasonDetails: 'Tambahkan detail pembayaran sebelum mengajukan pembayaran.',
    cannotRequestReasonPending: 'Sudah ada permintaan pembayaran yang tertunda.',
    cannotRequestReasonBalance: 'Belum ada komisi bulan tertutup yang tersedia.',
    cannotRequestReasonMinimum: 'Komisi tersedia di bawah jumlah pembayaran minimum.',
    methodBank: 'Transfer bank',
    methodCrypto: 'Kripto',
    methodEwallet: 'E-wallet',
    methodOther: 'Lainnya',
    accountName: 'Nama rekening',
    bankName: 'Nama bank',
    accountNumber: 'Nomor rekening',
    swiftBic: 'SWIFT/BIC',
    iban: 'IBAN',
    country: 'Negara',
    walletAddress: 'Alamat dompet',
    network: 'Jaringan',
    cryptoCurrency: 'Mata uang',
    ewalletProvider: 'Penyedia',
    ewalletAccountId: 'ID akun',
    payoutInstructions: 'Instruksi pembayaran',
    notes: 'Catatan',
    rejectionReason: 'Alasan penolakan',
  },
};

// pt-br shares pt manual
MANUAL['pt-br'] = MANUAL.pt;
MANUAL['zh-tw'] = {
  ...MANUAL.zh,
  availablePayout: '可提領金額',
  accruingCommission: '累計中（本月）',
  payouts: '付款',
  payoutDetails: '付款詳情',
  payoutHistory: '付款紀錄',
  requestPayout: '申請付款',
  payoutRequested: '付款申請已提交。',
  payoutRequestFailed: '付款申請失敗。',
  payoutDetailsSaved: '付款詳情已儲存。',
  payoutDetailsSaveFailed: '儲存付款詳情失敗。',
  savePayoutDetails: '儲存付款詳情',
  noPayouts: '尚無付款申請。',
  cannotRequestReasonDetails: '申請付款前請先填寫付款詳情。',
  cannotRequestReasonPending: '已有待處理的付款申請。',
  cannotRequestReasonBalance: '尚無已結算月份的可提領佣金。',
  cannotRequestReasonMinimum: '可提領佣金低於最低付款金額。',
  methodBank: '銀行轉帳',
  methodEwallet: '電子錢包',
  methodOther: '其他',
  accountName: '帳戶名',
  bankName: '銀行名稱',
  accountNumber: '帳號',
  country: '國家',
  walletAddress: '錢包地址',
  network: '網路',
  cryptoCurrency: '幣種',
  ewalletProvider: '服務商',
  ewalletAccountId: '帳戶 ID',
  payoutInstructions: '付款說明',
  notes: '備註',
  rejectionReason: '拒絕原因',
};
MANUAL['nl-be'] = MANUAL.nl;

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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
  return structuredClone(mod[exportName]);
}

function resolveValue(key, langCode, locale, parentLocale, merged) {
  const english = en.affiliate[key];
  const existing = locale.affiliate?.[key];
  if (existing && existing !== english) return existing;

  const manual = MANUAL[langCode]?.[key];
  if (manual) return manual;

  const parentVal = parentLocale?.affiliate?.[key];
  if (parentVal && parentVal !== english) return parentVal;

  if (merged[english] && merged[english] !== english) return merged[english];

  return existing ?? english;
}

async function syncLanguage(langCode, cache) {
  const locale = await loadLocale(langCode);
  const parentCode = PARENT[langCode];
  const parentLocale = parentCode
    ? (cache.get(parentCode) ?? await loadLocale(parentCode))
    : undefined;
  if (parentCode && parentLocale) cache.set(parentCode, parentLocale);

  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  const merged = mergePhraseMaps(map, overrides);

  if (!locale.affiliate) locale.affiliate = {};
  let updated = 0;
  let mapUpdated = false;

  for (const key of PAYOUT_KEYS) {
    const english = en.affiliate[key];
    const next = resolveValue(key, langCode, locale, parentLocale, merged);
    if (next !== locale.affiliate[key]) {
      locale.affiliate[key] = next;
      updated++;
    }
    if (next !== english && existsSync(mapPath) && map[english] !== next) {
      map[english] = next;
      mapUpdated = true;
    }
  }

  cache.set(langCode, locale);

  if (updated === 0) {
    console.log(`${langCode}: complete`);
    return false;
  }

  if (mapUpdated) writeFileSync(mapPath, JSON.stringify(map, null, 2));
  writeLocaleFile(langCode, locale);
  console.log(`${langCode}: updated ${updated} keys`);
  return true;
}

const langs = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''));

// Parents first so variants can inherit
const ordered = [...langs].sort((a, b) => {
  const ap = PARENT[a] ? 1 : 0;
  const bp = PARENT[b] ? 1 : 0;
  return ap - bp;
});

const cache = new Map();
let changed = 0;
for (const lang of ordered) {
  if (await syncLanguage(lang, cache)) changed++;
}
console.log(`done (${changed} locales updated)`);
