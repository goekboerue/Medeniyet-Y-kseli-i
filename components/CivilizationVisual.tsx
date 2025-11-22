
import React from 'react';
import { Era, BuildingStyle, Climate } from '../types';
import { 
  Castle, Tent, Factory, Landmark, Shield, Coins, Wheat, Cloud, Sun, Moon, Stars, 
  Snowflake, Palmtree, ThermometerSun, Trees, Gem, TrendingUp, 
  CloudRain, Wind, Skull, Crown, Swords, Target, Anchor, Zap, Building2
} from 'lucide-react';

interface CivilizationVisualProps {
  era: Era;
  dominantStyle: BuildingStyle;
  climate: Climate;
}

export const CivilizationVisual: React.FC<CivilizationVisualProps> = ({ era, dominantStyle, climate }) => {
  
  const isEconomic = dominantStyle === BuildingStyle.ECONOMIC;
  const isMilitary = dominantStyle === BuildingStyle.MILITARY;

  // --- Weather & Atmosphere Logic ---
  const getClimateStyles = (isNight: boolean) => {
    let styles = {
      bg: '',
      ground: '',
      accent: '',
      weather: null as React.ReactNode
    };

    switch (climate) {
      case Climate.ARCTIC:
        styles = {
          bg: isNight ? 'bg-slate-900' : 'bg-slate-100',
          ground: isNight ? 'from-slate-800 to-slate-900' : 'from-slate-200 to-white',
          accent: isNight ? 'text-blue-200' : 'text-slate-400',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Snow layer 1 */}
              <div className="absolute top-[-20%] left-[10%] animate-snow opacity-60 text-white" style={{animationDuration: '5s'}}>
                 <Snowflake size={10} />
              </div>
              <div className="absolute top-[-20%] left-[30%] animate-snow opacity-80 text-white" style={{animationDuration: '7s', animationDelay: '1s'}}>
                 <Snowflake size={14} />
              </div>
              <div className="absolute top-[-20%] left-[60%] animate-snow opacity-50 text-white" style={{animationDuration: '6s', animationDelay: '2.5s'}}>
                 <Snowflake size={8} />
              </div>
              <div className="absolute top-[-20%] left-[85%] animate-snow opacity-70 text-white" style={{animationDuration: '8s', animationDelay: '0.5s'}}>
                 <Snowflake size={12} />
              </div>
              {/* Wind effect */}
              <div className="absolute top-1/3 w-full h-32 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse transform -skew-x-12"></div>
            </div>
          )
        };
        break;

      case Climate.ARID:
        styles = {
          bg: isNight ? 'bg-stone-950' : 'bg-amber-100',
          ground: isNight ? 'from-stone-800 to-stone-900' : 'from-orange-200 to-amber-200',
          accent: 'text-orange-600',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Heat Haze / Sandstorm overlay */}
              <div className={`absolute inset-0 ${isNight ? 'bg-orange-900/10' : 'bg-orange-500/10'} mix-blend-multiply`}></div>
              {!isNight && (
                <>
                  <div className="absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-scan" style={{animationDuration: '8s', transform: 'rotate(90deg)', opacity: 0.3}}></div>
                  <div className="absolute top-10 right-10 text-orange-500/40 animate-pulse-slow"><Sun size={60} /></div>
                </>
              )}
              {/* Dust particles */}
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-400 rounded-full blur-[1px] animate-float-up opacity-50"></div>
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-600 rounded-full blur-[2px] animate-float-up opacity-30" style={{animationDelay: '1s'}}></div>
            </div>
          )
        };
        break;

      case Climate.TROPICAL:
        styles = {
          bg: isNight ? 'bg-teal-950' : 'bg-emerald-900',
          ground: isNight ? 'from-emerald-950 to-teal-950' : 'from-emerald-600 to-teal-700',
          accent: 'text-emerald-300',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Rain */}
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-[1px] h-8 bg-blue-200/40 animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random()}s`
                  }}
                ></div>
              ))}
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
              {!isNight && <div className="absolute top-4 left-1/3 opacity-40 text-gray-300 animate-float-up"><CloudRain size={48} /></div>}
            </div>
          )
        };
        break;

      case Climate.TEMPERATE:
      default:
        styles = {
          bg: isNight ? 'bg-slate-900' : 'bg-sky-300',
          ground: isNight ? 'from-stone-900 to-black' : 'from-emerald-500 to-emerald-400',
          accent: 'text-green-800',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               {!isNight ? (
                 <>
                    <div className="absolute top-8 left-[10%] text-white/80 animate-float-up" style={{animationDuration: '15s'}}><Cloud size={64} fill="white" /></div>
                    <div className="absolute top-16 left-[60%] text-white/60 animate-float-up" style={{animationDuration: '20s', animationDelay: '5s'}}><Cloud size={40} fill="white" /></div>
                    <div className="absolute top-4 right-[10%] text-yellow-300 animate-spin-slow"><Sun size={48} /></div>
                 </>
               ) : (
                  <div className="absolute top-10 right-1/3 w-full h-10 bg-fog-gradient opacity-20"></div>
               )}
            </div>
          )
        };
        break;
    }
    return styles;
  };

  // --- Era Renderers ---

  const renderTribal = () => {
    const styles = getClimateStyles(true);
    
    return (
      <div className={`relative w-full h-full overflow-hidden ${styles.bg} transition-colors duration-1000`}>
        {/* Sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 to-black opacity-60"></div>
        <div className="absolute top-6 left-1/4 text-yellow-100 opacity-90 animate-pulse-slow"><Moon size={24} /></div>
        <div className="absolute top-10 right-10 text-white animate-twinkle"><Stars size={14} /></div>

        {/* Ground */}
        <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t ${styles.ground}`}></div>

        {/* Structure Layer */}
        <div className="absolute bottom-10 w-full flex justify-center items-end gap-4">
           {isMilitary ? (
              // Military Tribal: Shield walls, spears, organized camp
              <div className="flex items-end gap-1 transform scale-110">
                 <div className="relative group">
                    <Tent size={56} className="text-red-900 fill-red-950/50 stroke-[1.5]" />
                    <div className="absolute -top-4 -right-2 text-red-500 animate-pulse"><Target size={16} /></div>
                 </div>
                 <Tent size={40} className="text-stone-600 fill-stone-800" />
                 <div className="absolute bottom-0 -left-6 opacity-60"><Shield size={24} className="text-stone-400 rotate-12" /></div>
                 <div className="absolute bottom-0 -right-6 opacity-60"><Shield size={24} className="text-stone-400 -rotate-12" /></div>
              </div>
           ) : isEconomic ? (
              // Economic Tribal: Larger tents, goods piles
              <div className="flex items-end gap-2 transform scale-110">
                  <div className="relative">
                     <Tent size={64} className="text-amber-700 fill-amber-900/50 stroke-[1.5]" />
                     <div className="absolute bottom-1 right-1/2 translate-x-1/2 text-yellow-500"><Coins size={12} /></div>
                  </div>
                  <div className="flex flex-col gap-1 mb-1">
                      <div className="w-4 h-4 bg-amber-600 rounded-sm border border-amber-800"></div>
                      <div className="w-5 h-5 bg-amber-700 rounded-sm border border-amber-900"></div>
                  </div>
              </div>
           ) : (
              // Default Tribal
              <div className="flex items-end gap-2">
                 <Tent size={48} className={`${styles.accent} fill-black/20`} />
                 <div className="mb-2 animate-pulse text-orange-500"><Zap size={12} fill="orange" /></div> 
                 <Tent size={32} className={`${styles.accent} fill-black/20`} />
              </div>
           )}
        </div>
        
        {/* Bonfire effect (common to tribal) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>

        {styles.weather}
      </div>
    );
  };

  const renderAgricultural = () => {
    const styles = getClimateStyles(false);
    
    return (
      <div className={`relative w-full h-full overflow-hidden ${styles.bg} transition-colors duration-1000`}>
        {/* Background Landscape */}
        <div className="absolute bottom-1/3 w-full flex justify-center opacity-60">
             <div className={`w-full h-32 bg-gradient-to-t ${styles.ground} opacity-50 transform scale-y-150 origin-bottom rounded-[100%]`}></div>
        </div>

        {/* Ground */}
        <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t ${styles.ground}`}></div>

        {/* Field Crops */}
        <div className="absolute bottom-2 left-0 w-full flex justify-around text-yellow-700/60">
             {[...Array(8)].map((_, i) => (
                <Wheat key={i} size={24 + Math.random()*16} className="animate-sway" style={{animationDelay: `${i * 0.2}s`}} />
             ))}
        </div>

        {/* Structures */}
        <div className="absolute bottom-12 w-full flex justify-center items-end">
           {isMilitary ? (
              // Military: Stone Castle, Banners
              <div className="relative flex flex-col items-center">
                 <div className="absolute -top-6 flex gap-8 w-full justify-between px-4">
                    <div className="bg-red-700 w-3 h-4 animate-sway origin-top shadow-sm"></div>
                    <div className="bg-red-700 w-3 h-4 animate-sway origin-top shadow-sm" style={{animationDelay: '0.5s'}}></div>
                 </div>
                 <Castle size={96} className="text-stone-700 fill-stone-400" strokeWidth={1.5} />
                 <div className="absolute bottom-0 w-full flex justify-between px-2">
                    <Shield size={20} className="text-stone-600 fill-red-900" />
                    <Shield size={20} className="text-stone-600 fill-red-900" />
                 </div>
              </div>
           ) : isEconomic ? (
              // Economic: Market Town, Windmill/Shop, Golden glow
              <div className="relative flex items-end gap-2">
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500/30 animate-ping"><Sun size={40} /></div>
                 <Landmark size={80} className="text-amber-800 fill-amber-100" strokeWidth={1.5} />
                 <div className="flex flex-col items-center pb-1">
                    <div className="bg-red-500/80 w-8 h-4 rounded-t-lg mb-1"></div> {/* Stall roof */}
                    <div className="border-2 border-amber-900 bg-amber-200 w-8 h-6"></div>
                 </div>
                 <div className="absolute -right-8 bottom-4 animate-bounce-slow text-yellow-600">
                    <Coins size={20} />
                 </div>
              </div>
           ) : (
              // Default: Village
              <div className="flex items-end gap-1">
                  <Building2 size={48} className="text-amber-900 fill-amber-200" />
                  <Building2 size={32} className="text-amber-900 fill-amber-200" />
              </div>
           )}
        </div>

        {styles.weather}
      </div>
    );
  };

  const renderIndustrial = () => {
    // Industrial base color overrides
    const skyColor = climate === Climate.ARCTIC ? 'bg-slate-300' : climate === Climate.ARID ? 'bg-amber-200' : 'bg-gray-400';
    
    return (
      <div className={`relative w-full h-full overflow-hidden ${skyColor} transition-colors duration-1000`}>
        {/* Smog/Smoke Layers */}
        <div className={`absolute inset-0 ${isEconomic ? 'bg-yellow-700/10' : 'bg-gray-900/20'}`}></div>
        
        {/* Skyline Silhouette */}
        <div className="absolute bottom-1/4 w-full flex items-end justify-center opacity-40 gap-1">
           <div className="w-8 h-24 bg-black/30"></div>
           <div className="w-12 h-32 bg-black/40"></div>
           <div className="w-16 h-16 bg-black/30"></div>
           <div className="w-10 h-40 bg-black/50"></div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent"></div>

        {/* Structures */}
        <div className="absolute bottom-8 w-full flex justify-center items-end">
           {isMilitary ? (
              // Military: Bunkers, Fortresses, Steel
              <div className="relative">
                 <div className="absolute -top-12 left-0 w-full flex justify-center opacity-50">
                    <Skull size={64} className="text-gray-700" />
                 </div>
                 <Castle size={100} className="text-slate-800 fill-slate-600" strokeWidth={2} />
                 {/* Barbed wire suggestion */}
                 <div className="absolute bottom-2 -left-10 w-[180%] h-4 border-t-2 border-dashed border-gray-900 flex justify-between">
                    <div className="w-1 h-3 bg-gray-900 transform rotate-45"></div>
                    <div className="w-1 h-3 bg-gray-900 transform rotate-45"></div>
                    <div className="w-1 h-3 bg-gray-900 transform rotate-45"></div>
                 </div>
              </div>
           ) : isEconomic ? (
              // Economic: Grand Bank, Gold accents
              <div className="relative">
                 <Landmark size={110} className="text-slate-800 fill-gray-200" />
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 text-green-700 font-bold bg-green-100 px-2 rounded border border-green-600 text-[10px]">BANK</div>
                 <div className="absolute -top-8 -right-8 text-green-600 animate-pulse">
                    <TrendingUp size={32} />
                 </div>
                 <div className="absolute bottom-0 -left-12">
                    <div className="w-8 h-10 bg-yellow-600/20 border border-yellow-600 rounded flex items-center justify-center">
                       <Gem size={16} className="text-yellow-500" />
                    </div>
                 </div>
              </div>
           ) : (
              // Default: Factories
              <div className="relative">
                 <Factory size={96} className="text-gray-800 fill-gray-600" />
                 <div className="absolute -top-8 left-4 text-gray-600/80 animate-float-up"><Cloud size={24} fill="gray" /></div>
                 <div className="absolute -top-14 left-8 text-gray-500/60 animate-float-up" style={{animationDelay: '1s'}}><Cloud size={20} fill="gray" /></div>
              </div>
           )}
        </div>
        
        {/* Weather integration (Snow/Rain on top of smog) */}
        {climate !== Climate.ARID && getClimateStyles(true).weather}
      </div>
    );
  };

  const renderTechnological = () => {
    const styles = getClimateStyles(true);
    const themeColor = isMilitary ? 'text-red-500' : isEconomic ? 'text-amber-400' : 'text-cyan-400';
    const glowColor = isMilitary ? 'shadow-red-500/50' : isEconomic ? 'shadow-amber-500/50' : 'shadow-cyan-500/50';
    const bgGradient = isMilitary ? 'from-red-900/20' : isEconomic ? 'from-amber-900/20' : 'from-cyan-900/20';

    return (
      <div className="relative w-full h-full overflow-hidden bg-black transition-colors duration-1000">
        {/* Cyber Grid */}
        <div 
            className="absolute bottom-0 w-full h-1/2 opacity-40"
            style={{
                background: `linear-gradient(transparent 95%, ${isMilitary ? '#ef4444' : isEconomic ? '#f59e0b' : '#06b6d4'} 95%), linear-gradient(90deg, transparent 95%, ${isMilitary ? '#ef4444' : isEconomic ? '#f59e0b' : '#06b6d4'} 95%)`,
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg)',
                transformOrigin: 'bottom'
            }}
        ></div>

        {/* Sky Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} to-transparent opacity-50`}></div>

        {/* Floating Elements */}
        <div className={`absolute top-12 left-12 animate-bounce-slow ${themeColor}`}>
           {isMilitary ? <Target size={32} /> : isEconomic ? <Gem size={32} /> : <Zap size={32} />}
        </div>

        {/* Main City Structures */}
        <div className="absolute bottom-8 w-full flex justify-center items-end gap-4">
           {isMilitary ? (
              // Military: Red Shield Dome, Heavy outline
              <div className="relative flex items-end">
                 <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 border-2 border-red-500/30 rounded-full animate-pulse"></div>
                 <div className={`w-16 h-48 border-2 border-red-500 bg-red-950/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] relative overflow-hidden`}>
                    <div className="absolute inset-0 flex flex-col justify-evenly items-center">
                        <Swords size={24} className="text-red-500 mb-4" />
                        <div className="w-8 h-[2px] bg-red-500"></div>
                        <div className="w-8 h-[2px] bg-red-500"></div>
                        <div className="w-8 h-[2px] bg-red-500"></div>
                    </div>
                 </div>
                 <div className="w-12 h-32 bg-red-900/50 border border-red-600 transform -skew-x-6"></div>
              </div>
           ) : isEconomic ? (
              // Economic: Golden Towers, Data Streams
              <div className="relative flex items-end gap-2">
                 <div className="w-20 h-56 border border-amber-400 bg-amber-900/20 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col p-2 space-y-1">
                       <div className="text-[8px] text-amber-400 font-mono animate-scan">BTC 94K</div>
                       <div className="text-[8px] text-green-400 font-mono animate-scan" style={{animationDelay: '0.5s'}}>NVDA +4%</div>
                       <div className="text-[8px] text-amber-400 font-mono animate-scan" style={{animationDelay: '1s'}}>GOLD ^^^</div>
                    </div>
                 </div>
                 <div className="w-12 h-40 border border-yellow-500 bg-yellow-900/30 flex items-end justify-center pb-2">
                    <Crown size={20} className="text-yellow-400" />
                 </div>
              </div>
           ) : (
              // Default: Sci-Fi City
              <div className="flex items-end gap-2">
                 <div className="w-14 h-44 border border-cyan-500 bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
                 <div className="w-10 h-32 border border-cyan-600 bg-cyan-950/30"></div>
              </div>
           )}
        </div>

        {styles.weather}
      </div>
    );
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-900 rounded-2xl border-2 border-gray-700 shadow-2xl overflow-hidden relative transition-all duration-500 group">
       {era === Era.TRIBAL && renderTribal()}
       {era === Era.AGRICULTURAL && renderAgricultural()}
       {era === Era.INDUSTRIAL && renderIndustrial()}
       {era === Era.TECHNOLOGICAL && renderTechnological()}
       
       {/* Vignette */}
       <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none"></div>
       
       {/* Climate Badge */}
       <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/90 border border-white/10 flex items-center gap-2 shadow-lg z-10">
          {climate === Climate.ARCTIC && <Snowflake size={12} className="text-blue-200" />}
          {climate === Climate.TROPICAL && <CloudRain size={12} className="text-blue-400" />}
          {climate === Climate.ARID && <Wind size={12} className="text-orange-300" />}
          {climate === Climate.TEMPERATE && <Trees size={12} className="text-green-400" />}
          <span>{climate}</span>
       </div>

       {/* Style Badge (Optional, to reinforce feedback) */}
       {(isMilitary || isEconomic) && (
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/90 border flex items-center gap-2 shadow-lg z-10
             ${isMilitary ? 'bg-red-900/60 border-red-500/30' : 'bg-amber-900/60 border-amber-500/30'}
          `}>
             {isMilitary ? <Swords size={12} /> : <Coins size={12} />}
             <span>{isMilitary ? 'Askeri' : 'Ekonomik'}</span>
          </div>
       )}
    </div>
  );
};
