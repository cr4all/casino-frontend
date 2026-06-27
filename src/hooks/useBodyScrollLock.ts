import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function lockBodyScroll() {
  lockCount += 1;
  if (lockCount !== 1) return;

  savedScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) return;

  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY);
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return undefined;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [locked]);
}
