import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { MapPin, Newspaper, ShieldCheck, X, ExternalLink, Activity } from 'lucide-react';
import {
  useGetIntelligenceNews,
  getGetIntelligenceNewsQueryKey,
  type EconomicCalendarEvent,
  type IntelligenceNewsItem,
} from '@usestormline/api-client-react';
import mapImage from '@/assets/map-equirectangular.jpg';
import { formatStormRating, getStormColor, formatEventTime } from '@/lib/intelligence';
import { projectEquirectangular } from '@/lib/map-projection';

// Country centers are used only as clearly labeled approximations when an
// event has no authoritative coordinate pair.
const REGIONS: Record<string, { lat: number; lon: number; name: string }> = {
  US: { lat: 38.0, lon: -97.0, name: 'United States' },
  CA: { lat: 56.1, lon: -106.3, name: 'Canada' },
  MX: { lat: 23.6, lon: -102.5, name: 'Mexico' },
  BR: { lat: -14.2, lon: -51.9, name: 'Brazil' },
  AR: { lat: -38.4, lon: -63.6, name: 'Argentina' },
  GB: { lat: 55.3, lon: -3.4, name: 'United Kingdom' },
  EU: { lat: 48.8, lon: 9.1, name: 'European Union' },
  FR: { lat: 46.2, lon: 2.2, name: 'France' },
  DE: { lat: 51.1, lon: 10.4, name: 'Germany' },
  IT: { lat: 41.8, lon: 12.5, name: 'Italy' },
  ES: { lat: 40.4, lon: -3.7, name: 'Spain' },
  CH: { lat: 46.8, lon: 8.2, name: 'Switzerland' },
  PL: { lat: 51.9, lon: 19.1, name: 'Poland' },
  UA: { lat: 48.3, lon: 31.1, name: 'Ukraine' },
  RU: { lat: 61.5, lon: 105.3, name: 'Russia' },
  TR: { lat: 38.9, lon: 35.2, name: 'Turkey' },
  IL: { lat: 31.0, lon: 34.8, name: 'Israel' },
  PS: { lat: 31.9, lon: 35.2, name: 'Palestine' },
  SA: { lat: 23.8, lon: 45.0, name: 'Saudi Arabia' },
  AE: { lat: 23.4, lon: 53.8, name: 'United Arab Emirates' },
  IR: { lat: 32.4, lon: 53.6, name: 'Iran' },
  IQ: { lat: 33.2, lon: 43.6, name: 'Iraq' },
  EG: { lat: 26.8, lon: 30.8, name: 'Egypt' },
  ZA: { lat: -30.5, lon: 22.9, name: 'South Africa' },
  NG: { lat: 9.0, lon: 8.6, name: 'Nigeria' },
  KE: { lat: -0.02, lon: 37.9, name: 'Kenya' },
  ET: { lat: 9.1, lon: 40.4, name: 'Ethiopia' },
  SD: { lat: 12.8, lon: 30.2, name: 'Sudan' },
  IN: { lat: 20.5, lon: 78.9, name: 'India' },
  CN: { lat: 35.8, lon: 104.1, name: 'China' },
  HK: { lat: 22.3, lon: 114.1, name: 'Hong Kong' },
  TW: { lat: 23.6, lon: 120.9, name: 'Taiwan' },
  JP: { lat: 36.2, lon: 138.2, name: 'Japan' },
  KR: { lat: 35.9, lon: 127.7, name: 'South Korea' },
  KP: { lat: 40.3, lon: 127.5, name: 'North Korea' },
  SG: { lat: 1.3, lon: 103.8, name: 'Singapore' },
  ID: { lat: -0.7, lon: 113.9, name: 'Indonesia' },
  AU: { lat: -25.2, lon: 133.7, name: 'Australia' },
  NZ: { lat: -40.9, lon: 174.8, name: 'New Zealand' },
};
function normalizeCountryCode(countryCode: string) {
  const code = countryCode.trim().toUpperCase();
  return code === 'UK' ? 'GB' : code;
}

function getFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

type MappedLocation = {
  key: string;
  code: string | null;
  name: string;
  x: number;
  y: number;
  precision: 'exact' | 'country-centroid';
  locationSource: string;
  events: EconomicCalendarEvent[];
  news: IntelligenceNewsItem[];
};

const DENSE_MARKER_OFFSETS: Partial<Record<string, { x: number; y: number }>> = {
  EU: { x: -18, y: 14 },
  DE: { x: 18, y: -14 },
};

