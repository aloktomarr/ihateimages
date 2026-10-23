import { Link } from 'react-router-dom';
import { Icon } from './icons';
import { LogoMark, Wordmark } from './Logo';
import ProductHuntBadge from './ProductHuntBadge';
import { CATEGORIES, TOOLS } from '../lib/tools';
import { prefetchRoute } from '../lib/routes';

const YEAR = new Date().getFullYear();

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link
              to={to}
              onMouseEnter={() => prefetchRoute(to)}
              className="text-[14px] text-muted transition hover:text-fg"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-28 overflow-hidden border-t border-line">
      <div className="container-page pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <Wordmark className="text-[17px]" />
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Free image tools that run entirely in your browser. No upload, no watermark, no sign-up.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-pop ring-2 ring-pop/30" />
              0 bytes uploaded, ever
            </p>
          </div>

          {CATEGORIES.map((cat) => (
            <FooterCol
              key={cat.id}
              title={cat.title}
              links={TOOLS.filter((t) => t.category === cat.id).map((t) => [t.title, t.path])}
            />
          ))}
          <FooterCol
            title="Company"
            links={[
              ['About', '/about'],
              ['Blog', '/blog'],
              ['Integrations', '/integrations'],
              ['Privacy', '/privacy'],
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line py-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {YEAR} iHateImages. Your images never leave your device.{' '}
            <a
              href="https://x.com/AlokTom19637918"
              target="_blank"
              rel="me noopener noreferrer"
              className="font-medium text-fg transition hover:underline"
            >
              Built by Alok Tomar
            </a>
            .
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/aloktomarr/ihateimages"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="Source code on GitHub"
            >
              <Icon name="github" className="h-[18px] w-[18px]" />
            </a>
            <ProductHuntBadge />
          </div>
        </div>
      </div>

      <div aria-hidden className="container-page select-none">
        <p className="display translate-y-[18%] whitespace-nowrap text-center [font-feature-settings:'cv08'] text-[clamp(3.5rem,15.5vw,13.5rem)] leading-[0.8] text-fg/[0.06]">
          iHateImages
        </p>
      </div>
    </footer>
  );
}
