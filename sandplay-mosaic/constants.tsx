
import type { AssetTheme } from './types';

export const THEMES = [
  { name: 'Forest', color: '#e2ece9', accent: '#2d5a27' },
  { name: 'Urban Solitude', color: '#f1f1f1', accent: '#4a5568' },
  { name: 'Deep Sea', color: '#e0f2fe', accent: '#075985' },
  { name: 'Sand', color: '#f6e3c1', accent: '#8d6e63' }
];

const assetUrl = (file: string) => new URL(`./assets/${file}`, import.meta.url).href;

const buildAssets = (prefix: string, count: number, theme: AssetTheme) =>
  Array.from({ length: count }, (_, i) => {
    const file = `${prefix}${i + 1}.PNG`;
    const url = assetUrl(file);
    return {
      name: `${theme} ${i + 1}`,
      icon: <img src={url} alt={`${theme} ${i + 1}`} className="w-8 h-8 object-contain" />,
      imageUrl: url,
      theme
    };
  });

export const CORE_ASSETS = [
  ...buildAssets('forest', 13, 'Forest'),
  ...buildAssets('urban', 11, 'Urban Solitude'),
  ...buildAssets('sea', 13, 'Deep Sea'),
  ...buildAssets('sand', 14, 'Sand')
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
