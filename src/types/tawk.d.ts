export interface TawkApi {
  onLoad?: () => void;
  setAttributes?: (
    attributes: Record<string, string>,
    callback?: (error: Error | null) => void,
  ) => void;
  logout?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  toggle?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}
