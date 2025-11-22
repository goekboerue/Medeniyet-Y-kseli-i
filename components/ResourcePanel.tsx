
import React, { useState, useEffect, useRef } from 'react';
import { Resources } from '../types';
import { Users, Coins, Map, TrendingUp, Briefcase, FlaskConical, AlertCircle, Pickaxe, PlusCircle } from 'lucide-react';

interface ResourcePanelProps {
  resources: Resources;
  income: number;
  scienceIncome: number;
  populationGrowth: number;
  availableWorkers: number;
  onManualGather: () => void;
  onExpandLand: () => void;
}

// Helper hook to track changes
const useResourceChange = (value: number) => {
  const [change, setChange] = useState<{ val: number; id: number } | null>(null);
  const prev = useRef(Math.floor(value));

  useEffect(() => {
    const current = Math.floor(value);
    const diff = current - prev.current;
    if (diff !== 0) {
      setChange({ val: diff, id: Date.now() + Math.random() });
      prev.current = current;
    }
  }, [value]);

  return change;
};

// Particle Effect Component
const ResourceEffect = ({ change, type }: { change: { val: number; id: number } | null, type: 'gold' | 'pop' | 'science' | 'land' }) => {
  if (!change || change.val <= 0) return null;

  // For population, we use a "puff" effect
  if (type === 'pop') {
    return (
      <div key={change.id} className="absolute left-1/2 top-1/2 pointer-events-none z-30 w-0 h-0">
        {[...Array(3)].map((_, i) => (
           <div 
              key={i}
              className="absolute w-8 h-8 rounded-full bg-blue-200/30 blur-sm animate-puff flex items-center justify-center"
              style={{
                animationDelay: `${i * 150}ms`,
                transform: 'translate(-50%, -50%)'
              }}
           >
             <div className="w-4 h-4 rounded-full bg-blue-100/50 blur-sm" />
           </div>
        ))}
      </div>
    );
  }

  // For others, we use a "burst" effect with particles
  return (
    <div key={change.id} className="absolute left-1/2 top-1/2 pointer-events-none z-30 w-0 h-0">
       {[...Array(5)].map((_, i) => (
          <div
             key={i}
             className={`absolute flex items-center justify-center animate-burst`}
             style={{
                '--tx': `${(Math.random() - 0.5) * 100}px`,
                '--ty': `${-40 - Math.random() * 50}px`,
                '--r': `${(Math.random() - 0.5) * 120}deg`,
                animationDelay: `${i * 60}ms`
             } as React.CSSProperties}
          >
             {type === 'gold' && (
               <div className="text-yellow-400 drop-shadow-[0_0_2px_rgba(234,179,8,0.8)]">
                  <Coins size={10} fill="currentColor" />
               </div>
             )}
             {type === 'science' && <div className="text-[10px] text-purple-300">✨</div>}
             {type === 'land' && <div className="w-2 h-2 bg-green-600/80 border border-green-400 transform rotate-45" />}
          </div>
       ))}
    </div>
  );
};

