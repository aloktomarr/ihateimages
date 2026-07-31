import { Link, NavLink } from 'react-router-dom';
import { Icon, type IconName } from './icons';
import ThemeToggle from './ThemeToggle';
import { TOOLS } from '../lib/tools';
import { prefetchRoute } from '../lib/routes';

// Shorter labels keep the horizontal bar tidy once every tool is live.
const SHORT: Record<string, string> = {
  '/strip-metadata': 'Metadata',
  '/background-remover': 'Background',
  '/favicon': 'Favicon',
  '/passport-photo': 'Passport',
};

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  ...TOOLS.filter((t) => t.live).map((t) => ({
    to: t.path,
    label: SHORT[t.path] ?? t.title,
    icon: t.icon,
  })),
];

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

          <nav className="no-scrollbar ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            {NAV.map((n) => (
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
          </nav>

          <div className="ml-auto shrink-0 md:ml-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: horizontally scrollable pill nav */}
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {NAV.map((n) => (
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
