import type { GameVendor } from '@/api/game.api';

const LOGO_RULES: { test: (slug: string, name: string) => boolean; url: string }[] = [
  {
    test: (s, n) => s.includes('pragmaticlive') || n.includes('pragmaticlive'),
    url: '/providers/pragmatic-live.png',
  },
  { test: (s, n) => s.includes('pragmatic') || n.includes('pragmatic'), url: '/providers/pragmatic-play.png' },
  { test: (s, n) => s.includes('booongo') || n.includes('booongo'), url: '/providers/booongo.png' },
  {
    test: (s, n) =>
      s.includes('playngo') ||
      n.includes('playngo') ||
      s.includes('playgo') ||
      n.includes('playgo'),
    url: '/providers/playngo.png',
  },
  { test: (s, n) => s.includes('egt') || n.includes('egt'), url: '/providers/egt.png' },
  { test: (s, n) => s.includes('amusnet') || n.includes('amusnet'), url: '/providers/amusnet.png' },
  { test: (s, n) => s.includes('amatic') || n.includes('amatic'), url: '/providers/amatic.png' },
  { test: (s, n) => s.includes('novomatic') || n.includes('novomatic'), url: '/providers/novomatic.png' },
  { test: (s, n) => s.includes('ruby') || n.includes('ruby'), url: '/providers/ruby.png' },
  { test: (s, n) => s.includes('netent') || n.includes('netent'), url: '/providers/ruby.png' },
  {
    test: (s, n) =>
      s.includes('kagaming') || n.includes('kagaming') || s.includes('kagame') || n.includes('kagame'),
    url: '/providers/ka-game.png',
  },
  { test: (s, n) => s.includes('habanero') || n.includes('habanero'), url: '/providers/habanero.png' },
  { test: (s, n) => s.includes('evoplay') || n.includes('evoplay'), url: '/providers/evoplay.png' },
  { test: (s, n) => s.includes('hacksaw') || n.includes('hacksaw'), url: '/providers/hacksaw.png' },
  { test: (s, n) => s.includes('pgsoft') || n.includes('pgsoft'), url: '/providers/pgsoft.png' },
  { test: (s, n) => s.includes('cq9') || n.includes('cq9'), url: '/providers/cq9.png' },
  { test: (s, n) => s.includes('vagaming') || n.includes('vagaming') || n.includes('va gaming'), url: '/providers/vagaming.png' },
  { test: (s, n) => s.includes('jili') || n.includes('jili'), url: '/providers/jili.png' },
  {
    test: (s, n) => s.includes('jdbfish') || n.includes('jdbfish') || s === 'jdb-fishing' || n.includes('jdbfish'),
    url: '/providers/jdb-fishing.png',
  },
  { test: (s, n) => s.includes('jdb') || n.includes('jdb'), url: '/providers/jdb.png' },
  { test: (s, n) => s.includes('spribe') || n.includes('spribe'), url: '/providers/spribe.png' },
  { test: (s, n) => s.includes('aviator') || n.includes('aviator'), url: '/providers/aviator.png' },
  { test: (s, n) => s.includes('ezugi') || n.includes('ezugi'), url: '/providers/ezugi.png' },
  { test: (s, n) => s.includes('playson') || n.includes('playson'), url: '/providers/playson.png' },
  {
    test: (s, n) => s.includes('microgaminggrand') || n.includes('microgaminggrand'),
    url: '/providers/microgaming-grand.png',
  },
  { test: (s, n) => s.includes('microgaming') || n.includes('microgaming'), url: '/providers/micro-gaming.png' },
  { test: (s, n) => s.includes('nolimit') || n.includes('nolimit'), url: '/providers/nolimitcitiy.png' },
  { test: (s, n) => s.includes('3oaks') || n.includes('3oaks'), url: '/providers/3oaks.png' },
  { test: (s, n) => s.includes('bgaming') || n.includes('bgaming'), url: '/providers/bgaming-mini.png' },
  { test: (s, n) => s.includes('mascot') || n.includes('mascot'), url: '/providers/mascot.png' },
  { test: (s, n) => s.includes('dreamtech') || n.includes('dreamtech'), url: '/providers/dreamtech.png' },
  { test: (s, n) => s.includes('dreamgaming') || n.includes('dreamgaming'), url: '/providers/dream-gaming.png' },
  { test: (s, n) => s.includes('sagaming') || n.includes('sagaming'), url: '/providers/sa-gaming.png' },
  { test: (s, n) => s.includes('simpleplay') || n.includes('simpleplay'), url: '/providers/simpleplay.png' },
  { test: (s, n) => s.includes('fachai') || n.includes('fachai'), url: '/providers/fachai.png' },
  {
    test: (s, n) =>
      s === 'funta' ||
      n === 'funta' ||
      s.includes('funta') ||
      n.includes('funta') ||
      s === 'ftgslot' ||
      n === 'ftgslot',
    url: '/providers/funta.png',
  },
  {
    test: (s, n) =>
      s === 'gtt' ||
      n === 'gtt' ||
      s.includes('gtt') ||
      n.includes('gtt') ||
      s.includes('gametimetec') ||
      n.includes('gametimetec'),
    url: '/providers/gtt.png',
  },
  {
    test: (s, n) =>
      s === 'galaxsys' ||
      n === 'galaxsys' ||
      s.includes('galaxsys') ||
      n.includes('galaxsys') ||
      s === 'galaxys' ||
      n === 'galaxys' ||
      s.includes('galaxys') ||
      n.includes('galaxys'),
    url: '/providers/galaxsys.png',
  },
  {
    test: (s, n) => s.includes('booming') || n.includes('booming'),
    url: '/providers/booming.png',
  },
  {
    test: (s, n) =>
      s === 'riddec' ||
      n === 'riddec' ||
      s.includes('riddec') ||
      n.includes('riddec'),
    url: '/providers/riddec.png',
  },
  {
    test: (s, n) =>
      s === 'slotmart' ||
      n === 'slotmart' ||
      s.includes('slotmart') ||
      n.includes('slotmart'),
    url: '/providers/slotmart.png',
  },
  {
    test: (s, n) =>
      s === 'blitzcrown' ||
      n === 'blitzcrown' ||
      s.includes('blitzcrown') ||
      n.includes('blitzcrown') ||
      s === 'mvg' ||
      n === 'mvg' ||
      s.includes('mvg') ||
      n.includes('mvg') ||
      s.includes('massivegaming') ||
      n.includes('massivegaming'),
    url: '/providers/blitzcrown.png',
  },
  {
    test: (s, n) =>
      s === 'luckymonaco' ||
      n === 'luckymonaco' ||
      s.includes('luckymonaco') ||
      n.includes('luckymonaco'),
    url: '/providers/luckymonaco.png',
  },
  {
    test: (s, n) =>
      s === 'zillion' ||
      n === 'zillion' ||
      s.includes('zillion') ||
      n.includes('zillion') ||
      s === 'zilion' ||
      n === 'zilion',
    url: '/providers/zillion.png',
  },
  {
    test: (s, n) =>
      s === 'jacktop' ||
      n === 'jacktop' ||
      s.includes('jacktop') ||
      n.includes('jacktop'),
    url: '/providers/jacktop.png',
  },
  { test: (s, n) => s.includes('tpg') || n.includes('tpg'), url: '/providers/tpg.png' },
  { test: (s, n) => s.includes('popok') || n.includes('popok'), url: '/providers/popok.png' },
  { test: (s, n) => s.includes('popiplay') || n.includes('popiplay'), url: '/providers/popiplay.png' },
  { test: (s, n) => s.includes('tada') || n.includes('tada'), url: '/providers/tada.png' },
  { test: (s, n) => s.includes('amigo') || n.includes('amigo'), url: '/providers/amigo.png' },
  { test: (s, n) => s.includes('inout') || n.includes('inout'), url: '/providers/inout.png' },
  { test: (s, n) => s.includes('playace') || n.includes('playace'), url: '/providers/playace.png' },
  { test: (s, n) => s.includes('goldengatex') || n.includes('goldengatex'), url: '/providers/goldengatex.png' },
  { test: (s, n) => s.includes('yellowbat') || n.includes('yellowbat'), url: '/providers/yellow-bat.png' },
  { test: (s, n) => s === 'wg' || n === 'wg', url: '/providers/wg.png' },
  { test: (s, n) => s.includes('atg') || n.includes('atg'), url: '/providers/atg.png' },
  {
    test: (s, n) => s.includes('fungamingfish') || n.includes('fungamingfish'),
    url: '/providers/fungaming-fishing.png',
  },
  {
    test: (s, n) => s.includes('jinjibaoxi') || n.includes('jinjibaoxi'),
    url: '/providers/jin-ji-bao-xi.png',
  },
  { test: (s, n) => s.includes('poker') || n.includes('poker'), url: '/providers/poker.png' },
];

function normalizeVendorKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugLogoUrl(slug: string): string {
  return `/providers/${slug}.png`;
}

function matchLocalLogo(vendor: GameVendor): string | null {
  const slugKey = normalizeVendorKey(vendor.slug);
  const nameKey = normalizeVendorKey(vendor.name);

  for (const rule of LOGO_RULES) {
    if (rule.test(slugKey, nameKey)) {
      return rule.url;
    }
  }

  // Vendor slugs come from Laravel Str::slug(name) — matches public/providers/{slug}.png
  if (vendor.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(vendor.slug)) {
    return slugLogoUrl(vendor.slug);
  }

  return null;
}

export function getVendorLogoUrl(vendor: GameVendor): string | null {
  const local = matchLocalLogo(vendor);
  if (local) return local;

  const remote = vendor.logo_url?.trim();
  return remote || null;
}

/** Wide banner art for provider cards on grid pages. */
export function getVendorBannerUrl(vendor: GameVendor): string | null {
  return getVendorLogoUrl(vendor);
}
