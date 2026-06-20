import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function scrollWindowToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      return;
    }

    scrollWindowToTop();
  }, [pathname, navigationType]);
}
