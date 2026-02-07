import React, { useEffect, useState } from 'react';
import { persistence } from '../services/persistenceService';
import { SavedSession } from '../types'; // Ensure this matches your file path
import { Sparkles } from 'lucide-react';

// Helper function to chunk array for row-based rendering
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// ProfileView should be a named export to match App.tsx import
export const ProfileView: React.FC = () => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Ensure persistence.getAllSessions() returns SavedSession[]
    const data = persistence.getAllSessions();
    if (data) {
        setSessions(data);
    }
  }, []);

  const handleCubeClick = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  // Determine chunk size for desktop layout (lg:grid-cols-4)
  const desktopChunkSize = 4; 

  return (
    <div className="w-full min-h-screen flex flex-col gap-12 animate-in fade-in duration-1000 pb-20 bg-white">
      {/* Simple Header */}
      <div className="relative w-full pt-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl serif italic text-slate-900 mb-2">Your Memories</h2>
          <p className="text-slate-500 max-w-2xl italic text-base">
            Click on any memory cube to explore its essence.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
           <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 opacity-20" />
           </div>
           <p className="text-sm italic uppercase tracking-[0.2em]">No memories saved yet.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-16 py-10">
          {/* Bookshelf Sections */}
          {chunkArray<SavedSession>(sessions, 8).map((shelf, shelfIndex) => (
            <div key={`shelf-${shelfIndex}`} className="relative">
              {/* Shelf styling - simple and minimal */}
              <div className="relative">
                {/* Memory cubes in grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 pb-1">
                  {shelf.map((session, cubeIndex) => {
                    const isSelected = selectedId === session.id;
                    const delay = cubeIndex * 0.05;
                    
                    return (
                      <div
                        key={session.id}
                        className="group cursor-pointer flex flex-col items-center"
                        onClick={() => handleCubeClick(session.id)}
                        title={session.talismanName}
                      >
                        <div
                          className="relative w-20 h-20"
                          style={{
                            perspective: '1000px',
                            zIndex: isSelected ? 50 : 1
                          }}
                        >
                          {/* Wrapper */}
                          <div
                            className={`w-full h-full transition-all duration-500 ease-in-out ${isSelected ? 'scale-150' : ''}`}
                            style={{
                              transitionDelay: `${delay}s`,
                              animation: isSelected ? 'none' : 'float 3s infinite ease-in-out'
                            }}
                          >
                            {/* Cube */}
                            <div
                              className={`cube-small relative w-full h-full transform-style-3d transition-transform duration-500 ${isSelected ? 'show-back' : 'show-front'}`}
                              style={{
                                transformStyle: 'preserve-3d',
                                transitionDelay: `${delay}s`
                              }}
                            >
                              {/* Front: Memory cube */}
                              <div
                                className="cube-face-small cube-front-small flex flex-col items-center justify-center border border-white/20 shadow-md hover:shadow-lg transition-shadow rounded-lg"
                                style={{ backgroundColor: session.accent }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
                                <Sparkles className="w-4 h-4 text-white drop-shadow-sm relative z-10" />
                              </div>

                              {/* Back: Image */}
                              <div
                                className="cube-face-small cube-back-small bg-white border border-slate-200 flex items-center justify-center overflow-hidden rounded-lg"
                                style={{
                                  transform: 'rotateY(180deg) translateZ(40px)',
                                  WebkitTransform: 'rotateY(180deg) translateZ(40px)'
                                }}
                              >
                                {session.talismanImageUrl ? (
                                  <img
                                    src={session.talismanImageUrl}
                                    alt={session.talismanName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-slate-400" />
                                  </div>
                                )}
                              </div>

                              {/* Sides */}
                              <div
                                className="cube-face-small"
                                style={{
                                  backgroundColor: session.accent,
                                  filter: 'brightness(0.9)',
                                  transform: 'rotateY(90deg) translateZ(40px)'
                                }}
                              />
                              <div
                                className="cube-face-small"
                                style={{
                                  backgroundColor: session.accent,
                                  filter: 'brightness(0.9)',
                                  transform: 'rotateY(-90deg) translateZ(40px)'
                                }}
                              />
                              <div
                                className="cube-face-small"
                                style={{
                                  backgroundColor: session.accent,
                                  filter: 'brightness(1.1)',
                                  transform: 'rotateX(90deg) translateZ(40px)'
                                }}
                              />
                              <div
                                className="cube-face-small"
                                style={{
                                  backgroundColor: session.accent,
                                  filter: 'brightness(0.8)',
                                  transform: 'rotateX(-90deg) translateZ(40px)'
                                }}
                              />
                            </div>
                          </div>

                          {/* Small shadow */}
                          <div
                            className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 blur-md rounded-full transition-all duration-500 ${isSelected ? 'scale-125 opacity-10' : 'opacity-20'}`}
                            style={{ transitionDelay: `${delay}s` }}
                          />
                        </div>

                        {/* Tooltip with mood/date */}
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-2 py-1 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          {session.mood} • {session.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Shelf ledge - now below the cubes */}
                <div className="w-full h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 shadow-md rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .transform-style-3d { transform-style: preserve-3d; }
        
        /* Small cube for shelves */
        .cube-face-small {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          backface-visibility: hidden;
        }
        
        .cube-front-small  { transform: rotateY(  0deg) translateZ(40px); }
        .cube-back-small   { transform: rotateY(180deg) translateZ(40px); }
        
        .cube-small.show-front { transform: rotateX(0deg) rotateY(0deg); }
        .cube-small.show-back { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};