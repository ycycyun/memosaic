
import type { AssetTheme } from './types';

export const THEMES = [
  { name: 'Desert', color: '#f6e3c1', accent: '#8d6e63' },
  { name: 'Forest', color: '#e2ece9', accent: '#2d5a27' },
  { name: 'Sea', color: '#e0f2fe', accent: '#075985' },
  { name: 'Urban', color: '#f1f1f1', accent: '#4a5568' }
];

const assetUrl = (file: string) => new URL(`./assets/${file}`, import.meta.url).href;

const buildAssets = (prefix: string, objects: string[], theme: AssetTheme) =>
  objects.map((objectName) => {
    const file = `${prefix}-${objectName}.PNG`;
    const url = assetUrl(file);
    return {
      name: objectName.charAt(0).toUpperCase() + objectName.slice(1),
      icon: <img src={url} alt={objectName} className="w-8 h-8 object-contain" />,
      imageUrl: url,
      theme
    };
  });

export const CORE_ASSETS = [
  ...buildAssets('sand', ['ball', 'box', 'bridge', 'car', 'cat', 'cloud', 'dog', 'flower', 'fox', 'house', 'key', 'light', 'rock', 'tree'], 'Desert'),
  ...buildAssets('forest', ['axe', 'bush', 'campfire', 'cave', 'cliff', 'deer', 'fog', 'mushroom', 'rabbit', 'soil', 'stream', 'tree', 'vine'], 'Forest'),
  ...buildAssets('sea', ['anchor', 'coral reef', 'corals', 'fish', 'lighthouse', 'pier', 'rain', 'sailboat', 'seagull', 'seashell', 'turtle', 'wave', 'wooden boat'], 'Sea'),
  ...buildAssets('urban', ['bench', 'bicycle', 'building', 'bus stop', 'bus', 'shop', 'street lamp', 'student', 'trash bin', 'vending machine', 'worker'], 'Urban')
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