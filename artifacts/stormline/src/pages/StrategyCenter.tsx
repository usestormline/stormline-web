import { useState, useEffect } from 'react';
import { useSearch, Link } from 'wouter';
import { Target, Plus, Database, Trash2, ShieldAlert, Briefcase } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import {
  getGetEconomicCalendarQueryKey,
  useGetEconomicCalendar,
  useGetStockTokenPortfolio,
  getGetStockTokenPortfolioQueryKey,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { dateKey, addUtcDays, formatSensitivity } from '@/lib/intelligence';

interface StrategyPlan {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  assetAddress: string;
  assetSymbol: string;
  action: 'Hold' | 'Increase' | 'Reduce' | 'Wait';
  thesis: string;
  invalidation: string;
  createdAt: string;
}

const strategyActions = ['Hold', 'Increase', 'Reduce', 'Wait'] as const;
type StrategyAction = (typeof strategyActions)[number];

function isStrategyPlan(value: unknown): value is StrategyPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  return (
    typeof plan.id === 'string' &&
    typeof plan.eventId === 'string' &&
    typeof plan.eventTitle === 'string' &&
    typeof plan.assetAddress === 'string' &&
    typeof plan.assetSymbol === 'string' &&
    strategyActions.includes(plan.action as StrategyAction) &&
    typeof plan.thesis === 'string' &&
    typeof plan.invalidation === 'string' &&
    typeof plan.createdAt === 'string'
  );
}

