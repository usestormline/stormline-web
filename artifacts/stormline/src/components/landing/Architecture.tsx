export default function Architecture() {
  return (
    <section className="bg-[#050505] text-white border-t border-[#222] px-6 md:px-12 py-24 md:py-32" id="architecture">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-24">
          <div className="eyebrow text-[#666] mb-4">System Design</div>
          <h2 className="display text-4xl md:text-6xl tracking-tight mb-6">How Stormline Verifies</h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto text-lg leading-relaxed">
            Stormline preserves source identity from event ingestion through wallet exposure
            display. It does not predict market direction.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Node 1 */}
          <div className="border border-[#222] bg-[#0a0a0a] p-8 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#222] group-hover:bg-brand transition-colors duration-500" />
            <div className="text-brand font-mono text-xs mb-8 uppercase tracking-widest">01. Ingestion</div>
            <h3 className="text-2xl font-display mb-4">Event Sourcing</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8">
              Stormline polls selected macroeconomic calendars and approved data providers. Events are verified and queued for monitoring as their windows approach.
            </p>
            <div className="bg-dark border border-[#222] p-4 font-mono text-xs text-[#666] flex flex-col gap-2">
              <div>&gt; GET /api/calendar/events</div>
              <div className="text-[#a1a1aa]">provider + agency + source URL</div>
              <div>&gt; NORMALIZED UTC timeline</div>
            </div>
          </div>

          {/* Node 2 */}
          <div className="border border-[#222] bg-[#0a0a0a] p-8 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#222] group-hover:bg-brand transition-colors duration-500" />
            <div className="text-brand font-mono text-xs mb-8 uppercase tracking-widest">02. Exposure</div>
            <h3 className="text-2xl font-display mb-4">Canonical Balances</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8">
              The connected address is checked against active deployments from Robinhood&apos;s
              official Stock Token registry on Robinhood Chain.
            </p>
            <div className="bg-dark border border-[#222] p-4 font-mono text-xs text-[#666] flex flex-col gap-2">
              <div>&gt; GET /rhj/assets</div>
              <div>&gt; MULTICALL balanceOf</div>
              <div className="text-brand">↳ CANONICAL CONTRACTS ONLY</div>
            </div>
          </div>

          {/* Node 3 */}
          <div className="border border-[#222] bg-[#0a0a0a] p-8 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#222] group-hover:bg-brand transition-colors duration-500" />
            <div className="text-brand font-mono text-xs mb-8 uppercase tracking-widest">03. Context</div>
            <h3 className="text-2xl font-display mb-4">Market Impact View</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8">
              Verified event windows and detected holdings are presented together. Issuer-specific
              relationships are not claimed without sourced company and sector metadata.
            </p>
            <div className="bg-dark border border-[#222] p-4 font-mono text-xs text-[#666] flex flex-col gap-2">
              <div>&gt; JOIN event + exposure context</div>
              <div>&gt; PRESERVE source evidence</div>
              <div className="text-white">✓ NO UNSOURCED SCORE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
