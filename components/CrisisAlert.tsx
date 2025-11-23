
import React from 'react';
import { Crisis, Resources } from '../types';
import { TriangleAlert, ShieldCheck, Ban, Coins, Users, TestTube, Map } from 'lucide-react';

interface CrisisAlertProps {
  crisis: Crisis;
  resources: Resources;
  onResolve: () => void;
  onIgnore: () => void;
}

export const CrisisAlert: React.FC<CrisisAlertProps> = ({ crisis, resources, onResolve, onIgnore }) => {
  const canAfford = (resources.gold >= (crisis.cost.gold || 0)) && 
                    (resources.population >= (crisis.cost.population || 0)) &&
                    (resources.science >= (crisis.cost.science || 0)) &&
                    (resources.soldiers >= (crisis.cost.soldiers || 0));

  return (
    <div className="w-full max-w-lg bg-gray-900 border border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden animate-bounce-in relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
      
      <div className="p-8 text-center">
        <div className="mx-auto bg-red-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 animate-pulse">
            <TriangleAlert size={40} className="text-red-500" />
        </div>

        <h2 className="text-3xl font-cinzel font-bold text-red-500 mb-2">KRİZ ANI!</h2>
        <h3 className="text-xl text-white font-bold mb-2">{crisis.name}</h3>
        <p className="text-gray-300 mb-6">{crisis.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-left mb-6">
            <div className="bg-black/40 p-3 rounded border border-gray-700">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Çözüm Maliyeti</p>
                {crisis.cost.gold && <div className={`flex items-center gap-2 ${resources.gold >= crisis.cost.gold ? 'text-white' : 'text-red-400'}`}><Coins size={14}/> {crisis.cost.gold} Altın</div>}
                {crisis.cost.population && <div className={`flex items-center gap-2 ${resources.population >= crisis.cost.population ? 'text-white' : 'text-red-400'}`}><Users size={14}/> {crisis.cost.population} Nüfus</div>}
                {crisis.cost.science && <div className={`flex items-center gap-2 ${resources.science >= crisis.cost.science ? 'text-white' : 'text-red-400'}`}><TestTube size={14}/> {crisis.cost.science} Bilim</div>}
            </div>
            <div className="bg-black/40 p-3 rounded border border-gray-700">
                 <p className="text-xs text-gray-500 font-bold uppercase mb-1">İhmal Cezası</p>
                 {crisis.penalty.gold && <div className="text-red-400 flex items-center gap-2"><Coins size={14}/> -{crisis.penalty.gold} Altın</div>}
                 {crisis.penalty.population && <div className="text-red-400 flex items-center gap-2"><Users size={14}/> -{crisis.penalty.population} Nüfus</div>}
                 {crisis.penalty.land && <div className="text-red-400 flex items-center gap-2"><Map size={14}/> -{crisis.penalty.land} Toprak</div>}
                 {crisis.penalty.science && <div className="text-red-400 flex items-center gap-2"><TestTube size={14}/> -{crisis.penalty.science} Bilim</div>}
            </div>
        </div>

        <div className="flex flex-col gap-3">
             <button
              onClick={onResolve}
              disabled={!canAfford}
              className={`
                w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${canAfford 
                  ? 'bg-green-700 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/30' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
              `}
            >
              <ShieldCheck size={18} />
              Krizi Çöz {canAfford ? '(Kaynakları Kullan)' : '(Yetersiz Kaynak)'}
            </button>
            <button
              onClick={onIgnore}
              className="w-full py-3 rounded-lg font-bold text-sm bg-transparent border border-red-500/30 hover:bg-red-900/20 text-red-400 flex items-center justify-center gap-2 transition-all"
            >
              <Ban size={18} />
              Görmezden Gel (Cezaya Katlan)
            </button>
        </div>
      </div>
    </div>
  );
};