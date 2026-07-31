import { Link } from 'react-router-dom';
import { BLOG_POSTS, formatDate } from '../lib/blog';
import { prefetchRoute } from '../lib/routes';

export default function Blog() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 text-[15px] text-muted">
        Notes on private, in-browser image processing and how iHateImages is built.
      </p>

      <div className="mt-8 space-y-4">
        {BLOG_POSTS.map((p) => (
          <Link
            key={p.slug}
            to={p.path}
            onMouseEnter={() => prefetchRoute(p.path)}
            className="card block transition hover:bg-hover"
          >
            <h2 className="text-lg font-bold text-fg">{p.title}</h2>
            <p className="mt-1 text-xs text-muted">
              {formatDate(p.date)} &middot; {p.readingMinutes} min read
            </p>
            <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
