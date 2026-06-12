import { useUiStore } from '@/stores/uiStore';

const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

const WIDGET_RETRY_MS = [0, 100, 300, 600, 1200];

let showGeneration = 0;

export function isTawkConfigured(): boolean {
  return Boolean(propertyId && widgetId);
}

export function showTawkWidget() {
  if (!isTawkConfigured()) return;

  const generation = ++showGeneration;

  const open = () => {
    if (generation !== showGeneration) return;
    if (!useUiStore.getState().liveChatOpen) return;

    window.Tawk_API?.showWidget?.();
    window.Tawk_API?.maximize?.();
  };

  for (const delay of WIDGET_RETRY_MS) {
    window.setTimeout(open, delay);
  }
}

export function hideTawkWidget() {
  showGeneration += 1;
  window.Tawk_API?.minimize?.();
  window.Tawk_API?.hideWidget?.();
}
