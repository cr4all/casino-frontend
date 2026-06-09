import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/common/Button';

export function HeroBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/[0.08] hero-glow">
      <div className="relative flex min-h-[180px] items-center px-6 py-8 md:min-h-[220px] md:px-10">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <div className="relative h-32 w-48">
            <span className="absolute right-0 top-0 text-5xl opacity-80">🃏</span>
            <span className="absolute right-12 top-8 text-4xl opacity-70">🎲</span>
            <span className="absolute right-4 bottom-0 text-4xl opacity-60">🪙</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-xl font-bold uppercase leading-tight tracking-wide text-white md:text-2xl lg:text-3xl">
            Welcome to{' '}
            <span className="text-accent-gold">Casino24</span>
            <br />
            Best Experience
          </h1>
          <Link to={isAuthenticated ? '/category/live' : '/category/slots'}>
            <Button variant="gold" className="mt-5 rounded-lg px-8 py-2.5 text-sm font-bold uppercase tracking-wide">
              Play Now &gt;
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
