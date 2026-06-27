import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  supportTicketsApi,
  type SupportTicketDetail,
  type SupportTicketMessage,
} from '@/api/supportTickets.api';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';

export function SupportTicketDetailPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const { t, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(ticketId)) return;
    supportTicketsApi
      .get(ticketId)
      .then((data) => {
        setTicket(data.ticket);
        setMessages(data.messages);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, ticketId]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!Number.isFinite(ticketId)) {
    return <Navigate to="/support-tickets" replace />;
  }

  const isClosed = ticket?.status === 'closed';

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() || isClosed) return;
    setSubmitting(true);
    setError(null);
    try {
      const message = await supportTicketsApi.reply(ticketId, body.trim());
      setMessages((prev) => [...prev, message]);
      setBody('');
    } catch {
      setError(t('supportTickets.replyFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl">
      <Link to="/support-tickets" className="text-sm text-accent-gold hover:underline">
        {t('supportTickets.backToList')}
      </Link>

      {loading ? (
        <p className="mt-6 text-muted">{t('common.loading')}</p>
      ) : !ticket ? (
        <p className="mt-6 text-muted">{t('supportTickets.notFound')}</p>
      ) : (
        <>
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold text-white">#{ticket.id} · {ticket.subject}</h1>
            <p className="mt-1 text-sm text-muted">
              {t(`supportTickets.categories.${ticket.category}`)} · {t(`supportTickets.status.${ticket.status}`)}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-white/5 bg-surface p-4">
            {messages.map((message) => {
              const isAdmin = message.sender_type === 'admin';
              return (
                <div
                  key={message.id}
                  className={`rounded-lg px-4 py-3 text-sm ${isAdmin ? 'ml-8 bg-accent/10 border border-accent/20' : 'mr-8 bg-card border border-white/5'}`}
                >
                  <p className="mb-1 text-xs text-muted">
                    {isAdmin ? t('supportTickets.supportTeam') : t('supportTickets.you')}
                    {message.created_at ? ` · ${formatDate(message.created_at)}` : ''}
                  </p>
                  <p className="whitespace-pre-wrap text-white">{message.body}</p>
                </div>
              );
            })}
          </div>

          {isClosed ? (
            <div className="mt-4 rounded-lg border border-white/5 bg-surface p-4 text-sm text-muted">
              {t('supportTickets.closedHint')}
            </div>
          ) : (
            <form onSubmit={(event) => void handleReply(event)} className="mt-4 space-y-3">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                maxLength={5000}
                placeholder={t('supportTickets.replyPlaceholder')}
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-white"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={submitting || !body.trim()}>
                {submitting ? t('common.loading') : t('supportTickets.sendReply')}
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
