import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { Bot, Package, ChevronRight, CarFront } from 'lucide-react';
import { buildVehicleDisplayName, type VehicleProfile } from '../domain/vehicle/vehicleProfile';

const buildVehicleFromParams = (searchParams: URLSearchParams): VehicleProfile | null => {
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const year = Number(searchParams.get('year') || '');
  const engineName = searchParams.get('engine') || '';

  if (!make || !model || !year) return null;

  return {
    make,
    model,
    year,
    engineName: engineName || undefined,
    source: 'manual',
    provider: 'search-params',
    confidence: engineName ? 'medium' : 'low',
    warnings: engineName
      ? ['Vehicle was selected manually. Confirm VIN/licence disc before fulfilment.']
      : ['Engine was not selected. Fitment confidence is reduced.'],
  };
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const products = useStore(state => state.products);
  const selectedVehicle = useStore(state => state.selectedVehicle);
  const setSelectedVehicle = useStore(state => state.setSelectedVehicle);
  const [isSearching, setIsSearching] = useState(true);
  
  const vehicleFromParams = buildVehicleFromParams(searchParams);
  const activeVehicle = vehicleFromParams || selectedVehicle;

  useEffect(() => {
    if (vehicleFromParams) {
      setSelectedVehicle(vehicleFromParams);
    }
  }, [vehicleFromParams?.make, vehicleFromParams?.model, vehicleFromParams?.year, vehicleFromParams?.engineName, setSelectedVehicle]);

  // Lightweight intent parse result. This will later move behind the fitment engine.
  const [aiResult, setAiResult] = useState<{
    make?: string;
    model?: string;
    year?: string;
    category?: string;
  } | null>(null);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const extracted: any = {};
      
      if (activeVehicle) {
        extracted.make = activeVehicle.make;
        extracted.model = activeVehicle.model;
        if (activeVehicle.year) extracted.year = activeVehicle.year.toString();
      }

      if (q.includes('ford') || q.includes('ranger')) extracted.make = 'Ford';
      if (q.includes('ranger')) extracted.model = 'Ranger';
      if (q.includes('toyota') || q.includes('hilux')) extracted.make = 'Toyota';
      if (q.includes('hilux')) extracted.model = 'Hilux';
      if (q.match(/\b(201\d|202\d)\b/)) extracted.year = q.match(/\b(201\d|202\d)\b/)?.[0];
      
      if (q.includes('brake') || q.includes('pad')) extracted.category = 'brakes';
      if (q.includes('filter')) extracted.category = 'filters';
      if (q.includes('oil')) extracted.category = 'oil';
      
      setAiResult(extracted);
      setIsSearching(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query, activeVehicle?.make, activeVehicle?.model, activeVehicle?.year]);

  const results = products.filter(p => {
    if (isSearching) return false;
    
    let match = false;

    if (aiResult?.category && p.category === aiResult.category) match = true;
    if (!query && activeVehicle) match = true;
    
    if (!match && query && p.name.toLowerCase().includes(query.toLowerCase())) match = true;
    if (!match && query && p.sku.toLowerCase().includes(query.toLowerCase())) match = true;

    if (activeVehicle) {
      const vehicleFitMatch = p.fits.length === 0 || p.fits.some(fit => {
        const sameMake = fit.make.toLowerCase() === activeVehicle.make.toLowerCase();
        const sameModel = fit.model.toLowerCase() === activeVehicle.model.toLowerCase();
        const sameYear = !activeVehicle.year || fit.year === activeVehicle.year;
        return sameMake && sameModel && sameYear;
      });

      return match && vehicleFitMatch;
    }
    
    return match;
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <div className="bg-slate-900 py-10 px-4 md:px-8 xl:px-12 border-b-4 border-amber-400">
        <div className="w-full mb-4 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
          <span className="text-slate-300">Search Results</span>
        </div>
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Search Results</h1>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
            {query ? (
              <>Results for: <span className="text-amber-400">&quot;{query}&quot;</span></>
            ) : activeVehicle ? (
              <>Parts filtered for: <span className="text-amber-400">{buildVehicleDisplayName(activeVehicle)}</span></>
            ) : (
              <>Browse matching parts</>
            )}
          </p>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 py-12">
        {activeVehicle && (
          <div className="bg-white border-2 border-slate-200 p-5 rounded-sm shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-amber-400 flex items-center justify-center rounded-sm">
                <CarFront className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Vehicle Profile</p>
                <p className="text-sm font-black uppercase tracking-tight text-slate-900">{buildVehicleDisplayName(activeVehicle)}</p>
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Confidence: <span className="text-slate-900">{activeVehicle.confidence}</span>
            </div>
          </div>
        )}

        {isSearching ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-8 h-8 rounded-sm border-4 border-amber-400 border-t-transparent animate-spin mb-4"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Bot className="w-4 h-4" /> Interpreting vehicle and part intent...
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-slate-800 border-2 border-slate-700 p-6 rounded-sm shadow-sm sticky top-24">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-700">
                  <Bot className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-white uppercase tracking-widest text-xs">Intent Snapshot</h3>
                </div>
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Current matching context:</p>
                
                <div className="space-y-3 font-mono text-xs text-amber-300 bg-slate-900 p-4 rounded-sm border border-slate-700">
                  {Object.entries(aiResult || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <span className="text-slate-500 uppercase">{key}:</span>
                      <span className="font-bold text-right">{val}</span>
                    </div>
                  ))}
                  {Object.keys(aiResult || {}).length === 0 && (
                    <span className="text-slate-500">No structured intent detected. Falling back to keyword search.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-grow">
              <div className="mb-6">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Found {results.length} matches</p>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((product) => (
                    <div key={product.id} className="bg-white border-2 flex flex-col justify-between border-slate-200 overflow-hidden hover:border-slate-900 transition-colors group relative rounded-sm shadow-sm">
                      <div className="relative border-b-2 border-slate-200 bg-slate-50 aspect-square p-6 flex items-center justify-center">
                        <img 
                          referrerPolicy="no-referrer"
                          src={product.image} 
                          alt={product.name}
                          className="object-contain w-full max-h-[160px] mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                         <div className="absolute top-3 right-3">
                           <span className="bg-slate-900 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
                             {product.brand}
                           </span>
                         </div>
                         {activeVehicle && (
                           <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
                             Vehicle Filtered
                           </div>
                         )}
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="mb-2 uppercase text-[9px] font-black text-slate-400 tracking-widest leading-none">
                          {product.sku}
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight mb-6 flex-grow text-sm">
                          <Link to={`/product/${product.id}`} className="hover:text-amber-500 before:absolute before:inset-0 transition-colors">
                            {product.name}
                          </Link>
                        </h3>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-slate-100">
                          <span className="text-lg font-black text-slate-900 tracking-tighter">R {product.price.toFixed(2)}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                            product.stock === 'in_stock' ? 'bg-green-100 text-green-800' : 
                            product.stock === 'low_stock' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 p-12 text-center rounded-sm">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Parts Found</h3>
                  <p className="text-slate-500 text-sm font-medium">We couldn't find any parts matching that vehicle or description.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}