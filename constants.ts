
import { Building, Era, Crisis, BuildingStyle, Technology, Rival, RelationStatus } from './types';

export const INITIAL_RESOURCES = {
  population: 5,
  gold: 0,
  land: 0,
  maxLand: 60,
  science: 0,
  soldiers: 0,
};

export const ERA_REQUIREMENTS = {
  [Era.TRIBAL]: { gold: 0, pop: 0 },
  [Era.AGRICULTURAL]: { gold: 500, pop: 20 },
  [Era.INDUSTRIAL]: { gold: 5000, pop: 100 },
  [Era.TECHNOLOGICAL]: { gold: 50000, pop: 500 },
};

export const RIVAL_TEMPLATES: Partial<Rival>[] = [
  { name: 'Kızıl Balta Kabilesi', attitude: 'AGGRESSIVE' },
  { name: 'Nehir Tüccarları', attitude: 'TRADER' },
  { name: 'Dağ Bekçileri', attitude: 'DEFENSIVE' },
  { name: 'Gölge İmparatorluğu', attitude: 'AGGRESSIVE' },
  { name: 'Güneş Rahipleri', attitude: 'TRADER' },
  { name: 'Demir Lejyonu', attitude: 'DEFENSIVE' },
];

export const TECHNOLOGIES: Technology[] = [
  // Tribal
  {
    id: 'stone_tools',
    name: 'Taş Aletler',
    description: 'Daha iyi avlanma teknikleri.',
    cost: 10,
    era: Era.TRIBAL,
    unlocksBuilding: 'hunting_grounds',
  },
  {
    id: 'oral_tradition',
    name: 'Sözlü Gelenek',
    description: 'Bilginin nesilden nesile aktarılması.',
    cost: 25,
    era: Era.TRIBAL,
    unlocksBuilding: 'storyteller',
  },
  {
    id: 'scouting',
    name: 'İzcilik',
    description: 'Yeni av sahaları keşfedin (+20 Toprak Kapasitesi).',
    cost: 40,
    era: Era.TRIBAL,
    bonus: { maxLand: 20 }
  },
  
  // Agricultural
  {
    id: 'agriculture',
    name: 'Tarım',
    description: 'Yerleşik hayata geçiş.',
    cost: 100,
    era: Era.AGRICULTURAL,
    unlocksBuilding: 'farm',
    prerequisite: 'stone_tools',
  },
  {
    id: 'masonry',
    name: 'Duvarcılık',
    description: 'Taş yapılar ve savunma (+10 Ordu Gücü).',
    cost: 150,
    era: Era.AGRICULTURAL,
    unlocksBuilding: 'barracks',
    bonus: { military: 10 }
  },
  {
    id: 'cartography',
    name: 'Haritalama',
    description: 'Sınırlarınızı detaylıca çizin (+50 Toprak Kapasitesi).',
    cost: 200,
    era: Era.AGRICULTURAL,
    bonus: { maxLand: 50 },
    prerequisite: 'scouting'
  },
  {
    id: 'writing',
    name: 'Yazı',
    description: 'Bilginin kalıcı hale gelmesi.',
    cost: 300,
    era: Era.AGRICULTURAL,
    unlocksBuilding: 'library',
    prerequisite: 'oral_tradition',
  },
  {
    id: 'currency',
    name: 'Para Birimi',
    description: 'Ticaretin standartlaşması.',
    cost: 250,
    era: Era.AGRICULTURAL,
    unlocksBuilding: 'market',
  },
  {
    id: 'bronze_working',
    name: 'Bronz İşleme',
    description: 'Daha güçlü silahlar. (+20 Ordu Gücü)',
    cost: 350,
    era: Era.AGRICULTURAL,
    bonus: { military: 20 },
    prerequisite: 'masonry'
  },

  // Industrial
  {
    id: 'steam_power',
    name: 'Buhar Gücü',
    description: 'Makinelerin yükselişi.',
    cost: 1000,
    era: Era.INDUSTRIAL,
    unlocksBuilding: 'factory',
    prerequisite: 'masonry',
  },
  {
    id: 'urbanization',
    name: 'Şehirleşme',
    description: 'Dikey mimari ve verimli alan kullanımı (+150 Toprak Kapasitesi).',
    cost: 1500,
    era: Era.INDUSTRIAL,
    bonus: { maxLand: 150 },
    prerequisite: 'masonry'
  },
  {
    id: 'banking',
    name: 'Bankacılık',
    description: 'Modern finans sistemi.',
    cost: 1200,
    era: Era.INDUSTRIAL,
    unlocksBuilding: 'bank',
    prerequisite: 'currency',
  },
  {
    id: 'metallurgy',
    name: 'Metalurji',
    description: 'Gelişmiş madencilik ve çelik.',
    cost: 800,
    era: Era.INDUSTRIAL,
    unlocksBuilding: 'mine',
  },
  {
    id: 'ballistics',
    name: 'Balistik',
    description: 'Uzun menzilli topçular. (+100 Ordu Gücü)',
    cost: 2000,
    era: Era.INDUSTRIAL,
    bonus: { military: 100 },
    prerequisite: 'metallurgy'
  },

  // Technological
  {
    id: 'computing',
    name: 'Bilgisayar',
    description: 'Dijital çağın başlangıcı.',
    cost: 5000,
    era: Era.TECHNOLOGICAL,
    unlocksBuilding: 'lab',
  },
  {
    id: 'drones',
    name: 'Otonom Drone',
    description: 'İnsansız savaş araçları. (+500 Ordu Gücü)',
    cost: 15000,
    era: Era.TECHNOLOGICAL,
    bonus: { military: 500 },
    prerequisite: 'computing'
  },
];

