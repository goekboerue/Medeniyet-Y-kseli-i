
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, ResourceType, Era, LogEntry, Resources, Crisis, BuildingStyle, Technology, Climate } from './types';
import { INITIAL_RESOURCES, BUILDING_DEFINITIONS, ERA_REQUIREMENTS, CRISIS_EVENTS, TICK_RATE_MS, TECHNOLOGIES } from './constants';
import { ResourcePanel } from './components/ResourcePanel';
import { BuildingCard } from './components/BuildingCard';
import { LogPanel } from './components/LogPanel';
import { CrisisAlert } from './components/CrisisAlert';
import { CivilizationVisual } from './components/CivilizationVisual';
import { EraTransitionOverlay } from './components/EraTransitionOverlay';
import { TechTree } from './components/TechTree';
import { SnapshotModal } from './components/SnapshotModal';
import { generateChronicle, generateEraTransition, generateCrisisLog, generateEmpireSnapshot } from './services/geminiService';
import { Pickaxe, Globe, Flag, ChevronRight, BrainCircuit, Camera, CloudSun, Users, ArrowRight, Lock, Palette, LayoutDashboard, FlaskConical, Hammer } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [resources, setResources] = useState<Resources>(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState(BUILDING_DEFINITIONS.map(b => ({ ...b, count: 0, assignedWorkers: 0 })));
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [era, setEra] = useState<Era>(Era.TRIBAL);
  const [climate, setClimate] = useState<Climate>(Climate.TEMPERATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [activeCrisis, setActiveCrisis] = useState<Crisis | null>(null);
  const [showEraTransition, setShowEraTransition] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'production' | 'research'>('production');
  
  // Snapshot State
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);

  // Initialization Logic
  useEffect(() => {
    const climates = Object.values(Climate);
    const randomClimate = climates[Math.floor(Math.random() * climates.length)];
    setClimate(randomClimate);

    setLogs([
      { 
        id: 'init', 
        timestamp: 'Başlangıç', 
        text: `Kabileniz, ${randomClimate} iklimin hakim olduğu vahşi topraklarda küçük bir ateş yaktı. Hayatta kalma mücadelesi başlıyor.`, 
        type: 'game' 
      }
    ]);
  }, []);

  // --- Derived Stats ---
  const calculateUsedWorkers = useCallback(() => {
    return buildings.reduce((total, b) => total + b.assignedWorkers, 0);
  }, [buildings]);

  const availableWorkers = Math.floor(resources.population) - calculateUsedWorkers();

  const calculateIncome = useCallback(() => {
    return buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;

      return total + (b.production.gold || 0) * effectiveBuildings;
    }, 0);
  }, [buildings]);
  
  const calculateScienceIncome = useCallback(() => {
    return buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;
      return total + (b.production.science || 0) * effectiveBuildings;
    }, 0);
  }, [buildings]);

  const calculatePopulationGrowth = useCallback(() => {
    const baseGrowth = 0.01 * (resources.population > 0 ? 1 : 0);
    const buildingGrowth = buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;
      return total + (b.production.population || 0) * effectiveBuildings;
    }, 0);
    return buildingGrowth + baseGrowth;
  }, [buildings, resources.population]);


  // Determine Civ Style (Military vs Economic)
  const dominantStyle = useMemo(() => {
    let mil = 0;
    let eco = 0;
    buildings.forEach(b => {
      if (b.style === BuildingStyle.MILITARY) mil += b.count;
      if (b.style === BuildingStyle.ECONOMIC) eco += b.count;
    });
    if (mil === 0 && eco === 0) return BuildingStyle.NONE;
    return mil >= eco ? BuildingStyle.MILITARY : BuildingStyle.ECONOMIC;
  }, [buildings]);

  // Determine Next Era & Progress
  const nextEraInfo = useMemo(() => {
    if (era === Era.TRIBAL) return { id: Era.AGRICULTURAL, req: ERA_REQUIREMENTS[Era.AGRICULTURAL] };
    if (era === Era.AGRICULTURAL) return { id: Era.INDUSTRIAL, req: ERA_REQUIREMENTS[Era.INDUSTRIAL] };
    if (era === Era.INDUSTRIAL) return { id: Era.TECHNOLOGICAL, req: ERA_REQUIREMENTS[Era.TECHNOLOGICAL] };
    return null;
  }, [era]);

  const getEmpireSummary = () => {
      return `🏛️ MEDENİYET DURUM RAPORU\n📅 Çağ: ${era}\n🌍 İklim: ${climate}\n👥 Nüfus: ${Math.floor(resources.population)}\n💰 Hazine: ${Math.floor(resources.gold)} Altın\n🏗️ En Büyük Yapı: ${buildings.sort((a,b) => b.count - a.count)[0]?.name || 'Yok'}\n\nBenim imparatorluğum yükseliyor! Seninkinin durumu ne? #MedeniyetYükselişi`;
  };

  const addLog = (text: string, type: 'game' | 'ai' | 'crisis' | 'warning' | 'tech' = 'game') => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text,
        type
      }
    ]);
  };

  // --- Actions ---

  const handleManualGather = () => {
    const chance = Math.random();
    setResources(prev => ({
      ...prev,
      gold: prev.gold + 1,
      maxLand: (prev.land >= prev.maxLand && chance > 0.98) ? prev.maxLand + 1 : prev.maxLand,
      land: (prev.land < prev.maxLand && chance > 0.8) ? prev.land + 1 : prev.land,
      science: (chance > 0.6) ? prev.science + 1 : prev.science
    }));
  };

  const handleExpandLand = () => {
    const expansionAmount = 5;
    const cost = Math.floor(resources.maxLand * 2.5); 

    if (resources.gold >= cost) {
      setResources(prev => ({
        ...prev,
        gold: prev.gold - cost,
        maxLand: prev.maxLand + expansionAmount
      }));
      addLog(`Yeni topraklar satın alındı! (+${expansionAmount} Kapasite)`, 'game');
    } else {
      addLog("Toprak genişletmek için yeterli altının yok.", "warning");
    }
  };

  const handleBuyBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentGoldCost = Math.floor(building.baseCost.gold * Math.pow(1.15, building.count));
    const currentLandCost = building.baseCost.land;

    if (resources.gold >= currentGoldCost && (resources.maxLand - resources.land) >= currentLandCost) {
      setResources(prev => ({
        ...prev,
        gold: prev.gold - currentGoldCost,
        land: prev.land + currentLandCost,
      }));

      setBuildings(prev => prev.map(b => {
        if (b.id === buildingId) {
          let newAssigned = b.assignedWorkers;
          const workersNeeded = b.baseCost.workers;
          
          if (workersNeeded > 0) {
             const currentlyAvailable = Math.floor(resources.population) - prev.reduce((sum, item) => sum + item.assignedWorkers, 0);
             const toAssign = Math.min(currentlyAvailable, workersNeeded);
             if (toAssign > 0) {
               newAssigned += toAssign;
             }
          }

          return { ...b, count: b.count + 1, assignedWorkers: newAssigned };
        }
        return b;
      }));

      addLog(`${building.name} inşa edildi.`);
    }
  };

  const handleWorkerAssignment = (buildingId: string, change: number) => {
    setBuildings(prev => {
      const building = prev.find(b => b.id === buildingId);
      if (!building) return prev;
      const maxWorkers = building.count * building.baseCost.workers;
      
      if (change > 0) {
        const currentlyAvailable = Math.floor(resources.population) - prev.reduce((sum, item) => sum + item.assignedWorkers, 0);
        if (currentlyAvailable < change) {
           addLog("Yeterli boşta işçi yok!", "warning");
           return prev;
        }
        if (building.assignedWorkers + change > maxWorkers) return prev;
      } else {
        if (building.assignedWorkers + change < 0) return prev;
      }

      return prev.map(b => {
        if (b.id === buildingId) {
          return { ...b, assignedWorkers: b.assignedWorkers + change };
        }
        return b;
      });
    });
  };

  const handleResearch = (techId: string) => {
    const tech = TECHNOLOGIES.find(t => t.id === techId);
    if (!tech) return;

    if (resources.science >= tech.cost) {
      setResources(prev => {
        const newResources = { ...prev, science: prev.science - tech.cost };
        if (tech.bonus?.maxLand) newResources.maxLand += tech.bonus.maxLand;
        return newResources;
      });

      setUnlockedTechs(prev => [...prev, techId]);
      let logMsg = `${tech.name} teknolojisi keşfedildi!`;
      if (tech.bonus?.maxLand) logMsg += ` (+${tech.bonus.maxLand} Toprak)`;
      addLog(logMsg, 'tech');
    }
  };

  const handleResolveCrisis = (resolutionType: 'solve' | 'ignore') => {
    if (!activeCrisis) return;

    if (resolutionType === 'solve') {
      if (resources.gold >= (activeCrisis.cost.gold || 0) && 
          resources.population >= (activeCrisis.cost.population || 0) &&
          resources.science >= (activeCrisis.cost.science || 0)) {
        
        setResources(prev => ({
          ...prev,
          gold: prev.gold - (activeCrisis.cost.gold || 0),
          population: prev.population - (activeCrisis.cost.population || 0),
          science: prev.science - (activeCrisis.cost.science || 0),
        }));
        addLog(`${activeCrisis.name} krizini başarıyla yönettiniz.`, 'game');
        generateCrisisLog(activeCrisis, true).then(text => addLog(text, 'ai'));
      } else {
         addLog("Krizi çözmek için yeterli kaynağınız yok!", "warning");
         return;
      }
    } else {
      setResources(prev => ({
        ...prev,
        gold: Math.max(0, prev.gold - (activeCrisis.penalty.gold || 0)),
        population: Math.max(0, prev.population - (activeCrisis.penalty.population || 0)),
        land: Math.max(0, prev.land - (activeCrisis.penalty.land || 0)),
        science: Math.max(0, prev.science - (activeCrisis.penalty.science || 0)),
      }));
      addLog(`${activeCrisis.name} krizi halkı perişan etti.`, 'crisis');
      generateCrisisLog(activeCrisis, false).then(text => addLog(text, 'ai'));
    }
    setActiveCrisis(null);
  };

  const handleGenerateHistory = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    const story = await generateChronicle({
      resources, era, buildings, technologies: unlockedTechs, gameTime, climate
    });
    addLog(story, 'ai');
    setIsGeneratingAI(false);
  };

  const handleTakeSnapshot = async () => {
    if (isGeneratingSnapshot) return;
    setIsSnapshotModalOpen(true);
    setSnapshotImage(null);
    setIsGeneratingSnapshot(true);

    try {
      const base64 = await generateEmpireSnapshot({
         resources, era, buildings, technologies: unlockedTechs, gameTime, climate
      }, dominantStyle);
      setSnapshotImage(base64);
    } catch (e) {
      console.error(e);
      setSnapshotImage(null);
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  // --- Game Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (showEraTransition) return;

      setBuildings(prevBuildings => {
        const currentPop = Math.floor(resources.population);
        let totalAssigned = prevBuildings.reduce((sum, b) => sum + b.assignedWorkers, 0);
        
        if (totalAssigned > currentPop) {
          let deficit = totalAssigned - currentPop;
          const reversed = [...prevBuildings].reverse();
          const updatedReversed = reversed.map(b => {
            if (deficit <= 0) return b;
            if (b.assignedWorkers > 0) {
              const reduceAmount = Math.min(b.assignedWorkers, deficit);
              deficit -= reduceAmount;
              return { ...b, assignedWorkers: b.assignedWorkers - reduceAmount };
            }
            return b;
          });
          return updatedReversed.reverse();
        }
        return prevBuildings;
      });

      setResources(prev => {
        let income = 0;
        let scienceIncome = 0;
        let popGrowth = 0.01;

        buildings.forEach(b => {
           const effectiveBuildings = b.baseCost.workers > 0 
            ? b.assignedWorkers / b.baseCost.workers
            : b.count;
           
           income += (b.production.gold || 0) * effectiveBuildings;
           scienceIncome += (b.production.science || 0) * effectiveBuildings;
           popGrowth += (b.production.population || 0) * effectiveBuildings;
        });

        return {
          ...prev,
          gold: prev.gold + income,
          population: prev.population + popGrowth,
          science: prev.science + scienceIncome
        };
      });

      setBuildings(prevBuildings => {
        const newBuildings = prevBuildings.map(b => {
          if (b.count > 0 && b.depletionChance) {
            const workingRatio = b.baseCost.workers > 0 ? (b.assignedWorkers / (b.count * b.baseCost.workers)) : 1;
            if (workingRatio > 0 && Math.random() < (b.depletionChance * workingRatio)) {
              addLog(`${b.name} kaynakları tükendi ve yıkıldı!`, 'warning');
              const newCount = b.count - 1;
              const maxWorkersNew = newCount * b.baseCost.workers;
              const newAssigned = Math.min(b.assignedWorkers, maxWorkersNew);
              return { ...b, count: newCount, assignedWorkers: newAssigned };
            }
          }
          return b;
        });
        return newBuildings;
      });

      if (nextEraInfo) {
        const req = nextEraInfo.req;
        if (resources.gold >= req.gold && resources.population >= req.pop) {
             setEra(nextEraInfo.id);
             setShowEraTransition(true);
             
             let landBonus = 0;
             if (nextEraInfo.id === Era.AGRICULTURAL) landBonus = 50;
             else if (nextEraInfo.id === Era.INDUSTRIAL) landBonus = 150;
             else if (nextEraInfo.id === Era.TECHNOLOGICAL) landBonus = 500;

             if (landBonus > 0) {
                setResources(prev => ({ ...prev, maxLand: prev.maxLand + landBonus }));
                setTimeout(() => addLog(`Yeni çağ ile sınırlar genişledi! (+${landBonus} Toprak)`, 'game'), 2000);
             }

             generateEraTransition(nextEraInfo.id).then(text => addLog(text, 'ai'));
        }
      }

      if (!activeCrisis && Math.random() < 0.005 && era !== Era.TRIBAL) {
          const possibleCrises = CRISIS_EVENTS.filter(c => c.era === era);
          if (possibleCrises.length > 0) {
              const crisis = possibleCrises[Math.floor(Math.random() * possibleCrises.length)];
              setActiveCrisis(crisis);
          }
      }

      setGameTime(t => t + 1);

    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [resources.population, buildings, era, activeCrisis, showEraTransition, resources.gold, nextEraInfo]);


  // --- Render Helpers ---

  const renderHeader = () => (
     <header className="flex justify-between items-center py-3 border-b border-gray-800 px-1">
        <div className="flex items-center gap-4">
           <h1 className="text-xl font-cinzel font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent hidden md:block">
              MEDENİYET YÜKSELİŞİ
           </h1>
           <div className="flex items-center gap-3 text-xs text-gray-400">
               <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                 <Flag size={12} className="text-amber-500"/> {era}
               </div>
               <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                 <Pickaxe size={12} className="text-gray-400"/> Yıl {1000 + Math.floor(gameTime / 5)}
               </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           {nextEraInfo && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700">
                 <span className="text-[10px] uppercase text-gray-500 font-bold">Hedef:</span>
                 <div className="flex gap-2">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                       <div className="h-full bg-yellow-600 transition-all" style={{ width: `${Math.min(100, (resources.gold / nextEraInfo.req.gold) * 100)}%` }} />
                    </div>
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, (resources.population / nextEraInfo.req.pop) * 100)}%` }} />
                    </div>
                 </div>
              </div>
           )}
           <button 
             onClick={handleTakeSnapshot}
             className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-purple-400 border border-gray-700 transition-colors"
             title="Şehri Resmet"
           >
              <Palette size={16} />
           </button>
        </div>
     </header>
  );

  return (
    <div className="h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden flex flex-col">
      {showEraTransition && (
        <EraTransitionOverlay 
          newEra={era} 
          dominantStyle={dominantStyle}
          onComplete={() => setShowEraTransition(false)} 
        />
      )}

      <SnapshotModal 
        isOpen={isSnapshotModalOpen} 
        onClose={() => setIsSnapshotModalOpen(false)} 
        imageData={snapshotImage}
        textSummary={getEmpireSummary()}
        isLoading={isGeneratingSnapshot}
      />
      
      {/* Sticky Resource Panel */}
      <ResourcePanel 
        resources={resources} 
        income={calculateIncome()} 
        scienceIncome={calculateScienceIncome()}
        populationGrowth={calculatePopulationGrowth()}
        availableWorkers={availableWorkers}
        onManualGather={handleManualGather}
        onExpandLand={handleExpandLand}
      />

      <div className="flex-1 container mx-auto max-w-7xl px-2 lg:px-4 pb-2 overflow-hidden flex flex-col">
        
        {renderHeader()}

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden min-h-0">
           
           {/* Left Column: Visuals & Info (Fixed non-scrollable container generally, content scrolls if needed) */}
           <div className="lg:col-span-5 flex flex-col gap-4 min-h-0 overflow-y-auto no-scrollbar pb-20 lg:pb-0">
              
              <div className="shrink-0">
                <CivilizationVisual era={era} dominantStyle={dominantStyle} climate={climate} />
              </div>

              {activeCrisis && (
                <div className="shrink-0">
                   <CrisisAlert 
                      crisis={activeCrisis} 
                      resources={resources} 
                      onResolve={() => handleResolveCrisis('solve')}
                      onIgnore={() => handleResolveCrisis('ignore')}
                   />
                </div>
              )}

              <div className="flex-1 min-h-[250px] bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                 <LogPanel 
                    logs={logs} 
                    onGenerateHistory={handleGenerateHistory} 
                    isGenerating={isGeneratingAI}
                 />
              </div>
           </div>

           {/* Right Column: Main Action Area (Tabbed) */}
           <div className="lg:col-span-7 flex flex-col bg-gray-900/80 rounded-xl border border-gray-800 overflow-hidden shadow-2xl min-h-0">
              
              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                 <button 
                    onClick={() => setActiveTab('production')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 font-cinzel font-bold transition-colors
                       ${activeTab === 'production' ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                    `}
                 >
                    <Hammer size={18} />
                    Üretim
                 </button>
                 <button 
                    onClick={() => setActiveTab('research')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 font-cinzel font-bold transition-colors
                       ${activeTab === 'research' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                    `}
                 >
                    <FlaskConical size={18} />
                    Araştırma
                 </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-black/20">
                  {activeTab === 'production' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20 lg:pb-0">
                         {buildings.filter(b => b.era === era || b.count > 0).map(building => (
                            <BuildingCard
                              key={building.id}
                              building={building}
                              resources={resources}
                              availableWorkers={availableWorkers}
                              onBuy={handleBuyBuilding}
                              onWorkerChange={handleWorkerAssignment}
                              unlockedTechs={unlockedTechs}
                              allTechs={TECHNOLOGIES}
                            />
                          ))}
                          {buildings.filter(b => b.era === era || b.count > 0).length === 0 && (
                             <div className="col-span-full text-center py-10 text-gray-500 italic">
                                Bu çağda inşa edilecek yeni bir yapı yok.
                             </div>
                          )}
                      </div>
                  ) : (
                      <div className="pb-20 lg:pb-0">
                          <TechTree 
                            technologies={TECHNOLOGIES} 
                            unlockedTechIds={unlockedTechs} 
                            resources={resources}
                            currentEra={era}
                            onResearch={handleResearch}
                          />
                      </div>
                  )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default App;
