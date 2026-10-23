import { useTheme } from '../theme';
import { Icon } from './icons';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="icon-btn"
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
    </button>
  );
}
