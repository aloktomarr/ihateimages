import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import RouteSeo from './components/RouteSeo';
import IncomingImageBridge from './components/IncomingImageBridge';
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

export default function App() {
  useEffect(() => {
    prefetchAllIdle();
  }, []);

  return (
    <div className="min-h-screen">
      <RouteSeo />
      <IncomingImageBridge />
      <TopNav />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Suspense fallback={<div className="py-24"><Spinner label="Loading tool" /></div>}>
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
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
