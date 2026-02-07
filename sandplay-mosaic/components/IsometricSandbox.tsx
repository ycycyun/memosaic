
import React, { useEffect, useRef, useState } from 'react';
import { ISO_MATH, ISO_COLS, ISO_ROWS, ISO_GRID_SIZE } from '../constants';
import { AssetTheme, SandboxObject } from '../types';

interface IsometricSandboxProps {
  objects: SandboxObject[];
  onDrop: (x: number, y: number) => void;
  onUpdateObject?: (id: string, x: number, y: number) => void;
  activeThemeColor: string;
  activeThemeName: AssetTheme;
  activeThemeBaseColor: string;
}

const IsometricSandbox: React.FC<IsometricSandboxProps> = ({
  objects,
  onDrop,
  activeThemeColor,
  activeThemeName,
  activeThemeBaseColor
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!surfaceRef.current) return;
    const el = surfaceRef.current;

    const updateSize = () => {
      setSurfaceSize({ width: el.clientWidth, height: el.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const baseGridSize = ISO_GRID_SIZE;
  const rawA = baseGridSize / 1.5;
  const rawB = baseGridSize / 3;
  const rawGridWidth = (ISO_COLS - 1 + ISO_ROWS - 1) * rawA;
  const rawGridHeight = (ISO_COLS - 1 + ISO_ROWS - 1) * rawB;
  const hasSurface = surfaceSize.width > 0 && surfaceSize.height > 0;
  const padding = 0;
  const baseScaleX = hasSurface
    ? (surfaceSize.width - padding * 2) / rawGridWidth
    : 1;
  const baseScaleY = hasSurface
    ? (surfaceSize.height - padding * 2) / rawGridHeight
    : 1;
  const scaleX = baseScaleX * 1.155;
  const scaleY = baseScaleY * 1.155;
  const gridSizeX = baseGridSize * scaleX;
  const gridSizeY = baseGridSize * scaleY;
  const gridWidth = rawGridWidth * scaleX;
  const gridHeight = rawGridHeight * scaleY;
  const centerX = hasSurface ? surfaceSize.width / 2 : 0;
  const centerY = hasSurface ? surfaceSize.height / 2 : 0;
  const minX = -(ISO_ROWS - 1) * rawA * scaleX;
  const minY = 0;
  const originX = centerX - gridWidth / 2 - minX - centerX * 0.1;
  const originY = centerY - gridHeight / 2 - minY - centerY * 0.15;
  const hitSizeX = gridSizeX * 1.2;
  const hitSizeY = gridSizeY * 1.2;
  const hitOffsetX = (hitSizeX - gridSizeX) / 2;
  const hitOffsetY = (hitSizeY - gridSizeY) / 2;
  const renderGrid = () => {
    const cells = [];
    const isSandTheme = activeThemeName === 'Sand';
    for (let x = 0; x < ISO_COLS; x++) {
      for (let y = 0; y < ISO_ROWS; y++) {
        const pos = ISO_MATH.toIso(x, y);
        const px = pos.x * scaleX;
        const py = pos.y * scaleY;
        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => onDrop(x, y)}
            className="absolute cursor-pointer group"
            style={{
              left: `${originX + px - hitOffsetX}px`,
              top: `${originY + py - hitOffsetY}px`,
              width: `${hitSizeX}px`,
              height: `${hitSizeY}px`,
              zIndex: x + y
            }}
          >
            {/* Grid Tile */}
            <div 
              className={`w-full h-full transition-colors ${isSandTheme ? '' : 'border border-slate-200/30 group-hover:bg-white/30'}`}
              style={{
                transform: 'rotateX(60deg) rotateZ(45deg)',
                backgroundColor: isSandTheme ? 'transparent' : activeThemeColor + '14',
                width: `${gridSizeX}px`,
                height: `${gridSizeY}px`,
                marginLeft: `${hitOffsetX}px`,
                marginTop: `${hitOffsetY}px`
              }}
            />
          </div>
        );
      }
    }
    return cells;
  };

  const trayStyles: Record<AssetTheme, { frame: string; surface: string; border: string; noiseOpacity: number }> = {
    Forest: {
      frame: '#2b3a2f',
      surface: activeThemeBaseColor,
      border: '#6b7f5f',
      noiseOpacity: 0.08
    },
    'Urban Solitude': {
      frame: '#3f3f46',
      surface: activeThemeBaseColor,
      border: '#a1a1aa',
      noiseOpacity: 0.06
    },
    'Deep Sea': {
      frame: '#0f3b4a',
      surface: activeThemeBaseColor,
      border: '#2b6f8f',
      noiseOpacity: 0.08
    },
    Sand: {
      frame: '#5D4037',
      surface: '#E6C288',
      border: '#8D6E63',
      noiseOpacity: 0.15
    },
  };

  const tray = trayStyles[activeThemeName];
  const noiseLayer = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${tray.noiseOpacity}'/%3E%3C/svg%3E")`;
  const surfaceGradient = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.12), transparent 55%)`;

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <div
        className="relative transition-transform duration-700 ease-out preserve-3d isometric-container"
        style={{
          transform: 'rotateX(55deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
          width: '34rem',
          height: '34rem'
        }}
      >
        <div
          className="absolute -inset-4 rounded-lg transform translate-z-[-10px] shadow-2xl border-b-[8px] border-r-[8px] border-black/40"
          style={{ backgroundColor: tray.frame }}
        />

        <div
          ref={surfaceRef}
          className="w-full h-full rounded-md border-4 relative overflow-hidden"
          style={{
            backgroundColor: tray.surface,
            borderColor: tray.border,
            backgroundImage: `${surfaceGradient}, ${noiseLayer}`,
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)'
          }}
        >
          <div
            className="relative w-full h-full"
            style={{ transform: 'rotateZ(45deg)', transformOrigin: '50% 50%' }}
          >
            {renderGrid()}

            {objects.map((obj) => {
              const pos = ISO_MATH.toIso(obj.x, obj.y);
              const px = pos.x * scaleX;
              const py = pos.y * scaleY;
              const objectSize = Math.min(gridSizeX, gridSizeY) * 4.2;
              return (
                <div
                  key={obj.id}
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${originX + px}px`,
                    top: `${originY + py}px`,
                    width: `${objectSize}px`,
                    height: `${objectSize}px`,
                    zIndex: obj.x + obj.y + 10,
                    transform: `translate(-50%, -50%) translate(0, -${20 * scaleY}px)`
                  }}
                >
                  <div className="flex flex-col items-center justify-end h-full">
                    {obj.imageUrl ? (
                      <img src={obj.imageUrl} alt={obj.name} className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                      <div className="text-slate-700 bg-white/80 p-2 rounded-lg shadow-lg border border-slate-100 flex items-center justify-center">
                        {React.isValidElement(obj.icon) ? obj.icon : <span>{obj.name}</span>}
                      </div>
                    )}
                    <div className="w-8 h-2 bg-black/10 blur-sm rounded-full -mb-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsometricSandbox;
