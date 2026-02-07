
import React from 'react';

// Removed global declaration for ImportMetaEnv as `import.meta.env` is not used directly.

export type AssetTheme = 'Desert' | 'Forest' | 'Sea' | 'Urban';

export interface User {
  id: string;
  username: string;
}

export interface SavedSession {
  id: string;
  talismanName: string;
  talismanImageUrl: string;
  mood: string;
  date: string;
  accent: string;
  objects: SandboxObject[];
}

export interface SandboxObject {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  icon: string | React.ReactNode;
  imageUrl?: string;
  isGenerative?: boolean;
}

export interface Reframe {
  type: 'Mirror' | 'Architect' | 'Poet';
  title: string;
  content: string;
  color: string;
}

export interface MuralShard {
  id: string;
  color: string;
  accent: string;
  itemName: string;
  itemIcon?: any;
  itemImageUrl?: string;
  mood: string;
  date: string;
}

export enum AppState {
  GROUNDING = 'GROUNDING',
  BUILDING = 'BUILDING',
  REFLECTING = 'REFLECTING',
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE'
}