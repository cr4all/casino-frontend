import type { WalletBalanceUpdate } from '@/stores/walletStore';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface WalletStreamOptions {
  signal: AbortSignal;
  onBalance: (update: WalletBalanceUpdate) => void;
  onError: (error: unknown) => void;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split('\n');
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return { event, data: dataLines.join('\n') };
}

export async function connectWalletBalanceStream({
  signal,
  onBalance,
  onError,
}: WalletStreamOptions): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error('Missing access token');
  }

  const response = await fetch(`${API_BASE}/wallet/balance/stream`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok || !response.body) {
    throw new Error(`Stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        const parsed = parseSseBlock(block);
        if (parsed && (parsed.event === 'snapshot' || parsed.event === 'balance')) {
          try {
            onBalance(JSON.parse(parsed.data) as WalletBalanceUpdate);
          } catch (error) {
            onError(error);
          }
        }

        boundary = buffer.indexOf('\n\n');
      }
    }
  } catch (error) {
    if (signal.aborted) {
      return;
    }

    onError(error);
    throw error;
  }
}
