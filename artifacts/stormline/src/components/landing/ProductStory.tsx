import { Link } from 'wouter';
import { ArrowRight, FileCheck, Layers, PenLine, X } from 'lucide-react';
import stormlineLogo from '@/assets/stormline-logo-transparent.png';
import bloombergLogo from '@/assets/brands/bloomberg.png';
import alphaSenseLogo from '@/assets/brands/alphasense.png';
import fiscalNoteLogo from '@/assets/brands/fiscalnote.png';
import polymarketLogo from '@/assets/brands/polymarket.png';
import EconomicCalendarPreview from '@/components/landing/EconomicCalendarPreview';

const COMPARE_DATA = [
  {
    name: "Stormline",
    logo: stormlineLogo,
    logoClass: "invert",
    highlight: true,
    primary: "On-chain exposure context",
    attributes: [
      { label: "Official/policy source context", val: "Core" },
      { label: "Global news geography", val: "Core" },
      { label: "Broad institutional market research", val: "Different purpose" },
      { label: "Prediction probabilities", val: "Different purpose" },
      { label: "Canonical Robinhood Stock Token resolution", val: "Core" },
      { label: "Wallet-level on-chain exposure", val: "Core" },
      { label: "Corporate-action multiplier monitoring", val: "Core" },
      { label: "User-authored strategy trail", val: "Core" },
      { label: "Live order execution", val: "Coming Soon" },
    ]
  },
  {
    name: "Bloomberg Terminal",
    logo: bloombergLogo,
    highlight: false,
    primary: "Integrated financial data & workflows",
    attributes: [
      { label: "Official/policy source context", val: "Partial" },
      { label: "Global news geography", val: "Core" },
      { label: "Broad institutional market research", val: "Core" },
      { label: "Prediction probabilities", val: "Not advertised" },
      { label: "Canonical Robinhood Stock Token resolution", val: "Not advertised" },
      { label: "Wallet-level on-chain exposure", val: "Not advertised" },
      { label: "Corporate-action multiplier monitoring", val: "Not advertised" },
      { label: "User-authored strategy trail", val: "Partial" },
      { label: "Live order execution", val: "Not advertised" },
    ]
  },
  {
    name: "AlphaSense",
    logo: alphaSenseLogo,
    highlight: false,
    primary: "AI document search",
    attributes: [
      { label: "Official/policy source context", val: "Partial" },
      { label: "Global news geography", val: "Partial" },
      { label: "Broad institutional market research", val: "Core" },
      { label: "Prediction probabilities", val: "Different purpose" },
      { label: "Canonical Robinhood Stock Token resolution", val: "Not advertised" },
      { label: "Wallet-level on-chain exposure", val: "Not advertised" },
      { label: "Corporate-action multiplier monitoring", val: "Not advertised" },
      { label: "User-authored strategy trail", val: "Not advertised" },
      { label: "Live order execution", val: "Different purpose" },
    ]
  },
  {
    name: "FiscalNote / PolicyNote",
    logo: fiscalNoteLogo,
    highlight: false,
    primary: "Policy & stakeholder tracking",
    attributes: [
      { label: "Official/policy source context", val: "Core" },
      { label: "Global news geography", val: "Partial" },
      { label: "Broad institutional market research", val: "Different purpose" },
      { label: "Prediction probabilities", val: "Different purpose" },
      { label: "Canonical Robinhood Stock Token resolution", val: "Not advertised" },
      { label: "Wallet-level on-chain exposure", val: "Not advertised" },
      { label: "Corporate-action multiplier monitoring", val: "Not advertised" },
      { label: "User-authored strategy trail", val: "Not advertised" },
      { label: "Live order execution", val: "Different purpose" },
    ]
  },
  {
    name: "Polymarket",
    logo: polymarketLogo,
    highlight: false,
    primary: "Prediction markets",
    attributes: [
      { label: "Official/policy source context", val: "Different purpose" },
      { label: "Global news geography", val: "Partial" },
      { label: "Broad institutional market research", val: "Not advertised" },
      { label: "Prediction probabilities", val: "Core" },
      { label: "Canonical Robinhood Stock Token resolution", val: "Not advertised" },
      { label: "Wallet-level on-chain exposure", val: "Not advertised" },
      { label: "Corporate-action multiplier monitoring", val: "Not advertised" },
      { label: "User-authored strategy trail", val: "Not advertised" },
      { label: "Live order execution", val: "Different purpose" },
    ]
  }
];

