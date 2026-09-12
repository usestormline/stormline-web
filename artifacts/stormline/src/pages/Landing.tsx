import { useEffect } from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Architecture from '@/components/landing/Architecture';
import FAQ from '@/components/landing/FAQ';
import LiveMarketTicker from '@/components/landing/LiveMarketTicker';
import ProductStory from '@/components/landing/ProductStory';

export default function Landing() {
  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-dark text-white selection:bg-brand selection:text-white">
      <PublicHeader />
      
      <main className="flex-1 flex flex-col">
        <Hero />
        
        <LiveMarketTicker />

        <Features />
        <ProductStory />
        <Architecture />
        <FAQ />
      </main>

      <PublicFooter />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marketTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}} />
    </div>
  );
}
