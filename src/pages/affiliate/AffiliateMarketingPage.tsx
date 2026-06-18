import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateBanner, type AffiliateLandingPageLink } from '@/api/affiliate.api';
import { CopyButton } from '@/components/affiliate/CopyButton';
import { useTranslation } from '@/hooks/useTranslation';

export function AffiliateMarketingPage() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<AffiliateBanner[]>([]);
  const [landingPages, setLandingPages] = useState<AffiliateLandingPageLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    affiliateApi.getMarketing().then((data) => {
      setBanners(data.banners);
      setLandingPages(data.landing_pages);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.marketing')}</h1>
        <p className="text-sm text-muted">{t('affiliate.marketingDesc')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <>
          <section className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.banners')}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <div key={banner.id} className="rounded border border-white/10 bg-background p-3">
                  <p className="text-sm font-medium text-white">{banner.category}</p>
                  <p className="text-xs text-muted">{banner.size}</p>
                  <a
                    href={banner.download_url}
                    download
                    className="mt-2 inline-block text-sm text-accent hover:underline"
                  >
                    {t('affiliate.download')}
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.landingPages')}</h2>
            <div className="space-y-2">
              {landingPages.map((page) => (
                <div key={page.id} className="flex flex-wrap items-center gap-2 rounded border border-white/5 bg-background p-3">
                  <span className="min-w-[100px] text-sm font-medium text-white">{page.label}</span>
                  <code className="flex-1 break-all text-xs text-muted">{page.url}</code>
                  <CopyButton text={page.url} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
