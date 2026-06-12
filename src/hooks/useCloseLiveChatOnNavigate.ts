import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { hideTawkWidget } from '@/utils/tawkWidget';

export function useCloseLiveChatOnNavigate() {
  const location = useLocation();
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);

  useEffect(() => {
    closeLiveChat();
    hideTawkWidget();
  }, [location.pathname, location.search, closeLiveChat]);
}
