import React from 'react';
import { Crisis, Resources } from '../types';
import { TriangleAlert, ShieldCheck, Ban } from 'lucide-react';

interface CrisisAlertProps {
  crisis: Crisis;
  resources: Resources;
  onResolve: () => void;
  onIgnore: () => void;
}

export const CrisisAlert: React.FC<CrisisAlertProps> = ({ crisis, resources, onResolve, onIgnore }) => {
  const canAfford = (resources.gold >= (crisis.cost.gold || 0)) && 
                    (resources.population >= (crisis.cost.population || 0));

  return (
    <div className="mb-8 w-full max-w-4xl mx-auto animate-bounce-in">
      <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        {/* Background pulse animation */}
        <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
          <div className="bg-red-500/20 p-4 rounded-full text-red-500 animate-pulse">
            <TriangleAlert size={32} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-cinzel font-bold text-red-400 mb-2 flex items-center gap-2">
              KRİZ: {crisis.name}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {crisis.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-black/30 px-3 py-1.5 rounded border border-red-500/30 text-red-300">
                <span className="text-red-500 font-bold uppercase text-xs block mb-1">Bedel (Çözüm)</span>
                {crisis.cost.gold ? `${crisis.cost.gold} Altın` : ''}
                {crisis.cost.population ? ` ${crisis.cost.population} Nüfus` : ''}
              </div>
              
              <div className="bg-black/30 px-3 py-1.5 rounded border border-red-500/30 text-red-300">
                 <span className="text-red-500 font-bold uppercase text-xs block mb-1">Ceza (İhmal)</span>
                 {crisis.penalty.gold ? `-${crisis.penalty.gold} Altın ` : ''}
                 {crisis.penalty.population ? `-${crisis.penalty.population} Nüfus ` : ''}
                 {crisis.penalty.land ? `-${crisis.penalty.land} Toprak ` : ''}
                 {crisis.penalty.science ? `-${crisis.penalty.science} Bilim ` : ''}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
            <button
              onClick={onResolve}
              disabled={!canAfford}
              className={`
                px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${canAfford 
                  ? 'bg-green-700 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/30' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
              `}
            >
              <ShieldCheck size={16} />
              Çöz ({canAfford ? 'Öde' : 'Yetersiz'})
            </button>
            <button
              onClick={onIgnore}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-400 flex items-center justify-center gap-2 transition-all"
            >
              <Ban size={16} />
              Görmezden Gel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};