const getValueColor = (val: string) => {
  switch (val) {
    case 'Core': return 'text-brand font-bold';
    case 'Partial': return 'text-black';
    case 'Different purpose': return 'text-muted';
    case 'Not advertised': return 'text-muted opacity-50';
    case 'Coming Soon': return 'text-brand border border-brand/30 px-1.5 py-0.5 text-[10px] rounded-sm';
    default: return '';
  }
};

export default function ProductStory() {
  const attributesList = COMPARE_DATA[0].attributes.map(a => a.label);

  return (
    <div className="bg-white text-black border-t border-line-strong">
      
      {/* 1. ABOUT (#about) */}
      <section id="about" className="scroll-mt-24 px-6 md:px-12 py-24 md:py-32 border-b border-line-strong">
        <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="eyebrow mb-6 text-brand">01 — About</div>
            <h2 className="display text-4xl md:text-5xl tracking-tight leading-[1.1] mb-8">
              Intelligence built for on-chain realities.
            </h2>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg leading-relaxed mb-8">
                Stormline is a geopolitical, political, and macro-event intelligence workspace built specifically around <strong>Robinhood Stock Tokens</strong>. It closes the gap between off-chain global events and on-chain portfolio exposure.
              </p>
              <div className="space-y-4 mb-8">
                <div className="font-mono text-xs uppercase tracking-widest text-muted border-b border-line-strong pb-2">Product Surfaces</div>
                <ul className="space-y-3 text-sm leading-relaxed text-[#333]">
                  <li className="flex gap-3"><span className="text-brand">/</span> Official/calendar/news ingestion</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Global Risk Map for spatial context</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Canonical chain-4663 asset resolution</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Latest underlying-market quote context</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Wallet exposure tracking</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Dividend & corporate-action multiplier terminal</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> User-authored strategy and trading drafts</li>
                  <li className="flex gap-3"><span className="text-brand">/</span> Rules-based monitoring and evaluation</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/app" className="btn btn-outline text-xs">Terminal</Link>
                <Link href="/calendar" className="btn btn-outline text-xs">Calendar</Link>
                <Link href="/market-impact" className="btn btn-outline text-xs">Impact</Link>
                <Link href="/app/news" className="btn btn-outline text-xs">News</Link>
              </div>
            </div>
            <div>
              <EconomicCalendarPreview />
            </div>
          </div>
        </div>
      </section>
      
      {/* 2. HOW TO USE (#how-to) */}
      <section id="how-to" className="scroll-mt-24 px-6 md:px-12 py-24 md:py-32 border-b border-line-strong bg-[#f9f9f9]">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="eyebrow mb-6 text-brand">02 — How To Use</div>
          <h2 className="display text-4xl md:text-5xl tracking-tight leading-none mb-16">
            Operational Workflow
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-line-strong">
            {[
              { num: "01", title: "Verify", text: "Official-source events and releases with UTC timestamps and provider status.", link: "/calendar" },
              { num: "02", title: "Locate", text: "Inspect the Global Risk Map and distinguish mapped vs unmapped geography.", link: "/app" },
              { num: "03", title: "Resolve", text: "Map affected symbols exclusively to canonical chain-4663 contracts.", link: "/app/portfolio" },
              { num: "04", title: "Inspect", text: "Review latest FMP underlying quote, market statistics, event rationale, and corporate-action multipliers without claiming causality.", link: "/market-impact" },
              { num: "05", title: "Plan", text: "Write a user-authored strategy or local Trading Desk draft; no order submission.", link: "/app/trading" },
              { num: "06", title: "Monitor & Evaluate", text: "Use rules, coverage, activity, and later compare outcomes against the original thesis.", link: "/app/shield" }
            ].map((step, i) => (
              <div key={i} className="p-8 border-r border-b border-line-strong bg-white hover:bg-[#f9f9f9] transition-colors flex flex-col justify-between group">
                <div>
                  <div className="text-brand font-mono text-xs mb-6 uppercase tracking-widest">Step {step.num}</div>
                  <h3 className="font-display text-2xl mb-4 font-bold">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-8">{step.text}</p>
                </div>
                <Link href={step.link} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black group-hover:text-brand transition-colors w-max">
                  Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUCT THESIS (#thesis) */}
      <section id="thesis" className="scroll-mt-24 px-6 md:px-12 py-24 md:py-32 border-b border-line-strong bg-white">
        <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="eyebrow mb-6 text-brand">03 — Product Thesis</div>
            <h2 className="display text-4xl md:text-5xl tracking-tight leading-none mb-16">
              Evidence over prediction.
            </h2>
            <div className="grid sm:grid-cols-2 gap-12">
              {[
                { l: "A", title: "Event timing vs. market timing", text: "Official policy/macro events often occur outside underlying market hours. On-chain assets and global audiences remain active, so precise UTC event windows matter." },
                { l: "B", title: "Asset identity precedes analysis", text: "Ticker matching alone is unsafe. Verifiable canonical contract resolution on chain-4663 must come first before any exposure is analyzed." },
                { l: "C", title: "Provenance beats unsupported prediction", text: "Original sources, accurate timestamps, provider degradation, and unmapped states are more auditable than fabricated confidence scores." },
                { l: "D", title: "Decisions need an audit trail", text: "The decision chain remains traceable: event → affected canonical asset → user thesis → monitoring → evaluation." }
              ].map(point => (
                <div key={point.l}>
                  <div className="font-mono text-brand text-xs uppercase mb-4 tracking-widest">[{point.l}]</div>
                  <h3 className="font-bold text-lg mb-3">{point.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="bg-white border border-line-strong p-6 sm:p-8 shadow-sm flex flex-col h-full justify-between">

              <div className="flex items-start justify-between border-b border-line-strong pb-5 mb-10">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-brand mb-1">Evidence Boundary</h3>
                  <div className="font-mono text-[10px] text-muted uppercase">System Architecture</div>
                </div>
                <div className="flex gap-1.5 mt-1" aria-hidden="true">
                  <div className="w-1.5 h-1.5 bg-brand animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-line-strong" />
                  <div className="w-1.5 h-1.5 bg-line-strong" />
                </div>
              </div>

              <div className="relative flex-1 pl-2 mb-10">
                <div className="absolute left-[27px] top-10 bottom-10 w-px bg-line" aria-hidden="true">
                  <div className="w-full h-full bg-gradient-to-b from-brand/0 via-brand/40 to-brand/0 animate-pulse motion-reduce:hidden" />
                </div>

                <div className="flex flex-col gap-12 relative">
                  <div className="flex gap-5 items-start">
                    <div className="relative z-10 w-12 h-12 bg-white border border-line-strong flex items-center justify-center shrink-0">
                      <FileCheck size={20} className="text-black" />
                    </div>
                    <div className="pt-1">
                      <div className="font-sans text-sm font-bold text-black mb-1">1. Verified Event</div>
                      <div className="font-mono text-[10px] text-muted uppercase tracking-widest">Source + UTC</div>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="relative z-10 w-12 h-12 bg-white border border-brand flex items-center justify-center shrink-0 shadow-[4px_4px_0_var(--brand-muted)]">
                      <Layers size={20} className="text-brand" />
                    </div>
                    <div className="pt-1">
                      <div className="font-sans text-sm font-bold text-brand mb-1">2. Stormline Layer</div>
                      <div className="font-mono text-[10px] text-brand/70 uppercase tracking-widest">Canonical identity + Provenance</div>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="relative z-10 w-12 h-12 bg-white border border-line-strong flex items-center justify-center shrink-0">
                      <PenLine size={20} className="text-black" />
                    </div>
                    <div className="pt-1">
                      <div className="font-sans text-sm font-bold text-black mb-1">3. User Decision</div>
                      <div className="font-mono text-[10px] text-muted uppercase tracking-widest">Authored Thesis</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative py-4 mb-8" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-line-strong"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 font-mono text-[10px] text-[#d32f2f] uppercase tracking-widest border border-[#d32f2f]/30 py-1">Execution Boundary</span>
                </div>
              </div>

              <div className="bg-[#f9f9f9] border border-line p-5">
                <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-4 pb-3 border-b border-line">System Constraints</div>
                <ul className="space-y-3.5 text-xs font-mono text-muted leading-tight">
                  <li className="flex gap-3 items-start"><X size={14} className="text-brand shrink-0 mt-0.5" /> <span>No event-price causality</span></li>
                  <li className="flex gap-3 items-start"><X size={14} className="text-brand shrink-0 mt-0.5" /> <span>No guaranteed returns</span></li>
                  <li className="flex gap-3 items-start"><X size={14} className="text-brand shrink-0 mt-0.5" /> <span>No token-price oracle</span></li>
                  <li className="flex gap-3 items-start"><X size={14} className="text-brand shrink-0 mt-0.5" /> <span>No automatic trade execution</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON (#compare) */}
      <section id="compare" className="scroll-mt-24 px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="eyebrow mb-6 text-brand">04 — Comparison</div>
          <h2 className="display text-4xl md:text-5xl tracking-tight leading-none mb-6">
            Market Context
          </h2>
          <p className="text-muted max-w-2xl mb-16 text-lg leading-relaxed">
            A fact-based comparison against other intelligence platforms. Claims strictly mirror public positioning.
          </p>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto border border-line-strong bg-white">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line-strong bg-[#f9f9f9]">
                  <th className="p-5 font-mono uppercase tracking-widest text-xs font-normal border-r border-line-strong w-1/4">Capability</th>
                  {COMPARE_DATA.map(p => (
                    <th key={p.name} className={`p-5 font-display font-bold text-lg border-r border-line-strong last:border-0 w-[15%] ${p.highlight ? 'bg-brand/5 text-brand' : ''}`}>
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white p-1.5">
                          <img
                            src={p.logo}
                            alt=""
                            aria-hidden="true"
                            className={`h-full w-full object-contain ${p.logoClass ?? ''}`}
                          />
                        </span>
                        <span>{p.name}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-line-strong">
                  <td className="p-5 border-r border-line-strong text-muted uppercase tracking-widest">Primary Job</td>
                  {COMPARE_DATA.map(p => (
                    <td key={p.name} className={`p-5 border-r border-line-strong last:border-0 ${p.highlight ? 'bg-brand/5' : ''}`}>
                      {p.primary}
                    </td>
                  ))}
                </tr>
                {attributesList.map((attrLabel, idx) => (
                  <tr key={idx} className="border-b border-line-strong last:border-0 hover:bg-[#f9f9f9] transition-colors">
                    <td className="p-5 border-r border-line-strong text-muted font-sans font-medium text-sm">{attrLabel}</td>
                    {COMPARE_DATA.map((p, pIdx) => {
                      const attrVal = p.attributes.find(a => a.label === attrLabel)?.val || '';
                      return (
                        <td key={pIdx} className={`p-5 border-r border-line-strong last:border-0 ${p.highlight ? 'bg-brand/5' : ''}`}>
                           <span className={getValueColor(attrVal)}>{attrVal}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-8">
            {COMPARE_DATA.map((product, i) => (
              <div key={i} className={`border border-line-strong p-6 sm:p-8 ${product.highlight ? 'bg-brand/5 border-brand' : 'bg-white shadow-sm'}`}>
                <div className="mb-6">
                  <h3 className="font-display font-bold text-2xl mb-2">
                    <span className={`flex items-center gap-3 ${product.highlight ? 'text-brand' : ''}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white p-1.5">
                        <img
                          src={product.logo}
                          alt=""
                          aria-hidden="true"
                          className={`h-full w-full object-contain ${product.logoClass ?? ''}`}
                        />
                      </span>
                      <span>{product.name}</span>
                    </span>
                  </h3>
                  <div className="font-mono text-xs uppercase text-muted tracking-widest">
                    {product.primary}
                  </div>
                </div>
                
                <div className="border-t border-line-strong pt-6 space-y-4">
                  {product.attributes.map((attr, j) => (
                    <div key={j} className="flex justify-between items-center gap-4">
                      <div className="text-sm font-medium text-muted w-1/2">{attr.label}</div>
                      <div className={`w-1/2 text-right font-mono text-xs ${getValueColor(attr.val)}`}>{attr.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}