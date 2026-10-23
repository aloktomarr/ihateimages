import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './icons';
import { TOOLS, toolForPath } from '../lib/tools';
import { prefetchRoute } from '../lib/routes';

// Shared building blocks for the content below each tool and on the marketing pages.

export function SectionHeader({
  eyebrow,
  title,
  accent,
  lead,
  center = false,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  /** Words set in the italic serif after the title. */
  accent?: string;
  lead?: ReactNode;
  center?: boolean;
  /** Optional action on the right (left-aligned layout only). */
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-6 ${center ? 'text-center' : ''}`}>
      <div className={center ? 'mx-auto max-w-3xl' : 'max-w-3xl'}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display text-display-md">
          {title}
          {accent && (
            <>
              {' '}
              <span className="serif-accent text-muted">{accent}</span>
            </>
          )}
        </h2>
        {lead && <p className={`lead mt-5 ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{lead}</p>}
      </div>
      {children}
    </div>
  );
}

/** The opening block of a content page (About, Privacy, Blog...). */
export function PageHeader({
  eyebrow,
  title,
  accent,
  lead,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="max-w-4xl pb-12 pt-12 sm:pb-16 sm:pt-20">
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h1 className="display text-display-lg">
        {title}
        {accent && (
          <>
            {' '}
            <span className="serif-accent text-muted">{accent}</span>
          </>
        )}
      </h1>
      {lead && <p className="lead mt-6 max-w-2xl">{lead}</p>}
      {children}
    </header>
  );
}

export function StepCards({ steps }: { steps: { name: string; text: string }[] }) {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.name} className="card relative overflow-hidden p-6">
          <span className="display block text-[3.25rem] leading-none text-fg/[0.08]">0{i + 1}</span>
          <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.02em] text-fg">{s.name}</h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] font-semibold tracking-[-0.015em] text-fg [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45 group-open:border-transparent group-open:bg-ink group-open:text-ink-fg">
              <Icon name="plus" className="h-4 w-4" />
            </span>
          </summary>
          <p className="-mt-1 max-w-2xl pb-6 pr-12 text-[15px] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** FAQ with the heading on the left and the questions on the right (stacks on mobile). */
export function FaqSection({ items, title = 'Questions,', accent = 'answered.' }: { items: { q: string; a: string }[]; title?: string; accent?: string }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
      <div>
        <h2 className="display text-display-md">
          {title} <span className="serif-accent text-muted">{accent}</span>
        </h2>
        <p className="mt-5 max-w-xs text-[15px] text-muted">
          Something else?{' '}
          <a
            href="https://github.com/aloktomarr/ihateimages/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Ask on GitHub
          </a>
          .
        </p>
      </div>
      <FaqList items={items} />
    </section>
  );
}

/** A row of other tools, nearest category first. */
export function RelatedTools({ path, title = 'More tools' }: { path: string; title?: string }) {
  const current = toolForPath(path);
  const others = TOOLS.filter((t) => t.path !== current?.path);
  const sorted = [
    ...others.filter((t) => t.category === current?.category),
    ...others.filter((t) => t.category !== current?.category),
  ].slice(0, 4);

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="display text-display-sm">{title}</h2>
        <Link to="/#tools" className="btn btn-ghost btn-sm -mr-3">
          All tools <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((t) => (
          <Link
            key={t.slug}
            to={t.path}
            onMouseEnter={() => prefetchRoute(t.path)}
            className="card-link group flex flex-col p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-subtle text-fg transition group-hover:bg-ink group-hover:text-ink-fg">
              <Icon name={t.icon} className="h-5 w-5" />
            </span>
            <span className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-fg">{t.title}</span>
            <span className="mt-1 text-[13.5px] leading-snug text-muted">{t.blurb}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
