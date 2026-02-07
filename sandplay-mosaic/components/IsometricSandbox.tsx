
import React from 'react';
import { ISO_MATH, ISO_COLS, ISO_ROWS, ISO_GRID_SIZE } from '../constants';
import { SandboxObject } from '../types';

interface IsometricSandboxProps {
  objects: SandboxObject[];
  onDrop: (x: number, y: number) => void;
  onUpdateObject?: (id: string, x: number, y: number) => void;
  activeThemeColor: string;
}

const IsometricSandbox: React.FC<IsometricSandboxProps> = ({ objects, onDrop, activeThemeColor }) => {
  const renderGrid = () => {
    const cells = [];
    for (let x = 0; x < ISO_COLS; x++) {
      for (let y = 0; y < ISO_ROWS; y++) {
        const pos = ISO_MATH.toIso(x, y);
        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => onDrop(x, y)}
            className="absolute cursor-pointer group"
            style={{
              left: `${50}%`,
              top: `${20}%`,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              width: `${ISO_GRID_SIZE}px`,
              height: `${ISO_GRID_SIZE}px`,
              zIndex: x + y
            }}
          >
            {/* Grid Tile */}
            <div 
              className="w-full h-full border border-slate-200/30 group-hover:bg-white/40 transition-colors"
              style={{
                transform: 'rotateX(60deg) rotateZ(45deg)',
                backgroundColor: activeThemeColor + '20'
              }}
            />
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="relative w-full h-[600px] bg-white/5 rounded-3xl overflow-hidden isometric-container border border-slate-200/50 shadow-inner">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.02)_100%)]" />
      
      {/* Grid */}
      <div className="relative h-full w-full">
        {renderGrid()}

        {/* Objects */}
        {objects.map((obj) => {
          const pos = ISO_MATH.toIso(obj.x, obj.y);
          return (
            <div
              key={obj.id}
              className="absolute pointer-events-none transition-all duration-300"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(20% + ${pos.y}px)`,
                width: `${ISO_GRID_SIZE}px`,
                height: `${ISO_GRID_SIZE}px`,
                zIndex: obj.x + obj.y + 10,
                transform: `translate(0, -20px)`
              }}
            >
              <div className="flex flex-col items-center justify-end h-full">
                {obj.imageUrl ? (
                  <img src={obj.imageUrl} alt={obj.name} className="w-12 h-12 object-contain drop-shadow-lg" />
                ) : (
                  <div className="text-slate-700 bg-white/80 p-2 rounded-lg shadow-lg border border-slate-100 flex items-center justify-center">
                    {/* Since icon is JSX, we just render it */}
                    {React.isValidElement(obj.icon) ? obj.icon : <span>{obj.name}</span>}
                  </div>
                )}
                {/* Shadow */}
                <div className="w-8 h-2 bg-black/10 blur-sm rounded-full -mb-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IsometricSandbox;