// Floating text component
const FloatingChange = ({ change, label }: { change: { val: number; id: number } | null, label?: string }) => {
  if (!change) return null;
  const isPositive = change.val > 0;
  return (
    <div
      key={change.id}
      className={`absolute top-3 right-3 text-xl font-bold animate-float-up pointer-events-none z-40 flex flex-col items-end leading-none
        ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
    >
      <span>{isPositive ? '+' : ''}{change.val}</span>
      {label && <span className="text-[10px] opacity-75 font-normal text-white">{label}</span>}
    </div>
  );
};

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources, income, scienceIncome, populationGrowth, availableWorkers, onManualGather, onExpandLand }) => {
  const totalPop = Math.floor(resources.population);
  const usedWorkers = totalPop - availableWorkers;

  const popChange = useResourceChange(resources.population);
  const goldChange = useResourceChange(resources.gold);
  const landChange = useResourceChange(resources.land);
  const scienceChange = useResourceChange(resources.science);
  
  const landCost = Math.floor(resources.maxLand * 2.5);
  const canAffordLand = resources.gold >= landCost;

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto mb-8">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Population Card */}
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
          <FloatingChange change={popChange} />
          <ResourceEffect change={popChange} type="pop" />
          <div className="absolute inset-0 bg-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <div className="w-full relative z-10">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-1">
                  <Users size={14} /> <span>Nüfus</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono leading-none mb-2 relative inline-block">
                {totalPop}
              </div>
              
              <div className="flex justify-between items-center text-[10px]">
                  <div className={`font-bold flex items-center gap-1 transition-colors duration-300 ${availableWorkers > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      <Briefcase size={10} /> 
                      <span>{availableWorkers} Boş</span>
                      {availableWorkers > 0 && (
                          <div className="relative flex items-center justify-center w-3 h-3 ml-1" title="İşçiler boşta!">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <AlertCircle size={10} className="relative text-emerald-500" />
                          </div>
                      )}
                  </div>
                  <div className="text-gray-500">{usedWorkers} İş</div>
              </div>
              <div className="text-[10px] text-blue-300/70 flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" /> +{populationGrowth.toFixed(1)}
              </div>
          </div>
        </div>

        {/* Gold Card */}
        <div className="bg-gray-800 border border-yellow-900/30 p-3 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
          <FloatingChange change={goldChange} />
          <ResourceEffect change={goldChange} type="gold" />
          <div className="absolute inset-0 bg-yellow-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 text-yellow-500/80 text-xs font-bold uppercase mb-1">
                  <Coins size={14} /> <span>Altın</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400 font-mono leading-none mb-2 relative inline-block">
                  {Math.floor(resources.gold)}
              </div>
              <div className="text-[10px] text-green-400 flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" /> +{income.toFixed(1)}/sn
              </div>
          </div>
        </div>

        {/* Science Card */}
        <div className="bg-gray-800 border border-purple-900/30 p-3 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
          <FloatingChange change={scienceChange} />
          <ResourceEffect change={scienceChange} type="science" />
          <div className="absolute inset-0 bg-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
                  <FlaskConical size={14} /> <span>Bilim</span>
              </div>
              <div className="text-2xl font-bold text-purple-400 font-mono leading-none mb-2 relative inline-block">
                {Math.floor(resources.science)}
              </div>
              <div className="text-[10px] text-purple-300 flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" /> +{scienceIncome.toFixed(1)}/sn
              </div>
          </div>
        </div>

        {/* Land Card */}
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
          <FloatingChange change={landChange} label="Kullanılan" />
          <ResourceEffect change={landChange} type="land" />
          <div className="absolute inset-0 bg-green-800/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <div className="relative z-10 w-full flex flex-col h-full">
              <div className="flex items-center justify-between text-green-600/80 text-xs font-bold uppercase mb-1">
                  <div className="flex items-center gap-2"><Map size={14} /> <span>Toprak</span></div>
                  
                  {/* Expand Land Button */}
                  <button 
                    onClick={onExpandLand}
                    disabled={!canAffordLand}
                    className={`
                      flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] border transition-all
                      ${canAffordLand 
                        ? 'bg-green-900/50 border-green-500 text-green-200 hover:bg-green-800' 
                        : 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'}
                    `}
                    title={`+5 Arazi (Bedel: ${landCost} Altın)`}
                  >
                    <PlusCircle size={10} />
                    {canAffordLand ? 'Genişlet' : `${landCost} G`}
                  </button>
              </div>
              
              <div className="text-xl font-bold text-green-500 font-mono leading-none mb-2 relative inline-block">
                  {resources.land} <span className="text-gray-500 text-sm">/ {resources.maxLand}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                  Boş: {resources.maxLand - resources.land}
              </div>
          </div>
        </div>
      </div>

      {/* Manual Gather Button */}
      <button 
        onClick={(e) => {
          onManualGather();
          // Add a temporary press effect
          const btn = e.currentTarget;
          btn.classList.add('scale-95');
          setTimeout(() => btn.classList.remove('scale-95'), 100);
        }}
        className="w-full bg-gradient-to-r from-amber-700 to-yellow-800 hover:from-amber-600 hover:to-yellow-700 text-white font-cinzel font-bold py-4 rounded-xl shadow-lg border-2 border-amber-500/50 hover:border-amber-400 transition-all flex items-center justify-center gap-3 group active:shadow-inner"
      >
         <div className="bg-black/30 p-2 rounded-full group-hover:scale-110 transition-transform">
           <Pickaxe size={24} className="text-amber-200" />
         </div>
         <span className="text-lg tracking-widest drop-shadow-md">KAYNAK TOPLA</span>
         <div className="text-xs font-mono opacity-70 ml-2 border-l border-white/20 pl-3 flex flex-col items-start">
            <span>+1 Altın</span>
            <span className="text-[9px] text-yellow-100/60">Şans eseri +1 Bilim / Toprak</span>
         </div>
      </button>

    </div>
  );
};
