export default function Privacy() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted">Your images never leave your device.</p>

      <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-muted">
        <section>
          <h2 className="text-xl font-bold text-fg">Your images stay on your device</h2>
          <p className="mt-2">
            Every tool on iHateImages processes your files entirely inside your browser using
            JavaScript and WebAssembly. Your images are never uploaded to, stored on, or seen by any
            server.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">What we store</h2>
          <p className="mt-2">
            The only thing we save is your light or dark theme preference, kept in your browser&rsquo;s
            local storage. There are no accounts, and we do not store your images or any personal
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">The background remover model</h2>
          <p className="mt-2">
            The background remover downloads a one-time AI model from a content delivery network so it
            can run on your device. The model comes to you; your image never goes out.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Analytics</h2>
          <p className="mt-2">
            We may use Microsoft Clarity, a privacy-friendly analytics tool, to see anonymized usage
            such as which tools are popular, so we can improve the site. Clarity never has access to
            your images, which are processed only on your device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fg">Contact</h2>
          <p className="mt-2">
            Questions about privacy? Reach out and we will be happy to help.
          </p>
        </section>
      </div>
    </div>
  );
}
