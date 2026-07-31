import type { SVGProps } from 'react';

export type IconName =
  | 'logo'
  | 'home'
  | 'compress'
  | 'convert'
  | 'resize'
  | 'shield'
  | 'scissors'
  | 'crop'
  | 'upscale'
  | 'star'
  | 'badge'
  | 'sun'
  | 'moon'
  | 'download'
  | 'lock'
  | 'ban'
  | 'bolt'
  | 'phone'
  | 'chevronDown'
  | 'upload'
  | 'rotate'
  | 'pdf';

const PATHS: Record<IconName, JSX.Element> = {
  logo: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4 18l5-5 4 4 3-3 4 4" />
    </>
  ),
  home: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M10 20v-6h4v6" />,
  compress: (
    <>
      <path d="M9 4v5H4M4 9l5-5" />
      <path d="M15 20v-5h5M20 15l-5 5" />
      <path d="M20 4l-5 5M15 4h5v5" />
      <path d="M4 20l5-5M9 20H4v-5" />
    </>
  ),
  convert: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  resize: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  shield: <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />,
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8 8l12 10M8 16L20 6" />
    </>
  ),
  crop: <path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14" />,
  upscale: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6M20 20l-4-4" />
    </>
  ),
  star: <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8-4.3-4.1 5.9-.9L12 3z" />,
  badge: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M5.5 16c.4-1.3 1.4-2 2.5-2s2.1.7 2.5 2M14 10h4M14 14h4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  download: <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />,
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />,
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  upload: <path d="M12 15V4M8 8l4-4 4 4M5 20h14" />,
  rotate: (
    <>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3v5h5" />
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className = 'h-6 w-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
