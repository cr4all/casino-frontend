import type { ReactNode, SVGProps } from 'react';

export type NavIconName =
  | 'home'
  | 'deposit'
  | 'withdraw'
  | 'transactions'
  | 'notices'
  | 'bonus'
  | 'liveChat';

interface NavIconProps extends SVGProps<SVGSVGElement> {
  name: NavIconName;
}

function IconBase({ children, className = 'h-5 w-5', ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

const icons: Record<NavIconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  deposit: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  withdraw: (
    <>
      <path d="M12 3v10" />
      <path d="m8 7 4-4 4 4" />
      <path d="M4 19h16" />
      <path d="M6 19v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </>
  ),
  transactions: (
    <>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </>
  ),
  notices: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  bonus: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M12 8c-1.5-2.5-4.5-2.5-4.5 0S10.5 8 12 8s4.5-2.5 4.5 0S13.5 8 12 8Z" />
    </>
  ),
  liveChat: (
    <>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </>
  ),
};

export function NavIcon({ name, className = 'h-5 w-5', ...props }: NavIconProps) {
  return (
    <IconBase className={className} {...props}>
      {icons[name]}
    </IconBase>
  );
}

export const sidebarIconClassName =
  'h-5 w-5 shrink-0 opacity-75 transition-opacity group-hover:opacity-100 [.sidebar-active_&]:opacity-100';

/** Sidebar game-type `<img>` icons: white when idle, original gold SVG when `.sidebar-active`. */
export const sidebarGameIconClassName = `${sidebarIconClassName} object-contain brightness-0 invert transition-[filter,opacity] [.sidebar-active_&]:brightness-100 [.sidebar-active_&]:invert-0`;
