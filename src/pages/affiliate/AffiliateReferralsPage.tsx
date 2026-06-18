import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateSubAffiliate } from '@/api/affiliate.api';
import { CopyButton } from '@/components/affiliate/CopyButton';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

export function AffiliateReferralsPage() {
  const { t } = useTranslation();
  const [overrideRate, setOverrideRate] = useState(5);
  const [recruitmentLink, setRecruitmentLink] = useState('');
  const [subs, setSubs] = useState<AffiliateSubAffiliate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    affiliateApi.getReferrals().then((data) => {
      setOverrideRate(data.override_rate);
      setRecruitmentLink(data.recruitment_link);
      setSubs(data.sub_affiliates);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.referrals')}</h1>
        <p className="text-sm text-muted">{t('affiliate.referralsDesc', { rate: overrideRate })}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        <p className="mb-2 text-sm font-medium text-white">{t('affiliate.recruitmentLink')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 break-all rounded bg-background px-3 py-2 text-xs text-muted">{recruitmentLink}</code>
          <CopyButton text={recruitmentLink} />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.subAffiliates')}</h2>
        {loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-muted">{t('affiliate.noSubAffiliates')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">{t('affiliate.stats.activePlayers')}</th>
                  <th className="pb-2 pr-4">{t('affiliate.subEarnings')}</th>
                  <th className="pb-2">{t('affiliate.yourCommission')}</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{sub.code}</td>
                    <td className="py-2 pr-4">{sub.players_count}</td>
                    <td className="py-2 pr-4">{formatBalance(sub.sub_earnings)}</td>
                    <td className="py-2">{formatBalance(sub.your_commission)}</td>
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
