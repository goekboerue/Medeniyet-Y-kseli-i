
import React, { useState, useEffect, useRef } from 'react';
import { Building, Resources, Technology } from '../types';
import { Coins, Map, Briefcase, TriangleAlert, Lock, ArrowUp, Crown, Plus, Minus, Users, Info, TrendingUp } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  resources: Resources;
  availableWorkers: number;
  onBuy: (buildingId: string) => void;
  onWorkerChange: (buildingId: string, change: number) => void;
  unlockedTechs: string[];
  allTechs: Technology[];
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ 
  building, 
  resources, 
  availableWorkers, 
  onBuy, 
  onWorkerChange,
  unlockedTechs, 
  allTechs 
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [workerAnim, setWorkerAnim] = useState<'add' | 'remove' | null>(null);
  const prevCountRef = useRef(building.count);

  // Trigger animation when count increases
  useEffect(() => {
    if (building.count > prevCountRef.current) {
      setIsUpgrading(true);
      const timer = setTimeout(() => setIsUpgrading(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = building.count;
  }, [building.count]);

  const handleWorkerClick = (change: number) => {
    onWorkerChange(building.id, change);
    setWorkerAnim(change > 0 ? 'add' : 'remove');
    setTimeout(() => setWorkerAnim(null), 200);
  };

  const currentGoldCost = Math.floor(building.baseCost.gold * Math.pow(1.15, building.count));
  const currentLandCost = building.baseCost.land;
  const workersPerBuilding = building.baseCost.workers;
  const maxWorkers = building.count * workersPerBuilding;

  // Efficiency Multipliers (Exponential Scaling)
  const efficiencyMultiplier = building.count > 1 ? Math.pow(1.05, building.count) : 1;
  const popEfficiencyMultiplier = building.count > 1 ? Math.pow(1.02, building.count) : 1;

  // Calculate actual production
  const actualGoldProd = (building.production.gold || 0) * efficiencyMultiplier;
  const actualScienceProd = (building.production.science || 0) * efficiencyMultiplier;
  const actualPopProd = (building.production.population || 0) * popEfficiencyMultiplier;

  // Check tech requirements
  const isTechLocked = building.requiredTech && !unlockedTechs.includes(building.requiredTech);
  const requiredTechName = building.requiredTech ? allTechs.find(t => t.id === building.requiredTech)?.name : 'Bilinmeyen Teknoloji';

  const hasGold = resources.gold >= currentGoldCost;
  const hasLand = (resources.maxLand - resources.land) >= currentLandCost;
  
  // Build button availability
  const canAfford = hasGold && hasLand;

  // Tier Logic
  let tier = 1;
  let tierName = "";
  let tierContainerStyle = "bg-gray-800 border-gray-700 hover:border-gray-500";
  let tierIconStyle = "bg-gray-700";
  let tierTitleColor = "text-gray-200";

  if (building.count >= 20) {
      tier = 3;
      tierName = "Muazzam ";
      tierContainerStyle = "bg-gradient-to-br from-gray-800 to-amber-900/20 border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      tierIconStyle = "bg-amber-900/40 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      tierTitleColor = "text-amber-400";
  } else if (building.count >= 10) {
      tier = 2;
      tierName = "Gelişmiş ";
      tierContainerStyle = "bg-gradient-to-br from-gray-800 to-blue-900/20 border-blue-500/40 hover:border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
      tierIconStyle = "bg-blue-900/40 text-blue-300 border border-blue-500/30";
      tierTitleColor = "text-blue-300";
  }

  // Risk Calculation
  let riskLevel = null;
  if (building.depletionChance) {
      if (building.depletionChance > 0.0015) riskLevel = { label: 'Yüksek Risk', color: 'text-red-400', border: 'border-red-500/30' };
      else if (building.depletionChance > 0.0008) riskLevel = { label: 'Orta Risk', color: 'text-orange-400', border: 'border-orange-500/30' };
      else riskLevel = { label: 'Düşük Risk', color: 'text-yellow-400', border: 'border-yellow-500/30' };
  }

  if (isTechLocked) {
      return (
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl relative overflow-hidden group h-full flex flex-col justify-center items-center opacity-70 hover:opacity-100 transition-opacity">
             <div className="absolute inset-0 bg-black/40 z-0"></div>
             <div className="z-10 flex flex-col items-center text-center p-4">
                <div className="bg-gray-800 p-3 rounded-full mb-3 border border-gray-700 shadow-lg">
                    <Lock size={24} className="text-gray-500" />
                </div>
                <h3 className="text-gray-400 font-bold text-sm mb-1">Kilitli Yapı</h3>
                <p className="text-xs text-gray-500 max-w-[200px]">
                   Bu yapıyı inşa etmek için <span className="text-purple-400 font-bold">{requiredTechName}</span> teknolojisini keşfetmelisin.
                </p>
             </div>
          </div>
      );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${tierContainerStyle} ${isUpgrading ? 'animate-upgrade' : ''}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg relative ${tierIconStyle}`}>
             {building.icon}
             {tier > 1 && (
                <div className="absolute -top-2 -right-2 text-amber-500 bg-black/50 rounded-full p-0.5 border border-amber-500/50">
                   <Crown size={10} fill="currentColor" />
                </div>
             )}
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight ${tierTitleColor}`}>
                {tierName}{building.name}
            </h3>
            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
               <span className="bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-700 text-gray-500">
                 Seviye {building.count}
               </span>
               {building.count > 5 && (
                  <span className="text-emerald-500 flex items-center gap-1 font-mono text-[10px]" title="Verimlilik Çarpanı">
                     <TrendingUp size={10} />
                     x{efficiencyMultiplier.toFixed(1)}
                  </span>
               )}
               {riskLevel && (
                 <span className={`flex items-center gap-1 ${riskLevel.color}`}>
                    <TriangleAlert size={10} /> {riskLevel.label}
                 </span>
               )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4 min-h-[2.5em] relative z-10 leading-relaxed">
        {building.description}
      </p>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs relative z-10">
        {/* Production Stats */}
        <div className="bg-black/20 p-2 rounded border border-gray-700/50 space-y-1">
           <div className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Verimli Üretim</div>
           {building.production.gold && (
             <div className="flex justify-between text-yellow-500">
                <span>Altın</span>
                <span className="font-mono">+{actualGoldProd.toFixed(1)}/sn</span>
             </div>
           )}
           {building.production.population && (
             <div className="flex justify-between text-blue-400">
                <span>Nüfus</span>
                <span className="font-mono">+{actualPopProd.toFixed(2)}/tk</span>
             </div>
           )}
           {building.production.science && (
             <div className="flex justify-between text-purple-400">
                <span>Bilim</span>
                <span className="font-mono">+{actualScienceProd.toFixed(1)}/sn</span>
             </div>
           )}
        </div>

        {/* Worker Management - Tooltip here */}
        {building.baseCost.workers > 0 && (
           <div className="bg-black/20 p-2 rounded border border-gray-700/50 flex flex-col justify-between group/workers relative">
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 border border-gray-600 text-gray-300 text-[10px] p-2 rounded shadow-xl pointer-events-none opacity-0 group-hover/workers:opacity-100 transition-opacity z-20">
                 <div className="font-bold text-white mb-1 flex items-center gap-1">
                    <Users size={10} /> İşçi Kapasitesi
                 </div>
                 <div className="flex justify-between mb-0.5">
                    <span>Bina Başına:</span>
                    <span className="text-white">{workersPerBuilding}</span>
                 </div>
                 <div className="flex justify-between mb-0.5">
                    <span>Toplam Kapasite:</span>
                    <span className="text-white">{maxWorkers}</span>
                 </div>
                 <div className="flex justify-between text-emerald-400">
                    <span>Mevcut Atanan:</span>
                    <span>{building.assignedWorkers}</span>
                 </div>
              </div>

              <div className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1 flex items-center justify-between">
                 <span>İşçiler</span>
                 <Info size={10} className="text-gray-600" />
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                  <button 
                    onClick={() => handleWorkerClick(-1)}
                    disabled={building.assignedWorkers <= 0}
                    className="w-6 h-6 rounded bg-gray-700 hover:bg-red-900/50 border border-gray-600 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={12} />
                  </button>
                  
                  <div className="font-mono font-bold text-center relative w-8">
                     <span className={building.assignedWorkers === maxWorkers ? 'text-green-400' : 'text-white'}>
                        {building.assignedWorkers}
                     </span>
                     {workerAnim === 'add' && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-green-400 text-[10px] animate-float-up">+1</span>}
                     {workerAnim === 'remove' && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-400 text-[10px] animate-float-up">-1</span>}
                  </div>

                  <button 
                    onClick={() => handleWorkerClick(1)}
                    disabled={building.assignedWorkers >= maxWorkers || availableWorkers <= 0}
                    className="w-6 h-6 rounded bg-gray-700 hover:bg-green-900/50 border border-gray-600 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={12} />
                  </button>
              </div>
           </div>
        )}
        {building.baseCost.workers === 0 && (
            <div className="bg-black/20 p-2 rounded border border-gray-700/50 flex items-center justify-center text-gray-600 italic">
               Otomatik Çalışır
            </div>
        )}
      </div>

      {/* Cost / Buy Button */}
      <button
        onClick={() => onBuy(building.id)}
        disabled={!canAfford}
        className={`
          w-full py-3 px-4 rounded-lg border-2 transition-all relative overflow-hidden group/btn
          ${canAfford 
            ? 'bg-gray-800 border-emerald-600/50 hover:bg-emerald-900/20 hover:border-emerald-500 text-white shadow-[0_4px_0_rgb(6,78,59)] hover:shadow-[0_2px_0_rgb(6,78,59)] active:shadow-none active:translate-y-1' 
            : 'bg-gray-900 border-gray-800 text-gray-500 opacity-60 cursor-not-allowed'}
        `}
      >
         <div className="flex items-center justify-between relative z-10">
            <span className="font-bold font-cinzel text-sm flex items-center gap-2">
               {canAfford ? <ArrowUp size={16} className="text-emerald-500" /> : <Lock size={14} />}
               {canAfford ? 'İNŞA ET' : 'YETERSİZ KAYNAK'}
            </span>
            <div className="flex items-center gap-3 text-xs">
               <span className={`flex items-center gap-1 ${resources.gold >= currentGoldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                  <Coins size={12} /> {currentGoldCost}
               </span>
               <span className={`flex items-center gap-1 ${hasLand ? 'text-green-400' : 'text-red-400'}`}>
                  <Map size={12} /> {currentLandCost}
               </span>
            </div>
         </div>
         {canAfford && <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent transform translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>}
      </button>

    </div>
  );
};
