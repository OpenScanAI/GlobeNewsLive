'use client';

import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface FullscreenToggleProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enterFullscreen = useCallback(async (element?: HTMLElement) => {
    const target = element || document.documentElement;
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen not supported:', e);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Exit fullscreen failed:', e);
    }
  }, []);

  const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
    if (document.fullscreenElement) {
      await exitFullscreen();
    } else {
      await enterFullscreen(element);
    }
  }, [enterFullscreen, exitFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}

export default function FullscreenToggle({ targetRef, className = '' }: FullscreenToggleProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleToggle = () => {
    const target = targetRef?.current || undefined;
    toggleFullscreen(target);
  };

  // Keyboard shortcut: 'F' to toggle fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        // Don't trigger if typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
        // Don't trigger if modifier keys are pressed
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
        isFullscreen
          ? 'bg-accent-green/20 text-accent-green border-accent-green/40'
          : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'
      } ${className}`}
      title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
    >
      {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
    </button>
  );
}
