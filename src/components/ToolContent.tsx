import { TOOL_CONTENT } from '../lib/toolContent';
import { FaqSection, RelatedTools, SectionHeader, StepCards } from './Sections';

// Renders the on-page how-to + FAQ content for a tool (Level 3 SEO). Pass the route path.
export default function ToolContent({ slug }: { slug: string }) {
  const data = TOOL_CONTENT[slug];
  if (!data) return null;

  return (
    <div className="mt-28 space-y-28">
      <section>
        <SectionHeader title="How it" accent="works." lead={data.about} />
        <div className="mt-10">
          <StepCards steps={data.steps} />
        </div>
      </section>

      <FaqSection items={data.faq} />

      <RelatedTools path={slug} />
    </div>
  );
}
