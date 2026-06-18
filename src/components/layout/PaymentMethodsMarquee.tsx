import { PAYMENT_MARQUEE_LOGOS, TRUST_BADGES } from '@/data/paymentMarqueeLogos';

function PaymentCard({ logo }: { logo: (typeof PAYMENT_MARQUEE_LOGOS)[number] }) {
  return (
    <div className="payment-marquee-card">
      <img
        src={logo.src}
        alt={logo.label}
        className="payment-marquee-logo"
        style={logo.width ? { width: logo.width } : undefined}
        loading="lazy"
      />
    </div>
  );
}

export function PaymentMethodsMarquee() {
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

        <div className="payment-methods-grid">
          {PAYMENT_MARQUEE_LOGOS.map((logo) => (
            <PaymentCard key={logo.id} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
