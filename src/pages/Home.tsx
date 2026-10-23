import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/icons';
import { DropArt } from '../components/Dropzone';
import Thumb from '../components/Thumb';
import WorkflowGuide from '../components/WorkflowGuide';
import ConversionMatrix from '../components/ConversionMatrix';
import { FaqSection, SectionHeader } from '../components/Sections';
import { TOOLS, CATEGORIES } from '../lib/tools';
import { RECIPES } from '../lib/recipes';
import { FAQ } from '../lib/seo';
import { prefetchRoute } from '../lib/routes';
import { imageFilesFrom, useIncomingFiles, useSendFiles } from '../lib/incoming';
import { formatLabel, suggestFor } from '../lib/suggest';
import { formatBytes } from '../lib/format';
import { modKeyLabel } from '../lib/palette';

const CATEGORY_TITLE = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.title]));

const PROMISES = [
  { icon: 'lock', label: '0 bytes uploaded' },
  { icon: 'ban', label: 'No watermark' },
  { icon: 'bolt', label: 'Works offline' },
  { icon: 'infinity', label: 'No limits' },
] as const;

/** The big "drop your images" card in the hero. */
function HeroDrop({ onPick }: { onPick: () => void }) {
  const [drag, setDrag] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick();
        }
      }}
      onDragOver={() => setDrag(true)}
      onDragLeave={() => setDrag(false)}
      onDrop={() => setDrag(false)}
      aria-label="Choose images"
      className="group mx-auto mt-12 max-w-3xl cursor-pointer rounded-[2rem] border border-line bg-surface p-2 shadow-lift transition duration-300 hover:shadow-float sm:mt-14"
    >
      <div
        className={`relative overflow-hidden rounded-[1.6rem] border-2 border-dashed px-6 py-12 transition sm:py-16 ${
          drag ? 'border-fg bg-subtle' : 'border-line-strong group-hover:border-fg/30'
        }`}
      >
        <DropArt active={drag} />
        <div className="mt-9 flex flex-col items-center gap-4">
          <span className="btn btn-primary btn-lg pointer-events-none">
            <Icon name="plus" className="h-5 w-5" />
            Choose images
          </span>
          <p className="text-[14px] text-muted">
            or drop them anywhere on this page
            <span className="hidden sm:inline">
              {' '}
              &middot; paste with <span className="kbd">{modKeyLabel()} V</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** After something is dropped: what it is, and what to do with it. */
