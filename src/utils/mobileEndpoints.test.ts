import { afterEach, describe, expect, it } from 'vitest';
import { getApiBaseUrl, getReverbHost, getReverbPort, getReverbScheme } from './apiBase';
import { isNewerVersion } from './appVersion';
import {
  clearResolvedMobileEndpoints,
  parseEndpointPaste,
  resolveMobileEndpoints,
  selectLatestPasteKey,
} from './mobileEndpoints';

const LISTING = `
<paste>
  <paste_key>olderkey1</paste_key>
  <paste_date>100</paste_date>
</paste>
<paste>
  <paste_key>newestkey</paste_key>
  <paste_date>300</paste_date>
</paste>
<paste>
  <paste_key>middlekey</paste_key>
  <paste_date>200</paste_date>
</paste>
`;

afterEach(() => {
  clearResolvedMobileEndpoints();
});

describe('selectLatestPasteKey', () => {
  it('picks the paste with the greatest paste_date', () => {
    expect(selectLatestPasteKey(LISTING)).toBe('newestkey');
  });

  it('returns null when the account has no pastes', () => {
    expect(selectLatestPasteKey('No pastes found.')).toBeNull();
    expect(selectLatestPasteKey('Bad API request, invalid api_user_key')).toBeNull();
  });
});

describe('parseEndpointPaste', () => {
  it('reads the API url and optional hosts', () => {
    expect(
      parseEndpointPaste(
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
    expect(parseEndpointPaste('not json')).toBeNull();
    expect(parseEndpointPaste(JSON.stringify({ reverbHost: 'api.example.com' }))).toBeNull();
    expect(parseEndpointPaste(JSON.stringify({ apiUrl: 'ftp://files.example.com' }))).toBeNull();
  });
});

describe('resolveMobileEndpoints', () => {
  it('uses the latest paste and exposes it as the API base', async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api_post.php')) {
        return new Response(LISTING, { status: 200 });
      }
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
      devKey: 'dev',
      userKey: 'user',
    });

    expect(config?.apiUrl).toBe('https://api.example.com/api/v1');
    expect(getApiBaseUrl()).toBe('https://api.example.com/api/v1');
    expect(getReverbHost()).toBe('socket.example.com');
    expect(getReverbScheme()).toBe('https');
    expect(getReverbPort()).toBe(443);
  });

  it('keeps the build-time API address when the paste is not JSON', async () => {
    const buildTimeUrl = getApiBaseUrl();
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api_post.php')) {
        return new Response('<paste><paste_key>abc</paste_key><paste_date>1</paste_date></paste>', {
          status: 200,
        });
      }
      return new Response('hello', { status: 200 });
    };

    await resolveMobileEndpoints({
      fetchImpl: fetchImpl as typeof fetch,
      devKey: 'dev',
      userKey: 'user',
    });

    expect(getApiBaseUrl()).toBe(buildTimeUrl);
  });

  it('skips Pastebin when a key is missing', async () => {
    let called = false;
    await resolveMobileEndpoints({
      fetchImpl: (async () => {
        called = true;
        return new Response('', { status: 200 });
      }) as typeof fetch,
      devKey: 'dev',
      userKey: '',
    });

    expect(called).toBe(false);
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
