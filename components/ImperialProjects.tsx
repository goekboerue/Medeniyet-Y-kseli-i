
import React from 'react';
import { Resources } from '../types';
import { Crown, Sparkles, TrendingUp, Map, FlaskConical } from 'lucide-react';

interface ImperialProjectsProps {
  resources: Resources;
  onGoldenAge: () => void;
  onFestival: () => void;
  onScienceGrant: () => void;
  onLandReclamation: () => void;
  isGoldenAgeActive: boolean;
}

export const ImperialProjects: React.FC<ImperialProjectsProps> = ({ 
  resources, 
  onGoldenAge, 
  onFestival, 
  onScienceGrant, 
  onLandReclamation,
  isGoldenAgeActive
}) => {
  
  // Costs calculation
  const goldenAgeCost = Math.max(1000, Math.floor(resources.gold * 0.8));
  const festivalCost = Math.max(200, Math.floor(resources.gold * 0.3));
  const scienceGrantCost = 5000;
  const landReclamationCost = Math.floor(resources.maxLand * 10); // Very expensive late game

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-amber-500/30 p-4 mb-4 shadow-lg">
       <h3 className="text-amber-400 font-cinzel font-bold flex items-center gap-2 mb-3 text-sm uppercase tracking-widest border-b border-amber-500/20 pb-2">
          <Crown size={16} /> İmparatorluk Projeleri (Hazine Yönetimi)
       </h3>
       
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Golden Age */}
          <button 
             onClick={onGoldenAge}
             disabled={resources.gold < 1000 || isGoldenAgeActive}
             className={`
                relative p-3 rounded border flex flex-col items-center justify-center gap-1 text-center transition-all group overflow-hidden
                ${isGoldenAgeActive 
                   ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                   : resources.gold >= goldenAgeCost 
                     ? 'bg-gray-800 hover:bg-amber-900/30 border-gray-600 hover:border-amber-500/50 text-gray-300 hover:text-amber-100' 
                     : 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'}
             `}
          >
             <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Sparkles size={20} className={isGoldenAgeActive ? 'text-amber-400 animate-spin-slow' : 'text-amber-600'} />
             <span className="font-bold text-xs">Altın Çağ</span>
             <span className="text-[10px] opacity-70">
                {isGoldenAgeActive ? 'AKTİF!' : `Maliyet: ${goldenAgeCost.toLocaleString()}g`}
             </span>
             <span className="text-[9px] text-green-400 mt-1">1dk Boyunca 2x Üretim</span>
          </button>

          {/* Festival */}
          <button 
             onClick={onFestival}
             disabled={resources.gold < 200}
             className={`
                p-3 rounded border flex flex-col items-center justify-center gap-1 text-center transition-all
                ${resources.gold >= festivalCost 
                   ? 'bg-gray-800 hover:bg-blue-900/30 border-gray-600 hover:border-blue-400 text-gray-300' 
                   : 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'}
             `}
          >
             <TrendingUp size={20} className="text-blue-500" />
             <span className="font-bold text-xs">Büyük Şölen</span>
             <span className="text-[10px] opacity-70">Maliyet: {festivalCost.toLocaleString()}g</span>
             <span className="text-[9px] text-blue-300 mt-1">+10 Nüfus Patlaması</span>
          </button>

          {/* Science Grant */}
          <button 
             onClick={onScienceGrant}
             disabled={resources.gold < scienceGrantCost}
             className={`
                p-3 rounded border flex flex-col items-center justify-center gap-1 text-center transition-all
                ${resources.gold >= scienceGrantCost 
                   ? 'bg-gray-800 hover:bg-purple-900/30 border-gray-600 hover:border-purple-400 text-gray-300' 
                   : 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'}
             `}
          >
             <FlaskConical size={20} className="text-purple-500" />
             <span className="font-bold text-xs">Bilim Fuarı</span>
             <span className="text-[10px] opacity-70">Maliyet: {scienceGrantCost.toLocaleString()}g</span>
             <span className="text-[9px] text-purple-300 mt-1">+1000 Bilim</span>
          </button>

          {/* Land Reclamation */}
          <button 
             onClick={onLandReclamation}
             disabled={resources.gold < landReclamationCost}
             className={`
                p-3 rounded border flex flex-col items-center justify-center gap-1 text-center transition-all
                ${resources.gold >= landReclamationCost 
                   ? 'bg-gray-800 hover:bg-green-900/30 border-gray-600 hover:border-green-400 text-gray-300' 
                   : 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'}
             `}
          >
             <Map size={20} className="text-green-600" />
             <span className="font-bold text-xs">Arazi Islahı</span>
             <span className="text-[10px] opacity-70">Maliyet: {landReclamationCost.toLocaleString()}g</span>
             <span className="text-[9px] text-green-300 mt-1">+10 Toprak Kapasitesi</span>
          </button>

       </div>
    </div>
  );
};
