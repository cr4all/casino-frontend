import { getInitialGameWindowSize } from '@/utils/gameWindow';

export const GAME_POPUP_NAME = 'casino-game-play';
export const GAME_FOCUS_CHANNEL = 'casino-game-focus';

let gamePopupRef: Window | null = null;

function focusPopup(popup: Window) {
  popup.focus();

  // Some browsers defer or block parent-initiated focus on an existing popup.
  requestAnimationFrame(() => popup.focus());
  window.setTimeout(() => popup.focus(), 0);

  try {
    const channel = new BroadcastChannel(GAME_FOCUS_CHANNEL);
    channel.postMessage({ type: 'focus' });
    channel.close();
  } catch {
    // BroadcastChannel not supported — parent focus calls above are enough.
  }
}

export function openGameWindow(gameId: number): boolean {
  const url = `${window.location.origin}/games/${gameId}/play`;
  const { width, height, left, top } = getInitialGameWindowSize();
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'scrollbars=no',
    'resizable=yes',
  ].join(',');

  // Reuse the single named popup when it is still open.
  const popup = window.open(url, GAME_POPUP_NAME, features);
  if (!popup) return false;

  gamePopupRef = popup.closed ? null : popup;
  if (popup.closed) return false;

  try {
    popup.opener = null;
  } catch {
    // ignore
  }

  focusPopup(popup);
  return true;
}

export function isGamePopupOpen(): boolean {
  return Boolean(gamePopupRef && !gamePopupRef.closed);
}
