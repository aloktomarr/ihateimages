import { Icon } from '../components/icons';
import { PageHeader } from '../components/Sections';

const SHORT_VERSION = [
  'Your images are processed on your device and never uploaded.',
  'We save only your light or dark theme choice, in your browser.',
  'Anonymous usage analytics never have access to your images.',
];

export default function Privacy() {
  return (
    <div className="container-page">
      <PageHeader eyebrow="Privacy policy" title="Your images never" accent="leave your device." />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="prose-ui max-w-3xl lg:order-1">
          <h2>Your images stay on your device</h2>
          <p>
            Every tool on iHateImages processes your files entirely inside your browser using JavaScript and
            WebAssembly. Your images are never uploaded to, stored on, or seen by any server.
          </p>

          <h2>What we store</h2>
          <p>
            The only thing we save is your light or dark theme preference, kept in your browser&rsquo;s local storage.
            There are no accounts, and we do not store your images or any personal information.
          </p>

          <h2>The background remover model</h2>
          <p>
            The background remover downloads a one-time AI model from a content delivery network so it can run on your
            device. The model comes to you; your image never goes out.
          </p>

          <h2>Analytics</h2>
          <p>
            We may use Microsoft Clarity, a privacy-friendly analytics tool, to see anonymized usage such as which tools
            are popular, so we can improve the site. Clarity never has access to your images, which are processed only
            on your device.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy?{' '}
            <a href="https://github.com/aloktomarr/ihateimages/issues" target="_blank" rel="noopener noreferrer">
              Reach out on GitHub
            </a>{' '}
            and we will be happy to help.
          </p>
        </div>

        <aside className="lg:order-2">
          <div className="card p-6 lg:sticky lg:top-24">
            <p className="eyebrow">The short version</p>
            <ul className="mt-5 space-y-4">
              {SHORT_VERSION.map((line) => (
                <li key={line} className="flex gap-3 text-[14.5px] leading-snug text-fg">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pop text-pop-fg">
                    <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="hint mt-6 border-t border-line pt-4">
              Want proof? Open your browser&rsquo;s developer tools, switch to the Network tab and use any tool. No
              image ever leaves the page.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
