import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './icons';
import ThemeToggle from './ThemeToggle';
import { TOOLS } from '../lib/tools';
import { prefetchRoute } from '../lib/routes';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

// Shorter labels for the compact bar / mobile pills.
const SHORT: Record<string, string> = {
  '/strip-metadata': 'Metadata',
  '/background-remover': 'Background',
  '/favicon': 'Favicon',
  '/passport-photo': 'Passport',
  '/image-to-pdf': 'PDF',
  '/rotate': 'Rotate',
};

const shortLabel = (path: string, title: string) => SHORT[path] ?? title;
const live = TOOLS.filter((t) => t.live);

// A handful of high-traffic tools sit inline; the rest live under a "More" menu so the bar
// never overflows as tools are added.
const PRIMARY = new Set(['/compress', '/convert', '/resize', '/background-remover', '/crop']);

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  ...live
    .filter((t) => PRIMARY.has(t.path))
    .map((t) => ({ to: t.path, label: shortLabel(t.path, t.title), icon: t.icon })),
];
const MORE_NAV: NavItem[] = [
  ...live
    .filter((t) => !PRIMARY.has(t.path))
    .map((t) => ({ to: t.path, label: t.title, icon: t.icon })),
  { to: '/integrations', label: 'Integrations', icon: 'link' },
];
const ALL_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  ...live.map((t) => ({ to: t.path, label: shortLabel(t.path, t.title), icon: t.icon })),
  { to: '/integrations', label: 'Integrations', icon: 'link' },
];

function MoreMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Close when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeInMore = items.some((i) => i.to === pathname);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] transition ${
          activeInMore || open
            ? 'bg-hover font-semibold text-accent'
            : 'font-medium text-muted hover:bg-hover hover:text-fg'
        }`}
      >
        More
        <Icon name="chevronDown" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-2xl border border-line bg-app p-1.5 shadow-lg">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onMouseEnter={() => prefetchRoute(n.to)}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? 'bg-hover font-semibold text-accent' : 'text-fg hover:bg-hover'
                }`
              }
            >
              <Icon name={n.icon} className="h-4 w-4 shrink-0" />
              {n.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopNav() {
  return (
    <header className="nav-blur sticky top-0 z-40 border-b border-line">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <Link
            to="/"
            onMouseEnter={() => prefetchRoute('/')}
            className="flex shrink-0 items-center gap-2"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white">
              <Icon name="logo" className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              iHate<span className="text-accent">Images</span>
            </span>
          </Link>

          <nav className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onMouseEnter={() => prefetchRoute(n.to)}
                onFocus={() => prefetchRoute(n.to)}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[15px] transition ${
                    isActive
                      ? 'bg-hover font-semibold text-accent'
                      : 'font-medium text-muted hover:bg-hover hover:text-fg'
                  }`
                }
              >
                <Icon name={n.icon} className="h-4 w-4 shrink-0" />
                {n.label}
              </NavLink>
            ))}
            <MoreMenu items={MORE_NAV} />
          </nav>

          <div className="ml-auto shrink-0 lg:ml-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Compact / mobile: horizontally scrollable pill nav (all tools) */}
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
          {ALL_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onTouchStart={() => prefetchRoute(n.to)}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                  isActive ? 'bg-accent font-semibold text-white' : 'text-fg hover:bg-hover'
                }`
              }
            >
              <Icon name={n.icon} className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