export default function StrategyCenter() {
  const { address } = useAppKitAccount();
  const now = new Date();
  const calendarParams = { from: dateKey(now), to: dateKey(addUtcDays(now, 14)) };

  const calendar = useGetEconomicCalendar(calendarParams, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey(calendarParams),
      staleTime: 15 * 60 * 1000,
    },
  });

  const portfolioParams = { address: address ?? '0x0000000000000000000000000000000000000000' };
  const portfolio = useGetStockTokenPortfolio(portfolioParams, {
    query: {
      queryKey: getGetStockTokenPortfolioQueryKey(portfolioParams),
      enabled: Boolean(address),
      staleTime: 2 * 60 * 1000,
    },
  });

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialEventId = searchParams.get('eventId');

  const [strategies, setStrategies] = useState<StrategyPlan[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('stormline_strategies');
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error('Saved strategy book is not a list.');
        const validPlans = parsed.filter(isStrategyPlan);
        setStrategies(validPlans);
        if (validPlans.length !== parsed.length) {
          localStorage.setItem('stormline_strategies', JSON.stringify(validPlans));
          setStorageError('Some invalid saved plans were removed.');
        }
      } catch {
        localStorage.removeItem('stormline_strategies');
        setStorageError('The saved strategy book was unreadable and has been reset.');
      }
    }
  }, []);

  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || '');
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<string>('');
  const [action, setAction] = useState<StrategyAction | ''>('');
  const [thesis, setThesis] = useState('');
  const [invalidation, setInvalidation] = useState('');
  
  const [savedFeedback, setSavedFeedback] = useState(false);

  const events = calendar.data?.events ?? [];
  const mappedEvents = events.filter(e => !e.needsTagging && e.affectedAssets && e.affectedAssets.length > 0)
                             .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                             
  const selectedEvent = mappedEvents.find(e => e.id === selectedEventId);
  const affectedAssets = selectedEvent?.affectedAssets ?? [];
  const selectedAsset = affectedAssets.find(a => a.address === selectedAssetAddress);

  useEffect(() => {
    if (selectedEvent && !selectedAssetAddress && affectedAssets.length > 0) {
      setSelectedAssetAddress(affectedAssets[0].address);
    }
  }, [selectedEvent, selectedAssetAddress, affectedAssets]);

  const handleSave = () => {
    if (!selectedEvent || !selectedAsset || !action || !thesis || !invalidation) return;
    
    const plan: StrategyPlan = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      assetAddress: selectedAsset.address,
      assetSymbol: selectedAsset.symbol,
      action,
      thesis: thesis.trim(),
      invalidation: invalidation.trim(),
      createdAt: new Date().toISOString()
    };
    
    const updated = [plan, ...strategies];
    try {
      localStorage.setItem('stormline_strategies', JSON.stringify(updated));
      setStrategies(updated);
      setStorageError(null);
    } catch {
      setStorageError('This browser could not save the strategy plan.');
      return;
    }
    
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
    
    setAction('');
    setThesis('');
    setInvalidation('');
  };

  const handleRemove = (id: string) => {
    if (!confirm('Are you sure you want to remove this strategy plan?')) return;
    const updated = strategies.filter(s => s.id !== id);
    try {
      localStorage.setItem('stormline_strategies', JSON.stringify(updated));
      setStrategies(updated);
      setStorageError(null);
    } catch {
      setStorageError('This browser could not update the strategy book.');
    }
  };
  
  const portfolioHoldings = portfolio.data?.holdings ?? [];
  const portfolioContracts = new Set(portfolioHoldings.map(h => h.contractAddress.toLowerCase()));

  if (!isClient) return null;

  return (
    <>
      <PageHead
        eyebrow="STRATEGY CENTER"
        title="Political Strategy Center"
        sub="Turn verified geopolitical and policy events into explicit portfolio decisions. Your strategy book is stored locally in this browser."
      />

      <div className="mb-6 border border-line-strong bg-white p-4 text-xs leading-relaxed text-muted">
        <strong className="text-black">User-authored decisions.</strong> Stormline provides verified
        event mappings and transmission rationale. It does not select an action, predict returns, or
        execute a trade. Hold, Increase, Reduce, and Wait are planning labels chosen by you.
      </div>

      {!address && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-600 p-4 flex gap-3 text-amber-900 shadow-sm">
          <ShieldAlert size={20} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm">Wallet Disconnected</p>
            <p className="text-xs mt-1">Connect your wallet to map strategy directly against your current Stock Token exposure. You can still formulate general event strategies below.</p>
          </div>
        </div>
      )}
      {storageError && (
        <p role="alert" className="mb-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-900">
          {storageError}
        </p>
      )}

      {calendar.isError ? (
        <div className="border border-line-strong bg-white p-10 flex flex-col items-center justify-center text-center">
          <Database size={32} className="mb-4 text-red-600" />
          <h3 className="display text-2xl">Intelligence unavailable</h3>
          <p className="mt-3 text-sm text-muted">Cannot load events to formulate strategy. Please check your connection.</p>
        </div>
      ) : calendar.isLoading ? (
        <div className="border border-line-strong bg-white p-10 text-center text-muted">
          Synchronizing intelligence feed...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <div className="border border-line-strong bg-white shadow-sm relative overflow-hidden">
              {savedFeedback && (
                <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-xs font-bold uppercase tracking-wider p-2 text-center z-10 animate-in slide-in-from-top-full duration-300">
                  Strategy Plan Committed Successfully
                </div>
              )}
              
              <div className="p-5 border-b border-line-strong bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Target size={20} />
                  <h2 className="font-semibold text-lg">Formulate Plan</h2>
                </div>
                {selectedEvent && (
                  <button 
                    onClick={() => {
                      setSelectedEventId('');
                      setSelectedAssetAddress('');
                      setAction('');
                    }}
                    className="text-xs font-mono uppercase text-muted hover:text-black transition-colors"
                  >
                    Clear Selection
                   </button>
                )}
               </div>
              
              <div className="p-6 space-y-8">
                <div>
                  <label className="flex items-center gap-2 eyebrow text-black mb-3">
                    <span className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold">1</span> 
                    Select Target Event
                  </label>
                  <select 
                    className="input font-semibold bg-white cursor-pointer"
                    value={selectedEventId}
                    onChange={e => {
                      setSelectedEventId(e.target.value);
                      setSelectedAssetAddress('');
                      setAction('');
                    }}
                  >
                    <option value="">-- Choose an upcoming mapped event --</option>
                    {mappedEvents.map(e => (
                      <option key={e.id} value={e.id}>
                        {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short'})} | {e.title}
                      </option>
                    ))}
                  </select>
                  {!selectedEvent && (
                    <p className="text-xs text-muted mt-2">Only events with mapped canonical assets are available for explicit strategy formulation.</p>
                  )}
                </div>
                
                {selectedEvent && (
                  <>
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="flex items-center gap-2 eyebrow text-black mb-3">
                         <span className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold">2</span> 
                         Select Affected Asset
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {affectedAssets.map(a => {
                           const isHeld = portfolioContracts.has(a.address.toLowerCase());
                           const isSelected = selectedAssetAddress === a.address;
                           return (
                              <button
                                type="button"
                               key={a.address} 
                                className={`group w-full border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${isSelected ? 'border-brand bg-brand-muted shadow-[2px_2px_0_var(--brand)]' : 'border-line hover:border-black hover:shadow-[2px_2px_0_#000]'}`}
                               onClick={() => setSelectedAssetAddress(a.address)}
                                aria-pressed={isSelected}
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-2">
                                   <span className="font-semibold text-lg">{a.symbol}</span>
                                   <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand' : 'bg-line-strong group-hover:bg-black'}`} />
                                  </div>
                                 {isHeld && <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#0000FF] text-white px-2 py-0.5">Held</span>}
                               </div>
                               <p className="text-xs text-black leading-relaxed line-clamp-3">{a.rationale}</p>
                               <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-muted">
                                 {formatSensitivity(a.sensitivity)} Vector
                                </div>
                              </button>
                           );
                        })}
                      </div>
                    </div>
                    
                    {selectedAsset && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                        <label className="flex items-center gap-2 eyebrow text-black mb-3">
                           <span className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold">3</span> 
                           Determine Action
                        </label>
                        <div className="flex flex-wrap gap-3">
                           {strategyActions.map(act => (
                            <button
                              key={act}
                              className={`px-6 py-3 border font-bold text-sm uppercase tracking-wider transition-all duration-200 flex-1 sm:flex-none ${action === act ? 'bg-black text-white border-black shadow-[2px_2px_0_var(--brand)]' : 'bg-white border-line hover:border-black text-black'}`}
                               onClick={() => setAction(act)}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                        
                        <div className="mt-8 space-y-6">
                          <div>
                            <label className="flex items-center gap-2 eyebrow text-black mb-3">
                               <span className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold">4</span> 
                               Core Thesis
                            </label>
                            <textarea 
                              className="input min-h-[100px] text-sm resize-y leading-relaxed" 
                              placeholder="Describe the expected transmission vector and rationale for this action..."
                              value={thesis}
                              onChange={e => setThesis(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 eyebrow text-black mb-3">
                               <span className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold">5</span> 
                               Invalidation Condition
                            </label>
                            <textarea 
                              className="input min-h-[100px] text-sm resize-y leading-relaxed" 
                              placeholder="What macro data, policy pivot, or market behavior invalidates this thesis?"
                              value={invalidation}
                              onChange={e => setInvalidation(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-line-strong flex justify-end">
                           <button 
                             className="btn btn-primary px-8 text-base shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] transition-all"
                              disabled={!action || !thesis.trim() || !invalidation.trim()}
                             onClick={handleSave}
                           >
                             Commit to Strategy Book <Plus size={18} className="ml-2" />
                           </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div>
             <div className="border border-line-strong bg-white h-full flex flex-col">
               <div className="p-5 border-b border-line-strong bg-gray-50 flex justify-between items-center shrink-0">
                 <h2 className="font-semibold flex items-center gap-2"><Briefcase size={18} /> Active Book</h2>
                 <span className="text-xs font-mono font-bold">{strategies.length} PLANS</span>
               </div>
               
               <div className="p-5 flex-1 overflow-y-auto min-h-0 bg-[#fbfbfb]">
                 <div className="mb-5 text-[10px] text-muted font-mono uppercase tracking-wider bg-white border border-line p-3">
                   <strong className="text-black block mb-1">Storage Notice</strong>
                    Plans are saved in this browser's local storage. They are not sent to Stormline.
                 </div>
                 
                 {strategies.length === 0 ? (
                   <div className="text-center py-10 text-muted">
                     <Target size={32} className="mx-auto mb-3 opacity-20" />
                     <p className="text-sm">No strategies defined.</p>
                     <p className="text-[10px] uppercase mt-2 font-mono">Build a plan to see it here</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {strategies.map(s => (
                       <div key={s.id} className="border border-line-strong p-5 bg-white shadow-[2px_2px_0_var(--line-strong)] relative group transition-all hover:border-black">
                         <button 
                            className="absolute right-4 top-4 text-muted transition-colors hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                           onClick={() => handleRemove(s.id)}
                            aria-label={`Remove ${s.assetSymbol} strategy plan`}
                         >
                           <Trash2 size={16} />
                         </button>
                         
                         <div className="flex items-center gap-2 mb-3 pr-6">
                           <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${
                             s.action === 'Increase' ? 'bg-green-50 text-green-700 border-green-700' :
                             s.action === 'Reduce' ? 'bg-red-50 text-red-700 border-red-700' :
                             s.action === 'Wait' ? 'bg-amber-50 text-amber-700 border-amber-700' :
                             'bg-gray-100 text-black border-black'
                           }`}>
                             {s.action}
                           </span>
                           <span className="font-mono text-sm font-bold border-b border-black">{s.assetSymbol}</span>
                         </div>
                         
                          <Link
                            href={`/events/${s.eventId}${s.eventDate ? `?date=${encodeURIComponent(new Date(s.eventDate).toISOString())}` : ''}`}
                            className="mb-3 block line-clamp-2 text-sm font-semibold hover:text-brand"
                            title={s.eventTitle}
                          >
                            {s.eventTitle}
                          </Link>
                         
                         <div className="text-xs space-y-2 mt-4 border-t border-line pt-3">
                           <div>
                             <strong className="text-black font-mono text-[10px] uppercase tracking-wider block mb-1">Thesis</strong> 
                             <p className="text-muted leading-relaxed line-clamp-3" title={s.thesis}>{s.thesis}</p>
                           </div>
                           <div className="pt-2">
                             <strong className="text-black font-mono text-[10px] uppercase tracking-wider block mb-1">Invalidation</strong> 
                             <p className="text-muted leading-relaxed line-clamp-3" title={s.invalidation}>{s.invalidation}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
