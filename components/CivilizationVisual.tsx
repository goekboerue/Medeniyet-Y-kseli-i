
import React from 'react';
import { Era, BuildingStyle, Climate } from '../types';
import { 
  Castle, Tent, Factory, Landmark, Shield, Coins, Wheat, Cloud, Sun, Moon, Stars, 
  Snowflake, Palmtree, ThermometerSun, Trees, Gem, TrendingUp, 
  CloudRain, Wind, Skull, Crown, Swords, Target, Zap, Building2, Mountain, 
  Waves, Cog, Binary, Signal, TentTree, Sparkles, Flag
} from 'lucide-react';

interface CivilizationVisualProps {
  era: Era;
  dominantStyle: BuildingStyle;
  climate: Climate;
}

export const CivilizationVisual: React.FC<CivilizationVisualProps> = ({ era, dominantStyle, climate }) => {
  
  const isEconomic = dominantStyle === BuildingStyle.ECONOMIC;
  const isMilitary = dominantStyle === BuildingStyle.MILITARY;

  // --- Style Overlay Effects ---
  const renderStyleEffects = () => {
    if (isMilitary) {
      return (
        <div className="absolute inset-0 pointer-events-none z-20">
           {/* Pulsing Red Overlay - Low Opacity */}
           <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 via-transparent to-transparent animate-pulse-slow"></div>
           
           {/* Floating Embers */}
           <div className="absolute bottom-0 left-[30%] w-1 h-1 bg-red-500 rounded-full animate-float-up opacity-0 blur-[1px]" style={{animationDuration: '3s', animationDelay: '0s'}}></div>
           <div className="absolute bottom-0 right-[30%] w-1.5 h-1.5 bg-red-600 rounded-full animate-float-up opacity-0 blur-[1px]" style={{animationDuration: '4s', animationDelay: '1.5s'}}></div>
           
           {/* Distant Banners for Non-Tribal */}
           {era !== Era.TRIBAL && (
             <>
               <div className="absolute bottom-[20%] left-[15%] text-red-800/40 animate-sway origin-bottom transform scale-75 opacity-60"><Flag size={16} fill="currentColor" /></div>
               <div className="absolute bottom-[20%] right-[15%] text-red-800/40 animate-sway origin-bottom transform scale-75 opacity-60" style={{animationDelay: '2s'}}><Flag size={16} fill="currentColor" /></div>
             </>
           )}
        </div>
      );
    }
    if (isEconomic) {
      return (
        <div className="absolute inset-0 pointer-events-none z-20">
           {/* Shimmering Gold Overlay - Low Opacity */}
           <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent animate-pulse-slow"></div>
           
           {/* Sparkles */}
           <div className="absolute top-[40%] left-[20%] text-yellow-300/40 animate-twinkle"><Sparkles size={12} /></div>
           <div className="absolute top-[30%] right-[25%] text-amber-200/40 animate-twinkle" style={{animationDelay: '1.5s'}}><Sparkles size={8} /></div>
           
           {/* Rising Gold Dust */}
           <div className="absolute bottom-0 left-[40%] w-0.5 h-0.5 bg-yellow-400 rounded-full animate-float-up opacity-0" style={{animationDuration: '5s'}}></div>
           <div className="absolute bottom-0 right-[40%] w-0.5 h-0.5 bg-yellow-400 rounded-full animate-float-up opacity-0" style={{animationDuration: '7s', animationDelay: '2.5s'}}></div>
        </div>
      );
    }
    return null;
  };

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
          bg: isNight ? 'bg-slate-950' : 'bg-slate-200',
          ground: isNight ? 'from-slate-800 to-slate-900' : 'from-slate-100 to-white',
          accent: isNight ? 'text-blue-200' : 'text-slate-400',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              <div className="absolute top-[-20%] left-[10%] animate-snow opacity-60 text-white" style={{animationDuration: '5s'}}>
                 <Snowflake size={10} />
              </div>
              <div className="absolute top-[-20%] left-[50%] animate-snow opacity-80 text-white" style={{animationDuration: '7s', animationDelay: '1s'}}>
                 <Snowflake size={14} />
              </div>
              <div className="absolute top-[-20%] left-[85%] animate-snow opacity-70 text-white" style={{animationDuration: '8s', animationDelay: '0.5s'}}>
                 <Snowflake size={12} />
              </div>
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            </div>
          )
        };
        break;

      case Climate.ARID:
        styles = {
          bg: isNight ? 'bg-stone-950' : 'bg-orange-100',
          ground: isNight ? 'from-stone-800 to-stone-900' : 'from-orange-200 to-amber-100',
          accent: 'text-orange-600',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              <div className={`absolute inset-0 ${isNight ? 'bg-orange-900/10' : 'bg-orange-500/10'} mix-blend-multiply`}></div>
              {!isNight && (
                <>
                  <div className="absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-scan" style={{animationDuration: '8s', transform: 'rotate(90deg)', opacity: 0.3}}></div>
                  <div className="absolute top-4 right-4 text-orange-500/40 animate-pulse-slow"><Sun size={60} /></div>
                  <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-orange-400 rounded-full blur-[1px] animate-float-up opacity-50"></div>
                </>
              )}
            </div>
          )
        };
        break;

      case Climate.TROPICAL:
        styles = {
          bg: isNight ? 'bg-teal-950' : 'bg-cyan-900',
          ground: isNight ? 'from-emerald-950 to-teal-950' : 'from-emerald-600 to-teal-800',
          accent: 'text-emerald-300',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-[1px] h-8 bg-blue-200/30 animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random()}s`
                  }}
                ></div>
              ))}
              {!isNight && <div className="absolute top-4 left-1/3 opacity-30 text-white animate-float-up"><CloudRain size={48} /></div>}
            </div>
          )
        };
        break;

      case Climate.TEMPERATE:
      default:
        styles = {
          bg: isNight ? 'bg-indigo-950' : 'bg-sky-300',
          ground: isNight ? 'from-stone-900 to-black' : 'from-green-500 to-emerald-400',
          accent: 'text-green-800',
          weather: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
               {!isNight ? (
                 <>
                    <div className="absolute top-8 left-[10%] text-white/70 animate-float-up" style={{animationDuration: '25s'}}><Cloud size={64} fill="white" /></div>
                    <div className="absolute top-16 left-[70%] text-white/50 animate-float-up" style={{animationDuration: '35s', animationDelay: '5s'}}><Cloud size={40} fill="white" /></div>
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
      <div className={`relative w-full h-full overflow-hidden ${styles.bg} transition-colors duration-1000 group`}>
        {/* Background Elements */}
        <div className="absolute bottom-1/3 left-0 w-full flex items-end opacity-20 text-gray-900">
             <Mountain size={180} strokeWidth={1} className="transform -translate-x-10 translate-y-10" />
             <Mountain size={240} strokeWidth={1} className="transform translate-x-0 translate-y-5" />
             <Mountain size={150} strokeWidth={1} className="transform translate-x-10 translate-y-10" />
        </div>
        
        {/* Sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 to-black/80 opacity-80"></div>
        <div className="absolute top-6 left-1/4 text-yellow-100 opacity-90 animate-pulse-slow"><Moon size={24} /></div>
        <div className="absolute top-10 right-10 text-white animate-twinkle"><Stars size={14} /></div>
        <div className="absolute top-20 left-10 text-white/50 animate-twinkle" style={{animationDelay: '1s'}}><Stars size={10} /></div>

        {/* Ground */}
        <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t ${styles.ground} clip-path-hill`}></div>

        {/* Structure Layer */}
        <div className="absolute bottom-6 w-full flex justify-center items-end gap-2 z-10">
           {/* Campfire Glow */}
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500/30 blur-xl rounded-full animate-pulse"></div>

           {isMilitary ? (
              <div className="flex items-end gap-[-5px] transform scale-105">
                 <div className="relative z-10">
                    <Tent size={52} className="text-red-900 fill-red-950/80 stroke-[1.5]" />
                    <div className="absolute -top-6 -right-2 text-red-500 animate-pulse"><Target size={16} /></div>
                 </div>
                 <div className="transform -translate-x-2 translate-y-1 opacity-80">
                    <Tent size={36} className="text-stone-700 fill-stone-900" />
                 </div>
                 <div className="absolute bottom-0 -left-6 opacity-60"><Shield size={24} className="text-stone-500 rotate-12" /></div>
              </div>
           ) : isEconomic ? (
              <div className="flex items-end gap-1 transform scale-105">
                  <div className="relative z-10">
                     <TentTree size={58} className="text-amber-700 fill-amber-900/60 stroke-[1.5]" />
                     <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-yellow-500/80"><Coins size={10} /></div>
                  </div>
                  <div className="flex flex-col gap-0.5 mb-1 opacity-70">
                      <div className="w-5 h-5 bg-amber-800 rounded-sm border border-amber-950 transform rotate-3"></div>
                      <div className="w-6 h-6 bg-amber-800 rounded-sm border border-amber-950 transform -rotate-2"></div>
                  </div>
              </div>
           ) : (
              <div className="flex items-end gap-[-10px]">
                 <Tent size={44} className={`${styles.accent} fill-black/40`} />
                 <div className="mb-1 animate-pulse text-orange-500 relative z-20"><Zap size={14} fill="orange" /></div> 
                 <Tent size={32} className={`${styles.accent} fill-black/40`} />
              </div>
           )}
        </div>
        
        {styles.weather}
        {renderStyleEffects()}
      </div>
    );
  };

  const renderAgricultural = () => {
    const styles = getClimateStyles(false);
    
    return (
      <div className={`relative w-full h-full overflow-hidden ${styles.bg} transition-colors duration-1000 group`}>
        {/* Rolling Hills Background */}
        <div className="absolute bottom-0 w-[120%] -left-[10%] h-1/2 bg-gradient-to-t from-green-800 to-green-600 rounded-[100%] transform scale-y-50 translate-y-10 opacity-80"></div>
        <div className="absolute bottom-0 w-[120%] -right-[10%] h-1/2 bg-gradient-to-t from-emerald-800 to-emerald-500 rounded-[100%] transform scale-y-75 translate-y-16 opacity-60"></div>

        {/* River (if water/temperate) */}
        {climate !== Climate.ARID && (
             <div className="absolute bottom-0 right-0 w-full h-24 bg-blue-400/30 transform skew-x-12 translate-y-12 blur-sm"></div>
        )}

        {/* Field Crops */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between px-8 text-yellow-700/50 z-0">
             {[...Array(12)].map((_, i) => (
                <Wheat key={i} size={16 + Math.random()*12} className="animate-sway origin-bottom" style={{animationDelay: `${i * 0.2}s`, animationDuration: '3s'}} />
             ))}
        </div>

        {/* Structures */}
        <div className="absolute bottom-6 w-full flex justify-center items-end z-10 drop-shadow-lg">
           {isMilitary ? (
              <div className="relative flex flex-col items-center">
                 <div className="absolute -top-6 flex gap-12 w-full justify-between px-2">
                    <div className="bg-red-700 w-2 h-3 animate-sway origin-top"></div>
                    <div className="bg-red-700 w-2 h-3 animate-sway origin-top" style={{animationDelay: '0.5s'}}></div>
                 </div>
                 <Castle size={90} className="text-stone-700 fill-stone-300" strokeWidth={1.5} />
                 <div className="absolute bottom-0 w-full flex justify-between px-1">
                    <div className="bg-stone-600 h-8 w-2 rounded-t"></div>
                    <div className="bg-stone-600 h-8 w-2 rounded-t"></div>
                 </div>
              </div>
           ) : isEconomic ? (
              <div className="relative flex items-end gap-1">
                 <div className="absolute -top-6 left-2 animate-spin-slow origin-center opacity-80">
                     <Wind size={40} className="text-amber-800" />
                 </div>
                 <Landmark size={76} className="text-amber-900 fill-amber-100" strokeWidth={1.5} />
                 <div className="flex flex-col items-center pb-0">
                    <div className="bg-red-500 w-10 h-4 rounded-t-full mb-0.5 shadow-sm"></div> {/* Stall roof */}
                    <div className="border border-amber-900 bg-amber-200 w-10 h-6 flex justify-center">
                        <div className="w-2 h-4 bg-amber-900/20 mt-2"></div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex items-end gap-2">
                  <Building2 size={48} className="text-amber-900 fill-amber-200" />
                  <div className="bg-stone-400 w-20 h-1 absolute bottom-0 -z-10 rounded"></div> {/* Road */}
                  <Building2 size={32} className="text-amber-900 fill-amber-200" />
              </div>
           )}
        </div>

        {styles.weather}
        {renderStyleEffects()}
      </div>
    );
  };

  const renderIndustrial = () => {
    // Industrial base color overrides
    const skyColor = climate === Climate.ARCTIC ? 'bg-slate-300' : climate === Climate.ARID ? 'bg-amber-200' : 'bg-stone-400';
    
    return (
      <div className={`relative w-full h-full overflow-hidden ${skyColor} transition-colors duration-1000`}>
        {/* Smog/Smoke Layers */}
        <div className={`absolute inset-0 ${isEconomic ? 'bg-amber-900/10' : 'bg-gray-900/30'}`}></div>
        <div className="absolute top-10 left-0 w-full h-20 bg-gradient-to-b from-gray-800/20 to-transparent blur-xl"></div>
        
        {/* Skyline Silhouette */}
        <div className="absolute bottom-10 w-full flex items-end justify-center opacity-30 gap-0.5 text-gray-800">
           <div className="w-6 h-16 bg-current"></div>
           <div className="w-8 h-24 bg-current"></div>
           <div className="w-12 h-12 bg-current"></div>
           <div className="w-10 h-32 bg-current"></div>
           <div className="w-14 h-20 bg-current"></div>
           <div className="w-6 h-10 bg-current"></div>
        </div>

        {/* Moving Gear Decoration */}
        <div className="absolute top-4 right-4 text-gray-600/20 animate-spin-slow">
            <Cog size={80} />
        </div>
        <div className="absolute top-12 right-16 text-gray-600/20 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
            <Cog size={50} />
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-8 bg-[#2a2a2a]"></div>
        <div className="absolute bottom-6 w-full h-2 bg-[#3a3a3a]"></div>

        {/* Structures */}
        <div className="absolute bottom-6 w-full flex justify-center items-end z-10">
           {isMilitary ? (
              <div className="relative">
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-60">
                    <Shield size={40} className="text-gray-600" />
                 </div>
                 <Castle size={96} className="text-slate-800 fill-slate-500" strokeWidth={2} />
                 {/* Chimneys */}
                 <div className="absolute top-4 -right-4 w-3 h-12 bg-slate-700">
                    <div className="absolute -top-4 -left-2 text-gray-500/50 animate-float-up"><Cloud size={16} fill="gray"/></div>
                 </div>
              </div>
           ) : isEconomic ? (
              <div className="relative">
                 <Landmark size={100} className="text-slate-800 fill-gray-300" />
                 <div className="absolute top-6 left-1/2 -translate-x-1/2 text-green-800 font-bold bg-green-100/80 px-2 py-0.5 rounded border border-green-600 text-[8px] shadow-sm">STOCK EXCH</div>
                 <div className="absolute -top-6 -right-6 text-green-700 animate-pulse">
                    <TrendingUp size={28} />
                 </div>
              </div>
           ) : (
              <div className="relative">
                 <Factory size={88} className="text-gray-800 fill-gray-600" />
                 <div className="absolute -top-8 left-4 text-gray-700/60 animate-float-up"><Cloud size={20} fill="black" /></div>
                 <div className="absolute -top-12 left-10 text-gray-700/40 animate-float-up" style={{animationDelay: '1.2s'}}><Cloud size={16} fill="black" /></div>
              </div>
           )}
        </div>
        
        {climate !== Climate.ARID && getClimateStyles(true).weather}
        {renderStyleEffects()}
      </div>
    );
  };

  const renderTechnological = () => {
    const themeColor = isMilitary ? 'text-red-500' : isEconomic ? 'text-amber-400' : 'text-cyan-400';
    const gridColor = isMilitary ? '#7f1d1d' : isEconomic ? '#78350f' : '#0e7490';
    
    return (
      <div className="relative w-full h-full overflow-hidden bg-black transition-colors duration-1000">
        {/* Retro Wave Grid Floor */}
        <div 
            className="absolute bottom-0 w-full h-[60%] opacity-50"
            style={{
                background: `
                    linear-gradient(transparent 95%, ${gridColor} 95%),
                    linear-gradient(90deg, transparent 95%, ${gridColor} 95%)
                `,
                backgroundSize: '40px 40px',
                transform: 'perspective(300px) rotateX(60deg) scale(1.5)',
                transformOrigin: 'bottom center',
                boxShadow: `0 -20px 20px ${gridColor}`
            }}
        ></div>

        {/* Horizon Glow */}
        <div className={`absolute bottom-[40%] left-0 w-full h-32 bg-gradient-to-t from-${isMilitary ? 'red' : isEconomic ? 'amber' : 'cyan'}-900/50 to-transparent blur-xl`}></div>

        {/* Floating Data Streams */}
        <div className={`absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none`}>
            <div className="absolute top-10 left-[20%] animate-scan" style={{animationDuration: '3s'}}><Binary size={12} className={themeColor}/></div>
            <div className="absolute top-20 left-[80%] animate-scan" style={{animationDuration: '4s'}}><Signal size={12} className={themeColor}/></div>
        </div>

        {/* City Structures */}
        <div className="absolute bottom-12 w-full flex justify-center items-end gap-6 z-10">
           {isMilitary ? (
              <div className="relative flex items-end">
                 {/* Force Field */}
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 border border-red-500/30 rounded-full animate-pulse bg-red-900/10"></div>
                 
                 <div className={`w-14 h-40 border border-red-500 bg-black/80 shadow-[0_0_15px_rgba(239,68,68,0.5)] relative overflow-hidden flex flex-col items-center justify-end pb-2`}>
                    <div className="w-1 h-full bg-red-900/50 absolute left-2"></div>
                    <div className="w-1 h-full bg-red-900/50 absolute right-2"></div>
                    <Swords size={20} className="text-red-500 mb-2" />
                 </div>
                 <div className="w-10 h-24 bg-red-950/80 border border-red-700 transform skew-y-12 translate-x-1"></div>
              </div>
           ) : isEconomic ? (
              <div className="relative flex items-end gap-1">
                 {/* Holographic Ads */}
                 <div className="absolute -top-16 left-0 text-[8px] text-amber-300 font-mono bg-black/50 border border-amber-500/50 px-1 py-0.5 rounded animate-float-up">BUY</div>
                 <div className="absolute -top-10 right-0 text-[8px] text-green-300 font-mono bg-black/50 border border-green-500/50 px-1 py-0.5 rounded animate-float-up" style={{animationDelay: '1s'}}>SELL</div>

                 <div className="w-16 h-48 border border-amber-400 bg-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.4)] relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 flex flex-col p-1 space-y-2 opacity-50">
                       <div className="h-0.5 w-full bg-amber-500/50"></div>
                       <div className="h-0.5 w-full bg-amber-500/50"></div>
                       <div className="h-0.5 w-full bg-amber-500/50"></div>
                       <div className="h-0.5 w-full bg-amber-500/50"></div>
                    </div>
                 </div>
                 <div className="w-12 h-32 border border-yellow-600 bg-black/60 flex items-end justify-center pb-2">
                    <Crown size={18} className="text-yellow-400" />
                 </div>
              </div>
           ) : (
              <div className="flex items-end gap-2">
                 <div className="w-12 h-36 border border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>
                 <div className="w-8 h-24 border border-cyan-600 bg-cyan-950/30"></div>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2"><Zap size={24} className="text-cyan-300 animate-pulse"/></div>
              </div>
           )}
        </div>
        
        {renderStyleEffects()}
      </div>
    );
  };

  return (
    <div className="w-full h-40 md:h-52 bg-gray-900 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden relative transition-all duration-500 group">
       {era === Era.TRIBAL && renderTribal()}
       {era === Era.AGRICULTURAL && renderAgricultural()}
       {era === Era.INDUSTRIAL && renderIndustrial()}
       {era === Era.TECHNOLOGICAL && renderTechnological()}
       
       {/* Vignette */}
       <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none z-30"></div>
       
       {/* Climate Badge */}
       <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[9px] uppercase tracking-widest text-white/90 border border-white/10 flex items-center gap-1.5 shadow-lg z-40">
          {climate === Climate.ARCTIC && <Snowflake size={10} className="text-blue-200" />}
          {climate === Climate.TROPICAL && <CloudRain size={10} className="text-blue-400" />}
          {climate === Climate.ARID && <Wind size={10} className="text-orange-300" />}
          {climate === Climate.TEMPERATE && <Trees size={10} className="text-green-400" />}
          <span>{climate}</span>
       </div>
    </div>
  );
};
