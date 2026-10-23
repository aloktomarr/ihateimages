import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/icons';
import { PageHeader } from '../components/Sections';

const PRINCIPLES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'lock', title: 'Private by design', text: 'Every tool runs in your browser. There is no server that could see your files.' },
  { icon: 'ban', title: 'Nothing in the way', text: 'No watermark, no sign-up, no paywall and no ads between you and your image.' },
  { icon: 'bolt', title: 'Fast and offline', text: 'No upload round trip, and the app keeps working with no connection once loaded.' },
];

export default function About() {
  return (
    <div className="container-page">
      <PageHeader
        eyebrow="About"
        title="Image tools,"
        accent="minus the hate."
        lead="iHateImages is a free, privacy-first image toolkit. Every tool, from compressing and converting to resizing, cropping, upscaling and removing backgrounds, runs entirely inside your web browser. Your files are never uploaded to a server."
      />

      <div className="grid gap-3 md:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-pop text-pop-fg">
              <Icon name={p.icon} className="h-5 w-5" />
            </span>
            <h2 className="mt-6 text-[18px] font-semibold tracking-[-0.02em]">{p.title}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="prose-ui mt-16 max-w-3xl">
        <h2>Why we built it</h2>
        <p>
          Most online image tools upload your photos to their servers, stamp them with a watermark, hide features
          behind a sign-up, or bury the page in ads. We wanted the opposite: fast, clean tools that respect your
          privacy and never touch your files.
        </p>

        <h2>How it works</h2>
        <p>
          Modern browsers can decode, edit and encode images using JavaScript and WebAssembly. iHateImages uses these
          on-device technologies, including a Web Worker so the interface stays smooth, to process everything locally.
          The app is also a Progressive Web App, so it keeps working offline once loaded. Read{' '}
          <Link to="/blog/client-side-image-processing">how we process images in your browser</Link> for the details.
        </p>

        <h2>What you can do</h2>
        <p>
          Compress and convert JPEG, PNG, WebP, AVIF and HEIC; resize and crop; upscale; strip EXIF and GPS metadata;
          remove backgrounds with on-device AI; and generate favicons and passport photos, all free and without a
          watermark.
        </p>

        <p>
          Have feedback or a tool you would like to see? We would love to hear it, because the whole point is to build
          the image toolkit we always wished existed.{' '}
          <a href="https://github.com/aloktomarr/ihateimages/issues" target="_blank" rel="noopener noreferrer">
            Open an issue on GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
