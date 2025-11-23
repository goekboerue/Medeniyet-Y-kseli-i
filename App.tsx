
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, ResourceType, Era, LogEntry, Resources, Crisis, BuildingStyle, Technology, Climate, Rival, RelationStatus } from './types';
import { INITIAL_RESOURCES, BUILDING_DEFINITIONS, ERA_REQUIREMENTS, CRISIS_EVENTS, TICK_RATE_MS, TECHNOLOGIES, RIVAL_TEMPLATES } from './constants';
import { ResourcePanel } from './components/ResourcePanel';
import { BuildingCard } from './components/BuildingCard';
import { LogPanel } from './components/LogPanel';
import { CrisisAlert } from './components/CrisisAlert';
import { CivilizationVisual } from './components/CivilizationVisual';
import { EraTransitionOverlay } from './components/EraTransitionOverlay';
import { TechTree } from './components/TechTree';
import { SnapshotModal } from './components/SnapshotModal';
import { DiplomacyPanel } from './components/DiplomacyPanel';
import { ImperialProjects } from './components/ImperialProjects';
import { generateChronicle, generateEraTransition, generateCrisisLog, generateEmpireSnapshot } from './services/geminiService';
import { Pickaxe, Globe, Flag, ChevronRight, BrainCircuit, Camera, CloudSun, Users, ArrowRight, Lock, Palette, LayoutDashboard, FlaskConical, Hammer, Save, Handshake } from 'lucide-react';

const SAVE_KEY = 'civilization_rise_save_v5'; // Version bumped

