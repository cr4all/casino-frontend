import { describe, expect, it } from 'vitest';
import { pickVisitorCountry, resolveVisitorLanguage } from '@/i18n/visitorLanguage';

describe('resolveVisitorLanguage', () => {
  it('uses the country language when English is the preferred browser language', () => {
    expect(resolveVisitorLanguage('KR', ['en-US', 'en'])).toBe('ko');
    expect(resolveVisitorLanguage('KR', ['en-US', 'ko'])).toBe('ko');
    expect(resolveVisitorLanguage('US', ['en-US', 'ko'])).toBe('en');
    expect(resolveVisitorLanguage('DE', ['en-US'])).toBe('de');
    expect(resolveVisitorLanguage('JP', ['en'])).toBe('ja');
    expect(resolveVisitorLanguage('BR', ['en-US'])).toBe('pt-br');
    expect(resolveVisitorLanguage('TW', ['en-US'])).toBe('zh-tw');
    expect(resolveVisitorLanguage('CN', ['en'])).toBe('zh');
    expect(resolveVisitorLanguage(null, ['en-US', 'de-DE'])).toBe('en');
  });

  it('keeps a non-English browser language when it disagrees with the country', () => {
    expect(resolveVisitorLanguage('US', ['ko-KR', 'en-US'])).toBe('ko');
    expect(resolveVisitorLanguage('KR', ['ja-JP'])).toBe('ja');
  });

  it('maps a browser language onto the country variant of the same language', () => {
    expect(resolveVisitorLanguage('BR', ['pt-PT'])).toBe('pt-br');
    expect(resolveVisitorLanguage('PT', ['pt-BR'])).toBe('pt');
    expect(resolveVisitorLanguage('TW', ['zh-CN'])).toBe('zh-tw');
    expect(resolveVisitorLanguage('CN', ['zh-TW'])).toBe('zh');
    expect(resolveVisitorLanguage('BE', ['fr-FR'])).toBe('fr-be');
    expect(resolveVisitorLanguage('BE', ['nl-BE'])).toBe('nl-be');
    expect(resolveVisitorLanguage('MA', ['ar'])).toBe('ar-ma');
  });

  it('picks among a country’s languages with the browser', () => {
    expect(resolveVisitorLanguage('BE', ['en-GB'])).toBe('nl-be');
    expect(resolveVisitorLanguage('CH', ['it-IT'])).toBe('it');
    expect(resolveVisitorLanguage('CH', ['en'])).toBe('de');
    expect(resolveVisitorLanguage('CA', ['fr-CA'])).toBe('fr');
    expect(resolveVisitorLanguage('CA', ['en-CA'])).toBe('en');
    expect(resolveVisitorLanguage('IN', ['en-IN'])).toBe('en');
    expect(resolveVisitorLanguage('IN', ['ta-IN'])).toBe('ta');
    expect(resolveVisitorLanguage('IN', [])).toBe('hi');
    expect(resolveVisitorLanguage('HK', ['en-HK'])).toBe('en');
    expect(resolveVisitorLanguage('HK', ['zh-HK'])).toBe('zh-tw');
    expect(resolveVisitorLanguage('US', ['es-MX', 'en-US'])).toBe('es');
    expect(resolveVisitorLanguage('SG', ['en-SG'])).toBe('en');
  });

  it('falls back to the browser, then English, when the country is unknown', () => {
    expect(resolveVisitorLanguage(null, ['de-DE', 'en'])).toBe('de');
    expect(resolveVisitorLanguage('XX', ['en-US'])).toBe('en');
    expect(resolveVisitorLanguage(null, [])).toBe('en');
    expect(resolveVisitorLanguage('US', ['en-US'])).toBe('en');
  });
});

describe('pickVisitorCountry', () => {
  it('uses the first recognized edge-country header', () => {
    expect(pickVisitorCountry({ cf: 'kr' })).toBe('KR');
    expect(pickVisitorCountry({ cf: 'XX', cloudfront: 'DE' })).toBe('DE');
    expect(pickVisitorCountry({ cf: '', cloudfront: '', countryCode: 'JP' })).toBe('JP');
    expect(pickVisitorCountry({ vercel: 'T1' })).toBeNull();
    expect(pickVisitorCountry(null)).toBeNull();
  });
});
