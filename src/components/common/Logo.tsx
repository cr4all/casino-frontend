import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  height?: number;
  onClick?: () => void;
}

export function Logo({ className = '', height = 32, onClick }: LogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`inline-flex items-center ${className}`}
      aria-label="iBets24"
    >
      <img
        src="/logo.png"
        alt="iBets24"
        height={height}
        className="h-auto w-auto object-contain"
        style={{ height }}
      />
    </Link>
  );
}
