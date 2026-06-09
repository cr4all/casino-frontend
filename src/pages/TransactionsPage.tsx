import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { paymentApi, type DepositItem, type WithdrawalItem } from '@/api/payment.api';
import { walletApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Transaction } from '@/types';

type Tab = 'ledger' | 'deposits' | 'withdrawals';

export function TransactionsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tab, setTab] = useState<Tab>('ledger');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      walletApi.getTransactions(),
      paymentApi.getDeposits(),
      paymentApi.getWithdrawals(),
    ])
      .then(([tx, dep, wit]) => {
        setTransactions(tx.items);
        setDeposits(dep.items);
        setWithdrawals(wit.items);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

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
    { id: 'ledger', label: 'Wallet Ledger' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
  ];

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <div className="flex gap-2">
          <Link to="/deposit" className="text-xs text-accent hover:underline">+ Deposit</Link>
          <Link to="/withdraw" className="text-xs text-accent hover:underline">Withdraw</Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-white/5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-accent text-white'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : tab === 'ledger' ? (
        transactions.length === 0 ? (
          <EmptyState message="No wallet transactions yet." />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-white/5 bg-surface text-left">
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th className="hidden sm:table-cell">Description</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-surface/50">
                  <td className={`px-4 py-3 capitalize font-medium ${typeColors[tx.type] ?? 'text-white'}`}>
                    {tx.type}
                  </td>
                  <td className="px-4 py-3 font-mono text-white">{tx.amount}</td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{tx.description ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      ) : tab === 'deposits' ? (
        deposits.length === 0 ? (
          <EmptyState message="No deposit requests yet." action={{ label: 'Make a deposit', to: '/deposit' }} />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-white/5 bg-surface text-left">
                <Th>ID</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th className="hidden sm:table-cell">Date</Th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-surface/50">
                  <td className="px-4 py-3 text-white">#{d.id}</td>
                  <td className="px-4 py-3 font-mono text-white">{d.currency} {d.amount}</td>
                  <td className="px-4 py-3 text-muted">{d.payment_method ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      ) : withdrawals.length === 0 ? (
        <EmptyState message="No withdrawal requests yet." action={{ label: 'Request withdrawal', to: '/withdraw' }} />
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-white/5 bg-surface text-left">
              <Th>ID</Th>
              <Th>Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th className="hidden sm:table-cell">Date</Th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-white/5 hover:bg-surface/50">
                <td className="px-4 py-3 text-white">#{w.id}</td>
                <td className="px-4 py-3 font-mono text-white">{w.currency} {w.amount}</td>
                <td className="px-4 py-3 text-muted">{w.payment_method ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                  {w.created_at ? new Date(w.created_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
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
