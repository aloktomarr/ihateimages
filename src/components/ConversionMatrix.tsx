import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons';
import { CONVERSIONS_BY_SLUG } from '../lib/landing';
import { prefetchConvertLanding } from '../lib/routes';

const FROM = ['heic', 'jpg', 'png', 'webp', 'avif'];
const TO = ['jpg', 'png', 'webp', 'avif'];
const LABEL: Record<string, string> = { heic: 'HEIC', jpg: 'JPG', png: 'PNG', webp: 'WebP', avif: 'AVIF' };

// Every supported conversion as a from/to grid: rows are what you have, columns what you want.
export default function ConversionMatrix() {
  const { pathname } = useLocation();
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <caption className="sr-only">Image format conversions</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
              From <Icon name="arrowRight" className="mx-1 inline h-3.5 w-3.5 align-[-2px]" /> To
            </th>
            {TO.map((t) => (
              <th key={t} scope="col" className="px-3 py-4 text-[15px] font-semibold text-fg">
                {LABEL[t]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FROM.map((f) => (
            <tr key={f} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-5 py-3 text-[15px] font-semibold text-fg">
                {LABEL[f]}
              </th>
              {TO.map((t) => {
                const c = CONVERSIONS_BY_SLUG[`${f}-to-${t}`];
                if (!c) {
                  return (
                    <td key={t} className="px-3 py-3 text-faint" aria-label="Same format">
                      &mdash;
                    </td>
                  );
                }
                const here = pathname === c.path;
                return (
                  <td key={t} className="px-2 py-2">
                    <Link
                      to={c.path}
                      onMouseEnter={prefetchConvertLanding}
                      aria-current={here ? 'page' : undefined}
                      className={`group inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-semibold transition ${
                        here ? 'bg-ink text-ink-fg' : 'bg-subtle/70 text-fg hover:bg-ink hover:text-ink-fg'
                      }`}
                    >
                      {LABEL[f]} to {LABEL[t]}
                      <Icon
                        name="arrowRight"
                        className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
