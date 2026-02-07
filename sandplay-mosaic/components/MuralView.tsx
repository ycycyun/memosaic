
import React, { useState } from 'react';
import { MuralShard } from '../types';
import { Sparkles, Calendar } from 'lucide-react';

interface MuralViewProps {
  shards: MuralShard[];
}

const MuralView: React.FC<MuralViewProps> = ({ shards }) => {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const toggleFlip = (id: string) => {
    const next = new Set(flippedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFlippedIds(next);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-12 animate-in fade-in duration-1000 pb-20">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Calendar className="w-3 h-3" /> The Daily Talisman Collection
        </div>
        <h2 className="text-5xl serif italic text-slate-900 mb-4">A Mosaic of Days</h2>
        <p className="text-slate-500 max-w-xl mx-auto italic">
          Every session is distilled into a single sacred object. 
          The color reflects your initial mood; the flip reveals your inner relic.
        </p>
      </div>

      {/* Changed from grid to flex with justify-center to handle single and multiple items gracefully */}
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {shards.map((shard) => (
          <div 
            key={shard.id} 
            className="group perspective-1000 aspect-square cursor-pointer w-full sm:w-64 md:w-72"
            onClick={() => toggleFlip(shard.id)}
          >
            <div className={`relative w-full h-full transition-transform duration-1000 preserve-3d shadow-xl rounded-3xl ${flippedIds.has(shard.id) ? 'rotate-y-180' : ''}`}>
              
              {/* Front Side: Pure Mood Color */}
              <div 
                className="absolute inset-0 backface-hidden rounded-3xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: shard.accent }}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
                <div className="relative opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2 text-white text-xs font-bold tracking-widest uppercase">
                    Reveal Spirit <Sparkles className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Back Side: The AI Talisman */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
                <div className="w-full aspect-square relative mb-6">
                  {shard.itemImageUrl ? (
                    <img 
                      src={shard.itemImageUrl} 
                      alt={shard.itemName} 
                      className="w-full h-full object-contain drop-shadow-2xl animate-in zoom-in-75 duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />
                  )}
                </div>
                <h3 className="text-xl serif italic text-slate-800 leading-tight mb-2">
                  {shard.itemName}
                </h3>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] border-t border-slate-100 pt-3 w-full">
                  {shard.date} • {shard.mood}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default MuralView;
