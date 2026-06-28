import {
  Fragment,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  supportTicketsApi,
  type SupportTicketDetail,
  type SupportTicketMessage,
} from '@/api/supportTickets.api';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatChatDateLabel, getChatDateKey } from '@/utils/formatDateTime';
import {
  collectFieldErrors,
  hasFieldErrors,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

function formatTime(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-1">
      <span className="select-none rounded-full bg-black/30 px-3 py-1 text-xs font-medium capitalize text-white/80">
        {label}
      </span>
    </div>
  );
}

function ChatMessageBubble({
  body,
  time,
  isOwn,
}: {
  body: string;
  time: string;
  isOwn: boolean;
}) {
  return (
    <div
      className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm leading-snug ${
        isOwn ? 'bg-accent-gold/15 text-white' : 'bg-card/80 text-white'
      }`}
    >
      <span className="whitespace-pre-wrap break-words">{body}</span>
      <span className="relative top-[3px] float-right ml-2.5 select-none text-[11px] leading-none text-white/45">
        {time}
      </span>
    </div>
  );
}

export function SupportTicketDetailPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const { t, language } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const adjustInputHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    adjustInputHeight();
  }, [body]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!Number.isFinite(ticketId)) {
    return <Navigate to="/support-tickets" replace />;
  }

  const isClosed = ticket?.status === 'closed';

  const handleReply = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isClosed || submitting) return;

    setError(null);
    setFieldErrors({});

    const errors = collectFieldErrors([
      [
        'body',
        requiredValue(body) ? undefined : t('common.fieldRequired', { field: t('supportTickets.message') }),
      ],
    ]);

    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const message = await supportTicketsApi.reply(ticketId, body.trim());
      setMessages((prev) => [...prev, message]);
      setBody('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch {
      setError(t('supportTickets.replyFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleReply();
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
          <div className="mt-4 mb-4">
            <h1 className="text-2xl font-bold text-white">#{ticket.id} · {ticket.subject}</h1>
            <p className="mt-1 text-sm text-muted">
              {t(`supportTickets.categories.${ticket.category}`)} · {t(`supportTickets.status.${ticket.status}`)}
            </p>
          </div>

          <div className="flex flex-col overflow-hidden rounded-lg border border-white/5 bg-surface">
            <div
              ref={scrollRef}
              className="scrollbar-dark max-h-[min(60vh,520px)] space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {messages.length === 0 ? (
                <p className="text-sm text-muted">{t('liveChat.empty')}</p>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_type === 'player';
                  const dateKey = getChatDateKey(message.created_at);
                  const prevDateKey =
                    index > 0 ? getChatDateKey(messages[index - 1]?.created_at) : null;
                  const showDateSeparator = Boolean(dateKey && dateKey !== prevDateKey);

                  return (
                    <Fragment key={message.id}>
                      {showDateSeparator && (
                        <ChatDateSeparator
                          label={formatChatDateLabel(message.created_at, language)}
                        />
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <ChatMessageBubble
                          body={message.body}
                          time={formatTime(message.created_at)}
                          isOwn={isOwn}
                        />
                      </div>
                    </Fragment>
                  );
                })
              )}
            </div>

            {isClosed ? (
              <div className="border-t border-white/10 px-4 py-3 text-sm text-muted">
                {t('supportTickets.closedHint')}
              </div>
            ) : (
              <form onSubmit={(event) => void handleReply(event)} noValidate className="border-t border-white/10 p-4">
                {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
                {fieldErrors.body && <p className="mb-2 text-xs text-red-400">{fieldErrors.body}</p>}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    id="ticket-reply-body"
                    value={body}
                    onChange={(event) => {
                      setBody(event.target.value);
                      setFieldErrors((prev) => omitFieldError(prev, 'body'));
                    }}
                    onKeyDown={handleInputKeyDown}
                    placeholder={t('supportTickets.replyPlaceholder')}
                    maxLength={5000}
                    rows={1}
                    className="min-h-10 flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-background px-3 py-2 text-sm leading-5 text-white outline-none focus:border-accent-gold/50"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !body.trim()}
                    className="h-10 shrink-0 rounded-lg bg-accent-gold px-4 text-sm font-semibold text-black transition enabled:hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? t('common.loading') : t('supportTickets.sendReply')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
