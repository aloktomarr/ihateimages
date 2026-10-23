import { Link } from 'react-router-dom';
import { Icon } from '../components/icons';
import { PageHeader } from '../components/Sections';
import { BLOG_POSTS, formatDate } from '../lib/blog';
import { prefetchRoute } from '../lib/routes';

export default function Blog() {
  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Blog"
        title="Notes from"
        accent="the browser."
        lead="On private, in-browser image processing, and how iHateImages is built."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {BLOG_POSTS.map((p) => (
          <Link
            key={p.slug}
            to={p.path}
            onMouseEnter={() => prefetchRoute(p.path)}
            className="card-link group flex min-h-[260px] flex-col p-6 sm:p-8"
          >
            <p className="tabular text-[13px] text-muted">
              {formatDate(p.date)} &middot; {p.readingMinutes} min read
            </p>
            <h2 className="mt-auto pt-10 text-[1.6rem] font-semibold leading-tight tracking-[-0.03em] text-fg">
              {p.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.excerpt}</p>
            <span className="mt-6 flex items-center gap-1.5 text-[14px] font-semibold text-fg">
              Read the post
              <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
