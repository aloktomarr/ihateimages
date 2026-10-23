import type { ReactElement } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BLOG_BY_SLUG, formatDate } from '../lib/blog';
import { Icon } from '../components/icons';

// Headings, lists and links are styled by the surrounding .prose-ui block.
function H2({ children }: { children: string }) {
  return <h2>{children}</h2>;
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
      <ul>
        <li>
          <span className="font-semibold text-fg">Privacy.</span> Your files never leave your device, so there is
          no server that could store, leak or train on them.
        </li>
        <li>
          <span className="font-semibold text-fg">Speed.</span> There is no upload and download round trip. Work
          happens on your local CPU and GPU and finishes as fast as your device can go.
        </li>
        <li>
          <span className="font-semibold text-fg">Cost.</span> With no servers to process images, the tools can
          stay free with no watermark and no sign-up.
        </li>
        <li>
          <span className="font-semibold text-fg">Offline.</span> Once the app has loaded, it keeps working with no
          internet connection at all.
        </li>
      </ul>

      <H2>The building blocks</H2>
      <p>
        Modern browsers ship a surprisingly capable image pipeline. We lean on three technologies:
      </p>
      <ul>
        <li>
          <span className="font-semibold text-fg">Canvas and OffscreenCanvas</span> decode, draw, resize and
          re-encode JPEG, PNG and WebP natively.
        </li>
        <li>
          <span className="font-semibold text-fg">Web Workers</span> run the heavy work off the main thread, so the
          interface stays smooth even while a large image is being encoded.
        </li>
        <li>
          <span className="font-semibold text-fg">WebAssembly</span> handles the formats browsers cannot encode or
          decode on their own.
        </li>
      </ul>

      <H2>Handling the tricky formats</H2>
      <p>
        Not every format is built into the browser, so a few tools bring their own codecs compiled to
        WebAssembly:
      </p>
      <ul>
        <li>
          <span className="font-semibold text-fg">HEIC</span> from an iPhone cannot be decoded natively, so we use
          a WebAssembly build of libheif to convert it first. Try{' '}
          <Link to="/convert/heic-to-jpg">
            HEIC to JPG
          </Link>
          .
        </li>
        <li>
          <span className="font-semibold text-fg">AVIF</span> uses the Squoosh encoder compiled to WebAssembly for
          the smallest files. It powers the{' '}
          <Link to="/compress">
            image compressor
          </Link>
          .
        </li>
        <li>
          <span className="font-semibold text-fg">Background removal</span> runs an ONNX segmentation model on your
          device. The model downloads once, then the{' '}
          <Link to="/background-remover">
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
      <ul>
        <li>
          <span className="font-semibold text-fg">Route-based code splitting</span> means each tool is a separate
          chunk and the initial download stays tiny.
        </li>
        <li>
          <span className="font-semibold text-fg">Lazy codecs</span> load the multi-megabyte HEIC and AVIF code
          only when you actually use a tool that needs it.
        </li>
        <li>
          <span className="font-semibold text-fg">A Progressive Web App shell</span> is cached so repeat visits are
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
    <div className="container-page">
      <article className="mx-auto max-w-3xl">
        <header className="pb-10 pt-12 sm:pb-12 sm:pt-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition hover:text-fg"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            All posts
          </Link>
          <p className="tabular mt-10 text-[13.5px] text-muted">
            {formatDate(post.date)} &middot; {post.readingMinutes} min read
          </p>
          <h1 className="display text-display-md mt-4">{post.title}</h1>
          <p className="lead mt-6">{post.description}</p>
        </header>

        <div className="prose-ui border-t border-line pt-6">
          <Body />
        </div>

        <div className="mt-16 flex flex-col items-start gap-5 rounded-[1.5rem] bg-band p-8 text-band-fg sm:flex-row sm:items-center sm:justify-between">
          <p className="display text-[1.75rem] leading-tight">
            See it for <span className="serif-accent text-pop">yourself.</span>
          </p>
          <Link to="/" className="btn btn-pop btn-lg">
            Try the tools <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
