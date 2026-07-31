import { TOOL_CONTENT } from '../lib/toolContent';

// Renders the on-page how-to + FAQ content for a tool (Level 3 SEO). Pass the route path.
export default function ToolContent({ slug }: { slug: string }) {
  const data = TOOL_CONTENT[slug];
  if (!data) return null;

  return (
    <div className="mt-14 max-w-3xl space-y-10">
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight">How it works</h2>
        <p className="mt-3 text-[15px] text-muted">{data.about}</p>
        <ol className="mt-4 space-y-3">
          {data.steps.map((s, i) => (
            <li key={s.name} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[15px] text-fg">
                <span className="font-semibold">{s.name}.</span>{' '}
                <span className="text-muted">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          {data.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-fg">{f.q}</h3>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
