/** Shared IBETS24 wordmark typography. */
export const LOGO_FONT_FAMILY = "Montserrat, 'Arial Black', Arial, sans-serif";
export const LOGO_FONT_SIZE = 36;
export const LOGO_FONT_WEIGHT = 800;
export const LOGO_VIEWBOX_WIDTH = 162;
export const LOGO_VIEWBOX_HEIGHT = 52;
export const LOGO_ASPECT_RATIO = LOGO_VIEWBOX_WIDTH / LOGO_VIEWBOX_HEIGHT;
export const LOGO_VIEWBOX = `0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`;

export function logoWidthForHeight(height: number): number {
  return Math.round(height * LOGO_ASPECT_RATIO);
}
export const LOGO_TEXT_X = 0;
export const LOGO_TEXT_Y = 40;
export const LOGO_LETTER_SPACING = '-0.08em';

export const FAVICON_FONT_FAMILY = LOGO_FONT_FAMILY;
export const FAVICON_IBETS_Y = 13;
export const FAVICON_24_Y = 25;
export const FAVICON_IBETS_SIZE = 8;
export const FAVICON_24_SIZE = 11;
