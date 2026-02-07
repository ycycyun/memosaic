
import React, { useState, useEffect } from 'react';
import { AppState, AssetTheme, SandboxObject, Reframe, MuralShard } from './types';
import { THEMES, CORE_ASSETS } from './constants';
import AssetPalette from './components/AssetPalette';
import IsometricSandbox from './components/IsometricSandbox';
import MuralView from './components/MuralView';
import { generateReframes, generateSummaryItem } from './services/geminiService';
import { Eraser, ChevronRight, Globe, Layers, Sparkles, Wind, ArrowLeft, Loader2, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<AppState>(AppState.GROUNDING);
  const [selectedTheme, setSelectedTheme] = useState<AssetTheme>('Forest');
  const [objects, setObjects] = useState<SandboxObject[]>([]);
  const [pendingAsset, setPendingAsset] = useState<any>(null);
  const [reframes, setReframes] = useState<Reframe[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [muralShards, setMuralShards] = useState<MuralShard[]>([]);
  const [isShattering, setIsShattering] = useState(false);
  const [isGeneratingTalisman, setIsGeneratingTalisman] = useState(false);

  // We no longer seed with placeholder data to ensure only the user's authentic AI talismans appear.
  useEffect(() => {
    setMuralShards([]);
  }, []);

  const handleStart = (theme: AssetTheme) => {
    setSelectedTheme(theme);
    setGameState(AppState.BUILDING);
  };

  const onDrop = (x: number, y: number) => {
    if (!pendingAsset) return;
    const newObj: SandboxObject = {
      id: Date.now().toString(),
      type: pendingAsset.name,
      name: pendingAsset.name,
      x,
      y,
      icon: pendingAsset.icon,
      imageUrl: pendingAsset.imageUrl,
      isGenerative: pendingAsset.isGenerative
    };
    setObjects([...objects, newObj]);
    setPendingAsset(null);
  };

  const handleFinish = async () => {
    if (objects.length === 0) return;
    setIsAnalyzing(true);
    setGameState(AppState.REFLECTING);
    const results = await generateReframes(objects, selectedTheme);
    setReframes(results);
    setIsAnalyzing(false);
  };

  const handleRelease = async () => {
    setIsGeneratingTalisman(true);
    setIsShattering(true);

    try {
      const { name, imageUrl } = await generateSummaryItem(objects, selectedTheme);
      const themeData = THEMES.find(t => t.name === selectedTheme)!;
      
      const newMuralEntry: MuralShard = {
        id: `talisman-${Date.now()}`,
        color: themeData.color,
        accent: themeData.accent,
        itemName: name,
        itemImageUrl: imageUrl,
        mood: selectedTheme,
        date: 'Today'
      };

      setMuralShards(prev => [newMuralEntry, ...prev]);
      
      // Delay slightly for visual effect
      setTimeout(() => {
        setGameState(AppState.COMMUNITY);
        setIsShattering(false);
        setIsGeneratingTalisman(false);
      }, 1000);
    } catch (error) {
      console.error("Talisman generation failed", error);
      setIsShattering(false);
      setIsGeneratingTalisman(false);
    }
  };

  const handleRestart = () => {
    setObjects([]);
    setReframes([]);
    setGameState(AppState.GROUNDING);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-1000" style={{ backgroundColor: THEMES.find(t => t.name === selectedTheme)?.color }}>
      
      <header className="px-8 py-6 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-white/40 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-white">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sandplay Mosaic</h1>
        </div>
        <div className="flex items-center gap-6">
          {gameState === AppState.BUILDING && (
            <div className="flex gap-4">
              <button onClick={() => setObjects([])} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors">
                <Eraser className="w-4 h-4" /> Reset
              </button>
              <button onClick={handleFinish} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg">
                I'm Finished
              </button>
            </div>
          )}
          {gameState === AppState.COMMUNITY && (
             <button onClick={handleRestart} className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-4 h-4" /> Start Anew
             </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full">
        {gameState === AppState.GROUNDING && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            <span className="text-slate-500 uppercase tracking-widest text-xs font-semibold mb-4">Phase I: Grounding</span>
            <h2 className="text-5xl serif italic text-slate-900 mb-6">Choose your atmosphere.</h2>
            <p className="text-slate-600 text-lg mb-12 leading-relaxed italic">
              "Select a mood to begin your internal architecture."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleStart(t.name as AssetTheme)}
                  className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl mb-6 transition-transform group-hover:scale-110 flex items-center justify-center text-white" style={{ backgroundColor: t.accent }}>
                    {t.name === 'Forest' ? <Wind /> : t.name === 'Deep Sea' ? <Sparkles /> : t.name === 'Sand' ? <Sun /> : <Globe />}
                  </div>
                  <h3 className="text-2xl serif font-semibold text-slate-800 mb-2">{t.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    Enter Space <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === AppState.BUILDING && (
          <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
            <AssetPalette theme={selectedTheme} onSelect={(asset) => setPendingAsset(asset)} />
            <div className="flex-1 w-full flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl serif italic text-slate-800">The Sandbox</h2>
                  <p className="text-slate-500 text-sm mt-1 italic">
                    {pendingAsset ? `Holding: ${pendingAsset.name}` : 'Construct your ephemeral world.'}
                  </p>
                </div>
              </div>
              <IsometricSandbox
                objects={objects}
                onDrop={onDrop}
                activeThemeColor={THEMES.find(t => t.name === selectedTheme)?.accent || '#000'}
                activeThemeBaseColor={THEMES.find(t => t.name === selectedTheme)?.color || '#fff'}
                activeThemeName={selectedTheme}
              />
            </div>
          </div>
        )}

        {gameState === AppState.REFLECTING && (
          <div className="flex-1 flex flex-col gap-12">
            <div className="text-center">
              <h2 className="text-4xl serif italic text-slate-900 mb-4">Reflections</h2>
              <p className="text-slate-600 max-w-xl mx-auto italic">How shall we distill this moment?</p>
            </div>
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-2 border-slate-200 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-slate-800 rounded-full animate-spin" />
                </div>
                <p className="text-slate-400 font-bold tracking-[0.3em] text-[10px] uppercase">Deciphering Layout...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reframes.map((r, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                        {r.type === 'Mirror' ? <Wind className="w-5 h-5" /> : r.type === 'Architect' ? <Layers className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{r.type}</span>
                    </div>
                    <h3 className="text-2xl serif mb-4 text-slate-800">{r.title}</h3>
                    <p className="text-slate-500 leading-relaxed italic mb-10 flex-1">"{r.content}"</p>
                    <button 
                      onClick={handleRelease} 
                      disabled={isGeneratingTalisman}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                    >
                      {isGeneratingTalisman ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Manifest Talisman
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isShattering && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-1000">
             <div className="relative">
                <div className="w-24 h-24 border-2 border-slate-100 rounded-full animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-800 animate-pulse" />
                </div>
             </div>
            <h2 className="text-2xl serif italic text-slate-800 mt-12">Distilling your session into a single relic...</h2>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">The AI is weaving the mosaic's next shard</p>
          </div>
        )}

        {gameState === AppState.COMMUNITY && !isShattering && (
          <MuralView shards={muralShards} />
        )}
      </main>

      <footer className="py-8 px-8 text-center opacity-40">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
          Sandplay Mosaic • Distilled Sessions • TartanHacks 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
