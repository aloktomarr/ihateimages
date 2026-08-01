import { useTheme } from '../theme';

// Product Hunt "featured" badge. Switches between the light and dark badge to match the theme.
export default function ProductHuntBadge() {
  const { theme } = useTheme();
  const badgeTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <a
      href="https://www.producthunt.com/products/ihateimages?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ihateimages"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
      aria-label="iHateImages on Product Hunt"
    >
      <img
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1211926&theme=${badgeTheme}`}
        alt="iHateImages - Free image toolkit that does everything in your browser | Product Hunt"
        width={250}
        height={54}
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}
