
import React, { useState, useEffect, useRef } from 'react';
import { Resources } from '../types';
import { Users, Coins, Map, TrendingUp, Briefcase, FlaskConical, AlertCircle, Pickaxe, PlusCircle, Swords } from 'lucide-react';

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

// Floating text component
const FloatingChange = ({ change, label }: { change: { val: number; id: number } | null, label?: string }) => {
  if (!change) return null;
  const isPositive = change.val > 0;
  return (
    <div
      key={change.id}
      className={`absolute -top-4 right-0 text-sm font-bold animate-float-up pointer-events-none z-40 flex flex-col items-end leading-none
        ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
    >
      <span>{isPositive ? '+' : ''}{change.val}</span>
    </div>
  );
};

const ResourceItem = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  colorClass, 
  change,
  trend
}: { 
  icon: any, 
  label: string, 
  value: React.ReactNode, 
  subValue?: React.ReactNode, 
  colorClass: string,
  change: { val: number; id: number } | null,
  trend?: string
}) => (
  <div className="flex items-center gap-3 bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-700/50 relative min-w-[120px] flex-1">
    <FloatingChange change={change} />
    <div className={`p-2 rounded-md bg-gray-800 ${colorClass}`}>
      <Icon size={18} />
    </div>
    <div className="flex flex-col">
       <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider flex items-center gap-2">
         {label}
         {trend && <span className="text-gray-600 font-mono normal-case opacity-70">{trend}</span>}
       </div>
       <div className="font-mono text-lg font-bold leading-none text-gray-200 flex items-baseline gap-1">
         {value}
         {subValue && <span className="text-[10px] text-gray-500 font-sans font-normal">{subValue}</span>}
       </div>
    </div>
  </div>
);

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources, income, scienceIncome, populationGrowth, availableWorkers, onManualGather, onExpandLand }) => {
  const totalPop = Math.floor(resources.population);
  const usedWorkers = totalPop - availableWorkers;

  const popChange = useResourceChange(resources.population);
  const goldChange = useResourceChange(resources.gold);
  const landChange = useResourceChange(resources.land);
  const scienceChange = useResourceChange(resources.science);
  const soldiersChange = useResourceChange(resources.soldiers);
  
  const landCost = Math.floor(resources.maxLand * 2.5);
  const canAffordLand = resources.gold >= landCost;

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full bg-gray-950/90 backdrop-blur-md p-2 border-b border-gray-800 shadow-2xl sticky top-0 z-50">
      
      <div className="flex flex-1 gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
        {/* Population */}
        <ResourceItem 
          icon={Users} 
          label="Nüfus" 
          colorClass="text-blue-400"
          value={totalPop}
          subValue={
             <span className={`${availableWorkers > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
               ({availableWorkers} Boş)
             </span>
          }
          change={popChange}
          trend={`+${populationGrowth.toFixed(1)}`}
        />

        {/* Soldiers */}
        <ResourceItem 
            icon={Swords} 
            label="Ordu" 
            colorClass="text-red-400"
            value={resources.soldiers}
            change={soldiersChange}
        />

        {/* Gold */}
        <ResourceItem 
          icon={Coins} 
          label="Altın" 
          colorClass="text-yellow-400"
          value={Math.floor(resources.gold)}
          change={goldChange}
          trend={`+${income.toFixed(1)}`}
        />

        {/* Science */}
        <ResourceItem 
          icon={FlaskConical} 
          label="Bilim" 
          colorClass="text-purple-400"
          value={Math.floor(resources.science)}
          change={scienceChange}
          trend={`+${scienceIncome.toFixed(1)}`}
        />

        {/* Land */}
        <div className="flex items-center gap-2 bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-700/50 relative min-w-[140px] flex-1">
            <FloatingChange change={landChange} />
            <div className="p-2 rounded-md bg-gray-800 text-green-500">
               <Map size={18} />
            </div>
            <div className="flex flex-col flex-1">
               <div className="flex justify-between items-center">
                   <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Toprak</span>
                   <button 
                      onClick={onExpandLand}
                      disabled={!canAffordLand}
                      className={`p-1 rounded border transition-colors ${canAffordLand ? 'border-green-500 text-green-400 hover:bg-green-900' : 'border-gray-700 text-gray-600'}`}
                      title={`Genişlet (${landCost} Altın)`}
                   >
                      <PlusCircle size={12} />
                   </button>
               </div>
               <div className="font-mono text-lg font-bold leading-none text-gray-200">
                  {resources.land}<span className="text-gray-500 text-sm">/{resources.maxLand}</span>
               </div>
            </div>
        </div>
      </div>

      {/* Compact Manual Gather Button */}
      <button 
        onClick={(e) => {
          onManualGather();
          const btn = e.currentTarget;
          btn.classList.add('scale-95');
          setTimeout(() => btn.classList.remove('scale-95'), 100);
        }}
        className="md:w-auto w-full px-6 py-2 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-lg shadow-lg border-t border-amber-400/30 flex items-center justify-center gap-2 active:shadow-inner shrink-0"
      >
         <Pickaxe size={18} className="text-amber-200 animate-pulse-slow" />
         <div className="flex flex-col items-start leading-none">
            <span className="font-bold font-cinzel text-sm tracking-wide">TOPLA</span>
            <span className="text-[9px] opacity-80 text-amber-100">+1 Kaynak</span>
         </div>
      </button>

    </div>
  );
};