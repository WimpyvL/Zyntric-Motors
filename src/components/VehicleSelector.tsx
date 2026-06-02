import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicles } from '../data/mockData';
import { Search, ChevronDown, Check, CarFront, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { buildVehicleDisplayName, type VehicleProfile } from '../domain/vehicle/vehicleProfile';
import { getVinProgressLabel, normalizeVin, validateVin } from '../domain/vehicle/vin';
import { nhtsaProvider } from '../domain/vehicle/providers/nhtsaProvider';

type Step = 'make' | 'model' | 'year' | 'engine' | null;

export default function VehicleSelector() {
  const navigate = useNavigate();
  const selectedVehicle = useStore(state => state.selectedVehicle);
  const setSelectedVehicle = useStore(state => state.setSelectedVehicle);
  const clearSelectedVehicle = useStore(state => state.clearSelectedVehicle);

  const [selectedMake, setSelectedMake] = useState<string>(selectedVehicle?.make || '');
  const [selectedModel, setSelectedModel] = useState<string>(selectedVehicle?.model || '');
  const [selectedYear, setSelectedYear] = useState<string>(selectedVehicle?.year?.toString() || '');
  const [selectedEngine, setSelectedEngine] = useState<string>(selectedVehicle?.engineName || '');
  
  const [activeStep, setActiveStep] = useState<Step>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setActiveStep(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const makes = vehicles.map(v => v.make);
  
  const models = useMemo(() => {
    if (!selectedMake) return [];
    const make = vehicles.find(v => v.make === selectedMake);
    return make ? make.models.map(m => m.name) : [];
  }, [selectedMake]);

  const years = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    const make = vehicles.find(v => v.make === selectedMake);
    if (!make) return [];
    const model = make.models.find(m => m.name === selectedModel);
    return model ? [...model.years].sort((a, b) => b - a) : [];
  }, [selectedMake, selectedModel]);

  const engines = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    const make = vehicles.find(v => v.make === selectedMake);
    if (!make) return [];
    const model = make.models.find(m => m.name === selectedModel);
    return model ? model.engines || [] : [];
  }, [selectedMake, selectedModel]);

  const buildManualVehicle = (overrides: Partial<VehicleProfile> = {}): VehicleProfile | null => {
    const make = overrides.make || selectedMake;
    const model = overrides.model || selectedModel;
    const yearValue = overrides.year ?? Number(selectedYear);
    const engineName = overrides.engineName || selectedEngine;

    if (!make || !model || !yearValue || !engineName) return null;

    return {
      make,
      model,
      year: yearValue,
      engineName,
      source: 'manual',
      provider: 'manual-selector',
      confidence: 'medium',
      warnings: ['Manual vehicle selection should still be confirmed against VIN/licence disc before final fulfilment.'],
      ...overrides,
    };
  };

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedYear('');
    setSelectedEngine('');
    clearSelectedVehicle();
    setActiveStep('model');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedYear('');
    setSelectedEngine('');
    clearSelectedVehicle();
    setActiveStep('year');
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedEngine('');
    clearSelectedVehicle();
    setActiveStep('engine');
  };

  const handleEngineChange = (engine: string) => {
    setSelectedEngine(engine);
    setActiveStep(null);

    const manualVehicle = buildManualVehicle({ engineName: engine });
    if (manualVehicle) {
      setSelectedVehicle(manualVehicle);
    }
  };

  const [vin, setVin] = useState('');
  const [vinError, setVinError] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);

  const validateVinInput = (value: string) => {
    const normalized = normalizeVin(value);

    if (!normalized) {
      setVinError('');
      return;
    }

    const validation = validateVin(normalized);
    if (!validation.isValid && normalized.length === 17) {
      setVinError(validation.error?.toUpperCase() || 'INVALID VIN');
      return;
    }

    if (!validation.isValid) {
      setVinError(getVinProgressLabel(normalized));
    } else {
      setVinError('');
    }
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeVin(e.target.value);
    setVin(value);
    validateVinInput(value);
  };

  const handleVinDecode = async () => {
    const validation = validateVin(vin);
    if (!validation.isValid) {
      setVinError(validation.error?.toUpperCase() || 'INVALID VIN');
      return;
    }

    setIsDecoding(true);
    setVinError('');

    try {
      const result = await nhtsaProvider.decodeVin({ vin: validation.normalizedVin });

      if (!result.vehicle) {
        setVinError(result.warnings[0]?.toUpperCase() || 'NO VEHICLE DATA FOUND.');
        setIsDecoding(false);
        return;
      }

      const vehicle = result.vehicle;
      const decodedMake = vehicle.make === 'Unknown' ? '' : vehicle.make;
      const decodedModel = vehicle.model === 'Unknown' ? '' : vehicle.model;

      setSelectedMake(decodedMake);
      setSelectedModel(decodedModel);
      setSelectedYear(vehicle.year?.toString() || '');
      setSelectedEngine(vehicle.engineName || '');

      if (decodedMake && decodedModel) {
        setSelectedVehicle(vehicle);
      } else {
        clearSelectedVehicle();
        setActiveStep(!decodedMake ? 'make' : 'model');
      }

      setVin('');
      setVinError(
        !decodedMake || !decodedModel
          ? 'VIN DECODED — PLEASE COMPLETE MISSING FIELDS BELOW.'
          : '',
      );
      setIsDecoding(false);
    } catch (error) {
      console.error('VIN Decode Error:', error);
      setVinError('NETWORK ERROR. PLEASE TRY AGAIN.');
      setIsDecoding(false);
    }
  };

  const handleFindParts = () => {
    const vehicle = selectedVehicle || buildManualVehicle();

    if (!vehicle) return;

    setSelectedVehicle(vehicle);

    const params = new URLSearchParams({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() || '',
      engine: vehicle.engineName || '',
    });

    navigate(`/search?${params.toString()}`);
  };

  const canFindParts = Boolean(selectedVehicle || buildManualVehicle());

  return (
    <div className="bg-slate-900 p-1 rounded-sm shadow-2xl relative z-20 w-full mb-8 lg:mb-0">
      {/* VIN Fast-Track */}
      <div className="bg-slate-800 p-3 pt-3 flex flex-col md:flex-row items-center gap-4 justify-between border-b border-slate-700">
        <div className="flex-1 w-full relative">
           <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="ENTER VIN FOR AUTO-DECODE..." 
                  value={vin}
                  onChange={handleVinChange}
                  maxLength={17}
                  className={`w-full bg-slate-900 border text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-sm outline-none transition-all ${
                    vinError 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : vin.length === 17 
                        ? 'border-green-500/50 focus:border-green-500' 
                        : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                {vinError && (
                  <div className={`absolute left-0 -bottom-5 text-[8px] font-black tracking-tighter uppercase whitespace-nowrap ${vinError.startsWith('LENGTH') ? 'text-slate-400' : 'text-red-500'}`}>
                    {vinError}
                  </div>
                )}
                {vin.length === 17 && !vinError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-500">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <button 
                onClick={handleVinDecode}
                disabled={isDecoding || !vin || vin.length !== 17 || !!vinError}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800/50 disabled:text-slate-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-sm transition-colors whitespace-nowrap"
              >
                {isDecoding ? 'Decoding...' : 'Decode'}
              </button>
           </div>
        </div>
        <div className="hidden md:block w-px h-8 bg-slate-700 mx-2"></div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest md:w-auto w-full text-center">
          Or use <span className="text-white">manual selection</span> below
        </p>
      </div>

      {selectedVehicle && (
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Selected Vehicle</p>
            <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
              {buildVehicleDisplayName(selectedVehicle)}
            </p>
          </div>
          <button
            onClick={() => {
              clearSelectedVehicle();
              setSelectedMake('');
              setSelectedModel('');
              setSelectedYear('');
              setSelectedEngine('');
            }}
            className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors self-start md:self-auto"
          >
            Clear Vehicle
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-1 relative" ref={selectorRef}>
        <div 
          onClick={() => setActiveStep(activeStep === 'make' ? null : 'make')}
          className={`p-4 lg:p-5 transition-colors cursor-pointer flex justify-between items-center group ${activeStep === 'make' || selectedMake ? 'bg-white' : 'bg-slate-100 hover:bg-white'} ${activeStep === 'make' ? 'ring-2 ring-slate-900 inset-0 z-10' : ''}`}
        >
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-pointer">Make</label>
            <div className={`text-sm font-bold ${selectedMake ? 'text-slate-900' : 'text-slate-400'}`}>{selectedMake || 'Select Make'}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeStep === 'make' ? 'rotate-180' : ''}`} />
        </div>
        
        <div 
          onClick={() => !selectedMake ? setActiveStep('make') : setActiveStep(activeStep === 'model' ? null : 'model')}
          className={`p-4 lg:p-5 transition-colors cursor-pointer flex justify-between items-center group ${activeStep === 'model' || selectedModel ? 'bg-white' : 'bg-slate-100'} ${!selectedMake ? 'opacity-50 hover:bg-slate-100' : 'hover:bg-white'} ${activeStep === 'model' ? 'ring-2 ring-slate-900 inset-0 z-10' : ''}`}
        >
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-pointer">Model</label>
            <div className={`text-sm font-bold ${selectedModel ? 'text-slate-900' : 'text-slate-400'}`}>{selectedModel || 'Select Model'}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeStep === 'model' ? 'rotate-180' : ''}`} />
        </div>
        
        <div 
          onClick={() => !selectedModel ? setActiveStep(!selectedMake ? 'make' : 'model') : setActiveStep(activeStep === 'year' ? null : 'year')}
          className={`p-4 lg:p-5 transition-colors cursor-pointer flex justify-between items-center group ${activeStep === 'year' || selectedYear ? 'bg-white' : 'bg-slate-100'} ${!selectedModel ? 'opacity-50 hover:bg-slate-100' : 'hover:bg-white'} ${activeStep === 'year' ? 'ring-2 ring-slate-900 inset-0 z-10' : ''}`}
        >
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-pointer">Year</label>
            <div className={`text-sm font-bold ${selectedYear ? 'text-slate-900' : 'text-slate-400'}`}>{selectedYear || 'Select Year'}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeStep === 'year' ? 'rotate-180' : ''}`} />
        </div>

        <div 
          onClick={() => !selectedYear ? setActiveStep(!selectedModel ? (!selectedMake ? 'make' : 'model') : 'year') : setActiveStep(activeStep === 'engine' ? null : 'engine')}
          className={`p-4 lg:p-5 transition-colors cursor-pointer flex justify-between items-center group ${activeStep === 'engine' || selectedEngine ? 'bg-white' : 'bg-slate-100'} ${!selectedYear ? 'opacity-50 hover:bg-slate-100' : 'hover:bg-white'} ${activeStep === 'engine' ? 'ring-2 ring-slate-900 inset-0 z-10' : ''}`}
        >
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 cursor-pointer">Engine</label>
            <div className={`text-sm font-bold ${selectedEngine ? 'text-slate-900' : 'text-slate-400'}`}>{selectedEngine || 'Select Engine'}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeStep === 'engine' ? 'rotate-180' : ''}`} />
        </div>

        <button 
          onClick={handleFindParts}
          disabled={!canFindParts}
          className="bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors flex items-center justify-center p-4 lg:p-5 disabled:bg-slate-300 disabled:text-slate-500 rounded-sm md:rounded-none"
        >
           <span className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
             <Search className="w-4 h-4" />
             Find Parts
           </span>
        </button>

        {activeStep && (
            <div className="fixed md:absolute inset-0 md:inset-auto md:top-[102%] md:left-0 md:w-full min-h-screen md:min-h-[150px] bg-white border-2 border-slate-900 shadow-2xl z-50 p-6 md:p-8 flex flex-col pt-20 md:pt-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
               <button 
                 onClick={() => setActiveStep(null)}
                 className="md:hidden absolute top-6 right-6 text-slate-400 hover:text-slate-900"
               >
                 <X className="w-8 h-8" />
               </button>

               <div className="flex items-center gap-2 mb-6 text-slate-400 border-b-2 border-slate-100 pb-4">
                  <CarFront className="w-5 h-5" />
                  <span className="text-xs md:text-[10px] font-black uppercase tracking-widest text-slate-900 md:text-slate-400">
                    {activeStep === 'make' && 'Select Vehicle Make'}
                    {activeStep === 'model' && `Select Model for ${selectedMake}`}
                    {activeStep === 'year' && `Select Year for ${selectedMake} ${selectedModel}`}
                    {activeStep === 'engine' && `Select Engine for ${selectedYear} ${selectedMake} ${selectedModel}`}
                  </span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 h-full md:max-h-[300px] overflow-y-auto pr-2 pb-20 md:pb-0">
                {activeStep === 'make' && makes.map(make => (
                  <button 
                    key={make} 
                    onClick={() => handleMakeChange(make)}
                    className={`text-left px-4 py-3 border-2 rounded-sm text-sm font-bold transition-all ${selectedMake === make ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-50'}`}
                  >
                    {make}
                  </button>
                ))}
                
                {activeStep === 'model' && models.map(model => (
                  <button 
                    key={model} 
                    onClick={() => handleModelChange(model)}
                    className={`text-left px-4 py-3 border-2 rounded-sm text-sm font-bold transition-all ${selectedModel === model ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-50'}`}
                  >
                    {model}
                  </button>
                ))}

                {activeStep === 'year' && years.map(year => (
                  <button 
                    key={year} 
                    onClick={() => handleYearChange(year.toString())}
                    className={`text-left px-4 py-3 border-2 rounded-sm text-sm font-bold transition-all ${selectedYear === year.toString() ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-50'}`}
                  >
                    {year}
                  </button>
                ))}

                {activeStep === 'engine' && engines.map(engine => (
                  <button 
                    key={engine} 
                    onClick={() => handleEngineChange(engine)}
                    className={`text-left px-4 py-3 border-2 rounded-sm text-sm font-bold transition-all ${selectedEngine === engine ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-50'}`}
                  >
                    {engine}
                  </button>
                ))}
              </div>
            </div>
        )}
      </div>
      
      <div className="bg-slate-800 p-3 pt-4 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Or simply <span className="text-white underline cursor-pointer hover:text-amber-400 transition-colors">upload a photo of your license disc or VIN</span> for manual fitment confirmation
        </p>
      </div>
    </div>
  );
}