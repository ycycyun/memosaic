import React, { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';

// Note: Ensure your '../types' file exists or replace MuralShard with 'any' for testing
// import { MuralShard } from '../types'; 

interface MuralViewProps {
  shards: any[]; // Changed to any for standalone compatibility
}

const MuralView: React.FC<MuralViewProps> = ({ shards }) => {
  const [revealedMap, setRevealedMap] = useState<{ [key: string]: boolean }>({});

  const toggleReveal = (id: string) => {
    setRevealedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full flex flex-col gap-16 animate-in fade-in duration-1000 pb-20 bg-slate-50/50">
      {/* Header Section */}
      <div className="text-center pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Calendar className="w-3 h-3" /> The Daily Talisman Collection
        </div>
        <h2 className="text-5xl serif italic text-slate-900 mb-4">A Mosaic of Days</h2>
        <p className="text-slate-500 max-w-2xl mx-auto italic">
          Every session is distilled into a single sacred object. 
          The color reflects your initial mood; click the cube to reveal your inner relic.
        </p>
      </div>

      {/* Real Storage Shelf Layout */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div 
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e6e3 100%)',
            borderRadius: '12px',
            padding: '80px 40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {Array.from({ length: Math.ceil(shards.length / 4) }).map((_, shelfIndex) => (
            <div key={shelfIndex} className="relative mb-40 last:mb-12">
              {/* Shelf ledge with 3D depth */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #d1ccc7 0%, #b8aca3 100%)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)'
                }}
              />

              {/* Cubes Grid */}
              <div className="flex flex-wrap justify-center gap-16 px-4 pb-12 relative z-10">
                {shards.slice(shelfIndex * 4, (shelfIndex + 1) * 4).map((shard, i) => {
                  const isRevealed = revealedMap[shard.id] || false;
                  
                  return (
                    <div 
                      key={shard.id}
                      className="group cursor-pointer relative"
                      onClick={() => toggleReveal(shard.id)}
                      style={{
                        width: '200px',
                        height: '200px',
                        // The Magic: Staggered floating animation
                        animation: isRevealed ? 'none' : `float 5s infinite ease-in-out ${i * 0.4}s`
                      }}
                    >
                      {isRevealed ? (
                        /* REVEALED STATE - 3D Box opening */
                        <div className="w-full h-full relative" style={{ perspective: '1500px' }}>
                          <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            transformStyle: 'preserve-3d'
                          }}>
                            {/* Box bottom */}
                            <div style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              backgroundColor: shard.accent,
                              borderRadius: '0 0 24px 24px',
                              opacity: 0.6,
                              bottom: 0,
                              left: 0,
                              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)'
                            }} />

                            {/* Box lid */}
                            <div style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              backgroundColor: shard.accent,
                              borderRadius: '24px 24px 0 0',
                              left: 0,
                              top: 0,
                              animation: 'box-lid-open-3d 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                              transformOrigin: 'center bottom',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }} />
                          </div>

                          {/* Content pop out */}
                          <div 
                            className="absolute inset-[-20px] bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl z-20"
                            style={{
                              animation: 'content-pop-out 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                            }}
                          >
                            <div className="w-full aspect-square relative mb-4">
                              {shard.itemImageUrl ? (
                                <img src={shard.itemImageUrl} alt={shard.itemName} className="w-full h-full object-contain drop-shadow-xl" />
                              ) : (
                                <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />
                              )}
                            </div>
                            <h3 className="text-lg serif italic text-slate-800 leading-tight mb-1">{shard.itemName}</h3>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-2 w-full">
                              {shard.date}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* UNREVEALED STATE - Floating 3D Cube */
                        <div className="w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
                          <div className="relative w-32 h-32 transition-transform duration-500 group-hover:scale-110" 
                               style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(25deg)' }}>
                            
                            {/* Standard 6 sides of the Cube */}
                            {[
                              { transform: 'translateZ(64px)', opacity: 1 }, // Front
                              { transform: 'translateZ(-64px) rotateY(180deg)', opacity: 0.9 }, // Back
                              { transform: 'rotateY(90deg) translateZ(64px)', opacity: 0.85 }, // Right
                              { transform: 'rotateY(-90deg) translateZ(64px)', opacity: 0.85 }, // Left
                              { transform: 'rotateX(90deg) translateZ(64px)', opacity: 0.8 }, // Top
                              { transform: 'rotateX(-90deg) translateZ(64px)', opacity: 0.8 } // Bottom
                            ].map((side, index) => (
                              <div
                                key={index}
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: shard.accent,
                                  borderRadius: '16px',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backfaceVisibility: 'hidden',
                                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                                  ...side
                                }}
                              >
                                {index === 0 && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <Sparkles className="text-white w-6 h-6" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-35px) rotate(2deg); 
          }
        }

        @keyframes box-lid-open-3d {
          0% { transform: rotateX(0deg); opacity: 1; }
          100% { transform: rotateX(-110deg); opacity: 0.2; }
        }

        @keyframes content-pop-out {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .serif {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
      `}</style>
    </div>
  );
};

export default MuralView;