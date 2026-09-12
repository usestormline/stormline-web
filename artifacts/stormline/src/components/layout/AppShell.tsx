import { lazy, Suspense, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  FileClock,
  Home,
  Landmark,
  Menu,
  Newspaper,
  Radar,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import Logo from './Logo';

const WalletNetworkStatus = lazy(() => import('@/components/wallet/WalletNetworkStatus'));
const ChainGuard = lazy(() => import('@/components/wallet/ChainGuard'));

const navSections = [
  {
    label: 'Overview',
    items: [{ href: '/app', label: 'Intelligence Command', icon: Home }],
  },
  {
    label: 'Geopolitical Intelligence',
    items: [
      { href: '/market-impact', label: 'Geopolitical Impact', icon: Radar },
      { href: '/calendar', label: 'Event Intelligence', icon: CalendarDays },
      { href: '/app/news', label: 'Newswire', icon: Newspaper },
    ],
  },
  {
    label: 'Strategy & Execution',
    items: [
      { href: '/app/strategy', label: 'Strategy Center', icon: Target },
      { href: '/app/portfolio', label: 'Asset Management', icon: Landmark },
      { href: '/app/trading', label: 'Trading Desk', icon: TrendingUp },
      { href: '/app/dividend-access', label: 'Dividend Monitor', icon: CircleDollarSign },
    ],
  },
  {
    label: 'Protection Automation',
    items: [
      { href: '/app/coverage', label: 'Protection Coverage', icon: ShieldCheck },
      { href: '/app/shield', label: 'Monitoring Rules', icon: ShieldCheck },
      { href: '/app/activity', label: 'Execution Activity', icon: FileClock },
    ],
  },
  {
    label: 'System & Tools',
    items: [
      { href: '/app/tools', label: 'Utility Hub', icon: Wrench },
      { href: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
] as const;

const mobileNavItems = [
  { href: '/app', label: 'Command', icon: Home },
  { href: '/app/portfolio', label: 'Assets', icon: Landmark },
  { href: '/app/trading', label: 'Trade', icon: TrendingUp },
  { href: '/market-impact', label: 'Impact', icon: Radar },
  { href: '/app/dividend-access', label: 'Dividend', icon: CircleDollarSign },
] as const;

export default function AppShell({
  children,
  walletEnabled = true,
}: {
  children: ReactNode;
  walletEnabled?: boolean;
}) {
  const [loc] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-[#f5f5f5] text-black">
      <aside className="hidden lg:flex flex-col w-64 border-r border-line-strong bg-white shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-line-strong shrink-0">
          <Logo />
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-8 overflow-y-auto">
          {navSections.map((section) => (
            <section key={section.label}>
              <div className="eyebrow mb-3">{section.label}</div>
              <nav className="flex flex-col gap-1 -mx-3" aria-label={section.label}>
                {section.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-10 items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                      loc === href || (loc.startsWith('/events') && href === '/calendar')
                        ? 'bg-black text-white shadow-[2px_2px_0_var(--brand)]'
                        : 'text-muted hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </nav>
            </section>
          ))}
        </div>

        <div className="p-6 border-t border-line-strong shrink-0 mt-auto space-y-3">
          <Link
            href="/"
            className="flex min-h-10 items-center gap-3 border border-line-strong px-3 text-sm font-medium text-muted transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Exit to Home
          </Link>
          <div className="flex items-center gap-2 p-3 bg-white border border-line-strong text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-green-600 block shrink-0" />
            <span className="text-muted">Mode:</span>
            <span>Monitor</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-line-strong bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="lg:hidden mr-4">
              <Logo />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted">
              <span>POLITICAL DEFI</span>
              <span>/</span>
              <span className="text-black uppercase">{loc === '/app' ? 'COMMAND' : loc.split('/').pop()?.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <details className="group relative lg:hidden">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 border border-line-strong px-3 text-xs font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <Menu size={16} aria-hidden="true" />
                Menu
              </summary>
              <div className="absolute right-0 top-12 z-50 max-h-[75vh] w-72 overflow-y-auto border border-line-strong bg-white p-4 shadow-xl">
                {navSections.map((section) => (
                  <nav key={section.label} aria-label={`${section.label} mobile`} className="mb-5 last:mb-0">
                    <p className="eyebrow mb-2">{section.label}</p>
                    {section.items.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`flex min-h-11 items-center gap-3 px-3 py-2 text-sm font-medium ${
                          loc === href || (loc.startsWith('/events') && href === '/calendar')
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </nav>
                ))}
              </div>
            </details>
            {walletEnabled && (
              <div className="hidden min-w-0 sm:block">
                <Suspense fallback={null}>
                  <WalletNetworkStatus />
                </Suspense>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {!walletEnabled || loc === '/app/dividend-access' || loc === '/app/strategy' || loc === '/app/news' || loc === '/app/trading'
              ? children
              : <Suspense fallback={null}><ChainGuard>{children}</ChainGuard></Suspense>}
          </div>
        </main>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-line-strong bg-white flex items-center justify-around z-20 shrink-0">
        {mobileNavItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider ${loc === href ? 'text-black' : 'text-muted'}`}>
            <Icon size={20} strokeWidth={loc === href ? 2.5 : 1.5} />
            {label.split(' ')[0]}
          </Link>
        ))}
      </div>
    </div>
  );
}
