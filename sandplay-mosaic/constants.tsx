
import React from 'react';
import { TreePine, Waves, Building2, Ghost, Heart, Moon, Sun, Anchor, Coffee, Cloud, Flower2, Bird, Cat, Key, Compass, Tent } from 'lucide-react';

export const THEMES = [
  { name: 'Forest', color: '#e2ece9', accent: '#2d5a27' },
  { name: 'Urban Solitude', color: '#f1f1f1', accent: '#4a5568' },
  { name: 'Deep Sea', color: '#e0f2fe', accent: '#075985' }
];

export const CORE_ASSETS = [
  { name: 'Tall Pine', icon: <TreePine className="w-6 h-6" />, theme: 'Forest' },
  { name: 'Wild Flower', icon: <Flower2 className="w-6 h-6" />, theme: 'Forest' },
  { name: 'Bird', icon: <Bird className="w-6 h-6" />, theme: 'Forest' },
  { name: 'Shelter', icon: <Tent className="w-6 h-6" />, theme: 'Forest' },
  
  { name: 'Stone Arch', icon: <Building2 className="w-6 h-6" />, theme: 'Urban Solitude' },
  { name: 'Warm Coffee', icon: <Coffee className="w-6 h-6" />, theme: 'Urban Solitude' },
  { name: 'Lost Key', icon: <Key className="w-6 h-6" />, theme: 'Urban Solitude' },
  { name: 'Stray Cat', icon: <Cat className="w-6 h-6" />, theme: 'Urban Solitude' },
  
  { name: 'Tide', icon: <Waves className="w-6 h-6" />, theme: 'Deep Sea' },
  { name: 'Heavy Anchor', icon: <Anchor className="w-6 h-6" />, theme: 'Deep Sea' },
  { name: 'Old Compass', icon: <Compass className="w-6 h-6" />, theme: 'Deep Sea' },
  { name: 'Inner Light', icon: <Sun className="w-6 h-6" />, theme: 'Deep Sea' },
];

export const ISO_GRID_SIZE = 40;
export const ISO_COLS = 12;
export const ISO_ROWS = 12;

export const ISO_MATH = {
  toIso: (x: number, y: number) => ({
    x: (x - y) * (ISO_GRID_SIZE / 1.5),
    y: (x + y) * (ISO_GRID_SIZE / 3)
  })
};
