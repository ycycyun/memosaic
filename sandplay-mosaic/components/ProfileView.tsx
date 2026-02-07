import React, { useEffect, useState } from 'react';
import { persistence } from '../services/persistenceService';
import { SavedSession } from '../types'; // Ensure this matches your file path
import { Sparkles, BookOpen } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-12 animate-in fade-in duration-1000 pb-20">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <BookOpen className="w-3 h-3" /> The Archive
        </div>
        <h2 className="text-5xl serif italic text-slate-900 mb-4">The Hall of Memories</h2>
        <p className="text-slate-500 max-w-xl mx-auto italic">
          Collected wisdom. Click a relic to revisit its essence.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
           <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 opacity-20" />
           </div>
           <p className="text-sm italic uppercase tracking-[0.2em]">No memories saved yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-24 py-10">
          {/* FIX: Added <SavedSession> generic here so TS knows what 'row' contains */}
          {chunkArray<SavedSession>(sessions, desktopChunkSize).map((row, rowIndex, allRows) => (
            <div 
              key={`shelf-row-${rowIndex}`} 
              className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 place-items-center"
            >
              {row.map((session, colIndex) => {
                const isSelected = selectedId === session.id;
                const delay = colIndex * 0.1; 
                
                return (
                  <div 
                    key={session.id} 
                    className="relative w-40 h-40 group cursor-pointer mb-8"
                    style={{ 
                      perspective: '1000px',
                      zIndex: isSelected ? 50 : 1
                    }}
                    onClick={() => handleCubeClick(session.id)}
                  >
                    {/* Wrapper */}
                    <div 
                      className={`w-full h-full transition-transform duration-700 ease-in-out ${isSelected ? 'scale-110' : ''}`}
                      style={{ transitionDelay: `${delay}s` }}
                    >
                      {/* Cube */}
                      <div 
                        className={`cube relative w-full h-full transform-style-3d transition-transform duration-500 ${isSelected ? 'show-back' : 'show-front'}`}
                        style={{ transitionDelay: `${delay}s` }}
                      >
                        {/* Front: Icon/Mood */}
                        <div className="cube-face cube-front flex flex-col items-center justify-center border border-white/20 shadow-inner"
                             style={{ backgroundColor: session.accent }}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                          <Sparkles className="w-8 h-8 text-white drop-shadow-md relative z-10" />
                          <div className="mt-2 text-white/90 text-[10px] font-bold uppercase tracking-widest relative z-10">
                             {session.mood}
                          </div>
                        </div>

                        {/* Back: Image/Content */}
                        <div className="cube-face cube-back bg-white border border-slate-200 flex flex-col items-center justify-center p-2 overflow-hidden">
                           <div className="w-full h-full bg-slate-50 rounded-lg overflow-hidden relative">
                              {session.talismanImageUrl ? (
                                <img 
                                    src={session.talismanImageUrl} 
                                    alt="Talisman" 
                                    className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-gray-300"/>
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2 text-center">
                                <p className="text-[9px] font-bold text-slate-800 line-clamp-1">{session.talismanName}</p>
                                <p className="text-[8px] text-slate-500">{session.date}</p>
                              </div>
                           </div>
                        </div>

                        {/* Sides */}
                        <div className="cube-face cube-right" style={{ backgroundColor: session.accent, filter: 'brightness(0.9)' }} />
                        <div className="cube-face cube-left" style={{ backgroundColor: session.accent, filter: 'brightness(0.9)' }} />
                        <div className="cube-face cube-top" style={{ backgroundColor: session.accent, filter: 'brightness(1.1)' }} />
                        <div className="cube-face cube-bottom" style={{ backgroundColor: session.accent, filter: 'brightness(0.8)' }} />
                      
                      </div>
                    </div>

                    {/* Shadow */}
                    <div 
                      className={`absolute -bottom-16 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 blur-xl rounded-[100%] transition-all duration-700 ${isSelected ? 'scale-150 opacity-20' : 'opacity-10'}`}
                      style={{ transitionDelay: `${delay}s` }}
                    />
                  </div>
                );
              })}
              {/* Shelf line */}
              {rowIndex < allRows.length - 1 && (
                <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[80%] h-px bg-slate-300/60 shadow-md" />
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .transform-style-3d { transform-style: preserve-3d; }
        .cube-face {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 24px;
          backface-visibility: hidden;
        }
        .cube-front  { transform: rotateY(  0deg) translateZ(80px); }
        .cube-right  { transform: rotateY( 90deg) translateZ(80px); }
        .cube-back   { transform: rotateY(180deg) translateZ(80px); }
        .cube-left   { transform: rotateY(-90deg) translateZ(80px); }
        .cube-top    { transform: rotateX( 90deg) translateZ(80px); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(80px); }

        .cube.show-front { transform: rotateX(0deg) rotateY(0deg); }
        .cube.show-back { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};