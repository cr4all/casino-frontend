import { Fragment, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLiveChat, useLiveChatConfig } from '@/hooks/useLiveChat';
import { useTranslation } from '@/hooks/useTranslation';
import { useUiStore } from '@/stores/uiStore';
import { formatChatDateLabel, getChatDateKey } from '@/utils/formatDateTime';

function formatTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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

export function LiveChatPanel() {
  const { t, language } = useTranslation();
  const { nativeEnabled } = useLiveChatConfig();
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);
  const openModal = useUiStore((s) => s.openModal);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { messages, loading, sending, error, sendMessage } = useLiveChat(liveChatOpen);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const adjustInputHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    adjustInputHeight();
  }, [draft, liveChatOpen]);

  useEffect(() => {
    if (!liveChatOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [liveChatOpen, messages]);

  if (!nativeEnabled || !liveChatOpen) return null;

  const submitDraft = async () => {
    if (!draft.trim() || sending) return;

    if (!isAuthenticated) {
      openModal('login');
      return;
    }

    const ok = await sendMessage(draft);
    if (ok) {
      setDraft('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitDraft();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitDraft();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-[#12121a] shadow-2xl lg:top-[var(--header-height,0px)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">{t('liveChat.title')}</p>
          <p className="text-xs text-muted">{t('liveChat.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={closeLiveChat}
          className="rounded-md px-2 py-1 text-lg text-muted transition hover:bg-white/5 hover:text-white"
          aria-label={t('common.close')}
        >
          ×
        </button>
      </div>

      <div ref={scrollRef} className="scrollbar-dark flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
        {!isAuthenticated ? (
          <div className="rounded-lg border border-white/10 bg-card/40 p-4 text-sm text-muted">
            {t('liveChat.loginRequired')}
          </div>
        ) : loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : messages.length === 0 ? (
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

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
        {error && (
          <p className="mb-2 text-xs text-red-400">
            {error === 'send_failed' ? t('liveChat.sendFailed') : t('liveChat.loadFailed')}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={t('liveChat.placeholder')}
            maxLength={2000}
            rows={1}
            className="min-h-10 flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-background px-3 py-2 text-sm leading-5 text-white outline-none focus:border-accent-gold/50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="h-10 shrink-0 rounded-lg bg-accent-gold px-4 text-sm font-semibold text-black transition enabled:hover:brightness-110 disabled:opacity-50"
          >
            {t('liveChat.send')}
          </button>
        </div>
      </form>
    </div>
  );
}
