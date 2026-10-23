import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './icons';
import { TOOLS } from '../lib/tools';
import { RECIPES } from '../lib/recipes';
import { CONVERSIONS } from '../lib/landing';
import { onOpenPalette } from '../lib/palette';
import { prefetchRoute } from '../lib/routes';
import { useTheme } from '../theme';

interface Item {
  id: string;
  section: string;
  title: string;
  hint?: string;
  icon: IconName;
  terms: string;
  /** Route to warm on hover, when the item navigates. */
  to?: string;
  run: () => void;
}

const SECTION_ORDER = ['Tools', 'Shortcuts', 'Conversions', 'Pages', 'Settings'];

// Search everything (tools, task shortcuts, conversions, pages) from the keyboard.
// Opens with Cmd/Ctrl+K or "/" anywhere, or from the search button in the header.
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => onOpenPalette(() => setOpen(true)), []);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
        restoreFocus.current?.focus?.();
      };
    }
  }, [open]);

  const go = (to: string) => () => navigate(to);

  const items: Item[] = useMemo(
    () => [
      ...TOOLS.map((t) => ({
        id: `tool-${t.slug}`,
        section: 'Tools',
        title: t.title,
        hint: t.blurb,
        icon: t.icon,
        terms: [t.title, t.blurb, ...t.keywords].join(' '),
        to: t.path,
        run: go(t.path),
      })),
      ...RECIPES.map((r) => ({
        id: `recipe-${r.to}`,
        section: 'Shortcuts',
        title: r.title,
        hint: r.blurb,
        icon: r.icon,
        terms: `${r.title} ${r.blurb}`,
        run: go(r.to),
      })),
      ...CONVERSIONS.map((c) => ({
        id: `conv-${c.slug}`,
        section: 'Conversions',
        title: `${c.fromLabel} to ${c.toLabel}`,
        icon: 'convert' as IconName,
        terms: `${c.fromLabel} to ${c.toLabel} ${c.from} ${c.to} convert`,
        run: go(c.path),
      })),
      ...(
        [
          ['Home', '/', 'home'],
          ['Integrations', '/integrations', 'link'],
          ['Blog', '/blog', 'pdf'],
          ['About', '/about', 'heart'],
          ['Privacy', '/privacy', 'lock'],
        ] as [string, string, IconName][]
      ).map(([title, to, icon]) => ({
        id: `page-${to}`,
        section: 'Pages',
        title,
        icon,
        terms: title,
        run: go(to),
      })),
      {
        id: 'theme',
        section: 'Settings',
        title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        icon: (theme === 'dark' ? 'sun' : 'moon') as IconName,
        terms: 'theme dark light mode appearance',
        run: toggle,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.section !== 'Conversions' || i.id.includes('heic-to-jpg'));
    const words = q.split(/\s+/);
    return items
      .filter((i) => {
        const hay = i.terms.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .map((i) => {
        const t = i.title.toLowerCase();
        return { i, score: t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2 };
      })
      .sort(
        (a, b) =>
          a.score - b.score ||
          SECTION_ORDER.indexOf(a.i.section) - SECTION_ORDER.indexOf(b.i.section),
      )
      .map((r) => r.i);
  }, [items, query]);

  // With a query, results are ranked; without one they are grouped. Either way, render in order.
  const grouped = useMemo(() => {
    if (query.trim()) return [{ section: 'Results', items: results }];
    return SECTION_ORDER.map((s) => ({ section: s, items: results.filter((r) => r.section === s) })).filter(
      (g) => g.items.length,
    );
  }, [results, query]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const choose = (item?: Item) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  let index = -1;

  return (
    <div className="fixed inset-0 z-[70]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-float"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, tasks and conversions"
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-fg outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={flat[active] ? `palette-${flat[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={() => setOpen(false)} className="kbd" aria-label="Close">
            Esc
          </button>
        </div>

        <div ref={listRef} id="palette-list" role="listbox" className="max-h-[min(60vh,480px)] overflow-y-auto p-2">
          {flat.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-muted">
              Nothing matches &ldquo;{query}&rdquo;. Try &ldquo;heic&rdquo;, &ldquo;pdf&rdquo; or &ldquo;100 kb&rdquo;.
            </p>
          )}
          {grouped.map((g) => (
            <div key={g.section} className="mb-1">
              <p className="px-3 pb-1 pt-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
                {g.section}
              </p>
              {g.items.map((item) => {
                index += 1;
                const i = index;
                const isActive = i === active;
                return (
                  <div
                    key={item.id}
                    id={`palette-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    data-index={i}
                    onMouseMove={() => setActive(i)}
                    onMouseEnter={() => item.to && prefetchRoute(item.to)}
                    onClick={() => choose(item)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${
                      isActive ? 'bg-subtle' : ''
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                        isActive ? 'border-transparent bg-ink text-ink-fg' : 'border-line bg-surface text-muted'
                      }`}
                    >
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-fg">{item.title}</span>
                      {item.hint && <span className="block truncate text-[12.5px] text-muted">{item.hint}</span>}
                    </span>
                    {isActive && <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-muted" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> to move <span className="kbd ml-2">↵</span> to open
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Icon name="lock" className="h-3.5 w-3.5" /> Nothing leaves your device
          </span>
        </div>
      </div>
    </div>
  );
}
