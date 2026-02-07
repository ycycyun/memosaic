
// Fix: Import React to resolve the namespace error for React.ReactNode
import React from 'react';

export type AssetTheme = 'Forest' | 'Urban Solitude' | 'Deep Sea';

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
  RELEASED = 'RELEASED',
  COMMUNITY = 'COMMUNITY'
}