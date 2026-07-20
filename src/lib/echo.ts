import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';
import { getApiBaseUrl, getReverbHost, getReverbPort, getReverbScheme } from '@/utils/apiBase';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;

function broadcastingAuthUrl(): string {
  const apiUrl = getApiBaseUrl();
  const apiRoot = apiUrl.replace(/\/api\/v1\/?$/, '/api');

  return `${apiRoot}/broadcasting/auth`;
}

function createEchoInstance(accessToken: string): Echo<'reverb'> {
  const scheme = getReverbScheme();
  const port = getReverbPort();

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'casino-local-key',
    wsHost: getReverbHost(),
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: broadcastingAuthUrl(),
    auth: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function getEcho(): Echo<'reverb'> | null {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    disconnectEcho();
    return null;
  }

  if (!echoInstance) {
    echoInstance = createEchoInstance(accessToken);
  }

  return echoInstance;
}

export function refreshEchoToken(): void {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    disconnectEcho();
    return;
  }

  disconnectEcho();
  echoInstance = createEchoInstance(accessToken);
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