export default function GlobalRiskMap({ events }: { events: EconomicCalendarEvent[] }) {
  const newsQuery = useGetIntelligenceNews({ limit: 50 }, {
    query: {
      queryKey: getGetIntelligenceNewsQueryKey({ limit: 50 }),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    }
  });

  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const { locations, mappedCount, unmappedCount } = useMemo(() => {
    const locs = new Map<string, MappedLocation>();
    let mapped = 0;
    let unmapped = 0;

    const addPoint = (
      key: string,
      code: string | null,
      name: string,
      latitude: number,
      longitude: number,
      precision: MappedLocation['precision'],
      locationSource: string,
      event?: EconomicCalendarEvent,
      news?: IntelligenceNewsItem,
    ) => {
      if (!locs.has(key)) {
        const { x, y } = projectEquirectangular(latitude, longitude);
        locs.set(key, { key, code, name, x, y, precision, locationSource, events: [], news: [] });
      }
      if (event && !locs.get(key)!.events.some(item => item.id === event.id)) locs.get(key)!.events.push(event);
      if (news && !locs.get(key)!.news.some(item => item.id === news.id)) locs.get(key)!.news.push(news);
    };

    events.forEach(event => {
      const exactLocations = event.locations.filter(location => location.latitude !== null && location.longitude !== null);
      if (exactLocations.length) {
        exactLocations.forEach((location, index) => {
          const code = location.countryCode ? normalizeCountryCode(location.countryCode) : null;
          const name = [location.city, location.region, location.country ?? location.countryCode].filter(Boolean).join(', ') || event.title;
          addPoint(`event:${event.id}:${index}`, code, name, location.latitude!, location.longitude!, 'exact', location.source, event);
        });
        mapped++;
        return;
      }
      const code = normalizeCountryCode(event.countryCode);
      const centroid = REGIONS[code];
      if (centroid) {
        addPoint(`centroid:${code}`, code, centroid.name, centroid.lat, centroid.lon, 'country-centroid', 'Country-code centroid approximation', event);
        mapped++;
        return;
      }
      unmapped++;
    });

    const newsItems = newsQuery.data?.items || [];
    newsItems.forEach(item => {
      const exactLocations = item.locations.filter(location => location.latitude !== null && location.longitude !== null);
      if (exactLocations.length) {
        exactLocations.forEach((location, index) => {
          const code = location.countryCode ? normalizeCountryCode(location.countryCode) : null;
          const name = [location.city, location.region, location.country ?? location.countryCode].filter(Boolean).join(', ') || item.title;
          addPoint(`news:${item.id}:${index}`, code, name, location.latitude!, location.longitude!, 'exact', location.source, undefined, item);
        });
        mapped++;
        return;
      }
      unmapped++;
    });

    return { 
      locations: Array.from(locs.values()),
      mappedCount: mapped,
      unmappedCount: unmapped
    };
  }, [events, newsQuery.data?.items]);

  const selectedLoc = selectedCode ? locations.find(l => l.key === selectedCode) : null;

  return (
    <section aria-label="Global Risk Map" className="border border-line-strong bg-white mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-line-strong bg-gray-50 gap-4">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MapPin size={20} />
            Global Risk Map
          </h2>
          <p className="text-xs text-muted mt-1 font-mono uppercase tracking-wider">
            Authoritative coordinates first · Centroids labeled as approximate
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-1.5" title="Mapped items">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            {mappedCount} Mapped
          </div>
          <div className="flex items-center gap-1.5" title="Unmapped or unlocatable items">
            <span className="w-2 h-2 rounded-full border border-line-strong bg-white"></span>
            {unmappedCount} Unmapped
          </div>
          <div className="flex items-center gap-2 border-l border-line pl-4">
             <span className={`h-2 w-2 rounded-full ${newsQuery.isError || newsQuery.data?.status === 'degraded' ? 'bg-amber-500' : newsQuery.isFetching && !newsQuery.data ? 'bg-[#0000FF] animate-pulse' : 'bg-green-600'}`} />
             {newsQuery.isError ? 'Feed Error' : newsQuery.isFetching && !newsQuery.data ? 'Syncing...' : newsQuery.data?.status === 'degraded' ? 'Degraded' : 'Live'}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* Map Area */}
        <div className="group relative aspect-[2/1] w-full min-w-0 overflow-hidden bg-black">
          <img 
            src={mapImage} 
            alt="World Map" 
            className="absolute inset-0 w-full h-full object-fill grayscale contrast-125 opacity-65 pointer-events-none select-none"
          />
          
          {locations.map((loc) => {
            const hasStorm = loc.events.length > 0;
            const maxRating = hasStorm ? Math.max(...loc.events.map(e => e.stormRating)) : 0;
            const hasNews = loc.news.length > 0;
            
            const isStorm = maxRating >= 2;
            const markerRing = isStorm
              ? (maxRating >= 3 ? 'border-red-600' : 'border-amber-500')
              : 'border-white';
            
            const isSelected = selectedCode === loc.key;
            const count = loc.events.length + loc.news.length;
            const offset = loc.code
              ? DENSE_MARKER_OFFSETS[loc.code] ?? { x: 0, y: 0 }
              : { x: 0, y: 0 };
            
            return (
              <button
                key={loc.key}
                type="button"
                className={`absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:flex
                  ${markerRing}
                  ${isSelected ? 'scale-125 z-20 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'hover:scale-110 shadow-[0_0_5px_rgba(0,0,0,0.8)]'}
                `}
                style={{ 
                  left: `calc(${loc.x}% + ${offset.x}px)`,
                  top: `calc(${loc.y}% + ${offset.y}px)`,
                  width: '30px',
                  height: '30px',
                  borderStyle: loc.precision === 'country-centroid' ? 'dashed' : 'solid',
                }}
                onClick={() => setSelectedCode(isSelected ? null : loc.key)}
                aria-label={`View ${count} items for ${loc.name}${hasStorm ? `, maximum Storm Rating ${maxRating}` : ''}${hasNews ? ', includes intelligence news' : ''}`}
              >
                {/* Optional pulse for highly sensitive active storms */}
                {maxRating >= 3 && !isSelected && (
                  <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-red-600 opacity-75 motion-safe:animate-ping" />
                )}
                
                <span className="absolute inset-[1px] flex items-center justify-center overflow-hidden rounded-full bg-white font-mono text-[8px] font-bold text-black">
                  {loc.code ?? <MapPin size={13} />}
                </span>
                {loc.code && (
                  <img
                    src={getFlagUrl(loc.code)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-[1px] h-[22px] w-[22px] rounded-full object-cover"
                    loading="lazy"
                    onError={event => {
                      event.currentTarget.classList.add('hidden');
                    }}
                  />
                )}

                <span
                  aria-hidden="true"
                  className="absolute -right-2.5 -top-2.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border border-white bg-black px-1 font-mono text-[9px] font-bold leading-none text-white"
                >
                  {count}
                </span>

                {hasNews && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-black bg-[#0000FF]"
                  />
                )}
              </button>
            );
          })}
          
          {/* Legend overlay inside map */}
           <div className="pointer-events-none absolute bottom-4 left-4 hidden flex-col gap-2 border border-white/20 bg-black/80 p-3 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm sm:flex">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-[3px] border-red-600 bg-white"></span> Red ring · Storm 3+
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-[3px] border-amber-500 bg-white"></span> Amber ring · Storm 2
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-[3px] border-white bg-white"></span> White ring · Storm 1
            </div>
             <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-white bg-[#0000FF]"></span> Blue dot · News included
             </div>
             <div className="flex items-center gap-2">
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-black px-1 text-[8px]">8</span> Number · Item count
             </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-[3px] border-dashed border-white bg-transparent"></span> Dashed ring · Country centroid
              </div>
              <div className="pt-1 border-t border-white/20 text-[8px] text-white/60 normal-case tracking-normal">
                Equirectangular basemap · Natural Earth
              </div>
          </div>
        </div>

        <div className="border-t border-line-strong bg-gray-50 p-3 sm:hidden">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            Select mapped location
          </p>
          <div
            className="flex snap-x gap-2 overflow-x-auto pb-1"
            role="list"
            aria-label="Mapped locations"
          >
            {locations.map((loc) => {
              const isSelected = selectedCode === loc.key;
              const count = loc.events.length + loc.news.length;

              return (
                <button
                  key={loc.key}
                  type="button"
                  role="listitem"
                  className={`flex min-h-11 min-w-fit snap-start items-center gap-2 border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-line-strong bg-white text-black'
                  }`}
                  onClick={() => setSelectedCode(isSelected ? null : loc.key)}
                  aria-pressed={isSelected}
                  aria-label={`View ${count} items for ${loc.name}`}
                >
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-current bg-white font-mono text-[8px] font-bold text-black">
                    {loc.code ?? <MapPin size={12} />}
                    {loc.code && (
                      <img
                        src={getFlagUrl(loc.code)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        onError={event => {
                          event.currentTarget.classList.add('hidden');
                        }}
                      />
                    )}
                  </span>
                  <span>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider">
                      {loc.code ?? 'Exact'}
                    </span>
                    <span className={`block font-mono text-[9px] uppercase ${isSelected ? 'text-white/75' : 'text-muted'}`}>
                      {count} items
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Detail Rail */}
        <div className="relative flex max-h-[520px] w-full min-w-0 shrink-0 flex-col overflow-hidden border-t border-line-strong bg-white lg:h-0 lg:min-h-full lg:max-h-full lg:w-auto lg:border-l lg:border-t-0">
          {selectedLoc ? (
            <>
              <div className="p-4 border-b border-line-strong bg-gray-50 flex items-start justify-between shrink-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-white font-mono text-[9px] font-bold">
                    {selectedLoc.code ?? <MapPin size={15} />}
                    {selectedLoc.code && (
                      <img
                        src={getFlagUrl(selectedLoc.code)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={event => {
                          event.currentTarget.classList.add('hidden');
                        }}
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                  <h3 className="truncate font-semibold text-lg leading-none">{selectedLoc.name}</h3>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted">
                    {selectedLoc.precision === 'exact' ? 'Exact verified location' : 'Approximate country centroid'} · {selectedLoc.locationSource}
                  </p>
                  <div className="flex items-center gap-2 mt-2 font-mono text-[10px] uppercase text-muted">
                    {selectedLoc.code && <><span>{selectedLoc.code}</span><span>•</span></>}
                    <span>{selectedLoc.events.length} Events</span>
                    <span>•</span>
                    <span>{selectedLoc.news.length} News</span>
                  </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedCode(null)}
                  className="p-1 hover:bg-gray-200 transition-colors text-muted hover:text-black rounded"
                  aria-label="Close details"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
                {selectedLoc.events.map(event => (
                  <div key={event.id} className="border border-line-strong bg-white p-3 hover:border-black transition-colors group">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`px-1.5 py-0.5 border text-[9px] font-mono uppercase tracking-wider ${getStormColor(event.stormRating)}`}>
                        Storm {event.stormRating}
                      </span>
                      {event.needsTagging && (
                        <span className="px-1.5 py-0.5 border border-dashed border-line-strong text-[9px] font-mono uppercase tracking-wider text-muted bg-gray-50">
                          Untagged
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${event.id}?date=${encodeURIComponent(new Date(event.date).toISOString())}`} className="block font-medium text-sm mb-2 group-hover:text-[#0000FF] transition-colors leading-tight">
                      {event.title}
                    </Link>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                      <span className="uppercase">{event.source || 'Official Source'}</span>
                      <span>{formatEventTime(event.date)}</span>
                    </div>
                  </div>
                ))}

                {selectedLoc.news.map(item => {
                  const pubDate = new Date(item.publishedAt);
                  return (
                    <div key={item.id} className="border border-line-strong bg-white p-3 hover:border-black transition-colors group">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.verification === 'official_company_release' || item.verification === 'official_incident_report' ? (
                          <span className="inline-flex items-center gap-1 border border-[#0000FF] text-[#0000FF] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-[#0000FF]/5">
                            <ShieldCheck size={10} /> {item.verification === 'official_incident_report' ? 'Official incident' : 'Official'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 border border-line-strong text-black px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider bg-white">
                            <Newspaper size={10} /> Reported
                          </span>
                        )}
                        {item.symbol && (
                          <span className="font-mono text-[9px] font-bold text-black border border-line bg-white px-1.5 py-0.5">
                            {item.symbol}
                          </span>
                        )}
                      </div>
                      <a 
                        href={item.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-sm mb-1 group-hover:text-[#0000FF] transition-colors leading-tight inline-flex items-start gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0000FF]"
                      >
                        <span className="line-clamp-2">{item.title}</span>
                        <ExternalLink size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted mt-2">
                        <span className="uppercase truncate max-w-[150px]">{item.source}</span>
                        <span className="shrink-0">{pubDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fbfbfb]">
              <Activity size={32} className="mb-4 text-muted opacity-30" />
              <p className="font-medium text-lg mb-2">Standby</p>
              <p className="text-sm text-muted">Select a geographic region on the map to view synchronized macro events and verified market intelligence.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
