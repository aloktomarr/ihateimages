import type { ReactElement } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BLOG_BY_SLUG, formatDate } from '../lib/blog';

function H2({ children }: { children: string }) {
  return <h2 className="text-xl font-bold text-fg">{children}</h2>;
}

// Article bodies, keyed by slug. Metadata (title, date, description) lives in blog.data.json.
const ARTICLES: Record<string, () => ReactElement> = {
  'client-side-image-processing': () => (
    <>
      <p>
        Most free online image tools work the same way: you upload your photo, a server processes
        it, and you download the result. That means your private images sit on someone else&rsquo;s
        computer, you wait for two network trips, and the service pays for bandwidth, which is why so
        many of them add watermarks, sign-up walls and ads. iHateImages takes the opposite approach:
        every tool runs entirely in your browser. Here is how.
      </p>

      <H2>Why do everything client-side?</H2>
      <p>There are four big wins to processing images on your own device:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <span className="text-fg">Privacy.</span> Your files never leave your device, so there is
          no server that could store, leak or train on them.
        </li>
        <li>
          <span className="text-fg">Speed.</span> There is no upload and download round trip. Work
          happens on your local CPU and GPU and finishes as fast as your device can go.
        </li>
        <li>
          <span className="text-fg">Cost.</span> With no servers to process images, the tools can
          stay free with no watermark and no sign-up.
        </li>
        <li>
          <span className="text-fg">Offline.</span> Once the app has loaded, it keeps working with no
          internet connection at all.
        </li>
      </ul>

      <H2>The building blocks</H2>
      <p>
        Modern browsers ship a surprisingly capable image pipeline. We lean on three technologies:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <span className="text-fg">Canvas and OffscreenCanvas</span> decode, draw, resize and
          re-encode JPEG, PNG and WebP natively.
        </li>
        <li>
          <span className="text-fg">Web Workers</span> run the heavy work off the main thread, so the
          interface stays smooth even while a large image is being encoded.
        </li>
        <li>
          <span className="text-fg">WebAssembly</span> handles the formats browsers cannot encode or
          decode on their own.
        </li>
      </ul>

      <H2>Handling the tricky formats</H2>
      <p>
        Not every format is built into the browser, so a few tools bring their own codecs compiled to
        WebAssembly:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <span className="text-fg">HEIC</span> from an iPhone cannot be decoded natively, so we use
          a WebAssembly build of libheif to convert it first. Try{' '}
          <Link to="/convert/heic-to-jpg" className="text-accent hover:underline">
            HEIC to JPG
          </Link>
          .
        </li>
        <li>
          <span className="text-fg">AVIF</span> uses the Squoosh encoder compiled to WebAssembly for
          the smallest files. It powers the{' '}
          <Link to="/compress" className="text-accent hover:underline">
            image compressor
          </Link>
          .
        </li>
        <li>
          <span className="text-fg">Background removal</span> runs an ONNX segmentation model on your
          device. The model downloads once, then the{' '}
          <Link to="/background-remover" className="text-accent hover:underline">
            background remover
          </Link>{' '}
          works offline. Your image is never uploaded.
        </li>
      </ul>

      <H2>Keeping it fast</H2>
      <p>
        Shipping codecs to the browser could easily make the app heavy, so performance is a
        first-class concern:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <span className="text-fg">Route-based code splitting</span> means each tool is a separate
          chunk and the initial download stays tiny.
        </li>
        <li>
          <span className="text-fg">Lazy codecs</span> load the multi-megabyte HEIC and AVIF code
          only when you actually use a tool that needs it.
        </li>
        <li>
          <span className="text-fg">A Progressive Web App shell</span> is cached so repeat visits are
          instant and the whole app works offline.
        </li>
      </ul>

      <H2>The honest trade-offs</H2>
      <p>
        Client-side processing is not magic. Very large batches use your device&rsquo;s memory, and
        some codecs are big first-time downloads (they are cached afterwards). But for the vast
        majority of everyday tasks, doing the work locally is both faster and dramatically more
        private.
      </p>

      <H2>The takeaway</H2>
      <p>
        The result is a toolkit that is private by design: there is no server that could leak your
        images because there is no server in the loop at all. Compress an image, convert a HEIC
        photo, or remove a background, and watch your browser&rsquo;s Network tab stay quiet.
      </p>
    </>
  ),
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? BLOG_BY_SLUG[slug] : undefined;
  const Body = slug ? ARTICLES[slug] : undefined;

  if (!post || !Body) return <Navigate to="/blog" replace />;

  return (
    <div className="max-w-3xl">
      <p className="mb-4">
        <Link to="/blog" className="text-sm text-muted transition hover:text-fg">
          &larr; Back to blog
        </Link>
      </p>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-xs text-muted">
        {formatDate(post.date)} &middot; {post.readingMinutes} min read
      </p>

      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-muted">
        <Body />
      </div>

      <div className="mt-10">
        <Link to="/" className="btn-primary">
          Try the tools
        </Link>
      </div>
    </div>
  );
}
