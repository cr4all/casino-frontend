import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { SupportAttachment } from '@/api/liveChat.api';
import { resolveAttachmentRequestUrl } from '@/utils/supportAttachmentUrl';

async function fetchAuthenticatedBlobUrl(url: string): Promise<string> {
  const requestUrl = resolveAttachmentRequestUrl(url);
  const { data } = await api.get<Blob>(requestUrl, { responseType: 'blob' });
  return URL.createObjectURL(data);
}

function AuthenticatedImage({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let blobUrl: string | null = null;
    let active = true;

    fetchAuthenticatedBlobUrl(url)
      .then((objectUrl) => {
        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        blobUrl = objectUrl;
        setSrc(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  if (failed) {
    return <span className="text-xs text-white/60">{alt}</span>;
  }

  if (!src) {
    return <div className="h-24 w-36 animate-pulse rounded-lg bg-white/10" />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

function AuthenticatedFileLink({
  url,
  name,
}: {
  url: string;
  name: string;
}) {
  const [loading, setLoading] = useState(false);

  const openFile = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const blobUrl = await fetchAuthenticatedBlobUrl(url);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      // Ignore — link stays inert on failure.
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void openFile()}
      disabled={loading}
      className="text-left text-xs text-accent-gold underline disabled:opacity-50"
    >
      {name}
    </button>
  );
}

export function MessageAttachments({ attachments }: { attachments?: SupportAttachment[] }) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-1 flex flex-col gap-1">
      {attachments.map((attachment) =>
        attachment.mime_type.startsWith('image/') ? (
          <AuthenticatedImage
            key={attachment.id}
            url={attachment.url}
            alt={attachment.original_name}
            className="max-w-[180px] rounded-lg"
          />
        ) : (
          <AuthenticatedFileLink
            key={attachment.id}
            url={attachment.url}
            name={attachment.original_name}
          />
        ),
      )}
    </div>
  );
}
