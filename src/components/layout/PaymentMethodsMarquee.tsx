import { PAYMENT_MARQUEE_LOGOS, TRUST_BADGES } from '@/data/paymentMarqueeLogos';

function PaymentCard({ logo }: { logo: (typeof PAYMENT_MARQUEE_LOGOS)[number] }) {
  return (
    <div className="payment-marquee-card">
      <div className="payment-marquee-logo-frame">
        <img src={logo.src} alt={logo.label} className="payment-marquee-logo" loading="lazy" />
      </div>
    </div>
  );
}

export function PaymentMethodsMarquee() {
  const items = [...PAYMENT_MARQUEE_LOGOS, ...PAYMENT_MARQUEE_LOGOS];

  return (
    <section className="payment-footer" aria-label="Payment methods and trust badges">
      <div className="payment-footer__inner">
        <div className="payment-trust-badges">
          {TRUST_BADGES.map((badge) => (
            <img
              key={badge.id}
              src={badge.src}
              alt={badge.label}
              className="payment-trust-badge"
              style={{ width: badge.width }}
              loading="lazy"
            />
          ))}
        </div>

        <div className="payment-marquee">
          <div className="payment-marquee-track payment-marquee-track--animate">
            {items.map((logo, index) => (
              <PaymentCard key={`${logo.id}-${index}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
