// A clean "Featured on Product Hunt" badge that links to the listing. We use our own badge rather
// than Product Hunt's dynamic image, because that image shows "???" until the product has votes.
export default function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/products/ihateimages?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ihateimages"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="iHateImages on Product Hunt"
      className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-panel px-3 py-2 transition hover:bg-hover"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: '#da552f' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
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
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
          Featured on
        </span>
        <span className="block text-sm font-extrabold text-fg">Product Hunt</span>
      </span>
    </a>
  );
}
