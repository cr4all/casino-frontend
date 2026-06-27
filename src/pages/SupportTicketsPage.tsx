import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  supportTicketsApi,
  type SupportTicketCategory,
  type SupportTicketSummary,
} from '@/api/supportTickets.api';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';

const categories: SupportTicketCategory[] = ['account', 'payment', 'bonus', 'game', 'other'];

export function SupportTicketsPage() {
  const { t, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('other');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    supportTicketsApi
      .list()
      .then((data) => setTickets(data.items))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await supportTicketsApi.create({
        subject: subject.trim(),
        category,
        body: body.trim(),
      });
      setTickets((prev) => [ticket, ...prev]);
      setShowForm(false);
      setSubject('');
      setBody('');
      setCategory('other');
    } catch {
      setError(t('supportTickets.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('supportTickets.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('supportTickets.subtitle')}</p>
        </div>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? t('common.close') : t('supportTickets.newTicket')}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={(event) => void handleCreate(event)} className="mb-6 rounded-lg border border-white/5 bg-surface p-5 space-y-4">
          <div>
            <label htmlFor="ticket-subject" className="mb-1 block text-sm text-muted">{t('supportTickets.subject')}</label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              minLength={3}
              maxLength={255}
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="ticket-category" className="mb-1 block text-sm text-muted">{t('supportTickets.category')}</label>
            <select
              id="ticket-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as SupportTicketCategory)}
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-white"
            >
              {categories.map((value) => (
                <option key={value} value={value}>{t(`supportTickets.categories.${value}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ticket-body" className="mb-1 block text-sm text-muted">{t('supportTickets.message')}</label>
            <textarea
              id="ticket-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              rows={5}
              maxLength={5000}
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-white"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? t('common.loading') : t('supportTickets.submit')}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-surface p-8 text-center">
          <p className="text-muted">{t('supportTickets.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/support-tickets/${ticket.id}`}
                className="block rounded-lg border border-white/5 bg-surface p-4 transition-colors hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">#{ticket.id} · {ticket.subject}</p>
                    <p className="mt-1 text-xs text-muted">
                      {t(`supportTickets.categories.${ticket.category}`)} · {t(`supportTickets.status.${ticket.status}`)}
                      {ticket.last_message_at ? ` · ${formatDate(ticket.last_message_at)}` : ''}
                    </p>
                  </div>
                  {ticket.unread_player_count > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                      {ticket.unread_player_count}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
