import React, { useState } from 'react';
import { AssetTheme } from '../types';
import { THEMES } from '../constants';
import { ChevronLeft, ChevronRight, Wind, Sparkles, Globe } from 'lucide-react';

interface ThemeCarouselProps {
  onSelectTheme: (theme: AssetTheme) => void;
}

export const ThemeCarousel: React.FC<ThemeCarouselProps> = ({ onSelectTheme }) => {
  const [centerIndex, setCenterIndex] = useState(2); // Start with "Sand" (index 3) in the middle, but let's use index 2 for "Deep Sea"

  // Adjust to start with Sand theme
  const initialIndex = THEMES.findIndex(t => t.name === 'Sand');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % THEMES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + THEMES.length) % THEMES.length);
  };

  const getThemeAt = (offset: number) => {
    return THEMES[(currentIndex + offset + THEMES.length) % THEMES.length];
  };

  const centerTheme = getThemeAt(0);
  const leftTheme = getThemeAt(-1);
  const rightTheme = getThemeAt(1);

  const getIcon = (themeName: string) => {
    switch (themeName) {
      case 'Forest':
        return <Wind className="w-8 h-8" />;
      case 'Deep Sea':
        return <Sparkles className="w-8 h-8" />;
      case 'Urban Solitude':
        return <Globe className="w-8 h-8" />;
      default:
        return <Globe className="w-8 h-8" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full">
      {/* Carousel Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-slate-700 transition-all hover:scale-110 flex-shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Carousel Content */}
          <div className="flex-1 flex items-center justify-center gap-4 px-4">
            {/* Left Preview */}
            <div className="flex flex-col items-center gap-3 opacity-40 scale-50 transform -translate-x-12">
              <div className="w-24 h-24 rounded-3xl shadow-lg flex items-center justify-center text-white" style={{ backgroundColor: leftTheme.accent }}>
                {getIcon(leftTheme.name)}
              </div>
              <h3 className="text-lg serif font-semibold text-slate-700">{leftTheme.name}</h3>
            </div>

            {/* Center Theme - Main */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <button
                onClick={() => onSelectTheme(centerTheme.name as AssetTheme)}
                className="group relative"
              >
                <div className="w-40 h-40 rounded-3xl shadow-2xl flex items-center justify-center text-white transition-all hover:scale-105 transform" style={{ backgroundColor: centerTheme.accent }}>
                  {getIcon(centerTheme.name)}
                </div>
              </button>
              <div className="text-center">
                <h3 className="text-3xl serif font-semibold text-slate-900">{centerTheme.name}</h3>
                <p className="text-slate-500 text-sm mt-2 italic">Click to begin</p>
              </div>
            </div>

            {/* Right Preview */}
            <div className="flex flex-col items-center gap-3 opacity-40 scale-50 transform translate-x-12">
              <div className="w-24 h-24 rounded-3xl shadow-lg flex items-center justify-center text-white" style={{ backgroundColor: rightTheme.accent }}>
                {getIcon(rightTheme.name)}
              </div>
              <h3 className="text-lg serif font-semibold text-slate-700">{rightTheme.name}</h3>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-slate-700 transition-all hover:scale-110 flex-shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {THEMES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-slate-900 w-8' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
