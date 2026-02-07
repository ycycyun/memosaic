
import React, { useState } from 'react';
import { AppState, AssetTheme, SandboxObject, Reframe, MuralShard, User } from './types';
import { THEMES } from './constants';
import AssetPalette from './components/AssetPalette';
import IsometricSandbox from './components/IsometricSandbox';
import MuralView from './components/MuralView';
import { ProfileView } from './components/ProfileView'; // Confirmed named import is correct
import Auth from './components/Auth';
import { ThemeCarousel } from './components/ThemeCarousel';
import DesertSandTrayBackground from './components/DesertSandTrayBackground';
import ForestSandTrayBackground from './components/ForestSandTrayBackground';
import SeaSandTrayBackground from './components/SeaSandTrayBackground';
import UrbanSandTrayBackground from './components/UrbanSandTrayBackground';
import { persistence } from './services/persistenceService';
import { generateReframes, generateSummaryItem } from './services/geminiService';
import { ChevronRight, Globe, Layers, Sparkles, Wind, ArrowLeft, Loader2, Bookmark, BookOpen, AlertCircle, AlertTriangle, LogOut } from 'lucide-react';
// @ts-ignore
import mosandLogo from './assets/mosand_logo_v2.svg';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [gameState, setGameState] = useState<AppState>(AppState.GROUNDING);
  const [selectedTheme, setSelectedTheme] = useState<AssetTheme>('Forest');
  const [objects, setObjects] = useState<SandboxObject[]>([]);
  const [pendingAsset, setPendingAsset] = useState<any>(null);
  const [reframes, setReframes] = useState<Reframe[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [muralShards, setMuralShards] = useState<MuralShard[]>([]);
  const [isShattering, setIsShattering] = useState(false);
  const [isGeneratingTalisman, setIsGeneratingTalisman] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Persistence State tracking
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'PROFILE' | 'RESTART' | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setGameState(AppState.GROUNDING);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameState(AppState.GROUNDING);
    // Reset other states
    setObjects([]);
    setReframes([]);
    setMuralShards([]);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const handleStart = (theme: AssetTheme) => {
    // Completely reset session state when starting a new flow
    setObjects([]);
    setReframes([]);
    setMuralShards([]);
    setGenError(null);
    setIsSessionSaved(false);
    setIsAnalyzing(false);
    setIsShattering(false);
    setIsGeneratingTalisman(false);
    setPendingAsset(null);

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

  // New handler for updating object positions
  const handleUpdateObject = (id: string, x: number, y: number) => {
    setObjects(prevObjects => 
      prevObjects.map(obj => 
        obj.id === id ? { ...obj, x, y } : obj
      )
    );
  };

  // New handler for deleting objects
  const handleDeleteObject = (id: string) => {
    setObjects(prevObjects => prevObjects.filter(obj => obj.id !== id));
  };

  const handleFinish = async () => {
    if (objects.length === 0) return;
    setIsAnalyzing(true);
    setGameState(AppState.REFLECTING);
    try {
      const results = await generateReframes(objects, selectedTheme);
      setReframes(results);
    } catch (err) {
      console.error("Reflection generation failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRelease = async () => {
    setGenError(null);
    setIsGeneratingTalisman(true);
    setIsShattering(true);
    setIsSessionSaved(false); // Reset saved state for new session

    try {
      const { name, imageUrl, accent, mood } = await generateSummaryItem(objects, selectedTheme);
      const themeData = THEMES.find(t => t.name === selectedTheme)!;
      
      const newMuralEntry: MuralShard = {
        id: `talisman-${Date.now()}`,
        color: themeData.color,
        accent: accent, // Use analyzed emotion color
        itemName: name,
        itemImageUrl: imageUrl,
        mood: mood,     // Use analyzed emotion name
        date: new Date().toLocaleDateString()
      };

      setMuralShards([newMuralEntry]);
      
      setTimeout(() => {
        setGameState(AppState.COMMUNITY);
        setIsShattering(false);
        setIsGeneratingTalisman(false);
      }, 1500);
    } catch (error) {
      console.error("Talisman generation failed", error);
      setGenError("The spirit of the day is playing hide and seek. Please try again in a moment.");
      setIsShattering(false);
      setIsGeneratingTalisman(false);
    }
  };

  const executeSave = () => {
    if (muralShards.length === 0 || !currentUser) return;
    setIsSaving(true);
    const shard = muralShards[0];
    
    persistence.saveSession({
      userId: currentUser.id,
      talismanName: shard.itemName,
      talismanImageUrl: shard.itemImageUrl || '',
      mood: shard.mood,
      date: shard.date,
      accent: shard.accent,
      objects: objects
    });
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      setIsSessionSaved(true);
    }, 600);
  };

  // --- Navigation & Protection Logic ---

  const requestNavigation = (destination: 'PROFILE' | 'RESTART') => {
    // Only check for unsaved changes if we are on the result screen (COMMUNITY)
    // and haven't saved yet.
    if (gameState === AppState.COMMUNITY && !isSessionSaved) {
      setPendingNavigation(destination);
      setShowSaveWarning(true);
    } else {
      executeNavigation(destination);
    }
  };

  const executeNavigation = (destination: 'PROFILE' | 'RESTART') => {
    if (destination === 'PROFILE') {
      setGameState(AppState.PROFILE);
    } else if (destination === 'RESTART') {
      // Clean up even though handleStart will do it too, good to be explicit here
      setObjects([]);
      setReframes([]);
      setMuralShards([]);
      setGenError(null);
      setGameState(AppState.GROUNDING);
    }
  };

  const handleConfirmDiscard = () => {
    setShowSaveWarning(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleConfirmSaveAndNavigate = () => {
    executeSave();
    // Wait a bit for the save simulation then navigate
    setTimeout(() => {
      setShowSaveWarning(false);
      if (pendingNavigation) {
        executeNavigation(pendingNavigation);
        setPendingNavigation(null);
      }
    }, 800);
  };

  const handleCancelNavigation = () => {
    setShowSaveWarning(false);
    setPendingNavigation(null);
  };

  const currentThemeData = THEMES.find(t => t.name === selectedTheme);
  const useThemeSandTrayBg = gameState === AppState.BUILDING;
  const rootBg =
    gameState === AppState.BUILDING
      ? 'transparent'
      : gameState === AppState.GROUNDING
        ? 'transparent'
        : '#ffffff';

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-1000 relative" style={{ backgroundColor: rootBg }}>
      {useThemeSandTrayBg && selectedTheme === 'Desert' && <DesertSandTrayBackground />}
      {useThemeSandTrayBg && selectedTheme === 'Forest' && <ForestSandTrayBackground />}
      {useThemeSandTrayBg && selectedTheme === 'Sea' && <SeaSandTrayBackground />}
      {useThemeSandTrayBg && selectedTheme === 'Urban' && <UrbanSandTrayBackground />}
      
      <header className="px-8 py-6 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-white/40 sticky top-0 z-50">
        <button 
          onClick={() => requestNavigation('RESTART')} 
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02] focus:outline-none"
          aria-label="Return to Home"
        >
          <img src={mosandLogo} alt="MoSand" className="h-9 w-auto object-contain drop-shadow-sm" />
        </button>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => requestNavigation('PROFILE')} 
            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${gameState === AppState.PROFILE ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BookOpen className="w-4 h-4" /> {currentUser.username}
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#B8C6E6] hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full relative">

        {/* --- Unsaved Changes Modal --- */}
        {showSaveWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 transform transition-all scale-100">
              <div className="flex items-center gap-4 mb-4 text-amber-500">
                <div className="p-3 bg-amber-50 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl serif font-bold text-slate-800">Unsaved Memory</h3>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                You haven't saved this talisman to your journal yet. 
                Leaving now means this specific reflection will be lost forever.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmSaveAndNavigate}
                  disabled={isSaving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                   Save & Continue
                </button>
                <button 
                  onClick={handleConfirmDiscard}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors"
                >
                  Discard & Leave
                </button>
                <button 
                  onClick={handleCancelNavigation}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === AppState.PROFILE && (
          <div className="flex flex-col gap-12">
            <div className="flex justify-start">
              <button onClick={() => setGameState(AppState.GROUNDING)} className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-4 h-4" /> Pick Theme
              </button>
            </div>
            <ProfileView onPickTheme={() => setGameState(AppState.GROUNDING)} onReturnToSandbox={() => setGameState(AppState.BUILDING)} username={currentUser.username} />
          </div>
        )}

        {gameState === AppState.GROUNDING && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full bg-transparent">
            <span className="text-slate-500 uppercase tracking-widest text-xs font-semibold mb-4">Phase I: Grounding</span>
            <h2 className="text-5xl serif italic text-slate-900 mb-6">Choose your atmosphere, {currentUser.username}.</h2>
            <p className="text-slate-600 text-lg mb-12 leading-relaxed italic">
              Select a mood to begin your internal architecture.
            </p>
            <ThemeCarousel onSelectTheme={handleStart} />
          </div>
        )}

        {gameState === AppState.BUILDING && (
          <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
            <div className="flex flex-col gap-4">
              <AssetPalette theme={selectedTheme} onSelect={(asset) => setPendingAsset(asset)} />
              <button onClick={handleFinish} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                Finish Scene
              </button>
              <button onClick={() => setObjects([])} className="w-full bg-white/50 border border-slate-200 text-slate-500 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">
                Clear Scene
              </button>
            </div>
            <div className="flex-1 w-full flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl serif italic text-slate-800">The Sandbox</h2>
                  <p className="text-slate-500 text-sm mt-1 italic">
                    {pendingAsset ? `Holding: ${pendingAsset.name}` : 'Design your sandbox world.'}
                  </p>
                </div>
              </div>
              <IsometricSandbox
                objects={objects}
                onDrop={onDrop}
                onUpdateObject={handleUpdateObject}
                onDeleteObject={handleDeleteObject}
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
              <p className="text-slate-600 max-w-xl mx-auto italic">How should we reflect on this moment?</p>
              {genError && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl inline-flex items-center gap-3 text-sm italic animate-in slide-in-from-top-4">
                  <AlertCircle className="w-4 h-4" /> {genError}
                </div>
              )}
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
                  <div key={i} className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-slate-100 shadow-xl hover:-translate-y-1 transition-all flex flex-col">
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
                      Create Talisman
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
          <div className="flex flex-col gap-10">
            <MuralView shards={muralShards} />
            <div className="flex flex-col items-center gap-6 pb-20">
              <button 
                onClick={executeSave}
                disabled={isSaving || isSessionSaved}
                className={`group flex items-center gap-4 bg-white px-10 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all ${!isSessionSaved ? 'hover:-translate-y-1' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${isSessionSaved ? 'bg-green-500' : 'bg-indigo-500 group-hover:scale-110'}`}>
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {isSessionSaved ? 'Memory Secured' : 'Preserve this Moment'}
                  </p>
                  <p className="text-lg serif italic text-slate-800">
                    {isSessionSaved ? 'Saved to Journal' : 'Save to My Journal'}
                  </p>
                </div>
              </button>
              
              <button 
                onClick={() => requestNavigation('RESTART')} 
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
              >
                Start A New
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 px-8 text-center opacity-40">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
          Mosand • Distilled Sessions • TartanHacks 2026
        </p>
      </footer>
    </div>
  );
};

export default App;