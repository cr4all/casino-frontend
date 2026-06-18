import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLiveChat, useLiveChatConfig } from '@/hooks/useLiveChat';
import { useTranslation } from '@/hooks/useTranslation';
import { useUiStore } from '@/stores/uiStore';

function formatTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function LiveChatPanel() {
  const { t } = useTranslation();
  const { nativeEnabled } = useLiveChatConfig();
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);
  const openModal = useUiStore((s) => s.openModal);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { messages, loading, sending, error, sendMessage } = useLiveChat(liveChatOpen);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!liveChatOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [liveChatOpen, messages]);

  if (!nativeEnabled || !liveChatOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      openModal('login');
      return;
    }

    const ok = await sendMessage(draft);
    if (ok) {
      setDraft('');
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

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!isAuthenticated ? (
          <div className="rounded-lg border border-white/10 bg-card/40 p-4 text-sm text-muted">
            {t('liveChat.loginRequired')}
          </div>
        ) : loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted">{t('liveChat.empty')}</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.sender_type === 'admin'
                  ? 'ml-auto bg-accent-gold/15 text-white'
                  : 'bg-card/80 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              <p className="mt-1 text-[10px] text-muted">{formatTime(message.created_at)}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
        {error && (
          <p className="mb-2 text-xs text-red-400">
            {error === 'send_failed' ? t('liveChat.sendFailed') : t('liveChat.loadFailed')}
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('liveChat.placeholder')}
            maxLength={2000}
            rows={3}
            className="min-h-[72px] flex-1 resize-none rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white outline-none focus:border-accent-gold/50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="self-end rounded-lg bg-accent-gold px-4 py-2 text-sm font-semibold text-black transition enabled:hover:brightness-110 disabled:opacity-50"
          >
            {t('liveChat.send')}
          </button>
        </div>
      </form>
    </div>
  );
}
