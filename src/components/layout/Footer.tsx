import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Casino</h4>
            <ul className="space-y-2">
              <li><Link to="/category/slots" className="text-xs text-muted hover:text-white transition-colors">Slots</Link></li>
              <li><Link to="/category/live" className="text-xs text-muted hover:text-white transition-colors">Live Casino</Link></li>
              <li><Link to="/category/jackpots" className="text-xs text-muted hover:text-white transition-colors">Jackpots</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/deposit" className="text-xs text-muted hover:text-white transition-colors">Deposit</Link></li>
              <li><Link to="/withdraw" className="text-xs text-muted hover:text-white transition-colors">Withdraw</Link></li>
              <li><Link to="/bonus" className="text-xs text-muted hover:text-white transition-colors">Bonuses</Link></li>
              <li><Link to="/transactions" className="text-xs text-muted hover:text-white transition-colors">Transactions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/notifications" className="text-xs text-muted hover:text-white transition-colors">Messages</Link></li>
              <li><a href="mailto:support@casino.local" className="text-xs text-muted hover:text-white transition-colors">support@casino.local</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-xs text-muted">Terms & Conditions</span></li>
              <li><span className="text-xs text-muted">Privacy Policy</span></li>
              <li><span className="text-xs text-muted">Responsible Gaming</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-muted">
            18+ | Play responsibly. Gambling can be addictive.
          </p>
          <p className="mt-2 text-xs text-muted/60">
            © {new Date().getFullYear()} Casino Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
