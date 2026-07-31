export default function About() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About iHateImages</h1>
      <div className="mt-5 space-y-6 text-[15px] leading-relaxed text-muted">
        <p>
          iHateImages is a free, privacy-first image toolkit. Every tool, from compressing and
          converting to resizing, cropping, upscaling and removing backgrounds, runs entirely inside
          your web browser. Your files are never uploaded to a server.
        </p>

        <section>
          <h2 className="text-xl font-bold text-fg">Why we built it</h2>
          <p className="mt-2">
            Most online image tools upload your photos to their servers, stamp them with a
            watermark, hide features behind a sign-up, or bury the page in ads. We wanted the
            opposite: fast, clean tools that respect your privacy and never touch your files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">How it works</h2>
          <p className="mt-2">
            Modern browsers can decode, edit and encode images using JavaScript and WebAssembly.
            iHateImages uses these on-device technologies, including a Web Worker so the interface
            stays smooth, to process everything locally. The app is also a Progressive Web App, so it
            keeps working offline once loaded.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">What you can do</h2>
          <p className="mt-2">
            Compress and convert JPEG, PNG, WebP, AVIF and HEIC; resize and crop; upscale; strip EXIF
            and GPS metadata; remove backgrounds with on-device AI; and generate favicons and
            passport photos, all free and without a watermark.
          </p>
        </section>

        <p>
          Have feedback or a tool you would like to see? We would love to hear it, because the whole
          point is to build the image toolkit we always wished existed.
        </p>
      </div>
    </div>
  );
}
