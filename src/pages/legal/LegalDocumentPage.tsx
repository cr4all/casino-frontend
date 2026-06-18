import { Link } from 'react-router-dom';
import { getLegalPageContent, type LegalPageId } from '@/content/legal';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/stores/languageStore';

interface LegalDocumentPageProps {
  pageId: LegalPageId;
}

export function LegalDocumentPage({ pageId }: LegalDocumentPageProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const content = getLegalPageContent(language, pageId);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-3 text-2xl font-bold text-white">{content.title}</h1>
      <p className="mb-8 text-sm leading-relaxed text-muted">{content.intro}</p>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-white">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-white/10 pt-6">
        <Link to="/" className="text-sm text-accent-gold hover:underline">
          {t('legal.backHome')}
        </Link>
      </div>
    </div>
  );
}
