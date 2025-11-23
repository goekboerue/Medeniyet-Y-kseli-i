

import React from 'react';
import { Rival, RelationStatus, Resources } from '../types';
import { Swords, Handshake, Gift, Shield, Skull, Crown, UserPlus, Timer } from 'lucide-react';

interface DiplomacyPanelProps {
  rivals: Rival[];
  resources: Resources;
  onAttack: (rivalId: string) => void;
  onTrade: (rivalId: string) => void;
  onImproveRelations: (rivalId: string) => void;
  onRecruit: (amount: number) => void;
  militaryStrength: number;
  gameTime?: number;
}

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({ 
  rivals, 
  resources, 
  onAttack, 
  onTrade, 
  onImproveRelations,
  onRecruit,
  militaryStrength,
  gameTime = 0
}) => {

  const getRelationColor = (status: RelationStatus) => {
    switch (status) {
      case RelationStatus.WAR: return 'text-red-500 bg-red-900/20 border-red-500/50';
      case RelationStatus.HOSTILE: return 'text-orange-500 bg-orange-900/20 border-orange-500/50';
      case RelationStatus.NEUTRAL: return 'text-gray-400 bg-gray-800 border-gray-600';
      case RelationStatus.FRIENDLY: return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/50';
      case RelationStatus.ALLY: return 'text-blue-400 bg-blue-900/20 border-blue-500/50';
      default: return 'text-gray-400';
    }
  };

  const getAttitudeIcon = (attitude: Rival['attitude']) => {
      switch(attitude) {
          case 'AGGRESSIVE': return <Swords size={14} className="text-red-400" />;
          case 'TRADER': return <Handshake size={14} className="text-amber-400" />;
          case 'DEFENSIVE': return <Shield size={14} className="text-blue-400" />;
      }
  };

  const RECRUIT_COST_GOLD = 50;
  const RECRUIT_COST_POP = 1;

  const renderRecruitButton = (amount: number) => {
    const totalGold = RECRUIT_COST_GOLD * amount;
    const totalPop = RECRUIT_COST_POP * amount;
    const canAfford = resources.gold >= totalGold && resources.population >= totalPop;

    return (
        <button
            onClick={() => onRecruit(amount)}
            disabled={!canAfford}
            className={`
                px-3 py-2 rounded font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all border
                ${canAfford 
                    ? 'bg-red-900/40 hover:bg-red-800 border-red-500/50 text-red-100' 
                    : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'}
            `}
            title={`-${totalGold} Altın, -${totalPop} Nüfus`}
        >
            <span className="flex items-center gap-1"><UserPlus size={12} /> +{amount}</span>
            <span className="text-[9px] opacity-70 font-mono">-{totalGold}g</span>
        </button>
    );
  };

  const isSoldiersZero = resources.soldiers <= 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Recruitment Section */}
      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="bg-red-900/30 p-3 rounded-full border border-red-500/30 hidden sm:block">
                 <Shield size={32} className="text-red-500" />
             </div>
             <div>
                 <h3 className="font-cinzel font-bold text-lg text-red-100">Askeri Karargah</h3>
                 <p className="text-xs text-gray-400">
                    Mevcut Asker: <span className="text-white font-bold">{resources.soldiers}</span> | 
                    Toplam Güç: <span className="text-red-400 font-bold">{Math.floor(militaryStrength)}</span>
                 </p>
                 <p className="text-[10px] text-gray-500 mt-1">1 Asker = 50 Altın + 1 Nüfus</p>
                 {isSoldiersZero && (
                    <div className="text-[10px] text-red-400 font-bold bg-red-900/20 px-2 py-0.5 rounded border border-red-500/30 inline-block mt-1 animate-pulse">
                        UYARI: Asker yok! Savunma çöktü (-%90 Güç).
                    </div>
                 )}
             </div>
         </div>

         <div className="grid grid-cols-4 gap-2 w-full lg:w-auto">
             {renderRecruitButton(1)}
             {renderRecruitButton(10)}
             {renderRecruitButton(100)}
             {renderRecruitButton(1000)}
         </div>
      </div>

      <h2 className="font-cinzel text-2xl flex items-center gap-2 border-b border-gray-800 pb-2 text-gray-200 mt-6">
          <Crown size={20} className="text-amber-500" /> Rakip Uygarlıklar
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {rivals.map(rival => {
            const relStyle = getRelationColor(rival.relation);
            const isAtWar = rival.relation === RelationStatus.WAR;
            const strengthRatio = militaryStrength > 0 ? rival.strength / militaryStrength : 100;
            const isOnCooldown = rival.cooldownEnd && rival.cooldownEnd > gameTime;
            const cooldownLeft = isOnCooldown ? Math.max(0, (rival.cooldownEnd || 0) - gameTime) : 0;
            
            let threatLevel = "Düşük";
            let threatColor = "text-green-500";
            if (strengthRatio > 1.5) { threatLevel = "Ölümcül"; threatColor = "text-red-600 font-bold"; }
            else if (strengthRatio > 1.1) { threatLevel = "Yüksek"; threatColor = "text-red-400"; }
            else if (strengthRatio > 0.8) { threatLevel = "Eşit"; threatColor = "text-yellow-400"; }

            return (
                <div key={rival.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Swords size={100} />
                    </div>
                    
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        {/* Rival Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-gray-200">{rival.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${relStyle}`}>
                                    {rival.relation}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded">
                                    {getAttitudeIcon(rival.attitude)} {rival.attitude}
                                </span>
                                <span>Çağ: {rival.era}</span>
                                <span className="flex items-center gap-1" title={`Tahmini Güç: ${Math.floor(rival.strength)}`}>
                                   Tehdit: <span className={threatColor}>{threatLevel}</span>
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {isOnCooldown ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 border border-gray-700 text-gray-500 rounded-lg text-xs italic">
                                    <Timer size={14} className="animate-pulse" />
                                    Yeniden toplanıyor ({cooldownLeft}s)
                                </div>
                            ) : isAtWar ? (
                                <button 
                                    onClick={() => onAttack(rival.id)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-600 text-red-200 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold"
                                >
                                    <Swords size={16} /> SALDIR
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => onTrade(rival.id)}
                                        disabled={resources.gold < 100}
                                        className="flex-1 md:flex-none px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-amber-400 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
                                        title="100 Altın karşılığında kaynak takası"
                                    >
                                        <Handshake size={14} /> Ticaret
                                    </button>
                                    <button 
                                        onClick={() => onImproveRelations(rival.id)}
                                        disabled={resources.gold < 200}
                                        className="flex-1 md:flex-none px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-blue-400 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
                                        title="200 Altın karşılığında hediye gönder"
                                    >
                                        <Gift size={14} /> Hediye
                                    </button>
                                    <button 
                                        onClick={() => onAttack(rival.id)}
                                        className="flex-1 md:flex-none px-3 py-2 bg-gray-800 hover:bg-red-900/30 border border-gray-600 hover:border-red-600 text-gray-400 hover:text-red-400 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                                    >
                                        <Skull size={14} /> Savaş İlan Et
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
