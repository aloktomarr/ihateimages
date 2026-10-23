import { useState } from 'react';
import { Link } from 'react-router-dom';
import WorkflowGuide from '../components/WorkflowGuide';
import { Icon } from '../components/icons';
import { PageHeader, SectionHeader } from '../components/Sections';

const PRESETS: [string, string][] = [
  ['/compress?target=100', 'Compress to 100 KB (target-size mode).'],
  ['/compress?target=50&format=jpeg', 'Compress to 50 KB and output JPEG.'],
  ['/compress?mode=quality&q=60', 'Open quality mode set to 60 percent.'],
  ['/crop?aspect=1:1', 'Open the cropper locked to a square.'],
  ['/compress?src=IMAGE_URL', 'Load an image by URL (for images that allow cross-origin reads).'],
];

const OPTIONS: [string, string][] = [
  ['target', 'Maximum size in KB'],
  ['mode', 'target or quality'],
  ['format', 'webp, jpeg, png or avif'],
  ['q', 'Quality from 1 to 100'],
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(`${window.location.origin}${text}`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="btn btn-ghost btn-sm shrink-0"
      aria-label={`Copy ${text}`}
    >
      <Icon name={copied ? 'check' : 'clipboard'} className="h-4 w-4" />
      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export default function Integrations() {
  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Integrations"
        title="Bring it into"
        accent="your workflow."
        lead="Send images in from your phone, your desktop, a bookmark or a right-click. Every option below still runs 100% in your browser, and your images are never uploaded to a server."
      />

      <WorkflowGuide />

      <section className="mt-28">
        <SectionHeader
          eyebrow="URL presets"
          title="Settings,"
          accent="in a link."
          lead="Open a tool already configured by adding options to the URL. Bookmark a preset, or link to it from any tool, script or note. It works in every browser, including on iPhone and Android."
        >
          <Link to="/compress?target=100" className="btn btn-secondary">
            Try the 100 KB preset <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </SectionHeader>

        <div className="mt-10 grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="card divide-y divide-line">
            {PRESETS.map(([url, desc]) => (
              <div key={url} className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <Link to={url} className="block truncate font-mono text-[13px] font-semibold text-fg hover:underline">
                    {url}
                  </Link>
                  <p className="mt-0.5 text-[13.5px] text-muted">{desc}</p>
                </div>
                <CopyButton text={url} />
              </div>
            ))}
          </div>
          <div className="card p-6">
            <p className="eyebrow">Compressor options</p>
            <dl className="mt-5 space-y-3.5">
              {OPTIONS.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="rounded-md bg-subtle px-2 py-0.5 font-mono text-[12.5px] font-semibold text-fg">{k}</dt>
                  <dd className="text-right text-[13.5px] text-muted">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="hint mt-6 border-t border-line pt-4">
              The cropper also takes <span className="font-mono font-semibold text-fg">aspect</span>: 1:1, 4:3, 3:2,
              16:9 or 2:3.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-28 grid gap-3 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-subtle text-fg">
            <Icon name="puzzle" className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-[1.4rem] font-semibold tracking-[-0.03em]">Browser extension</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            The Chrome and Edge extension adds a right-click &ldquo;Compress with iHateImages&rdquo; on any image on the
            web. The source and setup steps are in the{' '}
            <a
              href="https://github.com/aloktomarr/ihateimages/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              extension folder on GitHub
            </a>
            .
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-subtle text-fg">
            <Icon name="monitor" className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-[1.4rem] font-semibold tracking-[-0.03em]">Want a server-side API?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Tools like Zapier, Make and n8n need a hosted endpoint, which would mean uploading your images to a server.
            That is the opposite of how iHateImages works today, so it is not offered here. If you need automated batch
            processing, tell us and we can look at a separate opt-in service.
          </p>
        </div>
      </section>
    </div>
  );
}
