import { getInitialGameWindowSize } from '@/utils/gameWindow';

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

  const popup = window.open(url, `game-${gameId}`, features);
  if (!popup) return false;

  popup.opener = null;
  popup.focus();
  return true;
}