export const CRISIS_EVENTS: Crisis[] = [
  // Tribal
  {
    id: 'wild_beasts',
    name: 'Vahşi Hayvan Saldırısı',
    description: 'Köyün etrafında kurt sürüleri dolaşıyor. Avcıları organize etmezsek halk zarar görecek.',
    era: Era.TRIBAL,
    cost: { gold: 10, soldiers: 1 },
    penalty: { population: 2 },
  },
  {
    id: 'storm',
    name: 'Şiddetli Fırtına',
    description: 'Barınaklarımız tehlikede. Onarım için malzeme lazım.',
    era: Era.TRIBAL,
    cost: { gold: 5 },
    penalty: { gold: 20 },
  },
  // Agricultural
  {
    id: 'drought',
    name: 'Kuraklık',
    description: 'Ekinler kuruyor. Komşu kabilelerden su ve erzak satın almalıyız.',
    era: Era.AGRICULTURAL,
    cost: { gold: 100 },
    penalty: { population: 5 },
  },
  {
    id: 'plague',
    name: 'Salgın Hastalık',
    description: 'Bilinmeyen bir hastalık yayılıyor. Şifacılar çaresiz.',
    era: Era.AGRICULTURAL,
    cost: { science: 50 }, // Requires science to cure!
    penalty: { population: 8 },
  },
  // Industrial
  {
    id: 'strike',
    name: 'İşçi Grevi',
    description: 'Çalışma koşulları çok ağır. İşçiler zam istiyor.',
    era: Era.INDUSTRIAL,
    cost: { gold: 500 },
    penalty: { population: 10 },
  },
  {
    id: 'pollution',
    name: 'Zehirli Atık Sızıntısı',
    description: 'Fabrikalar nehri kirletti. Temizlik yapılmazsa hastalık yayılacak.',
    era: Era.INDUSTRIAL,
    cost: { gold: 300 },
    penalty: { population: 15 },
  },
  // Technological
  {
    id: 'cyber_attack',
    name: 'Siber Saldırı',
    description: 'Banka sistemleri hacklendi. Güvenlik duvarını güçlendir.',
    era: Era.TECHNOLOGICAL,
    cost: { gold: 2000 },
    penalty: { gold: 10000 },
  },
  {
    id: 'data_leak',
    name: 'Veri Sızıntısı',
    description: 'Gizli araştırmalar çalındı.',
    era: Era.TECHNOLOGICAL,
    cost: { science: 1000 },
    penalty: { science: 5000 },
  },
];

