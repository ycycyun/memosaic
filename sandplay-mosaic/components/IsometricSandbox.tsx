
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

  const hasSurface = surfaceSize.width > 0 && surfaceSize.height > 0;
  // Use padding to prevent items from touching the exact edge if desired, or 0 to fill
  const padding = 0;
  
  // Create a rectilinear grid that fills the surface
  // Divide surface width/height by number of columns/rows to get cell size
  const cellWidth = hasSurface ? (surfaceSize.width - padding * 2) / ISO_COLS : 0;
  const cellHeight = hasSurface ? (surfaceSize.height - padding * 2) / ISO_ROWS : 0;

  // Use the smaller dimension to keep cells square if aspect ratio varies slightly, 
  // or just use calculated width/height if we want full stretch.
  // Since we enforced aspect-ratio: 1 on container, we effectively have square cells.
  const cellSize = cellWidth; 

  const renderGrid = () => {
    const cells = [];
    const isSandTheme = activeThemeName === 'Sand';
    for (let x = 0; x < ISO_COLS; x++) {
      for (let y = 0; y < ISO_ROWS; y++) {
        // Cartesian positioning relative to top-left of the surface
        const left = x * cellSize + padding;
        const top = y * cellSize + padding;

        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => onDrop(x, y)}
            className="absolute cursor-pointer group"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              zIndex: 10
            }}
          >
            {/* Grid Tile Content */}
            <div 
              className={`w-full h-full transition-colors ${isSandTheme ? '' : 'border border-slate-200/30 group-hover:bg-white/30'}`}
              style={{
                backgroundColor: isSandTheme ? 'transparent' : activeThemeColor + '14',
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
    }
  };

  const tray = trayStyles[activeThemeName] || {
    frame: '#e8e6e3',
    surface: activeThemeBaseColor || '#f5f3f0',
    border: '#d4cfc9',
    noiseOpacity: 0.1
  };
  const noiseLayer = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${tray.noiseOpacity}'/%3E%3C/svg%3E")`;
  const surfaceGradient = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.12), transparent 55%)`;
  const isSandTheme = activeThemeName === 'Sand';

  return (
    <div
      className="relative w-full h-[600px] flex items-center justify-center isometric-container"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative transition-transform duration-700 ease-out preserve-3d"
        style={{
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          width: 'min(90%, 34rem)',
          aspectRatio: '1'
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
            style={{ transformOrigin: '50% 50%' }}
          >
            {renderGrid()}
            <div 
              className={`w-full h-full transition-colors ${isSandTheme ? '' : 'border border-slate-200/30 group-hover:bg-white/30'}`}
              style={{
                backgroundColor: isSandTheme ? 'transparent' : activeThemeColor + '14',
                width: `${gridSizeX}px`,
                height: `${gridSizeY}px`,
                marginLeft: `${hitOffsetX}px`,
                marginTop: `${hitOffsetY}px`
              }}
            />

            {objects.map((obj) => {
              // Convert grid coordinates to px
              const left = obj.x * cellSize + padding;
              const top = obj.y * cellSize + padding;
              
              const objectSize = cellSize * 2.5; // Slightly larger for visibility

              return (
                <div
                  key={obj.id}
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${left + cellSize/2}px`, // Center in cell
                    top: `${top + cellSize/2}px`,   // Center in cell
                    width: `${objectSize}px`,
                    zIndex: obj.x + obj.y + 20,
                    // Note: In 3D transformed space, Y is 'down' the board. 
                    // To make object stand up, we rely on the parent's preserve-3d.
                    // But here we just want it placed.
                    // We counter-rotate the object so it aligns vertically with the screen
                    transform: `translate(-50%, -100%) rotateZ(-45deg) rotateX(-60deg) translateY(-10px)`,
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="flex flex-col items-center justify-end h-full">
                    {obj.imageUrl ? (
                      <img
                        src={obj.imageUrl}
                        alt={obj.name}
                        className="w-full h-auto object-contain drop-shadow-lg"
                        style={{ transformOrigin: 'bottom center' }}
                      />
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