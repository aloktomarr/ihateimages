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
    icon: 'upload',
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

export default function WorkflowGuide() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {GUIDE.map((g) => (
        <div key={g.title} className="card">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-accent">
              <Icon name={g.icon} className="h-5 w-5" />
            </span>
            <h3 className="font-bold">{g.title}</h3>
          </div>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted marker:text-muted">
            {g.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