export const BUILDING_DEFINITIONS: Omit<Building, 'count' | 'assignedWorkers'>[] = [
  // --- TRIBAL ---
  {
    id: 'tent',
    name: 'Kıl Çadır',
    description: 'Basit barınak. Nüfus artış hızını biraz artırır.',
    baseCost: { gold: 10, land: 2, workers: 0 },
    production: { population: 0.1 },
    era: Era.TRIBAL,
    icon: '⛺',
    style: BuildingStyle.NONE,
  },
  {
    id: 'house',
    name: 'Ahşap Ev',
    description: 'Gelişmiş barınma imkanı. Nüfus artışını hızlandırır.',
    baseCost: { gold: 50, land: 5, workers: 1 },
    production: { population: 0.5 },
    era: Era.TRIBAL,
    icon: '🏠',
    style: BuildingStyle.NONE,
  },
  {
    id: 'hunting_grounds',
    name: 'Av Sahası',
    description: 'Düzenli yiyecek ve deri. Askeri disiplinin temelleri.',
    baseCost: { gold: 25, land: 5, workers: 2 },
    production: { gold: 1, military: 1 },
    era: Era.TRIBAL,
    icon: '🏹',
    depletionChance: 0.0005,
    style: BuildingStyle.MILITARY,
    requiredTech: 'stone_tools',
  },
  {
    id: 'storyteller',
    name: 'Masalcı Ateşi',
    description: 'Hikayeler anlatılır, ilk bilgiler aktarılır.',
    baseCost: { gold: 50, land: 2, workers: 1 },
    production: { science: 0.5 },
    era: Era.TRIBAL,
    icon: '🔥',
    style: BuildingStyle.NONE,
    requiredTech: 'oral_tradition',
  },

  // --- AGRICULTURAL ---
  {
    id: 'farm',
    name: 'Buğday Tarlası',
    description: 'Düzenli hasat. Temel ekonomi.',
    baseCost: { gold: 100, land: 10, workers: 5 },
    production: { gold: 5 },
    era: Era.AGRICULTURAL,
    icon: '🌾',
    style: BuildingStyle.ECONOMIC,
    requiredTech: 'agriculture',
  },
  {
    id: 'market',
    name: 'Pazar Yeri',
    description: 'Ticaret merkezi. Ekonomiyi canlandırır.',
    baseCost: { gold: 300, land: 5, workers: 3 },
    production: { gold: 15 },
    era: Era.AGRICULTURAL,
    icon: '⚖️',
    style: BuildingStyle.ECONOMIC,
    requiredTech: 'currency',
  },
  {
    id: 'library',
    name: 'Kütüphane',
    description: 'Bilginin toplandığı yer. Bilim üretir.',
    baseCost: { gold: 500, land: 8, workers: 4 },
    production: { science: 2 },
    era: Era.AGRICULTURAL,
    icon: '📜',
    style: BuildingStyle.NONE,
    requiredTech: 'writing',
  },
  {
    id: 'barracks',
    name: 'Kışla',
    description: 'Savaşçı eğitimi. Güçlü bir ordu için temel.',
    baseCost: { gold: 400, land: 15, workers: 10 },
    production: { gold: -2, military: 5 }, // Consumes gold to maintain army
    era: Era.AGRICULTURAL,
    icon: '⚔️',
    style: BuildingStyle.MILITARY,
    requiredTech: 'masonry',
  },

  // --- INDUSTRIAL ---
  {
    id: 'mine',
    name: 'Altın Madeni',
    description: 'Derin kazı. Yüksek getiri ama çökme riski var.',
    baseCost: { gold: 1000, land: 20, workers: 15 },
    production: { gold: 50 },
    era: Era.INDUSTRIAL,
    icon: '⛏️',
    depletionChance: 0.002,
    style: BuildingStyle.ECONOMIC,
    requiredTech: 'metallurgy',
  },
  {
    id: 'factory',
    name: 'Fabrika',
    description: 'Seri üretim. Makine arızaları üretimi durdurabilir.',
    baseCost: { gold: 2500, land: 15, workers: 50 },
    production: { gold: 120 },
    era: Era.INDUSTRIAL,
    icon: '🏭',
    depletionChance: 0.001,
    style: BuildingStyle.ECONOMIC,
    requiredTech: 'steam_power',
  },
  {
    id: 'fortress',
    name: 'Çelik Hisar',
    description: 'Aşılmaz duvarlar. Düşmana korku salar.',
    baseCost: { gold: 5000, land: 25, workers: 40 },
    production: { population: 2, military: 20 },
    era: Era.INDUSTRIAL,
    icon: '🏰',
    style: BuildingStyle.MILITARY,
    requiredTech: 'masonry',
  },
  {
    id: 'bank',
    name: 'Merkez Bankası',
    description: 'Finansal imparatorluk. Paranın gücü.',
    baseCost: { gold: 8000, land: 10, workers: 20 },
    production: { gold: 300 },
    era: Era.INDUSTRIAL,
    icon: '🏛️',
    style: BuildingStyle.ECONOMIC,
    requiredTech: 'banking',
  },

  // --- TECHNOLOGICAL ---
  {
    id: 'lab',
    name: 'Araştırma Laboratuvarı',
    description: 'Bilimin zirvesi. En zeki zihinleri gerektirir.',
    baseCost: { gold: 10000, land: 10, workers: 30 },
    production: { gold: 100, science: 20 },
    era: Era.TECHNOLOGICAL,
    icon: '🔬',
    style: BuildingStyle.NONE,
    requiredTech: 'computing',
  },
];

export const TICK_RATE_MS = 1000;