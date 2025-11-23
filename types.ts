
export enum ResourceType {
  POPULATION = 'POPULATION',
  GOLD = 'GOLD',
  LAND = 'LAND',
  SCIENCE = 'SCIENCE',
  SOLDIERS = 'SOLDIERS',
}

export enum Era {
  TRIBAL = 'Kabile Çağı',
  AGRICULTURAL = 'Tarım Çağı',
  INDUSTRIAL = 'Sanayi Çağı',
  TECHNOLOGICAL = 'Teknoloji Çağı',
}

export enum BuildingStyle {
  NONE = 'NONE',
  MILITARY = 'MILITARY',
  ECONOMIC = 'ECONOMIC',
}

export enum Climate {
  TEMPERATE = 'Ilıman',
  ARID = 'Kurak',
  ARCTIC = 'Kutup',
  TROPICAL = 'Tropikal'
}

export interface Resources {
  population: number;
  gold: number;
  land: number;
  maxLand: number;
  science: number;
  soldiers: number; // New Resource
}

export enum RelationStatus {
  WAR = 'Savaşta',
  HOSTILE = 'Düşman',
  NEUTRAL = 'Nötr',
  FRIENDLY = 'Dost',
  ALLY = 'Müttefik',
}

export interface Rival {
  id: string;
  name: string;
  strength: number; // Military power
  wealth: number; // Economic power (for looting)
  relation: RelationStatus;
  attitude: 'AGGRESSIVE' | 'DEFENSIVE' | 'TRADER';
  era: Era;
  lastInteractionTurn: number;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number;
  era: Era;
  prerequisite?: string; // ID of another tech
  unlocksBuilding?: string; // ID of building
  bonus?: {
    maxLand?: number;
    population?: number;
    military?: number; // New bonus type
  };
}

export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: {
    gold: number;
    land: number;
    workers: number; // Serves as "Max Workers Per Building"
  };
  production: {
    gold?: number;
    population?: number;
    science?: number;
    military?: number; // Passive defense/attack bonus
  };
  count: number;
  assignedWorkers: number; // New field for manual assignment
  era: Era;
  icon: string;
  depletionChance?: number; 
  style: BuildingStyle;
  requiredTech?: string; // ID of technology required to build
}

export interface Crisis {
  id: string;
  name: string;
  description: string;
  era: Era;
  cost: {
    gold?: number;
    population?: number;
    science?: number;
    soldiers?: number;
  };
  penalty: {
    gold?: number;
    population?: number;
    land?: number;
    science?: number;
  };
}

export interface GameState {
  resources: Resources;
  era: Era;
  buildings: Building[];
  technologies: string[]; // List of unlocked tech IDs
  gameTime: number;
  climate: Climate;
  rivals: Rival[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'game' | 'ai' | 'crisis' | 'warning' | 'tech' | 'war';
}