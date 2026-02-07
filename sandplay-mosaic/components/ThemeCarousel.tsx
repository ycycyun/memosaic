import React, { useState } from 'react';
import { AssetTheme } from '../types';
import { THEMES } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DesertImg from '../assets/Desert.PNG';
import ForestImg from '../assets/Forest.PNG';
import SeaImg from '../assets/Sea.PNG';
import UrbanImg from '../assets/Urban.PNG';
import DesertBg from '../background/desert.mp4';
import ForestBg from '../background/forest.mp4';
import SeaBg from '../background/sea.mp4';
import UrbanBg from '../background/urban.mp4';

interface ThemeCarouselProps {
  onSelectTheme: (theme: AssetTheme) => void;
}

export const ThemeCarousel: React.FC<ThemeCarouselProps> = ({ onSelectTheme }) => {
  const [centerIndex, setCenterIndex] = useState(2); // Start with "Desert" (index 0) in the middle

  // Adjust to start with Desert theme
  const initialIndex = THEMES.findIndex(t => t.name === 'Desert');
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

  const getIcon = (themeName: string, isCenter: boolean = false) => {
    const sizeClass = isCenter ? 'w-36 h-36' : 'w-20 h-20';
    switch (themeName) {
      case 'Desert':
        return <img src={DesertImg} alt="Desert" className={`${sizeClass} object-contain rounded-3xl pointer-events-none`} />;
      case 'Forest':
        return <img src={ForestImg} alt="Forest" className={`${sizeClass} object-contain rounded-3xl pointer-events-none`} />;
      case 'Sea':
        return <img src={SeaImg} alt="Sea" className={`${sizeClass} object-contain rounded-3xl pointer-events-none`} />;
      case 'Urban':
        return <img src={UrbanImg} alt="Urban" className={`${sizeClass} object-contain rounded-3xl pointer-events-none`} />;
      default:
        return <img src={UrbanImg} alt="Urban" className={`${sizeClass} object-contain rounded-3xl pointer-events-none`} />;
    }
  };

  const getBackgroundVideo = (themeName: string) => {
    switch (themeName) {
      case 'Desert':
        return DesertBg;
      case 'Forest':
        return ForestBg;
      case 'Sea':
        return SeaBg;
      case 'Urban':
        return UrbanBg;
      default:
        return UrbanBg;
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center pt-20">
      {/* Background Video */}
      <video
        key={centerTheme.name}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
      >
        <source src={getBackgroundVideo(centerTheme.name)} type="video/mp4" />
      </video>

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
                {getIcon(leftTheme.name, false)}
              </div>
              <h3 className="text-lg serif font-semibold text-slate-700">{leftTheme.name}</h3>
            </div>

            {/* Center Theme - Main */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onSelectTheme(centerTheme.name as AssetTheme)}
                className="group relative"
              >
                <div className="w-40 h-40 rounded-3xl shadow-2xl flex items-center justify-center text-white transition-all hover:scale-105 transform" style={{ backgroundColor: centerTheme.accent }}>
                  {getIcon(centerTheme.name, true)}
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
                {getIcon(rightTheme.name, false)}
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
        <div className="flex justify-center gap-2 mt-4">
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
