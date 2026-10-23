import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import RouteSeo from './components/RouteSeo';
import IncomingImageBridge from './components/IncomingImageBridge';
import GlobalDrop from './components/GlobalDrop';
import CommandPalette from './components/CommandPalette';
import { Lazy, prefetchAllIdle } from './lib/routes';

// Tool pages are separate lazy chunks (route-based code splitting) and are also prefetched on
// idle / hover, so the first click on any tool is instant.
const {
  Compress,
  Convert,
  Resize,
  StripMetadata,
  BackgroundRemover,
  Crop,
  Upscale,
  Favicon,
  PassportPhoto,
  Rotate,
  ImageToPdf,
  About,
  Privacy,
  Blog,
  ConvertLanding,
  BlogPost,
  Integrations,
} = Lazy;

// Start each new page at the top (the router keeps the old scroll position otherwise).
// Links with a #hash scroll to their target instead.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    prefetchAllIdle();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ink-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <RouteSeo />
      <ScrollToTop />
      <IncomingImageBridge />
      <GlobalDrop />
      <CommandPalette />
      <TopNav />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <div className="py-40">
              <Spinner label="Loading" />
            </div>
          }
        >
          <div key={pathname} className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/compress" element={<Compress />} />
              <Route path="/convert" element={<Convert />} />
              <Route path="/convert/:slug" element={<ConvertLanding />} />
              <Route path="/resize" element={<Resize />} />
              <Route path="/strip-metadata" element={<StripMetadata />} />
              <Route path="/background-remover" element={<BackgroundRemover />} />
              <Route path="/crop" element={<Crop />} />
              <Route path="/upscale" element={<Upscale />} />
              <Route path="/favicon" element={<Favicon />} />
              <Route path="/passport-photo" element={<PassportPhoto />} />
              <Route path="/rotate" element={<Rotate />} />
              <Route path="/image-to-pdf" element={<ImageToPdf />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/share-target" element={<Navigate to="/compress" replace />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