const App: React.FC = () => {
  // --- State ---
  const [resources, setResources] = useState<Resources>(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState(BUILDING_DEFINITIONS.map(b => ({ ...b, count: 0, assignedWorkers: 0 })));
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [futureTechLevel, setFutureTechLevel] = useState<number>(0);
  const [era, setEra] = useState<Era>(Era.TRIBAL);
  const [climate, setClimate] = useState<Climate>(Climate.TEMPERATE);
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [activeCrisis, setActiveCrisis] = useState<Crisis | null>(null);
  const [showEraTransition, setShowEraTransition] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Game modifiers
  const [goldenAgeEndTime, setGoldenAgeEndTime] = useState<number>(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'production' | 'research' | 'diplomacy'>('production');
  
  // Snapshot State
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);

  // --- Helper to init rivals ---
  const generateRandomRivals = () => {
      const shuffled = [...RIVAL_TEMPLATES].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3).map((template, idx) => ({
          id: `rival-${idx}`,
          name: template.name || `Kabile ${idx}`,
          strength: 10 + Math.random() * 20,
          wealth: 50 + Math.random() * 100,
          relation: RelationStatus.NEUTRAL,
          attitude: template.attitude || 'DEFENSIVE',
          era: Era.TRIBAL,
          lastInteractionTurn: 0,
          cooldownEnd: 0
      } as Rival));
  };

  // --- Load Game Logic ---
  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.resources) setResources({ ...INITIAL_RESOURCES, ...parsed.resources });
        if (parsed.unlockedTechs) setUnlockedTechs(parsed.unlockedTechs);
        if (parsed.futureTechLevel) setFutureTechLevel(parsed.futureTechLevel);
        if (parsed.era) setEra(parsed.era);
        if (parsed.climate) setClimate(parsed.climate);
        if (parsed.gameTime) setGameTime(parsed.gameTime);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.rivals && parsed.rivals.length > 0) setRivals(parsed.rivals);
        else setRivals(generateRandomRivals());
        
        // Merge saved buildings with definitions to ensure structure matches
        if (parsed.buildings) {
          setBuildings(prev => prev.map(def => {
            const savedB = parsed.buildings.find((p: any) => p.id === def.id);
            return savedB ? { ...def, count: savedB.count, assignedWorkers: savedB.assignedWorkers } : def;
          }));
        }
      } catch (e) {
        console.error("Save file corrupted, starting fresh.", e);
        setRivals(generateRandomRivals());
      }
    } else {
       // Initialize random climate for new game
       const climates = Object.values(Climate);
       const randomClimate = climates[Math.floor(Math.random() * climates.length)];
       setClimate(randomClimate);
       setRivals(generateRandomRivals());
       
       setLogs([
        { 
          id: 'init', 
          timestamp: 'Başlangıç', 
          text: `Kabileniz, ${randomClimate} iklimin hakim olduğu vahşi topraklarda küçük bir ateş yaktı.`, 
          type: 'game' 
        }
      ]);
    }
    setIsLoaded(true);
  }, []);

  // --- Save Game Logic ---
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveTimer = setTimeout(() => {
      const stateToSave = {
        resources,
        buildings: buildings.map(b => ({ id: b.id, count: b.count, assignedWorkers: b.assignedWorkers })),
        unlockedTechs,
        futureTechLevel,
        era,
        climate,
        gameTime,
        rivals,
        logs: logs.slice(-50) // Only save last 50 logs to keep storage light
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    }, 2000); // Debounce save every 2 seconds

    return () => clearTimeout(saveTimer);
  }, [resources, buildings, unlockedTechs, futureTechLevel, era, climate, gameTime, logs, isLoaded, rivals]);


  // --- Helper: Scaling Logic ---
  const getEfficiencyMultiplier = useCallback((count: number) => {
     if (count <= 1) return 1;
     return Math.pow(1.05, count); 
  }, []);

  // --- Derived Stats ---
  const calculateUsedWorkers = useCallback(() => {
    return buildings.reduce((total, b) => total + b.assignedWorkers, 0);
  }, [buildings]);

  const availableWorkers = Math.floor(resources.population) - calculateUsedWorkers();

  const isGoldenAgeActive = gameTime < goldenAgeEndTime;
  const globalProductionMultiplier = isGoldenAgeActive ? 2.0 : 1.0;

  const calculateMilitaryStrength = useCallback(() => {
      // PENALTY: If soldiers are 0, military strength is drastically reduced regardless of tech/buildings
      // This forces the player to maintain an active army.
      if (resources.soldiers <= 0) {
        // Base defense of 5 just to prevent division by zero or negative logic issues elsewhere, 
        // but it's effectively defenseless.
        return 5; 
      }

      let strength = resources.soldiers * 2; // Base soldier power
      
      // Add building bonuses
      buildings.forEach(b => {
          if (b.production.military && b.count > 0) {
              const effectiveBuildings = b.baseCost.workers > 0 ? (b.assignedWorkers / b.baseCost.workers) : b.count;
              strength += b.production.military * effectiveBuildings;
          }
      });

      // Add tech bonuses
      TECHNOLOGIES.forEach(t => {
          if (unlockedTechs.includes(t.id) && t.bonus?.military) {
              strength += t.bonus.military;
          }
      });

      // Infinite Tech Bonus: +5% per level
      if (futureTechLevel > 0) {
        strength = strength * (1 + (futureTechLevel * 0.05));
      }

      return strength * globalProductionMultiplier;
  }, [resources.soldiers, buildings, unlockedTechs, futureTechLevel, globalProductionMultiplier]);

  const calculateIncome = useCallback(() => {
    return buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;
      
      const multiplier = getEfficiencyMultiplier(b.count);
      return total + (b.production.gold || 0) * effectiveBuildings * multiplier;
    }, 0) * globalProductionMultiplier;
  }, [buildings, getEfficiencyMultiplier, globalProductionMultiplier]);
  
  const calculateScienceIncome = useCallback(() => {
    return buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;
        
      const multiplier = getEfficiencyMultiplier(b.count);
      return total + (b.production.science || 0) * effectiveBuildings * multiplier;
    }, 0) * globalProductionMultiplier;
  }, [buildings, getEfficiencyMultiplier, globalProductionMultiplier]);

  const calculatePopulationGrowth = useCallback(() => {
    const baseGrowth = 0.01 * (resources.population > 0 ? 1 : 0);
    const buildingGrowth = buildings.reduce((total, b) => {
      const effectiveBuildings = b.baseCost.workers > 0 
        ? b.assignedWorkers / b.baseCost.workers
        : b.count;
      
      const multiplier = Math.pow(1.02, b.count); 
      return total + (b.production.population || 0) * effectiveBuildings * multiplier;
    }, 0);
    return (buildingGrowth + baseGrowth) * globalProductionMultiplier;
  }, [buildings, resources.population, globalProductionMultiplier]);


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

  const nextEraInfo = useMemo(() => {
    if (era === Era.TRIBAL) return { id: Era.AGRICULTURAL, req: ERA_REQUIREMENTS[Era.AGRICULTURAL] };
    if (era === Era.AGRICULTURAL) return { id: Era.INDUSTRIAL, req: ERA_REQUIREMENTS[Era.INDUSTRIAL] };
    if (era === Era.INDUSTRIAL) return { id: Era.TECHNOLOGICAL, req: ERA_REQUIREMENTS[Era.TECHNOLOGICAL] };
    return null;
  }, [era]);

  const getEmpireSummary = () => {
      return `🏛️ MEDENİYET DURUM RAPORU\n📅 Çağ: ${era}\n🌍 İklim: ${climate}\n👥 Nüfus: ${Math.floor(resources.population)}\n⚔️ Ordu Gücü: ${Math.floor(calculateMilitaryStrength())}\n🧪 Gelecek Teknolojisi Seviyesi: ${futureTechLevel}\n\nBenim imparatorluğum yükseliyor! #MedeniyetYükselişi`;
  };

  const addLog = (text: string, type: 'game' | 'ai' | 'crisis' | 'warning' | 'tech' | 'war' = 'game') => {
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

  // --- Imperial Projects Actions ---

  const handleGoldenAge = () => {
    const cost = Math.max(1000, Math.floor(resources.gold * 0.8));
    if (resources.gold >= cost) {
       setResources(prev => ({ ...prev, gold: prev.gold - cost }));
       setGoldenAgeEndTime(gameTime + 60); // 60 seconds (ticks)
       addLog(`ALTIN ÇAĞ BAŞLADI! 60 saniye boyunca üretim 2 katına çıktı!`, 'game');
    }
  };

  const handleFestival = () => {
    const cost = Math.max(200, Math.floor(resources.gold * 0.3));
    if (resources.gold >= cost) {
       setResources(prev => ({ 
           ...prev, 
           gold: prev.gold - cost,
           population: prev.population + 10
       }));
       addLog(`Büyük Şölen düzenlendi. Halk mutlu (+10 Nüfus).`, 'game');
    }
  };

  const handleScienceGrant = () => {
    const cost = 5000;
    if (resources.gold >= cost) {
        setResources(prev => ({ ...prev, gold: prev.gold - cost, science: prev.science + 1000 }));
        addLog(`Bilim Fuarı düzenlendi. Bilim insanları ödüllendirildi (+1000 Bilim).`, 'tech');
    }
  };

  const handleLandReclamation = () => {
     const cost = Math.floor(resources.maxLand * 10);
     if (resources.gold >= cost) {
         setResources(prev => ({ ...prev, gold: prev.gold - cost, maxLand: prev.maxLand + 10 }));
         addLog(`Bataklıklar kurutuldu ve yeni araziler açıldı (+10 Toprak).`, 'game');
     }
  };


  // --- Diplomacy / War Actions ---

  const handleRecruitSoldier = (amount: number) => {
      const GOLD_COST = 50;
      const POP_COST = 1;
      
      if (resources.gold >= GOLD_COST * amount && resources.population >= POP_COST * amount) {
          setResources(prev => ({
              ...prev,
              gold: prev.gold - (GOLD_COST * amount),
              population: prev.population - (POP_COST * amount),
              soldiers: (prev.soldiers || 0) + amount
          }));
          addLog(`${amount} yeni asker orduya katıldı.`, 'game');
      } else {
          addLog("Asker yetiştirmek için yeterli kaynağın yok.", "warning");
      }
  };

  const handleAttackRival = (rivalId: string) => {
      const rival = rivals.find(r => r.id === rivalId);
      if (!rival) return;

      // Check cooldown (Farming Limit)
      if (rival.cooldownEnd && rival.cooldownEnd > gameTime) {
          addLog(`${rival.name} şu an sığınaklara çekildi. Saldıramıyoruz.`, 'warning');
          return;
      }

      const myStrength = calculateMilitaryStrength();
      const rivalStrength = rival.strength;
      
      // Determine outcome
      const advantage = myStrength / Math.max(1, rivalStrength);
      const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
      const score = advantage * randomFactor;

      // Cooldown to prevent spamming weak rivals
      const cooldownDuration = 30; // 30 seconds

      if (score > 1.1) {
          // Victory
          const lootGold = Math.floor(rival.wealth * 0.3);
          const lootLand = 10; // WINNING GRANTS LAND
          
          setResources(prev => ({
              ...prev,
              gold: prev.gold + lootGold,
              maxLand: prev.maxLand + lootLand,
              soldiers: Math.max(0, Math.floor((prev.soldiers || 0) * 0.95)) // 5% casualties
          }));
          
          setRivals(prev => prev.map(r => r.id === rivalId ? { 
              ...r, 
              strength: r.strength * 0.7, 
              wealth: r.wealth * 0.7,
              relation: RelationStatus.WAR,
              cooldownEnd: gameTime + cooldownDuration // Set cooldown
          } : r));
          
          addLog(`ZAFER! ${rival.name} bozguna uğratıldı ve geri çekildi. ${lootGold} altın ve ${lootLand} TOPRAK ele geçirildi!`, 'war');
      } else {
          // Defeat
          const lostSoldiersRatio = 0.3; // 30% casualties
          
          setResources(prev => ({
              ...prev,
              soldiers: Math.max(0, Math.floor((prev.soldiers || 0) * (1 - lostSoldiersRatio))) 
          }));
          setRivals(prev => prev.map(r => r.id === rivalId ? { 
              ...r, 
              relation: RelationStatus.WAR 
          } : r));
          addLog(`YENİLGİ! ${rival.name} savunmasını aşamadık. Ağır kayıplar verdik.`, 'war');
      }
  };

  const handleTradeRival = (rivalId: string) => {
      const cost = 100;
      if (resources.gold < cost) return;

      const rival = rivals.find(r => r.id === rivalId);
      if (!rival) return;

      // Reward: Either science or land info
      const isScience = Math.random() > 0.5;
      const rewardAmount = isScience ? 20 : 2;
      
      setResources(prev => ({
          ...prev,
          gold: prev.gold - cost,
          science: isScience ? prev.science + rewardAmount : prev.science,
          maxLand: !isScience ? prev.maxLand + rewardAmount : prev.maxLand
      }));
      
      setRivals(prev => prev.map(r => r.id === rivalId ? { 
        ...r, 
        wealth: r.wealth + 50,
        relation: r.relation === RelationStatus.WAR ? RelationStatus.HOSTILE : RelationStatus.NEUTRAL
      } : r));

      addLog(`${rival.name} ile ticaret yapıldı. ${isScience ? 'Bilgi' : 'Harita'} alındı.`, 'game');
  };

  const handleImproveRelations = (rivalId: string) => {
      const cost = 200;
      if (resources.gold < cost) return;

      setResources(prev => ({ ...prev, gold: prev.gold - cost }));
      setRivals(prev => prev.map(r => {
          if (r.id === rivalId) {
              let newRel = r.relation;
              if (r.relation === RelationStatus.WAR) newRel = RelationStatus.HOSTILE;
              else if (r.relation === RelationStatus.HOSTILE) newRel = RelationStatus.NEUTRAL;
              else if (r.relation === RelationStatus.NEUTRAL) newRel = RelationStatus.FRIENDLY;
              return { ...r, relation: newRel, wealth: r.wealth + 100 };
          }
          return r;
      }));
      addLog(`Hediye gönderildi. İlişkiler yumuşuyor.`, 'game');
  };

  // --- Other Actions ---

  const handleManualGather = () => {
    const chance = Math.random();
    setResources(prev => ({
      ...prev,
      gold: prev.gold + (1 + (prev.gold * 0.01)) * globalProductionMultiplier,
      maxLand: (prev.land >= prev.maxLand && chance > 0.98) ? prev.maxLand + 1 : prev.maxLand,
      land: (prev.land < prev.maxLand && chance > 0.8) ? prev.land + 1 : prev.land,
      science: (chance > 0.6) ? prev.science + (1 + (prev.science * 0.005)) * globalProductionMultiplier : prev.science
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
             if (toAssign > 0) newAssigned += toAssign;
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
        if (b.id === buildingId) return { ...b, assignedWorkers: b.assignedWorkers + change };
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
        if (tech.bonus?.military) addLog(`Ordu teknolojisi gelişti! (+${tech.bonus.military} Güç)`, 'tech');
        return newResources;
      });
      setUnlockedTechs(prev => [...prev, techId]);
      addLog(`${tech.name} keşfedildi!`, 'tech');
    }
  };

  const handleFutureResearch = () => {
     const cost = Math.floor(10000 * Math.pow(1.5, futureTechLevel));
     if (resources.science >= cost) {
         setResources(prev => ({
             ...prev,
             science: prev.science - cost,
             maxLand: prev.maxLand + 20, // Critical bottleneck fix
         }));
         setFutureTechLevel(prev => prev + 1);
         addLog(`Geleceğin Teknolojisi Seviye ${futureTechLevel + 1} keşfedildi! Ordu ve Toprak kapasitesi arttı.`, 'tech');
     } else {
         addLog("Yetersiz bilim puanı.", "warning");
     }
  };

  const handleResolveCrisis = (resolutionType: 'solve' | 'ignore') => {
    if (!activeCrisis) return;

    if (resolutionType === 'solve') {
      if (resources.gold >= (activeCrisis.cost.gold || 0) && 
          resources.population >= (activeCrisis.cost.population || 0) &&
          resources.science >= (activeCrisis.cost.science || 0) &&
          resources.soldiers >= (activeCrisis.cost.soldiers || 0)) {
        
        setResources(prev => ({
          ...prev,
          gold: prev.gold - (activeCrisis.cost.gold || 0),
          population: prev.population - (activeCrisis.cost.population || 0),
          science: prev.science - (activeCrisis.cost.science || 0),
          soldiers: prev.soldiers - (activeCrisis.cost.soldiers || 0),
        }));
        addLog(`${activeCrisis.name} krizini başarıyla yönettiniz.`, 'game');
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
    }
    setActiveCrisis(null);
  };

  const handleGenerateHistory = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    const story = await generateChronicle({
      resources, era, buildings, technologies: unlockedTechs, gameTime, climate, rivals, futureTechLevel
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
         resources, era, buildings, technologies: unlockedTechs, gameTime, climate, rivals, futureTechLevel
      }, dominantStyle);
      if (base64) setSnapshotImage(base64);
      else addLog("Ressamlar görüntü oluşturamadı (Yoğunluk).", "warning");
    } catch (e) {
      console.error(e);
      setSnapshotImage(null);
      addLog("Görüntü servisi şu an kullanılamıyor.", "warning");
    } finally {
      setIsGeneratingSnapshot(false);
    }
  };

  // --- Game Loop ---
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      if (showEraTransition || activeCrisis) return; // Pause during crisis popup
      const currentStrength = calculateMilitaryStrength();

      // --- Rival Logic ---
      setRivals(prev => prev.map(rival => {
          // Rivals grow naturally
          let growth = 0.5 + (Math.random());
          if (rival.attitude === 'AGGRESSIVE') growth *= 1.2;
          
          // Random Event: Rival Raid
          const isThreat = rival.strength > currentStrength;
          // Predatory AI: If player is very weak (< 50% of rival), they attack much more often
          const isPredatory = currentStrength < rival.strength * 0.5;
          const raidChance = isPredatory ? 0.02 : 0.005; 
          
          const isEnemy = rival.relation === RelationStatus.WAR || (rival.attitude === 'AGGRESSIVE' && rival.relation !== RelationStatus.FRIENDLY);
          
          if (isThreat && isEnemy && Math.random() < raidChance) {
             // Raid triggers!
             const stolenGold = Math.floor(resources.gold * 0.1);
             const lostSoldiers = Math.floor((resources.soldiers || 0) * 0.1);
             const landDamage = 2; // Raid destroys land capacity!

             setResources(r => ({ 
                 ...r, 
                 gold: Math.max(0, r.gold - stolenGold),
                 soldiers: Math.max(0, (r.soldiers || 0) - lostSoldiers),
                 maxLand: Math.max(r.land, r.maxLand - landDamage) 
             }));
             
             const raidMsg = isPredatory 
                ? `FIRSATÇI SALDIRI! ${rival.name} savunmasızlığımızı görüp saldırdı!`
                : `BASKIN! ${rival.name} saldırdı!`;

             addLog(`${raidMsg} ${stolenGold} altın yağmalandı, askerler şehit düştü.`, 'war');
             return { ...rival, wealth: rival.wealth + stolenGold, strength: rival.strength * 1.05 };
          }

          return { ...rival, strength: rival.strength + growth, wealth: rival.wealth + 1 };
      }));

      // --- Worker & Resource Logic ---
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
           
           const efficiencyMult = getEfficiencyMultiplier(b.count);
           const popMult = Math.pow(1.02, b.count);

           income += (b.production.gold || 0) * effectiveBuildings * efficiencyMult;
           scienceIncome += (b.production.science || 0) * effectiveBuildings * efficiencyMult;
           popGrowth += (b.production.population || 0) * effectiveBuildings * popMult;
        });
        
        // Global Multipliers
        const globalMult = isGoldenAgeActive ? 2.0 : 1.0;

        return {
          ...prev,
          gold: prev.gold + (income * globalMult),
          population: prev.population + (popGrowth * globalMult),
          science: prev.science + (scienceIncome * globalMult)
        };
      });

      // --- Building Depletion ---
      setBuildings(prevBuildings => {
        return prevBuildings.map(b => {
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
      });

      // --- Era Check ---
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

      // --- Crisis Check ---
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
  }, [isLoaded, resources.population, buildings, era, activeCrisis, showEraTransition, resources.gold, nextEraInfo, getEfficiencyMultiplier, rivals, calculateMilitaryStrength, isGoldenAgeActive]);


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
               <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-700" title="Oyun otomatik kaydediliyor">
                 <Save size={12} className="text-green-500 animate-pulse-slow"/>
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

  if (!isLoaded) return <div className="h-screen bg-black flex items-center justify-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden flex flex-col">
      {showEraTransition && (
        <EraTransitionOverlay 
          newEra={era} 
          dominantStyle={dominantStyle}
          onComplete={() => setShowEraTransition(false)} 
        />
      )}

      {/* Full Screen Crisis Modal */}
      {activeCrisis && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <CrisisAlert 
                crisis={activeCrisis} 
                resources={resources} 
                onResolve={() => handleResolveCrisis('solve')}
                onIgnore={() => handleResolveCrisis('ignore')}
             />
        </div>
      )}

      <SnapshotModal 
        isOpen={isSnapshotModalOpen} 
        onClose={() => setIsSnapshotModalOpen(false)} 
        onRetry={handleTakeSnapshot}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        
        <div className="container mx-auto max-w-7xl px-2 lg:px-4 pt-2">
           {renderHeader()}
        </div>

        {/* Middle Section */}
        <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-2">
          <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-4">
             
             {/* Left Side: Visuals & Status */}
             <div className="lg:col-span-5 flex flex-col gap-4">
                <CivilizationVisual era={era} dominantStyle={dominantStyle} climate={climate} />
             </div>

             {/* Right Side: Interaction Tabs */}
             <div className="lg:col-span-7 flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10">
                   <button 
                      onClick={() => setActiveTab('production')}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 font-cinzel font-bold transition-colors
                         ${activeTab === 'production' ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                      `}
                   >
                      <Hammer size={18} />
                      <span className="hidden sm:inline">Üretim</span>
                   </button>
                   <button 
                      onClick={() => setActiveTab('research')}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 font-cinzel font-bold transition-colors
                         ${activeTab === 'research' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                      `}
                   >
                      <FlaskConical size={18} />
                      <span className="hidden sm:inline">Araştırma</span>
                   </button>
                   <button 
                      onClick={() => setActiveTab('diplomacy')}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 font-cinzel font-bold transition-colors
                         ${activeTab === 'diplomacy' ? 'bg-gray-800 text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                      `}
                   >
                      <Handshake size={18} />
                      <span className="hidden sm:inline">Diplomasi</span>
                   </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {activeTab === 'production' ? (
                        <>
                           {/* Imperial Projects (Resource Sinks) */}
                           <ImperialProjects 
                              resources={resources}
                              onGoldenAge={handleGoldenAge}
                              onFestival={handleFestival}
                              onScienceGrant={handleScienceGrant}
                              onLandReclamation={handleLandReclamation}
                              isGoldenAgeActive={isGoldenAgeActive}
                           />

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        </>
                    ) : activeTab === 'research' ? (
                        <TechTree 
                          technologies={TECHNOLOGIES} 
                          unlockedTechIds={unlockedTechs} 
                          resources={resources}
                          currentEra={era}
                          onResearch={handleResearch}
                          futureTechLevel={futureTechLevel}
                          onFutureResearch={handleFutureResearch}
                        />
                    ) : (
                        <DiplomacyPanel 
                          rivals={rivals}
                          resources={resources}
                          militaryStrength={calculateMilitaryStrength()}
                          onAttack={handleAttackRival}
                          onTrade={handleTradeRival}
                          onImproveRelations={handleImproveRelations}
                          onRecruit={handleRecruitSoldier}
                          gameTime={gameTime}
                        />
                    )}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Logs */}
        <div className="shrink-0 border-t border-gray-800 bg-gray-950">
            <LogPanel 
              logs={logs} 
              onGenerateHistory={handleGenerateHistory} 
              isGenerating={isGeneratingAI}
            />
        </div>

      </div>
    </div>
  );
};

export default App;
