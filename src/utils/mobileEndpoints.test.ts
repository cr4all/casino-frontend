import { afterEach, describe, expect, it } from 'vitest';
import { getApiBaseUrl, getReverbHost, getReverbPort, getReverbScheme } from './apiBase';
import { isNewerVersion } from './appVersion';
import {
  clearResolvedMobileEndpoints,
  firebaseEndpointUrl,
  parseEndpointDocument,
  resolveMobileEndpoints,
} from './mobileEndpoints';

const DATABASE_URL = 'https://casino-default-rtdb.asia-southeast1.firebasedatabase.app';
const ENDPOINT_URL = `${DATABASE_URL}/mobile/endpoints.json`;

afterEach(() => {
  clearResolvedMobileEndpoints();
});

describe('firebaseEndpointUrl', () => {
  it('builds the public endpoints document URL', () => {
    expect(firebaseEndpointUrl(`${DATABASE_URL}/`)).toBe(ENDPOINT_URL);
    expect(firebaseEndpointUrl('https://casino-default-rtdb.firebaseio.com')).toBe(
      'https://casino-default-rtdb.firebaseio.com/mobile/endpoints.json',
    );
  });

  it('rejects addresses that are not a Firebase database root', () => {
    expect(firebaseEndpointUrl('')).toBeNull();
    expect(firebaseEndpointUrl('http://casino-default-rtdb.firebaseio.com')).toBeNull();
    expect(firebaseEndpointUrl('https://evil.example')).toBeNull();
    expect(firebaseEndpointUrl(`${DATABASE_URL}/other.json`)).toBeNull();
  });
});

describe('parseEndpointDocument', () => {
  it('reads the API url and optional hosts', () => {
    expect(
      parseEndpointDocument(
        JSON.stringify({
          apiUrl: 'https://api.example.com/api/v1/',
          reverbHost: 'api.example.com',
          reverbPort: 443,
          reverbScheme: 'https',
          reverbAppKey: 'public-key',
          assetsBaseUrl: 'https://image.example.com/',
        }),
      ),
    ).toEqual({
      apiUrl: 'https://api.example.com/api/v1',
      reverbHost: 'api.example.com',
      reverbPort: 443,
      reverbScheme: 'https',
      reverbAppKey: 'public-key',
      assetsBaseUrl: 'https://image.example.com',
    });
  });

  it('rejects text that is not an endpoint JSON object', () => {
    expect(parseEndpointDocument('not json')).toBeNull();
    expect(parseEndpointDocument(JSON.stringify({ reverbHost: 'api.example.com' }))).toBeNull();
    expect(parseEndpointDocument(JSON.stringify({ apiUrl: 'ftp://files.example.com' }))).toBeNull();
  });
});

describe('resolveMobileEndpoints', () => {
  it('reads the Firebase document and exposes it as the API base', async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(ENDPOINT_URL);
      return new Response(
        JSON.stringify({
          apiUrl: 'https://api.example.com/api/v1',
          reverbHost: 'socket.example.com',
          reverbPort: 443,
          reverbScheme: 'https',
        }),
        { status: 200 },
      );
    };

    const config = await resolveMobileEndpoints({
      fetchImpl: fetchImpl as typeof fetch,
      databaseUrl: DATABASE_URL,
    });

    expect(config?.apiUrl).toBe('https://api.example.com/api/v1');
    expect(getApiBaseUrl()).toBe('https://api.example.com/api/v1');
    expect(getReverbHost()).toBe('socket.example.com');
    expect(getReverbScheme()).toBe('https');
    expect(getReverbPort()).toBe(443);
  });

  it('keeps the build-time API address when the document is missing or not JSON', async () => {
    const buildTimeUrl = getApiBaseUrl();

    await resolveMobileEndpoints({
      fetchImpl: (async () => new Response('null', { status: 200 })) as typeof fetch,
      databaseUrl: DATABASE_URL,
    });
    expect(getApiBaseUrl()).toBe(buildTimeUrl);

    clearResolvedMobileEndpoints();

    await resolveMobileEndpoints({
      fetchImpl: (async () => new Response('hello', { status: 200 })) as typeof fetch,
      databaseUrl: DATABASE_URL,
    });
    expect(getApiBaseUrl()).toBe(buildTimeUrl);
  });

  it('skips the request when the database URL is missing or not Firebase', async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return new Response('', { status: 200 });
    }) as typeof fetch;

    await resolveMobileEndpoints({ fetchImpl, databaseUrl: '' });
    await resolveMobileEndpoints({ fetchImpl, databaseUrl: 'https://evil.example' });

    expect(called).toBe(false);
  });

  it('accepts the Capacitor HTTP proxy when it targeted Firebase', async () => {
    const proxy = `https://localhost/_capacitor_http_interceptor_?u=${encodeURIComponent(ENDPOINT_URL)}`;
    const response = new Response(JSON.stringify({ apiUrl: 'https://api.example.com/api/v1' }), { status: 200 });
    Object.defineProperty(response, 'url', { value: proxy });

    const config = await resolveMobileEndpoints({
      fetchImpl: (async () => response) as typeof fetch,
      databaseUrl: DATABASE_URL,
    });

    expect(config?.apiUrl).toBe('https://api.example.com/api/v1');
  });

  it('ignores a Capacitor HTTP proxy that targeted another host', async () => {
    const buildTimeUrl = getApiBaseUrl();
    const proxy = `https://localhost/_capacitor_http_interceptor_?u=${encodeURIComponent('https://evil.example/mobile/endpoints.json')}`;
    const response = new Response(JSON.stringify({ apiUrl: 'https://evil.example/api/v1' }), { status: 200 });
    Object.defineProperty(response, 'url', { value: proxy });

    await resolveMobileEndpoints({
      fetchImpl: (async () => response) as typeof fetch,
      databaseUrl: DATABASE_URL,
    });

    expect(getApiBaseUrl()).toBe(buildTimeUrl);
  });

  it('ignores a response that left the Firebase host', async () => {
    const buildTimeUrl = getApiBaseUrl();
    const response = new Response(JSON.stringify({ apiUrl: 'https://evil.example/api/v1' }), { status: 200 });
    Object.defineProperty(response, 'url', { value: 'https://evil.example/mobile/endpoints.json' });

    await resolveMobileEndpoints({
      fetchImpl: (async () => response) as typeof fetch,
      databaseUrl: DATABASE_URL,
    });

    expect(getApiBaseUrl()).toBe(buildTimeUrl);
  });
});

describe('isNewerVersion', () => {
  it('compares semantic versions numerically', () => {
    expect(isNewerVersion('1.2.0', '1.1.9')).toBe(true);
    expect(isNewerVersion('1.10.0', '1.9.0')).toBe(true);
    expect(isNewerVersion('1.2.0', '1.2.0')).toBe(false);
    expect(isNewerVersion('1.0.0', '1.2.0')).toBe(false);
    expect(isNewerVersion('1.2', '1.0.0')).toBe(false);
  });
});
