import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { gameApi } from '@/api/game.api';
import { paymentApi, type DepositItem, type WithdrawalItem } from '@/api/payment.api';
import { walletApi } from '@/api/wallet.api';
import { BetHistoryTable } from '@/components/account/BetHistoryTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { BetHistoryItem, PaginationMeta, Transaction } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

type Tab = 'bets' | 'deposits' | 'withdrawals' | 'wallet';

const VALID_TABS: Tab[] = ['bets', 'deposits', 'withdrawals', 'wallet'];

const EMPTY_PAGINATION: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
};

export function TransactionsPage() {
  const { t, tTxType, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = VALID_TABS.includes(tabParam as Tab) ? (tabParam as Tab) : 'bets';

  const [bets, setBets] = useState<BetHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const setTab = (next: Tab) => {
    setSearchParams({ tab: next });
    setPage(1);
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (tab === 'bets') {
        const data = await gameApi.getBets(page);
        setBets(data.items);
        setPagination(data.pagination);
      } else if (tab === 'deposits') {
        const data = await paymentApi.getDeposits(page);
        setDeposits(data.items);
        setPagination(data.pagination ?? EMPTY_PAGINATION);
      } else if (tab === 'withdrawals') {
        const data = await paymentApi.getWithdrawals(page);
        setWithdrawals(data.items);
        setPagination(data.pagination ?? EMPTY_PAGINATION);
      } else {
        const data = await walletApi.getTransactions(page);
        setTransactions(data.items);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tab, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const typeColors: Record<string, string> = {
    deposit: 'text-green-400',
    withdraw: 'text-red-400',
    bet: 'text-accent',
    win: 'text-accent-gold',
    bonus: 'text-accent-purple',
    rollback: 'text-muted',
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'bets', label: t('betHistory.title') },
    { id: 'deposits', label: t('transactions.deposits') },
    { id: 'withdrawals', label: t('transactions.withdrawals') },
    { id: 'wallet', label: t('transactions.wallet') },
  ];

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{t('transactions.title')}</h1>
        <div className="flex gap-2">
          <Link to="/deposit" className="text-xs text-accent hover:underline">{t('transactions.depositLink')}</Link>
          <Link to="/withdraw" className="text-xs text-accent hover:underline">{t('transactions.withdrawLink')}</Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-white/5">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === tabItem.id
                ? 'border-accent text-white'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'bets' ? (
        <BetHistoryTable
          bets={bets}
          pagination={pagination}
          loading={loading}
          onPageChange={setPage}
        />
      ) : loading ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : tab === 'deposits' ? (
        deposits.length === 0 ? (
          <EmptyState
            message={t('transactions.noDeposits')}
            action={{ label: t('transactions.makeDeposit'), to: '/deposit' }}
          />
        ) : (
          <>
            <PaymentTable items={deposits} amountHeader={t('transactions.amount')} />
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )
      ) : tab === 'withdrawals' ? (
        withdrawals.length === 0 ? (
          <EmptyState
            message={t('transactions.noWithdrawals')}
            action={{ label: t('transactions.requestWithdrawal'), to: '/withdraw' }}
          />
        ) : (
          <>
            <PaymentTable items={withdrawals} amountHeader={t('transactions.amount')} />
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )
      ) : transactions.length === 0 ? (
        <EmptyState message={t('transactions.noWalletTx')} />
      ) : (
        <>
          <Table>
            <thead>
              <tr className="border-b border-white/5 bg-surface text-left">
                <Th>{t('transactions.type')}</Th>
                <Th>{t('transactions.amount')}</Th>
                <Th className="hidden md:table-cell">{t('transactions.balanceAfter')}</Th>
                <Th className="hidden sm:table-cell">{t('transactions.reference')}</Th>
                <Th>{t('transactions.date')}</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-surface/50">
                  <td className={`px-4 py-3 capitalize font-medium ${typeColors[tx.type] ?? 'text-white'}`}>
                    {tTxType(tx.type)}
                  </td>
                  <td className="px-4 py-3 font-mono text-white">{formatBalance(tx.amount)}</td>
                  <td className="px-4 py-3 font-mono text-muted hidden md:table-cell">
                    {tx.balance_after != null ? formatBalance(tx.balance_after) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                    {tx.reference_type ? `${tx.reference_type}/${tx.reference_id}` : (tx.description ?? '—')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {formatDate(tx.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function PaymentTable({
  items,
  amountHeader,
}: {
  items: (DepositItem | WithdrawalItem)[];
  amountHeader: string;
}) {
  const { t, tPaymentMethod, formatDate } = useTranslation();

  return (
    <Table>
      <thead>
        <tr className="border-b border-white/5 bg-surface text-left">
          <Th>{t('deposit.id')}</Th>
          <Th>{amountHeader}</Th>
          <Th>{t('transactions.method')}</Th>
          <Th>{t('transactions.status')}</Th>
          <Th className="hidden sm:table-cell">{t('transactions.date')}</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-white/5 hover:bg-surface/50">
            <td className="px-4 py-3 text-white">#{item.id}</td>
            <td className="px-4 py-3 font-mono text-white">
              {item.currency} {formatBalance(item.amount)}
            </td>
            <td className="px-4 py-3 text-muted">{tPaymentMethod(item.payment_method)}</td>
            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
            <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
              {formatDate(item.created_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-medium text-muted ${className}`}>{children}</th>
  );
}

function EmptyState({ message, action }: { message: string; action?: { label: string; to: string } }) {
  return (
    <div className="rounded-lg bg-surface p-8 text-center border border-white/5">
      <p className="text-muted">{message}</p>
      {action && (
        <Link to={action.to} className="mt-3 inline-block text-sm text-accent hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
