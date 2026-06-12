export interface TawkApi {
  onLoad?: () => void;
  onChatMessageSystem?: (message: unknown) => void;
  setAttributes?: (
    attributes: Record<string, string>,
    callback?: (error: Error | null) => void,
  ) => void;
  logout?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  minimize?: () => void;
  maximize?: () => void;
  toggle?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}
