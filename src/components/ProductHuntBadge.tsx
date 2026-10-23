// A clean "Featured on Product Hunt" badge that links to the listing. We use our own badge rather
// than Product Hunt's dynamic image, because that image shows "???" until the product has votes.
export default function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/products/ihateimages?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ihateimages"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="iHateImages on Product Hunt"
      className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-3 transition hover:border-line-strong"
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: '#da552f' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 15l6-6 6 6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-[9.5px] font-semibold uppercase tracking-wide text-muted">Featured on</span>
        <span className="block text-[13px] font-bold text-fg">Product Hunt</span>
      </span>
    </a>
  );
}