function Picker({
  files,
  thumbs,
  onChange,
  onClear,
}: {
  files: File[];
  thumbs: string[];
  onChange: () => void;
  onClear: () => void;
}) {
  const send = useSendFiles();
  const suggestions = suggestFor(files);
  const many = files.length > 1;
  const total = files.reduce((s, f) => s + f.size, 0);
  const formats = [...new Set(files.map(formatLabel))].join(', ');

  return (
    <section className="container-page pb-8 pt-12 sm:pt-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex max-w-full animate-fade-up items-center gap-3 rounded-full border border-line bg-surface p-1.5 pr-2 text-left shadow-soft">
          <span className="flex shrink-0 -space-x-3">
            {thumbs.slice(0, 3).map((t, i) => (
              <span key={t} className="block h-11 w-11 overflow-hidden rounded-full ring-2 ring-surface">
                <Thumb src={t} alt="" label={formatLabel(files[i])} className="h-full w-full" />
              </span>
            ))}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[14rem] truncate text-[14px] font-semibold text-fg sm:max-w-xs">
              {many ? `${files.length} images` : files[0].name}
            </span>
            <span className="tabular block text-[12.5px] text-muted">
              {formats} &middot; {formatBytes(total)}
            </span>
          </span>
          <button type="button" onClick={onChange} className="btn btn-secondary btn-sm ml-1">
            Change
          </button>
          <button type="button" onClick={onClear} className="icon-btn h-8 w-8" aria-label="Start over">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <h1 className="display text-display-lg mt-9 animate-fade-up [animation-delay:60ms]">
          What should we <span className="serif-accent text-muted">do with {many ? 'them' : 'it'}?</span>
        </h1>
        <p className="mt-5 animate-fade-up text-[15px] text-muted [animation-delay:120ms]">
          Pick one and it opens with your {many ? 'images' : 'image'} already loaded. Nothing is uploaded.
        </p>
      </div>

      <div className="mt-12">
        <p className="eyebrow mb-4">Suggested for {many ? 'these' : 'this'}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((s, i) => {
            const best = i === 0;
            return (
              <button
                key={s.to}
                type="button"
                onClick={() => send(files, s.to)}
                onMouseEnter={() => prefetchRoute(s.to.split('?')[0])}
                style={{ animationDelay: `${150 + i * 60}ms` }}
                className={`group relative flex min-h-[184px] animate-fade-up flex-col rounded-[1.25rem] border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
                  best
                    ? 'border-transparent bg-ink text-ink-fg'
                    : 'border-line bg-surface text-fg hover:border-line-strong'
                }`}
              >
                <span className="flex items-start justify-between">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      best ? 'bg-pop text-pop-fg' : 'bg-subtle text-fg'
                    }`}
                  >
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  {best && <span className="chip-pop">Best match</span>}
                </span>
                <span className="mt-auto pt-6 text-[18px] font-semibold tracking-[-0.025em]">{s.title}</span>
                <span className={`mt-1 text-[13.5px] leading-snug ${best ? 'text-ink-fg/65' : 'text-muted'}`}>
                  {s.reason}
                </span>
                <Icon
                  name="arrowRight"
                  className="absolute bottom-5 right-5 h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                />
              </button>
            );
          })}
        </div>

        <p className="eyebrow mb-4 mt-12">Or any tool</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {TOOLS.map((t, i) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => send(files, t.path)}
              onMouseEnter={() => prefetchRoute(t.path)}
              style={{ animationDelay: `${300 + i * 25}ms` }}
              className="group flex animate-fade-up items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition hover:border-line-strong hover:bg-subtle/50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-subtle text-fg transition group-hover:bg-ink group-hover:text-ink-fg">
                <Icon name={t.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold text-fg">{t.short}</span>
                {many && !t.multiple && <span className="block text-[11.5px] text-muted">First image only</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [staged, setStaged] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbUrls = useRef<string[]>([]);
  const { hash } = useLocation();

  const revoke = () => {
    thumbUrls.current.forEach((u) => URL.revokeObjectURL(u));
    thumbUrls.current = [];
  };
  useEffect(() => revoke, []);

  const stage = useCallback((files: File[]) => {
    if (!files.length) return;
    revoke();
    const urls = files.slice(0, 3).map((f) => URL.createObjectURL(f));
    thumbUrls.current = urls;
    setThumbs(urls);
    setStaged(files);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Images dropped or pasted anywhere on the site (or on this page) land here.
  useIncomingFiles(stage);

  // Deep links like /#tools from the tool breadcrumbs.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash]);

  const pick = () => inputRef.current?.click();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          stage(imageFilesFrom(e.target.files));
          e.target.value = '';
        }}
      />

      {staged.length > 0 ? (
        <Picker
          files={staged}
          thumbs={thumbs}
          onChange={pick}
          onClear={() => {
            revoke();
            setStaged([]);
            setThumbs([]);
          }}
        />
      ) : (
        <section className="relative">
          <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]" />
          <div className="container-page pb-10 pt-14 text-center sm:pt-20">
            <p className="chip mx-auto animate-fade-up">
              <span className="h-2 w-2 rounded-full bg-pop ring-2 ring-pop/30" />
              Runs 100% in your browser
            </p>
            <h1 className="display text-display-xl mx-auto mt-7 max-w-5xl animate-fade-up [animation-delay:60ms]">
              Fix any image,
              <br />
              <span className="serif-accent inline-block text-muted [text-wrap:balance]">without uploading it.</span>
            </h1>
            <p className="lead mx-auto mt-7 max-w-xl animate-fade-up [animation-delay:120ms]">
              Compress, convert, resize, crop and remove backgrounds. Free, no sign-up, no watermark, and your files
              never leave this tab.
            </p>
            <div className="animate-fade-up [animation-delay:180ms]">
              <HeroDrop onPick={pick} />
            </div>
            <ul className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] font-medium text-muted [animation-delay:240ms]">
              {PROMISES.map((p) => (
                <li key={p.label} className="flex items-center gap-2">
                  <Icon name={p.icon} className="h-4 w-4 text-fg" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Shortcuts: start from the job, not the tool. */}
      <section className="container-page mt-24 sm:mt-28">
        <SectionHeader
          eyebrow="Shortcuts"
          title="Start from"
          accent="what you need."
          lead="Skip the settings. Each shortcut opens a tool that is already set up for the job."
        />
        <div className="mt-10 grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {RECIPES.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              onMouseEnter={() => prefetchRoute(r.to.split('?')[0])}
              className="card-link group relative flex items-center gap-4 p-4 sm:min-h-[176px] sm:flex-col sm:items-stretch sm:gap-0 sm:p-5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-subtle text-fg transition group-hover:bg-pop group-hover:text-pop-fg">
                <Icon name={r.icon} className="h-5 w-5" />
              </span>
              <Icon
                name="arrowUpRight"
                className="absolute right-4 top-4 hidden h-4 w-4 text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg sm:block"
              />
              <span className="min-w-0 sm:mt-auto sm:pt-8">
                <span className="block text-[16px] font-semibold leading-snug tracking-[-0.02em] text-fg sm:text-[17px]">
                  {r.title}
                </span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-muted sm:mt-1">{r.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* All tools as a numbered grid with hairline dividers. */}
      <section id="tools" className="container-page mt-28 scroll-mt-24 sm:mt-36">
        <SectionHeader
          eyebrow="Tools"
          title={`${TOOLS.length} tools.`}
          accent="All free, all private."
          lead="Everything you need between a photo and the place it is going. Each one runs on your device."
        />
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line lg:grid-cols-4">
          {TOOLS.map((t, i) => (
            <Link
              key={t.slug}
              to={t.path}
              onMouseEnter={() => prefetchRoute(t.path)}
              onFocus={() => prefetchRoute(t.path)}
              className="group relative flex flex-col bg-surface p-4 transition hover:bg-subtle/60 sm:p-6"
            >
              <span className="flex items-center justify-between">
                <span className="tabular text-[12px] font-semibold text-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="hidden text-[11.5px] font-medium text-faint sm:inline">{CATEGORY_TITLE[t.category]}</span>
              </span>
              <span className="mt-4 grid h-11 w-11 sm:mt-6 place-items-center rounded-xl border border-line bg-surface text-fg shadow-soft transition group-hover:border-transparent group-hover:bg-ink group-hover:text-ink-fg">
                <Icon name={t.icon} className="h-5 w-5" />
              </span>
              <span className="mt-4 flex items-center gap-2 text-[15.5px] font-semibold tracking-[-0.02em] text-fg sm:mt-5 sm:text-[17px]">
                {t.title}
                <Icon
                  name="arrowRight"
                  className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
              <span className="mt-1.5 text-[13px] leading-snug text-muted sm:text-[14px]">{t.blurb}</span>
            </Link>
          ))}
          <a
            href="https://github.com/aloktomarr/ihateimages/issues/new?template=feature_request.md"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-6 bg-subtle/60 p-4 transition hover:bg-subtle sm:p-6"
          >
            <span className="tabular text-[12px] font-semibold text-faint">{String(TOOLS.length + 1).padStart(2, '0')}</span>
            <span>
              <span className="display block text-[1.6rem] leading-tight">
                Your idea <span className="serif-accent text-muted">here?</span>
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-fg">
                Suggest a tool
                <Icon name="arrowUpRight" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </span>
          </a>
        </div>
      </section>

      {/* Proof: the privacy promise, in big type. */}
      <section className="mt-28 bg-band text-band-fg sm:mt-36 dark:border-y dark:border-line">
        <div className="container-page py-20 sm:py-28">
          <p className="eyebrow !text-band-fg/55">Why it is different</p>
          <h2 className="display text-display-lg mt-5 max-w-4xl">
            Other tools upload your photos. <span className="serif-accent text-pop">We can&rsquo;t.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-band-fg/65">
            There is no server in the loop, so there is nothing to leak, store or train on. The work happens inside
            this tab, on your own device.
          </p>
          <div className="mt-16 grid gap-12 border-t border-band-fg/15 pt-12 md:grid-cols-3 md:gap-8">
            {[
              ['0 bytes', 'uploaded, ever', 'Every tool runs in your browser with WebAssembly and a Web Worker. Open DevTools and watch the Network tab stay quiet.'],
              ['100%', 'yours, no watermark', 'Full-resolution output with nothing stamped on it. No account, no paywall, no "pro" tier.'],
              ['∞ files', 'and it works offline', 'Batch as many images as your device can handle. After your first visit, it keeps working with no connection.'],
            ].map(([big, sub, text]) => (
              <div key={big}>
                <p className="display whitespace-nowrap text-[clamp(3rem,6vw,4.75rem)]">{big}</p>
                <p className="mt-2 text-[15px] font-semibold text-pop">{sub}</p>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-band-fg/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page mt-28 sm:mt-36">
        <SectionHeader
          eyebrow="Convert"
          title="Any format,"
          accent="to any format."
          lead="Including iPhone HEIC. Find what you have on the left and what you need along the top."
        >
          <Link to="/convert" className="btn btn-secondary">
            Open the converter <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </SectionHeader>
        <div className="mt-10">
          <ConversionMatrix />
        </div>
      </section>

      <section className="container-page mt-28 sm:mt-36">
        <SectionHeader
          eyebrow="Integrations"
          title="Works where"
          accent="you already are."
          lead="Send images in from your phone's share sheet, your desktop's Open with menu, a bookmark or a right-click. Still 100% on your device."
        >
          <Link to="/integrations" className="btn btn-secondary">
            All integrations <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </SectionHeader>
        <div className="mt-10">
          <WorkflowGuide layout="tabs" />
        </div>
      </section>

      <div className="container-page mt-28 sm:mt-36">
        <FaqSection items={FAQ} />
      </div>

      <section className="container-page mt-28 sm:mt-36">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-16 text-center sm:py-24">
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <h2 className="display text-display-lg relative">
            Got an image?
            <br />
            <span className="serif-accent text-muted">Drop it anywhere.</span>
          </h2>
          <p className="lead relative mx-auto mt-6 max-w-md">On this page or any other. We&rsquo;ll suggest the right tool.</p>
          <button type="button" onClick={pick} className="btn btn-primary btn-lg relative mt-9">
            <Icon name="plus" className="h-5 w-5" />
            Choose images
          </button>
        </div>
      </section>
    </div>
  );
}
