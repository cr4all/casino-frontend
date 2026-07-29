import type { LegalContentBundle } from './types';

export const legalEn: LegalContentBundle = {
  about: {
    title: 'About iBets24',
    intro:
      'iBets24 is an online casino platform offering slots, live dealer games, and secure payment options for players worldwide. We focus on fair play, fast payouts, and responsive customer support.',
    sections: [
      {
        title: 'Our mission',
        paragraphs: [
          'We provide a safe, entertaining gaming environment with transparent rules and responsible gaming tools.',
          'Our catalogue is supplied by licensed game providers and is updated regularly with new titles and promotions.',
        ],
      },
      {
        title: 'Licence & compliance',
        paragraphs: [
          'iBets24 operates in accordance with applicable gaming regulations in the jurisdictions where our services are offered.',
          'We apply age verification, anti-money laundering controls, and data protection standards across all products.',
        ],
      },
      {
        title: 'Customer support',
        paragraphs: [
          'Our support team is available via live chat and email at support@ibets24.com.',
          'For account, payment, or bonus questions, please contact us before submitting duplicate requests.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro:
      'These Terms & Conditions govern your use of iBets24. By registering or using our services, you agree to these terms.',
    sections: [
      {
        title: 'Eligibility',
        paragraphs: [
          'You must be at least 18 years old (or the legal age in your jurisdiction) to open an account.',
          'You are responsible for ensuring that online gambling is legal in your country of residence.',
        ],
      },
      {
        title: 'Account',
        paragraphs: [
          'Each player may hold only one account. Shared, duplicate, or fraudulent accounts may be closed and balances forfeited.',
          'You must provide accurate registration details and keep your login credentials secure.',
        ],
      },
      {
        title: 'Deposits & withdrawals',
        paragraphs: [
          'Deposits and withdrawals are processed using the payment methods displayed in the cashier.',
          'We may request identity or payment verification before releasing withdrawals.',
        ],
      },
      {
        title: 'Bonuses & promotions',
        paragraphs: [
          'Bonuses are subject to individual promotion terms including wagering requirements and expiry dates.',
          'Abuse of promotions, including bonus hunting or coordinated play, may result in bonus cancellation.',
        ],
      },
      {
        title: 'Limitation of liability',
        paragraphs: [
          'iBets24 is not liable for losses arising from connectivity issues, third-party provider outages, or force majeure events.',
          'We reserve the right to amend these terms. Material changes will be published on this page.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This Privacy Policy explains how iBets24 collects, uses, and protects your personal information.',
    sections: [
      {
        title: 'Information we collect',
        paragraphs: [
          'We collect registration data (email, phone, country), transaction history, gameplay activity, and technical logs (IP address, device, browser).',
          'Verification documents may be collected when required by law or for security reviews.',
        ],
      },
      {
        title: 'How we use data',
        paragraphs: [
          'Data is used to operate your account, process payments, prevent fraud, provide support, and comply with legal obligations.',
          'With your consent, we may send promotional communications which you can opt out of at any time.',
        ],
      },
      {
        title: 'Cookies',
        paragraphs: [
          'We use cookies for session management, language preferences, analytics, and optional live chat. See our Cookie Policy for details.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'Depending on your jurisdiction, you may request access, correction, or deletion of personal data by contacting support@ibets24.com.',
        ],
      },
    ],
  },
  responsibleGaming: {
    title: 'Responsible Gaming',
    intro:
      'Gambling should be entertainment, not a way to make money. iBets24 promotes responsible play and provides tools to help you stay in control.',
    sections: [
      {
        title: 'Play responsibly',
        paragraphs: [
          'Set a budget before you play and never chase losses.',
          'Do not gamble when under the influence of alcohol or if you are upset or stressed.',
        ],
      },
      {
        title: 'Self-control tools',
        paragraphs: [
          'Contact support to request deposit limits, cooling-off periods, or self-exclusion.',
          'You may close your account at any time by contacting customer support.',
        ],
      },
      {
        title: 'Underage gambling',
        paragraphs: [
          'Our services are strictly for adults. We use verification measures to prevent underage access.',
        ],
      },
      {
        title: 'Need help?',
        paragraphs: [
          'If you or someone you know has a gambling problem, contact a local helpline or organisation such as GamCare, Gamblers Anonymous, or BeGambleAware.',
        ],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    intro: 'Answers to common questions about iBets24 accounts, payments, and games.',
    sections: [
      {
        title: 'How do I register?',
        paragraphs: [
          'Click Register, complete the form with valid details, and confirm your email if required.',
        ],
      },
      {
        title: 'What do my withdrawal statuses mean?',
        paragraphs: [
          'Your withdrawal request may show one of the following statuses:',
          'requested — Your withdrawal request has been received and is waiting to be reviewed and processed.',
          'review — Your withdrawal request is under review by our team before approval.',
          'approved — Your withdrawal has been approved and is queued for payout.',
          'processing — Your withdrawal payout is currently being processed.',
          'completed — Your withdrawal has been successfully processed on our side, and the funds have been released to your selected bank account or wallet.',
          'rejected — Your withdrawal request was not approved. The held amount has been returned to your account balance.',
          'A "completed" status means the withdrawal was successfully processed and released from our side. Even after the status changes to "completed", funds may not appear in your bank account or wallet immediately while they move through the banking or payment network.',
          'If funds are still not received more than 24 hours after the status becomes "completed", please contact support for assistance.',
        ],
      },
      {
        title: 'How long do withdrawals take?',
        paragraphs: [
          'After approval, withdrawals are usually completed within a few seconds to a few minutes. In some cases, banking network delays or payment provider processes may take up to 24 hours.',
          'Processing times can also depend on the payment method and any verification required for your account.',
        ],
      },
      {
        title: 'What should I check before submitting a withdrawal?',
        paragraphs: [
          'Please carefully verify your bank account or wallet details before submitting a withdrawal request.',
          'Once a withdrawal has been successfully processed (completed), it may not be possible to reverse, modify, or recover the transaction if incorrect payment details were provided.',
          'We strongly recommend double-checking all payment details before confirming your withdrawal request.',
        ],
      },
      {
        title: 'What are the withdrawal limits based on verification?',
        paragraphs: [
          'Withdrawal limits depend on your account verification level. At least one of email verification, phone verification, or KYC is required to withdraw.',
          'Email verified — Maximum withdrawal: {{email_verified_limit}} (wallet currency).',
          'Phone verified — Maximum withdrawal: {{phone_verified_limit}} (wallet currency).',
          'Email and phone both verified (without KYC) — The limits are combined (up to {{combined_verified_limit}}).',
          'KYC completed — No withdrawal limit.',
          'You can complete verification from your profile to increase or remove your withdrawal limit.',
        ],
      },
      {
        title: 'Are the games fair?',
        paragraphs: [
          'Games are supplied by licensed providers and use certified random number generators (RNG) or live dealer studios.',
        ],
      },
      {
        title: 'How do I contact support?',
        paragraphs: [
          'Use Live Chat in the sidebar or email support@ibets24.com. Include your registered email for faster assistance.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro: 'We are here to help with account, payment, and technical questions.',
    sections: [
      {
        title: 'Support channels',
        paragraphs: [
          'Email: support@ibets24.com',
          'Live chat: available from the sidebar when signed in (subject to availability).',
        ],
      },
      {
        title: 'Response times',
        paragraphs: [
          'Live chat is the fastest option during business hours. Email enquiries are usually answered within 24 hours.',
        ],
      },
      {
        title: 'Complaints',
        paragraphs: [
          'If you are not satisfied with our response, describe your issue in detail and we will escalate internally.',
        ],
      },
    ],
  },
  partners: {
    title: 'Partners',
    intro:
      'iBets24 welcomes long-term partnerships with affiliates, media publishers, payment providers, game studios, and other B2B partners.',
    sections: [
      {
        title: 'Affiliate Program',
        paragraphs: [
          'Our affiliate program offers competitive commissions for referring new players who meet our eligibility and compliance requirements.',
          'Existing affiliates can access performance stats and payouts from the Affiliate Portal after signing in.',
          'To apply or request affiliate terms, email partners@ibets24.com with your traffic sources, target markets, and promotional methods.',
        ],
      },
      {
        title: 'Business Partnerships',
        paragraphs: [
          'We collaborate with licensed game providers, payment solution partners, marketing agencies, and technology vendors that share our standards for fairness, security, and responsible gaming.',
          'Send partnership proposals to partners@ibets24.com including company details, product overview, and proposed commercial model.',
        ],
      },
      {
        title: 'How to get in touch',
        paragraphs: [
          'Business and partnership enquiries: partners@ibets24.com',
          'Player support (accounts, payments, bonuses): support@ibets24.com',
          'Please do not use the partners inbox for player account issues — those requests are handled by customer support.',
        ],
      },
    ],
  },
  aml: {
    title: 'AML Policy',
    intro:
      'iBets24 maintains anti-money laundering (AML) and counter-terrorist financing procedures in line with applicable regulations.',
    sections: [
      {
        title: 'Customer due diligence',
        paragraphs: [
          'We verify customer identity and monitor transactions for unusual patterns.',
          'Enhanced due diligence may apply to high-risk jurisdictions or large transactions.',
        ],
      },
      {
        title: 'Reporting',
        paragraphs: [
          'Suspicious activity may be reported to relevant authorities as required by law.',
        ],
      },
      {
        title: 'Cooperation',
        paragraphs: [
          'Players must cooperate with verification requests. Failure to provide documents may result in account restrictions.',
        ],
      },
    ],
  },
};
