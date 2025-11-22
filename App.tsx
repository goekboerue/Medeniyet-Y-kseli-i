
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
import { Pickaxe, Globe, Flag, ChevronRight, BrainCircuit, Camera, CloudSun, Users, ArrowRight, Lock, Palette } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [resources, setResources] = useState<Resources>(INITIAL_RESOURCES);
  // Initialize buildings with 0 assigned workers
  const [buildings, setBuildings] = useState(BUILDING_DEFINITIONS.map(b => ({ ...b, count: 0, assignedWorkers: 0 })));
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [era, setEra] = useState<Era>(Era.TRIBAL);
  const [climate, setClimate] = useState<Climate>(Climate.TEMPERATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [activeCrisis, setActiveCrisis] = useState<Crisis | null>(null);
  const [showEraTransition, setShowEraTransition] = useState(false);
  
  // Snapshot State
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);

  // Initialization Logic
  useEffect(() => {
    // Pick a random climate on startup
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

  // Generate Empire Text Summary
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
      gold: prev.gold + 1, // Basic click income
      // Tiny chance to expand maxLand if capped, representing exploration
      maxLand: (prev.land >= prev.maxLand && chance > 0.98) ? prev.maxLand + 1 : prev.maxLand,
      land: (prev.land < prev.maxLand && chance > 0.8) ? prev.land + 1 : prev.land, // Small chance to find usable land
      science: (chance > 0.6) ? prev.science + 1 : prev.science // 40% chance for science
    }));
  };

  const handleExpandLand = () => {
    const expansionAmount = 5;
    // Cost scales with current maxLand to simulate difficulty of expanding further
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
          // Auto-assign workers if available and building needs them
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
      
      // Check constraints
      if (change > 0) {
        // Adding workers
        const currentlyAvailable = Math.floor(resources.population) - prev.reduce((sum, item) => sum + item.assignedWorkers, 0);
        if (currentlyAvailable < change) {
           addLog("Yeterli boşta işçi yok!", "warning");
           return prev;
        }
        if (building.assignedWorkers + change > maxWorkers) {
           return prev; // Cannot exceed max capacity
        }
      } else {
        // Removing workers
        if (building.assignedWorkers + change < 0) {
          return prev;
        }
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
      // Deduct cost
      setResources(prev => {
        const newResources = { ...prev, science: prev.science - tech.cost };
        
        // Apply Bonuses
        if (tech.bonus) {
            if (tech.bonus.maxLand) {
                newResources.maxLand += tech.bonus.maxLand;
            }
            // Add other bonuses here if needed
        }
        return newResources;
      });

      setUnlockedTechs(prev => [...prev, techId]);
      
      let logMsg = `${tech.name} teknolojisi keşfedildi!`;
      if (tech.bonus?.maxLand) logMsg += ` (+${tech.bonus.maxLand} Toprak Kapasitesi)`;
      
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
      // Ignore penalty
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
      resources,
      era,
      buildings,
      technologies: unlockedTechs,
      gameTime,
      climate
    });
    addLog(story, 'ai');
    setIsGeneratingAI(false);
  };

  const handleTakeSnapshot = async () => {
    if (isGeneratingSnapshot) return;
    setIsSnapshotModalOpen(true);
    setSnapshotImage(null); // clear previous
    setIsGeneratingSnapshot(true);

    try {
      const base64 = await generateEmpireSnapshot({
         resources, era, buildings, technologies: unlockedTechs, gameTime, climate
      }, dominantStyle);
      setSnapshotImage(base64);
    } catch (e) {
      console.error(e);
      setSnapshotImage(null); // ensure null on error
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  // --- Game Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (showEraTransition) return;

      // 0. Safety Check: Population Drop Management
      setBuildings(prevBuildings => {
        const currentPop = Math.floor(resources.population);
        let totalAssigned = prevBuildings.reduce((sum, b) => sum + b.assignedWorkers, 0);
        
        if (totalAssigned > currentPop) {
          let deficit = totalAssigned - currentPop;
          // Remove workers starting from the last building type to maintain some stability
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

      // 1. Resource Generation
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

      // 2. Building Depletion
      setBuildings(prevBuildings => {
        const newBuildings = prevBuildings.map(b => {
          if (b.count > 0 && b.depletionChance) {
            // Only working buildings deplete
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

      // 3. Era Progression
      if (nextEraInfo) {
        const req = nextEraInfo.req;
        if (resources.gold >= req.gold && resources.population >= req.pop) {
             setEra(nextEraInfo.id);
             setShowEraTransition(true);
             
             // Apply Era Bonus: Land Expansion
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

      // 4. Random Crisis
      if (!activeCrisis && Math.random() < 0.005 && era !== Era.TRIBAL) { // Low chance per tick
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


  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-purple-500/30 pb-8 md:pb-0">
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

      <div className="container mx-auto p-4 md:p-6 lg:max-w-7xl">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6 pt-2 md:pt-0">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
              MEDENİYET YÜKSELİŞİ
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
               <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                 <Globe size={14} className="text-blue-400"/> {climate} İklimi
               </div>
               <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                 <Flag size={14} className="text-amber-500"/> {era}
               </div>
               <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
                 <Pickaxe size={14} className="text-gray-400"/> Yıl {1000 + Math.floor(gameTime / 5)}
               </div>
            </div>

            {/* Next Era Progress Bar */}
            {nextEraInfo && (
              <div className="mt-2 bg-gray-900/80 rounded-lg p-2 border border-gray-700 max-w-md">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-400 flex items-center gap-1 uppercase tracking-wider font-bold">
                    <Lock size={10} /> Sonraki Çağ Hedefi: <span className="text-purple-300">{nextEraInfo.id}</span>
                  </span>
                  <span className="text-[10px] text-gray-500">Gereksinimler</span>
                </div>
                <div className="flex gap-3 items-center">
                   {/* Gold Progress */}
                   <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-yellow-500/80 mb-0.5">
                        <span>Altın</span>
                        <span>{Math.floor(resources.gold)} / {nextEraInfo.req.gold}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-600 transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (resources.gold / nextEraInfo.req.gold) * 100)}%` }}
                        />
                      </div>
                   </div>
                   {/* Pop Progress */}
                   <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-blue-400/80 mb-0.5">
                        <span>Nüfus</span>
                        <span>{Math.floor(resources.population)} / {nextEraInfo.req.pop}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (resources.population / nextEraInfo.req.pop) * 100)}%` }}
                        />
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end">
             <button 
               onClick={handleTakeSnapshot}
               className="bg-gradient-to-r from-purple-900 to-blue-900 hover:from-purple-800 hover:to-blue-800 border border-purple-500/50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg group"
             >
                <Palette size={18} className="text-purple-300 group-hover:text-white transition-colors" />
                <span className="hidden md:inline font-cinzel text-sm">Şehri Resmet</span>
             </button>
             <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2 min-w-[120px] justify-center">
                <div className={`w-2 h-2 rounded-full ${activeCrisis ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-xs font-mono uppercase">{activeCrisis ? 'KRİZ DURUMU' : 'STABİL'}</span>
             </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Game Area */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Resources */}
             <ResourcePanel 
                resources={resources} 
                income={calculateIncome()} 
                scienceIncome={calculateScienceIncome()}
                populationGrowth={calculatePopulationGrowth()}
                availableWorkers={availableWorkers}
                onManualGather={handleManualGather}
                onExpandLand={handleExpandLand}
             />

             {/* Visuals */}
             <div className="mb-8">
                <CivilizationVisual era={era} dominantStyle={dominantStyle} climate={climate} />
             </div>

             {/* Crisis Alert */}
             {activeCrisis && (
               <CrisisAlert 
                  crisis={activeCrisis} 
                  resources={resources} 
                  onResolve={() => handleResolveCrisis('solve')}
                  onIgnore={() => handleResolveCrisis('ignore')}
               />
             )}

            {/* Buildings */}
            <div className="space-y-6">
              <h2 className="text-xl font-cinzel font-bold text-amber-500 flex items-center gap-2 border-b border-gray-800 pb-2">
                 <Users size={20} /> Yapılar ve İşgücü
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

          </div>

          {/* Right Column: Tech & Logs */}
          <div className="lg:col-span-4 space-y-8">
             <TechTree 
                technologies={TECHNOLOGIES} 
                unlockedTechIds={unlockedTechs} 
                resources={resources}
                currentEra={era}
                onResearch={handleResearch}
             />
             
             <LogPanel 
                logs={logs} 
                onGenerateHistory={handleGenerateHistory} 
                isGenerating={isGeneratingAI}
             />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
