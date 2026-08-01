import { Link } from 'react-router-dom';
import { Icon } from './icons';
import ProductHuntBadge from './ProductHuntBadge';
import { prefetchRoute } from '../lib/routes';

const YEAR = new Date().getFullYear();

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-fg">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link
              to={to}
              onMouseEnter={() => prefetchRoute(to)}
              className="text-sm text-muted transition hover:text-fg"
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
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white">
                <Icon name="logo" className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                iHate<span className="text-accent">Images</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Free, private image tools that run 100% in your browser. No upload, no watermark, no
              sign-up.
            </p>
            <div className="mt-4">
              <ProductHuntBadge />
            </div>
          </div>

          <FooterCol
            title="Tools"
            links={[
              ['Compress', '/compress'],
              ['Convert', '/convert'],
              ['Resize', '/resize'],
              ['Remove background', '/background-remover'],
              ['Crop', '/crop'],
            ]}
          />
          <FooterCol
            title="More tools"
            links={[
              ['Upscale', '/upscale'],
              ['Strip metadata', '/strip-metadata'],
              ['Favicon generator', '/favicon'],
              ['Passport photo', '/passport-photo'],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ['About', '/about'],
              ['Blog', '/blog'],
              ['Privacy', '/privacy'],
            ]}
          />
        </div>

        <p className="mt-10 text-xs text-muted">
          &copy; {YEAR} iHateImages. Your images never leave your device.{' '}
          <a
            href="https://x.com/AlokTom19637918"
            target="_blank"
            rel="me noopener noreferrer"
            className="transition hover:text-fg"
          >
            Built by Alok Tomar
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
