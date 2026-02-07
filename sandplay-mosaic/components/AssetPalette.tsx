
import React, { useState } from 'react';
import { CORE_ASSETS } from '../constants';
import { AssetTheme } from '../types';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { generateAssetImage } from '../services/geminiService';

interface AssetPaletteProps {
  theme: AssetTheme;
  onSelect: (asset: any) => void;
}

const AssetPalette: React.FC<AssetPaletteProps> = ({ theme, onSelect }) => {
  const [genQuery, setGenQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredAssets = CORE_ASSETS.filter(a => a.theme === theme);

  const handleGenerate = async () => {
    if (!genQuery.trim()) return;
    setIsGenerating(true);
    const imageUrl = await generateAssetImage(genQuery);
    if (imageUrl) {
      onSelect({
        name: genQuery,
        imageUrl: imageUrl,
        isGenerative: true
      });
      setGenQuery('');
    }
    setIsGenerating(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl w-72 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Core Assets</h3>
        <div className="grid grid-cols-4 gap-3">
          {filteredAssets.map((asset, i) => (
            <button
              key={i}
              onClick={() => onSelect(asset)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-200 transition-colors border border-slate-100 group"
              title={asset.name}
            >
              <div className="group-hover:scale-110 transition-transform">
                {asset.icon}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Manifest Custom
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={genQuery}
            onChange={(e) => setGenQuery(e.target.value)}
            placeholder="Type 'old clock'..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetPalette;
