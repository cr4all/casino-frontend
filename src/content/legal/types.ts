export type LegalPageId =
  | 'about'
  | 'terms'
  | 'privacy'
  | 'responsibleGaming'
  | 'faq'
  | 'contact'
  | 'partners'
  | 'aml'
  | 'kyc';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalPageContent {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalContentBundle = Record<LegalPageId, LegalPageContent>;
