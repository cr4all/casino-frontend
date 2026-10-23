import type { NavigateFunction } from 'react-router-dom';
import { isNativeApp } from '@/utils/capacitor';
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

/**
 * Opens a game in a desktop popup (web) or in-app full-screen route (native).
 * Pass `navigate` from React Router when calling from a component so the native
 * path uses client-side routing instead of a full document load.
 */
export function openGameWindow(gameId: number, navigate?: NavigateFunction): boolean {
  const path = `/games/${gameId}/play`;

  if (isNativeApp()) {
    if (navigate) {
      navigate(path);
      return true;
    }
    window.location.assign(path);
    return true;
  }

  const url = `${window.location.origin}${path}`;
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
