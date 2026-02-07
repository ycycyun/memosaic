import React, { useRef, useState, useEffect } from 'react';
import { ISO_COLS, ISO_ROWS } from '../constants';
import { SandboxObject } from '../types';

interface IsometricSandboxProps {
  objects: SandboxObject[];
  onDrop: (x: number, y: number) => void;
  activeThemeColor: string;
  activeThemeName?: string;
  activeThemeBaseColor?: string;
}

const IsometricSandbox: React.FC<IsometricSandboxProps> = ({
  objects,
  onDrop,
  activeThemeColor,
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);

  // We use percentages for the grid to ensure it perfectly fills the parent container
  const cellWidth = 100 / ISO_COLS;
  const cellHeight = 100 / ISO_ROWS;

  const tray = {
    frame: '#e8e6e3',
    surface: '#f5f3f0',
    border: '#d4cfc9'
  };

  const surfaceGradient = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0) 60%)`;
  const noiseLayer = `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)`;

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      {/* 1. Perspective Container */}
      <div style={{ perspective: '1200px' }}>
        
        {/* 2. The Main Tray (Rotated in 3D Space) */}
        <div
          className="relative transition-transform duration-700 ease-out shadow-2xl"
          style={{
            transform: 'rotateX(55deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d',
            width: '32rem',
            height: '32rem',
            backgroundColor: tray.frame,
            borderRadius: '8px',
            borderBottom: '12px solid rgba(0,0,0,0.2)',
            borderRight: '12px solid rgba(0,0,0,0.1)',
          }}
        >
          {/* 3. The Inner Sand Surface */}
          <div
            ref={surfaceRef}
            className="absolute inset-2 overflow-visible"
            style={{
              backgroundColor: tray.surface,
              border: `4px solid ${tray.border}`,
              backgroundImage: `${surfaceGradient}, ${noiseLayer}`,
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* 4. The Grid Overlay */}
            <div className="relative w-full h-full">
              {Array.from({ length: ISO_COLS }).map((_, x) =>
                Array.from({ length: ISO_ROWS }).map((_, y) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => onDrop(x, y)}
                    className="absolute border border-black/5 hover:bg-white/30 cursor-pointer transition-colors"
                    style={{
                      left: `${x * cellWidth}%`,
                      top: `${y * cellHeight}%`,
                      width: `${cellWidth}%`,
                      height: `${cellHeight}%`,
                      backgroundColor: activeThemeColor + '15',
                    }}
                  />
                ))
              )}

              {/* 5. The Objects */}
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  className="absolute pointer-events-none"
                  style={{
                    // Position at the center of the target tile
                    left: `${obj.x * cellWidth + cellWidth / 2}%`,
                    top: `${obj.y * cellHeight + cellHeight / 2}%`,
                    width: '0px',
                    height: '0px',
                    zIndex: obj.x + obj.y + 10,
                  }}
                >
                  <div 
                    className="flex flex-col items-center justify-end"
                    style={{
                      width: '120px', 
                      height: '120px',
                      marginLeft: '-60px', // Center the object container
                      marginTop: '-100px', // Lift it so the base sits on the grid
                      /* IMPORTANT: Counter-rotate the object so it stays upright 
                         while the floor stays tilted.
                      */
                      transform: 'rotateZ(45deg) rotateX(-55deg) scale(1.5)',
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {obj.imageUrl ? (
                      <img
                        src={obj.imageUrl}
                        alt={obj.name}
                        className="w-full h-auto object-contain drop-shadow-xl"
                      />
                    ) : (
                      <div className="bg-white/90 p-2 rounded shadow-lg border text-xs">
                        {obj.name}
                      </div>
                    )}
                    {/* Shadow on the sand */}
                    <div className="w-12 h-4 bg-black/20 blur-md rounded-[100%] absolute -bottom-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsometricSandbox;