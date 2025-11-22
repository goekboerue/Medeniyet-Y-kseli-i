
import React, { useEffect, useState, useMemo } from 'react';
import { Era, BuildingStyle } from '../types';
import { Swords, Coins, Sparkles, Crown, Flag, Zap, Hammer, Rocket, Shield, Gem, Wheat, Mountain, Tent, Castle, Factory, Landmark, BrainCircuit } from 'lucide-react';

interface EraTransitionOverlayProps {
  newEra: Era;
  dominantStyle: BuildingStyle;
  onComplete: () => void;
}

export const EraTransitionOverlay: React.FC<EraTransitionOverlayProps> = ({ newEra, dominantStyle, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence the animation stages
    const t1 = setTimeout(() => setStage(1), 100); // Fade in background
    const t2 = setTimeout(() => setStage(2), 1000); // Show text
    const t3 = setTimeout(() => setStage(3), 4000); // Fade out
    const t4 = setTimeout(onComplete, 5000); // Remove from DOM

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Generate random particles
  const particles = useMemo(() => {
     return Array.from({ length: 40 }).map((_, i) => ({
         id: i,
         left: Math.random() * 100, // 0-100% width
         delay: Math.random() * 2,
         duration: 3 + Math.random() * 4,
         size: 16 + Math.random() * 24,
         initialRotation: Math.random() * 360,
     }));
  }, []);

  const getEraTitle = () => {
     if (dominantStyle === BuildingStyle.MILITARY) return `Şanlı ${newEra}`;
     if (dominantStyle === BuildingStyle.ECONOMIC) return `Zengin ${newEra}`;
     return `${newEra} Devri`;
  };

  const getQuote = () => {
    if (newEra === Era.TRIBAL) return "Ateşin etrafında toplananlar, yarını inşa edecek.";
    if (newEra === Era.AGRICULTURAL) return "Tohum toprağa düştü, medeniyet filizlendi.";
    if (newEra === Era.INDUSTRIAL) {
        if (dominantStyle === BuildingStyle.ECONOMIC) return "Buhar ve altın, dünyanın yeni efendileridir.";
        return "Çelik dişliler arasında yeni bir dünya doğuyor.";
    }
    if (newEra === Era.TECHNOLOGICAL) return "Yıldızlara uzanan yol, veri otoyollarından geçer.";
    
    // Fallbacks
    if (dominantStyle === BuildingStyle.MILITARY) return "Güç, sadece onu almaya cesaret edenlerindir.";
    if (dominantStyle === BuildingStyle.ECONOMIC) return "Altın dünyayı döndürür, çelik ise korur.";
    return "İlerleme kaçınılmazdır.";
  };

  const getIcon = () => {
      if (dominantStyle === BuildingStyle.MILITARY) return <Swords size={64} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />;
      if (dominantStyle === BuildingStyle.ECONOMIC) return <Coins size={64} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />;
      if (newEra === Era.TECHNOLOGICAL) return <Rocket size={64} className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />;
      return <Sparkles size={64} className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />;
  };

  const getBackgroundClass = () => {
      switch (newEra) {
          case Era.TRIBAL: return "bg-gradient-to-b from-orange-950 via-stone-900 to-black";
          case Era.AGRICULTURAL: return "bg-gradient-to-b from-emerald-900 via-green-950 to-black";
          case Era.INDUSTRIAL: return "bg-gradient-to-b from-slate-800 via-gray-900 to-black";
          case Era.TECHNOLOGICAL: return "bg-gradient-to-b from-indigo-950 via-slate-950 to-black";
          default: return "bg-black";
      }
  };

  const renderBackgroundVisuals = () => {
    // Base background pattern based on Era
    let BaseVisual = null;

    switch (newEra) {
      case Era.TRIBAL:
        BaseVisual = (
          <>
            <div className="absolute bottom-0 left-0 opacity-10 text-orange-500 transform -translate-x-1/4 translate-y-1/4">
              <Mountain size={400} />
            </div>
            <div className="absolute bottom-20 right-10 opacity-5 text-red-500 animate-pulse">
               <Tent size={200} />
            </div>
          </>
        );
        break;
      case Era.AGRICULTURAL:
        BaseVisual = (
          <div className="absolute bottom-0 w-full flex justify-around opacity-10 text-green-400">
             <Wheat size={200} className="transform -translate-y-10" />
             <Wheat size={160} className="transform translate-y-10" />
             <Wheat size={220} />
             <Castle size={300} className="opacity-20 transform translate-y-20" />
          </div>
        );
        break;
      case Era.INDUSTRIAL:
        BaseVisual = (
           <>
             <div className="absolute bottom-0 right-0 opacity-10 text-gray-400">
                <Factory size={400} />
             </div>
             <div className="absolute top-20 left-20 opacity-5 text-gray-500 animate-spin-slow">
                <Hammer size={150} />
             </div>
           </>
        );
        break;
      case Era.TECHNOLOGICAL:
        BaseVisual = (
           <div className="absolute inset-0 opacity-10 text-cyan-500 overflow-hidden">
              <BrainCircuit size={600} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12" />
              <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,#06b6d4_95%)] bg-[length:40px_40px] opacity-30"></div>
           </div>
        );
        break;
    }

    // Style Overlay
    let StyleOverlay = null;
    if (dominantStyle === BuildingStyle.MILITARY) {
        StyleOverlay = (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Swords size={800} className="text-red-500 rotate-45" />
            </div>
        );
    } else if (dominantStyle === BuildingStyle.ECONOMIC) {
        StyleOverlay = (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Landmark size={800} className="text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {BaseVisual}
            {StyleOverlay}
        </div>
    );
  };

  const renderParticles = () => {
      let Icon = Sparkles;
      let colorClass = "text-white";
      let animationName = "rise-up"; // Default rising
      
      // Config based on style/era
      if (dominantStyle === BuildingStyle.ECONOMIC) {
          Icon = Coins;
          colorClass = "text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]";
          animationName = "fall-down"; 
      } else if (dominantStyle === BuildingStyle.MILITARY) {
          Icon = Flag;
          colorClass = "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]";
          animationName = "rise-up";
      } else if (newEra === Era.AGRICULTURAL) {
          Icon = Wheat;
          colorClass = "text-green-400";
          animationName = "rise-up";
      } else if (newEra === Era.INDUSTRIAL) {
          Icon = Hammer;
          colorClass = "text-gray-400";
          animationName = "rise-up";
      } else if (newEra === Era.TECHNOLOGICAL) {
          Icon = Zap;
          colorClass = "text-cyan-400";
          animationName = "rise-up";
      }

      return particles.map(p => (
          <div 
            key={p.id}
            className={`absolute ${colorClass} opacity-0`}
            style={{
                left: `${p.left}%`,
                animation: `${animationName} ${p.duration}s linear forwards`,
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.initialRotation}deg)`
            }}
          >
              <Icon size={p.size} />
          </div>
      ));
  };

  if (stage === 3 && !onComplete) return null; 

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 overflow-hidden ${getBackgroundClass()} ${stage >= 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <style>{`
        @keyframes fall-down {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes rise-up {
          0% { transform: translateY(110vh) scale(0.5) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(-10vh) scale(1.2) rotate(45deg); opacity: 0; }
        }
      `}</style>
      
      {stage >= 1 && renderBackgroundVisuals()}
      {stage >= 1 && renderParticles()}
      
      <div className={`relative z-10 flex flex-col items-center text-center p-8 transition-all duration-1000 transform ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mb-6 p-6 bg-black/30 rounded-full border border-white/10 backdrop-blur-sm animate-bounce-slow">
           {getIcon()}
        </div>
        
        <h2 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
           {getEraTitle()}
        </h2>
        
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mb-6"></div>
        
        <p className="text-xl md:text-2xl text-gray-300 font-light italic max-w-2xl leading-relaxed drop-shadow-md">
           "{getQuote()}"
        </p>
      </div>
    </div>
  );
};
