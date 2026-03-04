'use client';

import { useState, useEffect } from 'react';
import { Language, LANGUAGES, getBrowserLanguage, isRTL } from '@/lib/i18n';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  compact?: boolean;
}

export default function LanguageSelector({ currentLang, onLanguageChange, compact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-colors ${
          isOpen ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="text-sm">🌐</span>
        {!compact && (
          <>
            <span>{currentLanguage.native}</span>
            <span className="text-text-dim">▾</span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 z-50 bg-void/95 backdrop-blur-sm border border-border-subtle rounded-lg shadow-xl overflow-hidden min-w-[140px]">
            <div className="px-2 py-1.5 border-b border-border-subtle">
              <span className="text-[9px] text-text-dim font-mono">SELECT LANGUAGE</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] transition-colors ${
                    currentLang === lang.code 
                      ? 'bg-accent-cyan/20 text-accent-cyan' 
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                  style={{ direction: lang.rtl ? 'rtl' : 'ltr' }}
                >
                  <span className="font-medium">{lang.native}</span>
                  <span className="text-[9px] text-text-dim">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for managing language state
export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem('globalradar-lang') as Language;
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      setLanguage(stored);
    } else {
      // Fall back to browser language
      setLanguage(getBrowserLanguage());
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('globalradar-lang', lang);
    
    // Update document direction for RTL languages
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return { language, changeLanguage, isRTL: isRTL(language) };
}
