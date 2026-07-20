import { describe, expect, it } from 'vitest';
import {
  apiHostname,
  resolveApiBaseUrl,
  resolveReverbHost,
  resolveReverbPort,
  resolveReverbScheme,
} from './apiBase';

describe('apiHostname', () => {
  it('prefixes api. and strips www', () => {
    expect(apiHostname('ibets24.eu')).toBe('api.ibets24.eu');
    expect(apiHostname('www.ibets24.eu')).toBe('api.ibets24.eu');
    expect(apiHostname('api.ibets24.com')).toBe('api.ibets24.com');
  });
});

describe('resolveApiBaseUrl', () => {
  it('uses override in dev', () => {
    expect(
      resolveApiBaseUrl({
        hostname: 'ibets24.eu',
        protocol: 'https:',
        isDev: true,
        override: 'http://localhost:8000/api/v1',
      }),
    ).toBe('http://localhost:8000/api/v1');
  });

  it('derives api host in production', () => {
    expect(
      resolveApiBaseUrl({
        hostname: 'www.ibets24.eu',
        protocol: 'https:',
        isDev: false,
      }),
    ).toBe('https://api.ibets24.eu/api/v1');
  });

  it('uses override for localhost / IP even when not DEV', () => {
    expect(
      resolveApiBaseUrl({
        hostname: '10.10.51.60',
        protocol: 'http:',
        isDev: false,
        override: 'http://10.10.51.60:8000/api/v1',
      }),
    ).toBe('http://10.10.51.60:8000/api/v1');
  });
});

describe('resolveReverb*', () => {
  it('derives wss settings from page host in production', () => {
    expect(resolveReverbHost({ hostname: 'ibets24.co', isDev: false })).toBe('api.ibets24.co');
    expect(
      resolveReverbScheme({ hostname: 'ibets24.co', protocol: 'https:', isDev: false }),
    ).toBe('https');
    expect(resolveReverbPort({ hostname: 'ibets24.co', protocol: 'https:', isDev: false })).toBe(
      443,
    );
  });
});
