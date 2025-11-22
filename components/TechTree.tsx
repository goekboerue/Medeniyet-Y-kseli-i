import React from 'react';
import { Technology, Era, Resources } from '../types';
import { FlaskConical, Lock, Check, ChevronRight } from 'lucide-react';

interface TechTreeProps {
  technologies: Technology[];
  unlockedTechIds: string[];
  resources: Resources;
  currentEra: Era;
  onResearch: (techId: string) => void;
}

export const TechTree: React.FC<TechTreeProps> = ({ technologies, unlockedTechIds, resources, currentEra, onResearch }) => {
  
  // Sort techs to ensure prerequisites are generally above or visually linked (simplified here by era)
  const techsByEra = {
    [Era.TRIBAL]: technologies.filter(t => t.era === Era.TRIBAL),
    [Era.AGRICULTURAL]: technologies.filter(t => t.era === Era.AGRICULTURAL),
    [Era.INDUSTRIAL]: technologies.filter(t => t.era === Era.INDUSTRIAL),
    [Era.TECHNOLOGICAL]: technologies.filter(t => t.era === Era.TECHNOLOGICAL),
  };

  // Helper to check if tech is available
  const isTechAvailable = (tech: Technology) => {
    if (unlockedTechIds.includes(tech.id)) return false; // Already unlocked
    if (tech.prerequisite && !unlockedTechIds.includes(tech.prerequisite)) return false; // Prereq missing
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
        {/* Status Icon */}
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

        {/* Action / Cost */}
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

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
        <h2 className="font-cinzel text-2xl flex items-center gap-2 border-b border-gray-800 pb-2 text-gray-200">
            <FlaskConical size={20} className="text-purple-500" /> Teknoloji Ağacı
        </h2>
        
        {Object.entries(techsByEra).map(([eraKey, techs]) => {
           // Only show eras up to next one
           const eraOrder = [Era.TRIBAL, Era.AGRICULTURAL, Era.INDUSTRIAL, Era.TECHNOLOGICAL];
           const currentEraIndex = eraOrder.indexOf(currentEra);
           const thisEraIndex = eraOrder.indexOf(eraKey as Era);
           
           // Show unlocked eras + 1
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
    </div>
  );
};