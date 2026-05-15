'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface AudioSummaryProps {
  text: string;
  className?: string;
}

export default function AudioSummary({ text, className = '' }: AudioSummaryProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError(true);
      return;
    }

    // If currently speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    setError(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setError(true);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking, isPaused]);

  // Load voices (they load asynchronously)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Don't render if browser doesn't support TTS
  if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          handleSpeak();
        }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer select-none ${
          isSpeaking
            ? 'bg-accent-green/20 text-accent-green animate-pulse'
            : 'bg-white/5 text-text-dim hover:text-white hover:bg-white/10'
        }`}
        title={isSpeaking ? 'Stop' : 'Read aloud'}
      >
        {isSpeaking ? (
          <>
            <span className="animate-pulse">🔊</span>
            <span>STOP</span>
          </>
        ) : (
          <>
            <span>🔈</span>
            <span>TTS</span>
          </>
        )}
      </span>

      {error && (
        <span className="text-[8px] text-accent-red" title="Text-to-speech not available">
          ⚠️
        </span>
      )}
    </span>
  );
}

// Hook for using TTS anywhere
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}
