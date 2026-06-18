import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

export function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="secondary" onClick={copy}>
      {copied ? t('common.copied') : t('common.copy')}
    </Button>
  );
}
