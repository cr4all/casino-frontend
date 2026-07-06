import {
  Fragment,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AttachIcon } from '@/components/common/AttachIcon';
import type { SupportAttachment } from '@/api/liveChat.api';
import {
  supportTicketsApi,
  type SupportTicketDetail,
  type SupportTicketMessage,
} from '@/api/supportTickets.api';
import { MessageAttachments } from '@/components/support/MessageAttachments';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatChatDateLabel, getChatDateKey } from '@/utils/formatDateTime';

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
  attachments,
  time,
  isOwn,
}: {
  body: string;
  attachments?: SupportAttachment[];
  time: string;
  isOwn: boolean;
}) {
  return (
    <div
      className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm leading-snug ${
        isOwn ? 'bg-accent-gold/15 text-white' : 'bg-card/80 text-white'
      }`}
    >
      {body ? <span className="whitespace-pre-wrap break-words">{body}</span> : null}
      <MessageAttachments attachments={attachments} />
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
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [body, setBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<SupportTicketMessage[]>([]);

  const mergeMessages = useCallback((incoming: SupportTicketMessage[], prepend = false) => {
    if (!incoming.length) return;

    setMessages((current) => {
      const known = new Set(current.map((m) => m.id));
      const next = prepend ? [...incoming.filter((m) => !known.has(m.id)), ...current] : [...current];

      if (!prepend) {
        for (const message of incoming) {
          if (!known.has(message.id)) {
            next.push(message);
          }
        }
      }

      next.sort((a, b) => a.id - b.id);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const loadTicket = useCallback(async () => {
    const data = await supportTicketsApi.get(ticketId);
    setTicket(data.ticket);
    messagesRef.current = data.messages;
    setMessages(data.messages);
    setHasMore(Boolean(data.has_more));
  }, [ticketId]);

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(ticketId)) return;
    loadTicket()
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated, loadTicket, ticketId]);

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(ticketId)) return;

    const pollTimer = window.setInterval(() => {
      void supportTicketsApi
        .get(ticketId, { after_id: messagesRef.current.at(-1)?.id })
        .then((data) => {
          setTicket(data.ticket);
          mergeMessages(data.messages);
        })
        .catch(() => undefined);
    }, 3000);

    return () => window.clearInterval(pollTimer);
  }, [isAuthenticated, mergeMessages, ticketId]);

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
  const canSend = Boolean(body.trim() || selectedFile);

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore) return;

    const oldestId = messagesRef.current[0]?.id;
    if (!oldestId) return;

    setLoadingOlder(true);
    try {
      const data = await supportTicketsApi.get(ticketId, { before_id: oldestId });
      mergeMessages(data.messages, true);
      setHasMore(Boolean(data.has_more));
    } catch {
      setError(t('liveChat.loadFailed'));
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleReply = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isClosed || submitting || !canSend) return;

    setError(null);
    setSubmitting(true);

    try {
      const message = await supportTicketsApi.reply(ticketId, {
        body: body.trim() || undefined,
        file: selectedFile ?? undefined,
      });
      mergeMessages([message]);
      setBody('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadOlderMessages()}
                    disabled={loadingOlder}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {loadingOlder ? t('common.loading') : t('supportTickets.loadOlder')}
                  </button>
                </div>
              )}
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
                          attachments={message.attachments}
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
                {selectedFile && (
                  <p className="mb-2 text-xs text-white/70">
                    {t('supportTickets.attachedFile')}: {selectedFile.name}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                  <textarea
                    ref={inputRef}
                    id="ticket-reply-body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={t('supportTickets.replyPlaceholder')}
                    maxLength={5000}
                    rows={1}
                    className="min-h-10 flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-background px-3 py-2 text-sm leading-5 text-white outline-none focus:border-accent-gold/50"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/80 transition hover:bg-white/5"
                    aria-label={t('supportTickets.attach')}
                    title={t('supportTickets.attach')}
                  >
                    <AttachIcon />
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !canSend}
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
