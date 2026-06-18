import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateTrackingLink } from '@/api/affiliate.api';
import { CopyButton } from '@/components/affiliate/CopyButton';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

const landingPages = ['homepage', 'registration', 'sportsbook', 'casino', 'vip'] as const;

export function AffiliateTrackingPage() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<AffiliateTrackingLink[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    landing_page: 'homepage',
    campaign_id: '',
    s1: '',
    s2: '',
    s3: '',
    s4: '',
    s5: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setLinks(await affiliateApi.getTrackingLinks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const buildPreview = async () => {
    const url = await affiliateApi.buildTrackingLink(form);
    setPreviewUrl(url);
  };

  const createLink = async () => {
    setSaving(true);
    try {
      await affiliateApi.createTrackingLink(form);
      setForm({ name: '', landing_page: 'homepage', campaign_id: '', s1: '', s2: '', s3: '', s4: '', s5: '' });
      setPreviewUrl('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.tracking')}</h1>
        <p className="text-sm text-muted">{t('affiliate.trackingDesc')}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold text-white">{t('affiliate.createLink')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded border border-white/10 bg-background px-3 py-2 text-sm"
            placeholder={t('affiliate.linkName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="rounded border border-white/10 bg-background px-3 py-2 text-sm"
            value={form.landing_page}
            onChange={(e) => setForm({ ...form, landing_page: e.target.value })}
          >
            {landingPages.map((p) => (
              <option key={p} value={p}>{t(`affiliate.landing.${p}`)}</option>
            ))}
          </select>
          <input
            className="rounded border border-white/10 bg-background px-3 py-2 text-sm"
            placeholder="Campaign ID"
            value={form.campaign_id}
            onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
          />
          {(['s1', 's2', 's3', 's4', 's5'] as const).map((key) => (
            <input
              key={key}
              className="rounded border border-white/10 bg-background px-3 py-2 text-sm uppercase"
              placeholder={key.toUpperCase()}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={buildPreview}>{t('affiliate.previewLink')}</Button>
          <Button onClick={createLink} disabled={!form.name || saving}>{t('affiliate.saveLink')}</Button>
        </div>
        {previewUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all rounded bg-background px-3 py-2 text-xs text-muted">{previewUrl}</code>
            <CopyButton text={previewUrl} />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.savedLinks')}</h2>
        {loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted">
                  <th className="pb-2 pr-4">{t('affiliate.linkName')}</th>
                  <th className="pb-2 pr-4">Sub ID</th>
                  <th className="pb-2 pr-4">Clicks</th>
                  <th className="pb-2">URL</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-muted">{t('affiliate.noLinks')}</td></tr>
                ) : links.map((link) => (
                  <tr key={link.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{link.name}</td>
                    <td className="py-2 pr-4">{link.sub_id ?? '—'}</td>
                    <td className="py-2 pr-4">{link.clicks_count}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="max-w-xs truncate text-xs text-muted">{link.url}</span>
                        <CopyButton text={link.url} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
