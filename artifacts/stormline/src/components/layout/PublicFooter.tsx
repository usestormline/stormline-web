import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export default function PublicFooter() {
  return (
    <footer className="bg-dark text-white border-t border-[#222] pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="mb-6"><Logo theme="dark" /></div>
            <p className="text-[#a1a1aa] max-w-sm text-sm leading-relaxed mb-6">
              Verified event intelligence and canonical Robinhood Stock Token exposure in one
              non-custodial interface.
            </p>
            <div className="inline-block border border-brand/30 bg-brand/5 text-brand px-3 py-1.5 text-xs font-mono uppercase tracking-widest">
              Live Verified Feeds
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#666] mb-6">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
              <li><Link href="/" className="hover:text-white transition-colors">Platform Overview</Link></li>
              <li><a href="/#architecture" className="hover:text-white transition-colors">Architecture</a></li>
              <li><Link href="/stats" className="hover:text-white transition-colors">Network Statistics</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">Storm Calendar</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#666] mb-6">Legal & Meta</h4>
            <ul className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">System Status</span></li>
              <li>
                <a
                  href="https://x.com/UseStormLine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  aria-label="Follow Stormline on X, opens in a new tab"
                >
                  X / @UseStormLine
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-[#666] font-mono leading-relaxed">
          <p>© {new Date().getFullYear()} Stormline Protocol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
