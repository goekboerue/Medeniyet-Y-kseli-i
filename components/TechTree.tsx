
import React from 'react';
import { Technology, Era, Resources } from '../types';
import { FlaskConical, Lock, Check, ChevronRight, Infinity, ShieldPlus, Map } from 'lucide-react';

interface TechTreeProps {
  technologies: Technology[];
  unlockedTechIds: string[];
  resources: Resources;
  currentEra: Era;
  onResearch: (techId: string) => void;
  futureTechLevel?: number;
  onFutureResearch?: () => void;
}

export const TechTree: React.FC<TechTreeProps> = ({ technologies, unlockedTechIds, resources, currentEra, onResearch, futureTechLevel = 0, onFutureResearch }) => {
  
  // Sort techs
  const techsByEra = {
    [Era.TRIBAL]: technologies.filter(t => t.era === Era.TRIBAL),
    [Era.AGRICULTURAL]: technologies.filter(t => t.era === Era.AGRICULTURAL),
    [Era.INDUSTRIAL]: technologies.filter(t => t.era === Era.INDUSTRIAL),
    [Era.TECHNOLOGICAL]: technologies.filter(t => t.era === Era.TECHNOLOGICAL),
  };

  const isTechAvailable = (tech: Technology) => {
    if (unlockedTechIds.includes(tech.id)) return false; 
    if (tech.prerequisite && !unlockedTechIds.includes(tech.prerequisite)) return false; 
    return true;
  };

  const renderTechCard = (tech: Technology) => {
    const isUnlocked = unlockedTechIds.includes(tech.id);
    const isAvailable = isTechAvailable(tech);
    const canAfford = resources.science >= tech.cost;
    const isLocked = !isUnlocked && !isAvailable;

    return (
      <div 
        key={tech.id}
        className={`
          relative p-3 rounded-lg border transition-all flex flex-col justify-between min-h-[100px]
          ${isUnlocked 
            ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
            : isLocked 
              ? 'bg-gray-900/50 border-gray-800 opacity-60 grayscale' 
              : 'bg-gray-800 border-purple-500/30 hover:border-purple-400 shadow-lg'}
        `}
      >
        <div className="absolute top-2 right-2">
            {isUnlocked && <Check size={16} className="text-emerald-500" />}
            {isLocked && <Lock size={16} className="text-gray-600" />}
        </div>

        <div>
          <h4 className={`font-bold text-sm mb-1 flex items-center gap-2 ${isUnlocked ? 'text-emerald-400' : isLocked ? 'text-gray-500' : 'text-purple-300'}`}>
             {tech.name}
          </h4>
          <p className="text-[10px] text-gray-400 leading-tight mb-3">
            {tech.description}
          </p>
        </div>

        {!isUnlocked && (
          <div className="mt-auto">
             {isLocked ? (
                 <div className="text-[10px] text-red-900/50 font-mono bg-red-900/10 px-2 py-1 rounded inline-block">
                    Gereksinim: {technologies.find(t => t.id === tech.prerequisite)?.name}
                 </div>
             ) : (
               <button 
                 onClick={() => onResearch(tech.id)}
                 disabled={!canAfford}
                 className={`
                   w-full text-xs py-1.5 rounded flex items-center justify-center gap-2 font-bold transition-colors
                   ${canAfford 
                     ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/30' 
                     : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                 `}
               >
                 <FlaskConical size={12} />
                 {tech.cost} Bilim
               </button>
             )}
          </div>
        )}
        
        {isUnlocked && (
           <div className="mt-auto text-[10px] text-emerald-500/80 font-mono bg-emerald-900/10 px-2 py-1 rounded w-max">
              Keşfedildi
           </div>
        )}
      </div>
    );
  };

  const futureTechCost = Math.floor(10000 * Math.pow(1.5, futureTechLevel));
  const canAffordFuture = resources.science >= futureTechCost;

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
        <h2 className="font-cinzel text-2xl flex items-center gap-2 border-b border-gray-800 pb-2 text-gray-200">
            <FlaskConical size={20} className="text-purple-500" /> Teknoloji Ağacı
        </h2>
        
        {Object.entries(techsByEra).map(([eraKey, techs]) => {
           const eraOrder = [Era.TRIBAL, Era.AGRICULTURAL, Era.INDUSTRIAL, Era.TECHNOLOGICAL];
           const currentEraIndex = eraOrder.indexOf(currentEra);
           const thisEraIndex = eraOrder.indexOf(eraKey as Era);
           
           if (thisEraIndex > currentEraIndex + 1) return null;

           if (techs.length === 0) return null;

           return (
             <div key={eraKey} className="relative">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${thisEraIndex <= currentEraIndex ? 'text-gray-400' : 'text-gray-700'}`}>
                    {thisEraIndex === currentEraIndex && <ChevronRight size={12} className="text-amber-500" />}
                    {eraKey}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {techs.map(tech => renderTechCard(tech))}
                </div>
             </div>
           );
        })}

        {/* Future Tech Section - Only visible if Tech Era or nearly all unlocked */}
        {currentEra === Era.TECHNOLOGICAL && onFutureResearch && (
            <div className="mt-8 pt-6 border-t border-purple-900/50">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-purple-400 animate-pulse">
                    <Infinity size={14} /> Sonsuz Ufuklar
                </h3>
                <div className="bg-gradient-to-r from-purple-900/40 to-black p-4 rounded-xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        <h4 className="font-bold text-lg text-white flex items-center gap-2">
                            Geleceğin Teknolojisi <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">Seviye {futureTechLevel + 1}</span>
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">
                            Medeniyetin sınırlarını zorla. Her seviye orduyu güçlendirir ve yeni yaşam alanları (toprak) açar.
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                             <span className="text-green-400 flex items-center gap-1"><Map size={12}/> +20 Toprak Kapasitesi</span>
                             <span className="text-red-400 flex items-center gap-1"><ShieldPlus size={12}/> +%5 Ordu Gücü</span>
                        </div>
                    </div>
                    <button
                        onClick={onFutureResearch}
                        disabled={!canAffordFuture}
                        className={`
                            px-6 py-3 rounded-lg font-bold flex flex-col items-center gap-1 min-w-[140px] transition-all
                            ${canAffordFuture 
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        <span className="flex items-center gap-2"><FlaskConical size={16} /> Araştır</span>
                        <span className="text-[10px] opacity-80 font-mono">{futureTechCost.toLocaleString()} Bilim</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};