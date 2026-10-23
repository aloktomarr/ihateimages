import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from './icons';
import { LogoMark, Wordmark } from './Logo';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES, TOOLS, toolForPath, type ToolMeta } from '../lib/tools';
import { prefetchRoute } from '../lib/routes';
import { modKeyLabel, openPalette } from '../lib/palette';

const PAGES: [string, string][] = [
  ['/convert', 'Convert'],
  ['/integrations', 'Integrations'],
  ['/blog', 'Blog'],
];

function ToolLink({ tool, onPick, compact = false }: { tool: ToolMeta; onPick?: () => void; compact?: boolean }) {
  return (
    <NavLink
      to={tool.path}
      onMouseEnter={() => prefetchRoute(tool.path)}
      onFocus={() => prefetchRoute(tool.path)}
      onClick={onPick}
      className={({ isActive }) =>
        `group flex items-start gap-3 rounded-xl p-2.5 transition ${isActive ? 'bg-subtle' : 'hover:bg-subtle'}`
      }
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-line bg-surface text-fg transition group-hover:border-transparent group-hover:bg-ink group-hover:text-ink-fg">
        <Icon name={tool.icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 pt-px">
        <span className="block text-[14px] font-semibold leading-tight text-fg">{tool.title}</span>
        {!compact && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{tool.blurb}</span>}
      </span>
    </NavLink>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const activeTool = !!toolForPath(pathname) && !pathname.startsWith('/convert');

  useEffect(() => setOpen(false), [pathname]);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex h-9 items-center gap-1 rounded-full px-3.5 text-[14px] font-medium transition ${
          open || activeTool ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle hover:text-fg'
        }`}
      >
        Tools
        <Icon name="chevronDown" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[780px] animate-scale-in rounded-2xl border border-line bg-surface p-3 shadow-float">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <p className="px-2.5 pb-1 pt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
                  {cat.title}
                </p>
                {TOOLS.filter((t) => t.category === cat.id).map((t) => (
                  <ToolLink key={t.slug} tool={t} onPick={() => setOpen(false)} />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-subtle px-4 py-3 text-[13px]">
            <span className="text-muted">
              <span className="font-semibold text-fg">Not sure which one?</span> Drop an image anywhere and we&rsquo;ll
              suggest a tool.
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openPalette();
              }}
              className="flex shrink-0 items-center gap-1.5 font-semibold text-fg"
            >
              Search <span className="kbd">{modKeyLabel()} K</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Portalled to <body>: the header's backdrop-filter would otherwise trap this fixed sheet.
  return createPortal(
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-in overflow-y-auto bg-app lg:hidden">
      <div className="container-page space-y-6 pb-16 pt-4">
        <button
          type="button"
          onClick={() => {
            onClose();
            openPalette();
          }}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 text-left text-[15px] text-muted"
        >
          <Icon name="search" className="h-5 w-5" />
          Search tools and tasks
        </button>
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="eyebrow mb-1 px-2.5">{cat.title}</p>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
              {TOOLS.filter((t) => t.category === cat.id).map((t) => (
                <ToolLink key={t.slug} tool={t} onPick={onClose} />
              ))}
            </div>
          </div>
        ))}
        <div className="border-t border-line pt-4">
          {[['/', 'Home'], ...PAGES, ['/about', 'About'], ['/privacy', 'Privacy']].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-2.5 py-3 text-[16px] font-semibold ${
                  isActive ? 'text-fg' : 'text-muted'
                }`
              }
            >
              {label}
              <Icon name="chevronRight" className="h-4 w-4 text-faint" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={`nav-blur sticky top-0 z-50 border-b transition-colors ${
        scrolled || menuOpen ? 'border-line' : 'border-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center gap-2">
        <Link to="/" className="mr-3 flex shrink-0 items-center gap-2.5" aria-label="iHateImages home">
          <LogoMark className="h-8 w-8" />
          <Wordmark className="text-[17px]" />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          <ToolsMenu />
          {PAGES.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => prefetchRoute(to)}
              className={({ isActive }) =>
                `flex h-9 items-center rounded-full px-3.5 text-[14px] font-medium transition ${
                  isActive ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle hover:text-fg'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            className="mr-1 hidden h-9 w-60 items-center gap-2.5 rounded-full border border-line bg-surface pl-3.5 pr-1.5 text-[13.5px] text-faint shadow-soft transition hover:border-line-strong hover:text-muted md:flex"
          >
            <Icon name="search" className="h-4 w-4" />
            <span className="flex-1 text-left">Search tools&hellip;</span>
            <span className="kbd">{modKeyLabel()} K</span>
          </button>
          <button type="button" onClick={openPalette} className="icon-btn md:hidden" aria-label="Search">
            <Icon name="search" className="h-[18px] w-[18px]" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="icon-btn lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </div>
      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  );
}
