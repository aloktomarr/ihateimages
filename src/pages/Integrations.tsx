import { Link } from 'react-router-dom';

const PRESETS: [string, string][] = [
  ['/compress?target=100', 'Compress to 100 KB (target-size mode).'],
  ['/compress?target=50&format=jpeg', 'Compress to 50 KB and output JPEG.'],
  ['/compress?mode=quality&q=60', 'Open quality mode set to 60 percent.'],
  ['/compress?src=IMAGE_URL', 'Load an image by URL (for images that allow cross-origin reads).'],
];

export default function Integrations() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Integrations and workflow</h1>
      <p className="mb-8 text-[15px] text-muted">
        Bring iHateImages into the tools you already use. Every option below still runs 100% in your
        browser, and your images are never uploaded to a server.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold">1. Install the app</h2>
          <p className="mt-2 text-sm text-muted">
            The share sheet, the "Open with" menu, and home-screen shortcuts all need the app
            installed. In desktop Chrome or Edge, use the install icon in the address bar or the
            browser menu and choose Install iHateImages. On Android, open the browser menu and pick
            "Add to home screen".
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">2. Phone share sheet</h2>
          <p className="mt-2 text-sm text-muted">
            Once installed on Android, open a photo in your gallery or any app, tap Share, and choose
            iHateImages. The image opens straight in the compressor, ready to shrink and save.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">3. Desktop "Open with"</h2>
          <p className="mt-2 text-sm text-muted">
            After installing on desktop Chrome or Edge, right-click an image file in your file
            manager, choose Open with, and pick iHateImages. The file loads in the compressor
            automatically.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">4. URL presets and bookmarks</h2>
          <p className="mt-2 text-sm text-muted">
            Open the compressor already configured by adding options to the URL. Bookmark a preset,
            or link to it from any other tool, script, or note.
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-hover text-fg">
                <tr>
                  <th className="px-3 py-2 font-semibold">URL</th>
                  <th className="px-3 py-2 font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody>
                {PRESETS.map(([url, desc]) => (
                  <tr key={url} className="border-t border-line">
                    <td className="px-3 py-2 font-mono text-xs text-accent">{url}</td>
                    <td className="px-3 py-2 text-muted">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Options: <span className="font-mono text-xs">target</span> (max size in KB),{' '}
            <span className="font-mono text-xs">mode</span> (target or quality),{' '}
            <span className="font-mono text-xs">format</span> (webp, jpeg, png, avif), and{' '}
            <span className="font-mono text-xs">q</span> (quality 1 to 100).
          </p>
          <p className="mt-3">
            <Link to="/compress?target=100" className="btn-ghost inline-flex">
              Try the 100 KB preset
            </Link>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">5. Browser extension</h2>
          <p className="mt-2 text-sm text-muted">
            A small Chrome and Edge extension adds a right-click option, "Compress with iHateImages",
            on any image on the web. It opens the image here for you to compress and download, with
            no upload to a server. The source and setup steps are in the{' '}
            <a
              href="https://github.com/aloktomarr/ihateimages/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              extension folder on GitHub
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">Want a server-side API?</h2>
          <p className="mt-2 text-sm text-muted">
            Tools like Zapier, Make, and n8n need a hosted endpoint, which would mean uploading your
            images to a server. That is the opposite of how iHateImages works today, so it is not
            offered here. If you need automated batch processing, tell us and we can look at a
            separate opt-in service.
          </p>
        </div>
      </div>
    </section>
  );
}
