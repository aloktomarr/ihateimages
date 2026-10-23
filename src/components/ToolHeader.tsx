import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons';
import { toolForPath } from '../lib/tools';

// The title block at the top of every tool: breadcrumb, icon, big title and the promises.
export default function ToolHeader({ title, description }: { title: string; description: string }) {
  const { pathname } = useLocation();
  const tool = toolForPath(pathname);

  return (
    <header className="pb-8 pt-8 sm:pb-10 sm:pt-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
        <Link to="/#tools" className="transition hover:text-fg">
          Tools
        </Link>
        <Icon name="chevronRight" className="h-3.5 w-3.5 text-faint" />
        <span className="text-fg">{tool?.title ?? title}</span>
      </nav>

      <div className="mt-6 flex items-start gap-4 sm:gap-5">
        {tool && (
          <span className="mt-1 hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-ink-fg shadow-lift sm:grid">
            <Icon name={tool.icon} className="h-7 w-7" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="display text-display-md">{title}</h1>
          <p className="lead mt-4 max-w-2xl">{description}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2 sm:pl-[4.75rem]">
        {[
          ['lock', 'On-device'],
          ['ban', 'No watermark'],
          ['bolt', 'Works offline'],
          ...(tool?.multiple ? [['infinity', 'Batch, no limits']] : []),
        ].map(([icon, label]) => (
          <li key={label} className="chip">
            <Icon name={icon as 'lock'} className="h-3.5 w-3.5" />
            {label}
          </li>
        ))}
      </ul>
    </header>
  );
}
