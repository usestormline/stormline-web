import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Switch, useLocation } from 'wouter';

const Landing = lazy(() => import('@/pages/Landing'));
const Stats = lazy(() => import('@/pages/Stats'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const ShieldRules = lazy(() => import('@/pages/ShieldRules'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Activity = lazy(() => import('@/pages/Activity'));
const Settings = lazy(() => import('@/pages/Settings'));
const MarketImpact = lazy(() => import('@/pages/MarketImpact'));
const ProtectionCoverage = lazy(() => import('@/pages/ProtectionCoverage'));
const TransferStockToken = lazy(() => import('@/pages/TransferStockToken'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const TokenUtilityHub = lazy(() => import('@/pages/TokenUtilityHub'));
const DividendAccess = lazy(() => import('@/pages/DividendAccess'));
const StrategyCenter = lazy(() => import('@/pages/StrategyCenter'));
const Newswire = lazy(() => import('@/pages/Newswire'));
const TradingDesk = lazy(() => import('@/pages/TradingDesk'));
const AppShell = lazy(() => import('@/components/layout/AppShell'));
const WalletProvider = lazy(() => import('@/lib/wallet'));

function RouteLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#f5f5f5]" aria-busy="true" aria-label="Loading page" />
  );
}

function Shell({ children, walletEnabled = true }: { children: ReactNode; walletEnabled?: boolean }) {
  return <AppShell walletEnabled={walletEnabled}>{children}</AppShell>;
}

function usesWallet(path: string) {
  return !(
    path === '/' ||
    path === '/stats' ||
    path === '/calendar' ||
    path.startsWith('/events/')
  );
}

export default function App() {
  const [path] = useLocation();

  const routes = (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/stats" component={Stats} />

      <Route path="/calendar">
        <Shell walletEnabled={false}><CalendarPage /></Shell>
      </Route>

      <Route path="/market-impact">
        <Shell><MarketImpact /></Shell>
      </Route>

      <Route path="/app/news">
        <Shell><Newswire /></Shell>
      </Route>

      <Route path="/events/:id">
        <Shell walletEnabled={false}><EventDetail /></Shell>
      </Route>
      
      <Route path="/app">
        <Shell><Dashboard /></Shell>
      </Route>
      
      <Route path="/app/strategy">
        <Shell><StrategyCenter /></Shell>
      </Route>

      <Route path="/app/trading">
        <Shell><TradingDesk /></Shell>
      </Route>

      <Route path="/app/tools">
        <Shell><TokenUtilityHub /></Shell>
      </Route>

      <Route path="/app/shield">
        <Shell><ShieldRules /></Shell>
      </Route>

      <Route path="/app/coverage">
        <Shell><ProtectionCoverage /></Shell>
      </Route>
      
      <Route path="/app/portfolio">
        <Shell><Portfolio /></Shell>
      </Route>

      <Route path="/app/transfer">
        <Shell><TransferStockToken /></Shell>
      </Route>

      <Route path="/app/dividend-access">
        <Shell><DividendAccess /></Shell>
      </Route>
      
      <Route path="/app/activity">
        <Shell><Activity /></Shell>
      </Route>
      
      <Route path="/app/settings">
        <Shell><Settings /></Shell>
      </Route>
      
      <Route>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center font-mono bg-white text-black">
          <div className="display text-8xl mb-4">404</div>
          <p className="text-muted uppercase tracking-widest text-sm mb-8">Path Not Found</p>
          <a href="/" className="btn btn-outline border-black">Return Home</a>
        </div>
      </Route>
    </Switch>
  );

  return (
    <Suspense fallback={<RouteLoading />}>
      {usesWallet(path) ? <WalletProvider>{routes}</WalletProvider> : routes}
    </Suspense>
  );
}
