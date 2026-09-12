import { Link } from 'wouter';
import { ArrowRight, Plus } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative px-6 md:px-12 py-24 md:py-32 overflow-hidden flex flex-col justify-between" style={{ minHeight: '85vh' }}>
      <div className="absolute right-0 bottom-0 w-[60vw] h-[60vw] max-w-[1000px] max-h-[1000px] bg-brand opacity-20 rounded-full blur-[150px] pointer-events-none translate-x-1/4 translate-y-1/4" />
      
      <div className="grid md:grid-cols-2 gap-12 max-w-[1600px] mx-auto w-full relative z-10 mb-20 flex-1">
        <div className="max-w-md pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#333] mb-8 text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
            <span className="w-1.5 h-1.5 bg-brand rounded-full" />
            Verified Market Intelligence
          </div>
          <p className="text-[#a1a1aa] leading-relaxed text-base md:text-lg">
            Track verified macro and policy events alongside canonical Robinhood Stock Token
            positions. Stormline provides source evidence and exposure context without predicting
            market direction or taking control of user assets.
          </p>
          <Link href="/app" className="inline-flex items-center gap-2 mt-10 text-brand font-medium hover:text-white transition-colors uppercase tracking-widest font-mono text-sm">
            Launch Platform <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex md:justify-end">
          <div className="text-right flex flex-col items-end">
            <Plus size={16} className="text-[#666] inline-block mb-4" />
            <p className="font-mono text-xs text-[#a1a1aa] uppercase tracking-widest text-right leading-relaxed border-r border-[#333] pr-4">
               Evidence<br/>before<br/>action
            </p>
            <div className="mt-8 border border-[#222] bg-[#0a0a0a] p-4 text-left max-w-xs w-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand origin-top scale-y-50 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
               <div className="text-[#666] font-mono text-[10px] uppercase mb-1">Verified Coverage</div>
               <div className="text-sm font-medium">Events + Stock Token exposure</div>
              <div className="text-xs text-[#a1a1aa] mt-2 flex justify-between">
                 <span>Robinhood Chain</span>
                  <span className="text-brand">194 contracts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full relative z-10">
        <h1 className="display text-[15vw] md:text-[180px] lg:text-[220px] leading-none tracking-tighter m-0 flex flex-col md:flex-row md:items-end">
          STORM
          <span className="font-sans font-normal text-[10vw] md:text-[80px] lg:text-[100px] text-[#a1a1aa] md:ml-4 md:mb-6 lg:mb-9 tracking-tight">Line</span>
        </h1>
      </div>
    </section>
  );
}
