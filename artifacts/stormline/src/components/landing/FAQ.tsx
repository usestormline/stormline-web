import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: "Is Stormline a trading bot or robo-advisor?",
    a: "No. Stormline provides verified event and on-chain exposure information. It does not predict market direction, recommend a trade, or submit transactions."
  },
  {
    q: "Does Stormline manage my funds?",
    a: "No. Stormline is strictly a non-custodial monitoring tool. We verify your on-chain Robinhood Stock Token holdings and evaluate them against upcoming macroeconomic events. You maintain complete control of your assets, and Stormline can never execute trades on your behalf."
  },
  {
    q: "What kind of events does the calendar track?",
    a: "The calendar includes normalized macroeconomic releases and official US policy publications returned by the connected providers. Each record keeps its source, verification type, and freshness metadata."
  },
  {
    q: "Can I connect my own brokerage account?",
    a: "No. Stormline integrates specifically with Robinhood's canonical Stock Tokens. You can connect your Web3 wallet to verify exposure to these tokenized assets, but traditional brokerage integrations are not supported."
  },
  {
    q: "Why focus on tokenized stocks?",
    a: "Tokenized equities often operate with different settlement mechanics and extended trading hours compared to traditional markets. Stormline's architecture is built to address the unique volatility windows that exist in 24/7 or digitally-native financial environments."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white text-black border-t border-line-strong px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto w-full">
        <div className="mb-16">
          <div className="eyebrow mb-4">Frequently Asked</div>
          <h2 className="display text-4xl md:text-5xl tracking-tight">System Parameters</h2>
        </div>

        <div className="border-t border-line-strong">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-line-strong">
              <button 
                className="w-full text-left py-6 flex justify-between items-center focus:outline-none focus-visible:bg-gray-50"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-display text-lg md:text-xl font-medium pr-8">{faq.q}</span>
                <span className="shrink-0 text-brand">
                  {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-muted leading-relaxed text-sm md:text-base max-w-3xl">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
