import { useState } from 'react';
import { Icon, type IconName } from './icons';

// One clear, honest guide to every way to send images into the tools, shared by the home page and
// the Integrations page. It is split by platform because the options differ: Android supports the
// share sheet, iPhone does not (Safari cannot hand shares to a web app), and some options are
// desktop only.
const GUIDE: { icon: IconName; title: string; steps: string[] }[] = [
  {
    icon: 'share',
    title: 'Android (Chrome)',
    steps: [
      'Open ihateimages.com, then use the browser menu and choose "Install app" or "Add to Home screen".',
      'To send a photo, open it in your gallery or any app, tap Share, and choose iHateImages.',
      'The image opens straight in the compressor, ready to shrink and save.',
      'Long-press the app icon for shortcuts to Compress, Convert, and more.',
    ],
  },
  {
    icon: 'phone',
    title: 'iPhone and iPad (Safari)',
    steps: [
      'Open ihateimages.com in Safari, tap the Share button, and choose "Add to Home Screen" for one-tap access that also works offline.',
      'Safari does not let web apps receive shares, so open the app and tap the upload area to pick a photo from your library.',
      'For a repeatable setup, bookmark a URL preset (below), for example a compress-to-100-KB link.',
    ],
  },
  {
    icon: 'monitor',
    title: 'Desktop (Chrome or Edge)',
    steps: [
      'Open ihateimages.com and click the install icon in the address bar to install the app.',
      'Right-click any image file in your file manager, choose Open with, and pick iHateImages.',
      'The file loads in the compressor automatically.',
    ],
  },
  {
    icon: 'link',
    title: 'URL presets (any device)',
    steps: [
      'Add options to the compressor URL and bookmark it, for example /compress?target=100.',
      'Options: target (KB), mode (target or quality), format (webp, jpeg, png, avif), q (1 to 100).',
      'Works in every browser on every device, including iPhone and Android.',
    ],
  },
  {
    icon: 'puzzle',
    title: 'Browser extension (desktop)',
    steps: [
      'Install the Chrome or Edge extension (source in the extension folder on GitHub).',
      'Right-click any image on the web and choose "Compress with iHateImages".',
      'The image opens here to compress and download, with no upload.',
    ],
  },
];

/** Every option, either as tabs (compact, for the home page) or as a grid of cards. */
export default function WorkflowGuide({ layout = 'grid' }: { layout?: 'grid' | 'tabs' }) {
  const [tab, setTab] = useState(0);

  if (layout === 'tabs') {
    const g = GUIDE[tab];
    return (
      <div className="card overflow-hidden">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line p-2" role="tablist">
          {GUIDE.map((item, i) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition ${
                i === tab ? 'bg-ink text-ink-fg' : 'text-muted hover:bg-subtle hover:text-fg'
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.title}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)]">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pop text-pop-fg">
              <Icon name={g.icon} className="h-6 w-6" />
            </span>
            <h3 className="display mt-5 text-[1.75rem]">{g.title}</h3>
          </div>
          <ol className="space-y-4">
            {g.steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-[12.5px] font-bold text-fg">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[15px] leading-relaxed text-muted">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {GUIDE.map((g) => (
        <div key={g.title} className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-subtle text-fg">
              <Icon name={g.icon} className="h-5 w-5" />
            </span>
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{g.title}</h3>
          </div>
          <ol className="mt-5 space-y-3">
            {g.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                <span className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-subtle text-[11px] font-bold text-fg">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
