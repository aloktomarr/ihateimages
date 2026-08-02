import { Link } from 'react-router-dom';
import { TOOLS } from '../lib/tools';
import { Icon, type IconName } from '../components/icons';
import { FAQ } from '../lib/seo';
import { POPULAR_CONVERSIONS } from '../lib/landing';
import { prefetchConvertLanding } from '../lib/routes';

const BADGES: { icon: IconName; label: string }[] = [
  { icon: 'lock', label: 'On-device only' },
  { icon: 'ban', label: 'No watermark' },
  { icon: 'bolt', label: 'Works offline' },
  { icon: 'phone', label: 'HEIC supported' },
];

const WORKFLOW: { icon: IconName; title: string; blurb: string; to: string }[] = [
  {
    icon: 'phone',
    title: 'Phone share sheet',
    blurb: 'Share a photo to iHateImages from any app on your phone.',
    to: '/integrations',
  },
  {
    icon: 'upload',
    title: 'Open with on desktop',
    blurb: 'Right-click an image file and open it straight in the tool.',
    to: '/integrations',
  },
  {
    icon: 'link',
    title: 'URL presets',
    blurb: 'Bookmark a preset like compress to 100 KB, or link to it.',
    to: '/compress?target=100',
  },
  {
    icon: 'puzzle',
    title: 'Browser extension',
    blurb: 'Right-click any image on the web to compress it here.',
    to: '/integrations',
  },
  {
    icon: 'download',
    title: 'Install the app',
    blurb: 'Add it to your phone or desktop. Works offline once loaded.',
    to: '/integrations',
  },
  {
    icon: 'bolt',
    title: 'App shortcuts',
    blurb: 'Jump straight to a tool from the installed app icon.',
    to: '/integrations',
  },
];

export default function Home() {
  return (
    <div>
      <section className="py-6 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          The image toolkit that <span className="text-accent">hates</span> watermarks
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Compress, convert, resize and clean your images, 100% in your browser. No upload, no
          watermark, no sign-up. Your files never touch a server.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[13px] text-muted"
            >
              <Icon name={b.icon} className="h-4 w-4" />
              {b.label}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TOOLS.map((tool) =>
          tool.live ? (
            <Link key={tool.slug} to={tool.path} className="card group transition hover:bg-hover">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-accent">
                  <Icon name={tool.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold group-hover:text-accent">{tool.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{tool.blurb}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div key={tool.slug} className="card relative opacity-60">
              <span className="absolute right-3 top-3 rounded-full bg-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                Soon
              </span>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-muted">
                  <Icon name={tool.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">{tool.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{tool.blurb}</p>
                </div>
              </div>
            </div>
          ),
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-extrabold tracking-tight">Popular conversions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_CONVERSIONS.map((c) => (
            <Link
              key={c.slug}
              to={c.path}
              onMouseEnter={prefetchConvertLanding}
              className="btn-ghost"
            >
              {c.fromLabel} to {c.toLabel}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight">Use it in your workflow</h2>
          <Link to="/integrations" className="btn-ghost">
            See all integrations
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Bring images into the tools from your phone, your desktop, or a link. Everything still runs
          100% in your browser, with no upload.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW.map((w) => (
            <Link key={w.title} to={w.to} className="card group transition hover:bg-hover">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-accent">
                  <Icon name={w.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold group-hover:text-accent">{w.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{w.blurb}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-fg">{f.q}</h3>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Everything runs locally with JavaScript and WebAssembly. Works offline once loaded.
      </p>
    </div>
  );
}
