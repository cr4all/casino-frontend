import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { gameApi } from '@/api/game.api';
import { BetHistoryTable } from '@/components/account/BetHistoryTable';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { BetHistoryItem, PaginationMeta } from '@/types';

const EMPTY_PAGINATION: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
};

export function BetHistoryPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [bets, setBets] = useState<BetHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadBets = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await gameApi.getBets(page);
      setBets(data.items);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('betHistory.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('betHistory.subtitle')}</p>
        </div>
        <Link to="/transactions" className="text-xs text-accent hover:underline">
          {t('betHistory.allTransactions')}
        </Link>
      </div>

      <BetHistoryTable
        bets={bets}
        pagination={pagination}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
}
