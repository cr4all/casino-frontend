import { useEffect, useRef, useState } from 'react';
import { affiliateApi } from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

export function AffiliateInvoicesPage() {
  const { t, formatDate } = useTranslation();
  const [invoices, setInvoices] = useState<{ id: number; original_name: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      setInvoices(await affiliateApi.getInvoices());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await affiliateApi.uploadInvoice(file);
      await load();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.invoices')}</h1>
        <p className="text-sm text-muted">{t('affiliate.invoicesDesc')}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">{t('affiliate.uploadInvoice')}</h2>
        <p className="text-xs text-muted">{t('affiliate.invoiceHint')}</p>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? t('common.loading') : t('affiliate.uploadPdf')}
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        {loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted">{t('affiliate.noInvoices')}</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/5 bg-background px-3 py-2 text-sm">
                <span className="text-white">{inv.original_name}</span>
                <span className="text-muted">{inv.status}</span>
                <span className="text-xs text-muted">{formatDate(inv.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
