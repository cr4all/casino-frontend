import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateSupport } from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useUiStore } from '@/stores/uiStore';

export function AffiliateSupportPage() {
  const { t } = useTranslation();
  const openLiveChat = useUiStore((s) => s.openLiveChat);
  const [support, setSupport] = useState<AffiliateSupport | null>(null);

  useEffect(() => {
    affiliateApi.getSupport().then(setSupport);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.support')}</h1>
        <p className="text-sm text-muted">{t('affiliate.supportDesc')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {support?.live_chat_enabled && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="text-sm font-semibold text-white">{t('affiliate.support.liveChat')}</h2>
            <p className="mt-1 text-sm text-muted">{t('affiliate.support.liveChatDesc')}</p>
            <Button className="mt-3" onClick={openLiveChat}>{t('affiliate.support.openChat')}</Button>
          </div>
        )}

        {support?.tickets_enabled && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="text-sm font-semibold text-white">{t('affiliate.support.ticket')}</h2>
            <p className="mt-1 text-sm text-muted">{t('affiliate.support.ticketDesc')}</p>
            <a href={`mailto:${support?.account_manager_email}`} className="mt-3 inline-block text-sm text-accent hover:underline">
              {t('affiliate.support.emailTicket')}
            </a>
          </div>
        )}

        {support?.telegram && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="text-sm font-semibold text-white">Telegram</h2>
            <p className="mt-1 text-sm text-accent">{support.telegram}</p>
          </div>
        )}

        {support?.skype && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="text-sm font-semibold text-white">Skype</h2>
            <p className="mt-1 text-sm text-accent">{support.skype}</p>
          </div>
        )}

        {support?.account_manager_email && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="text-sm font-semibold text-white">{t('affiliate.support.accountManager')}</h2>
            <a href={`mailto:${support.account_manager_email}`} className="mt-1 inline-block text-sm text-accent hover:underline">
              {support.account_manager_email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
