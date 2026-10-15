import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'pill' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, currentLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'pill') {
    return (
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:text-white"
          title="Sprache wählen / Select language"
          aria-expanded={isOpen}
        >
          <span className="text-sm leading-none" role="img" aria-label={currentLanguageInfo.name}>
            {currentLanguageInfo.flag}
          </span>
          <span className="font-semibold text-stone-100">{currentLanguageInfo.nativeName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-stone-900 border border-stone-700/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
            <div className="px-3 py-1.5 border-b border-stone-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-amber-400" />
                <span>Sprache / Language</span>
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                {SUPPORTED_LANGUAGES.length}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto py-1 divide-y divide-stone-800/40">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/60 text-amber-300 font-semibold'
                        : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div>
                        <div className="text-xs leading-snug">{lang.nativeName}</div>
                        <div className="text-[10px] text-stone-400">{lang.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header and Compact variants
  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
        title="Sprachauswahl / Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentLanguageInfo.name}>
          {currentLanguageInfo.flag}
        </span>
        <span className="font-semibold text-stone-800 uppercase tracking-wide">
          {currentLanguageInfo.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span>Sprachauswahl</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">10 Sprachen</span>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <div className="text-xs leading-snug">{lang.nativeName}</div>
                      <div className="text-[10px] text-stone-400">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
