import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { notificationApi, type InternalMessage } from '@/api/notification.api';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

export function NotificationsPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationApi
      .getMessages()
      .then((data) => setMessages(data.items))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="py-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('messages.title')}</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">
            {t('messages.unread', { count: unreadCount })}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-muted">{t('common.loadingMessages')}</p>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-surface p-8 text-center">
          <p className="text-muted">{t('messages.noMessages')}</p>
          <p className="mt-2 text-xs text-muted">{t('messages.noMessagesHint')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id;

            return (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    msg.is_read
                      ? 'border-white/5 bg-surface hover:bg-card'
                      : 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${msg.is_read ? 'text-white' : 'text-accent-gold'}`}>
                        {!msg.is_read && (
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
                        )}
                        {msg.subject}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : '—'}
                      </p>
                    </div>
                    <span className="text-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                  {isExpanded && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-muted border-t border-white/5 pt-3">
                      {msg.body}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
