import { Link } from 'wouter';
import stormlineLogo from '@/assets/stormline-logo-transparent.png';

export default function Logo({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold display text-lg tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <img
          src={stormlineLogo}
          alt=""
          aria-hidden="true"
          className={`h-full w-full object-contain ${isDark ? '' : 'invert'}`}
        />
      </span>
      STORMLINE
    </Link>
  );
}