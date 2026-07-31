import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SEO, OG_IMAGE, SEO_BY_PATH, SITE_NAME, SITE_URL } from '../lib/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Keeps the document head in sync with the current route for search engines and social sharing.
// Google renders client-side JS, so per-route titles, descriptions, canonicals and JSON-LD set
// here are indexed; the static tags in index.html cover the (home) first paint.
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', OG_IMAGE);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', OG_IMAGE);

    const id = 'route-jsonld';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (meta.jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(meta.jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [pathname]);

  return null;
}
