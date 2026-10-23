import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import ToolContent from '../components/ToolContent';
import ToolHeader from '../components/ToolHeader';
import { Icon } from '../components/icons';
import { BusyOverlay, MobileActionBar, SettingsPanel, StageCard, WorkspaceGrid } from '../components/Workspace';
import { generateFavicons } from '../lib/favicon';
import { formatBytes } from '../lib/format';
import { nextPaint } from '../lib/schedule';
import { useIncomingFiles } from '../lib/incoming';
import { downloadBlob } from '../lib/download';

const PACK = [
  ['favicon.ico', '16, 32 and 48px in one file'],
  ['favicon-16/32/48/64.png', 'PNG icons for browsers'],
  ['apple-touch-icon.png', '180px, for iPhone home screens'],
  ['android-chrome-192/512.png', 'PWA and Android icons'],
  ['site.webmanifest', 'Ready to fill in'],
  ['README.txt', 'The HTML snippet to paste'],
];

/** A browser tab strip, so you can see the icon where it will actually live. */
function TabPreview({ icon, dark }: { icon: string; dark?: boolean }) {
  return (
    <div className={`rounded-xl p-2 pb-0 ${dark ? 'bg-[#1f2023]' : 'bg-[#dfe1e5]'}`}>
      <div className="flex items-end gap-1">
        <div
          className={`flex h-9 w-56 max-w-full items-center gap-2 rounded-t-lg px-3 ${
            dark ? 'bg-[#35363a] text-[#e8eaed]' : 'bg-white text-[#202124]'
          }`}
        >
          <img src={icon} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
          <span className="truncate text-[12.5px]">Your website</span>
          <Icon name="close" className="ml-auto h-3 w-3 shrink-0 opacity-60" />
        </div>
        <div className={`mb-2 px-2 text-[16px] leading-none ${dark ? 'text-[#9aa0a6]' : 'text-[#5f6368]'}`}>+</div>
      </div>
    </div>
  );
}

export default function Favicon() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [archive, setArchive] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const urlsRef = useRef<string[]>([]);

  const cleanup = useCallback(() => {
    urlsRef.current.forEach(URL.revokeObjectURL);
    urlsRef.current = [];
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const onFiles = useCallback(
    async (files: File[]) => {
      cleanup();
      setFile(files[0]);
      setPreviews([]);
      setArchive(null);
      setError('');
      setBusy(true);
      // Paint the busy state before building the icons so the click stays responsive (good INP).
      await nextPaint();
      try {
        const { archive: blob, previews: p } = await generateFavicons(files[0]);
        p.forEach((x) => urlsRef.current.push(x.url));
        setPreviews(p);
        setArchive(blob);
      } catch {
        setError('Could not read that image. PNG, JPG, WebP or SVG work best for icons.');
      } finally {
        setBusy(false);
      }
    },
    [cleanup],
  );
  useIncomingFiles(onFiles);

  const download = () => {
    if (archive) downloadBlob(archive, 'favicons.zip');
  };

  const icon = (s: number) => previews.find((p) => p.size === s)?.url;

  return (
    <div className="container-page">
      <ToolHeader
        title="Favicon generator"
        description="Turn one image into a full icon set: favicon.ico, PNGs, an apple-touch-icon, PWA icons and a web manifest, zipped and ready for your site. A square image works best."
      />

      <WorkspaceGrid>
        <div className="min-w-0">
          {!file ? (
            <Dropzone multiple={false} onFiles={onFiles} />
          ) : (
            <StageCard
              file={file}
              onReplace={onFiles}
              onClear={() => {
                cleanup();
                setFile(null);
                setPreviews([]);
                setArchive(null);
              }}
              disabled={busy}
            >
              {previews.length === 0 ? (
                <div className="relative grid min-h-[320px] place-items-center rounded-2xl bg-subtle">
                  {busy && <BusyOverlay label="Generating icons" />}
                  {error && (
                    <p className="flex max-w-sm items-start gap-2 px-6 text-[13.5px] font-medium text-danger">
                      <Icon name="alert" className="mt-px h-4 w-4 shrink-0" />
                      {error}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-2xl bg-subtle p-4 sm:grid-cols-[1fr_auto] sm:p-5">
                    <div className="space-y-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">In the browser</p>
                      <TabPreview icon={icon(32)!} />
                      <TabPreview icon={icon(32)!} dark />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 sm:pl-6">
                      <p className="self-start text-[12px] font-semibold uppercase tracking-[0.08em] text-faint sm:self-center">
                        Home screen
                      </p>
                      <div className="grid place-items-center rounded-[1.75rem] bg-gradient-to-br from-[#7f8cff] to-[#ff8fb3] p-6">
                        <img src={icon(180)} alt="" className="h-16 w-16 rounded-[22%] shadow-lift" />
                        <span className="mt-1.5 text-[11px] font-medium text-white">Your app</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
                      Every size
                    </p>
                    <div className="flex flex-wrap items-end gap-5 px-1">
                      {previews.map((p) => {
                        const dim = Math.min(p.size, 96);
                        return (
                          <figure key={p.size} className="text-center">
                            <img
                              src={p.url}
                              alt={`${p.size}px icon`}
                              style={{ width: dim, height: dim }}
                              className="checkerboard rounded-lg border border-line"
                            />
                            <figcaption className="tabular mt-1.5 text-[11.5px] font-medium text-muted">{p.size}px</figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </StageCard>
          )}
        </div>

        <SettingsPanel
          footer={
            <div className={file ? 'hidden lg:block' : ''}>
              <button type="button" onClick={download} disabled={!archive} className="btn btn-primary btn-lg w-full">
                <Icon name="download" className="h-4 w-4" />
                Download favicons.zip
              </button>
              {archive && <p className="hint tabular mt-2 text-center">{formatBytes(archive.size)}</p>}
            </div>
          }
        >
          <div>
            <p className="text-[13px] font-semibold text-fg">What&rsquo;s in the pack</p>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
              {PACK.map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3 px-3.5 py-2.5">
                  <Icon
                    name={archive ? 'check' : 'pdf'}
                    className={`mt-0.5 h-4 w-4 shrink-0 ${archive ? 'text-good' : 'text-faint'}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12.5px] text-fg">{name}</span>
                    <span className="block text-[12px] text-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SettingsPanel>
      </WorkspaceGrid>

      {file && (
        <MobileActionBar busy={busy}>
          <button type="button" onClick={download} disabled={!archive} className="btn btn-primary btn-lg flex-1">
            <Icon name="download" className="h-4 w-4" />
            {busy ? 'Generating' : 'Download favicons.zip'}
          </button>
        </MobileActionBar>
      )}

      <ToolContent slug="/favicon" />
    </div>
  );
}
