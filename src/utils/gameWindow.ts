/** Outer window size where Pragmatic / Reel Kingdom slots show without bottom clipping. */
export const GAME_WINDOW_REFERENCE = {
  outerWidth: 956,
  outerHeight: 911,
} as const;

type ScreenMetrics = Pick<Screen, 'availWidth' | 'availHeight'> & {
  availLeft?: number;
  availTop?: number;
};

function getScreenOffsets(screenLike: ScreenMetrics) {
  return {
    left: screenLike.availLeft ?? 0,
    top: screenLike.availTop ?? 0,
  };
}

export function getGameWindowOuterSize(screenLike: ScreenMetrics = window.screen) {
  const scale = Math.min(
    1,
    screenLike.availWidth / GAME_WINDOW_REFERENCE.outerWidth,
    screenLike.availHeight / GAME_WINDOW_REFERENCE.outerHeight,
  );

  return {
    width: Math.round(GAME_WINDOW_REFERENCE.outerWidth * scale),
    height: Math.round(GAME_WINDOW_REFERENCE.outerHeight * scale),
  };
}

function getCenteredPosition(
  outerWidth: number,
  outerHeight: number,
  screenLike: ScreenMetrics = window.screen,
) {
  const { left: availLeft, top: availTop } = getScreenOffsets(screenLike);

  return {
    left: availLeft + Math.max(0, Math.round((screenLike.availWidth - outerWidth) / 2)),
    top: availTop + Math.max(0, Math.round((screenLike.availHeight - outerHeight) / 2)),
  };
}

export function getInitialGameWindowSize(screenLike: ScreenMetrics = window.screen) {
  const { width, height } = getGameWindowOuterSize(screenLike);
  const { left, top } = getCenteredPosition(width, height, screenLike);

  return { width, height, left, top };
}

export function fitGameWindow() {
  const screenLike = window.screen as ScreenMetrics;
  const { width, height } = getGameWindowOuterSize(screenLike);
  const { left, top } = getCenteredPosition(width, height, screenLike);

  window.resizeTo(width, height);
  window.moveTo(left, top);
}
