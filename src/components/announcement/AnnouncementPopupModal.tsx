import { useCallback, useId, useState } from 'react';
import { LogoMark } from '@/components/common/Logo';
import { type AnnouncementPopup } from '@/api/notification.api';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNotificationText } from '@/utils/formatBalance';
import { snoozePopupForToday } from '@/utils/popupSnooze';

interface AnnouncementPopupModalProps {
  popup: AnnouncementPopup;
  userId: number;
  onDismiss: (popupId: number) => void;
}

export function AnnouncementPopupModal({ popup, userId, onDismiss }: AnnouncementPopupModalProps) {
  const { t } = useTranslation();
  const gradientId = useId().replace(/:/g, '');
  const [hideForToday, setHideForToday] = useState(false);
  useBodyScrollLock(true);

  const handleClose = useCallback(() => {
    if (hideForToday) {
      snoozePopupForToday(userId, popup.id);
    }

    onDismiss(popup.id);
  }, [hideForToday, onDismiss, popup.id, userId]);

  const title = formatNotificationText(popup.title);
  const body = formatNotificationText(popup.body);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-popup-title"
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="h-1 bg-gradient-to-r from-accent-gold/20 via-accent-gold to-accent-gold/20" />

          <div className="border-b border-white/[0.06] bg-surface/40 px-6 pb-5 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex justify-center">
                  <LogoMark gradientId={gradientId} height={36} className="block h-9 w-auto max-w-full" />
                </div>
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-gold/80">
                  {t('announcement.popupBadge')}
                </p>
                <h2
                  id="announcement-popup-title"
                  className="mt-2 text-center text-xl font-bold leading-snug text-white"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-[min(42vh,320px)] overflow-y-auto overscroll-contain px-6 py-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{body}</p>
          </div>

          <div className="border-t border-white/[0.06] bg-surface/20 px-6 py-5">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-background/40 px-3 py-2.5 transition-colors hover:border-white/10">
              <input
                type="checkbox"
                checked={hideForToday}
                onChange={(event) => setHideForToday(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-surface accent-accent-gold"
              />
              <span className="text-sm text-muted">{t('announcement.hideForToday')}</span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-accent-gold to-[#F57C00] py-3 text-sm font-bold text-background shadow-[0_8px_24px_rgba(255,179,0,0.25)] transition-opacity hover:opacity-90"
            >
              {t('announcement.popupClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
