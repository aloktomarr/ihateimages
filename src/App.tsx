import { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import RouteSeo from './components/RouteSeo';
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
  About,
  Privacy,
  Blog,
  ConvertLanding,
  BlogPost,
} = Lazy;

export default function App() {
  useEffect(() => {
    prefetchAllIdle();
  }, []);

  return (
    <div className="min-h-screen">
      <RouteSeo />
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
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
