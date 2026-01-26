import { useGameStore } from '@/store/useGameStore';
import { useCallback, useEffect } from 'react';

// Define available sound types
export type SoundType = 'click' | 'success' | 'error' | 'toggle' | 'hover';

// Map types to file paths
// Since we don't have actual files, we'll use empty strings or placeholders for now.
// In a real app, these would be: '/sounds/click.mp3', etc.
// For now, I'll use a data URI for a simple click to demonstrate functionality if possible, 
// or just standard paths assuming the user will add them.
// Given the prompt "Ensure file volume optimized", I will assume files SHOULD exist at public/sounds/
const SOUND_FILES: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  toggle: '/sounds/toggle.mp3',
  hover: '/sounds/hover.mp3',
};

// Singleton cache for audio buffers to avoid reloading
const audioCache: Record<string, HTMLAudioElement> = {};

export const useSound = () => {
  const { sound } = useGameStore();
  
  // Preload sounds on mount
  useEffect(() => {
    Object.values(SOUND_FILES).forEach(path => {
      if (!audioCache[path]) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audioCache[path] = audio;
      }
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!sound.enabled) return;

    const path = SOUND_FILES[type];
    const audio = audioCache[path] || new Audio(path);
    
    // Reset time to allow rapid replaying
    audio.currentTime = 0;
    audio.volume = sound.volume;
    
    // Play and catch errors (e.g., if file doesn't exist or user didn't interact yet)
    audio.play().catch(e => {
      // Ignore abort errors or missing files to prevent console spam
      if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
        console.warn(`Failed to play sound: ${type}`, e);
      }
    });
    
    // Cache if not cached
    if (!audioCache[path]) {
      audioCache[path] = audio;
    }
  }, [sound.enabled, sound.volume]);

  return { play };
};

// Helper for non-hook usage (e.g., in utils) if needed, though hook is preferred for reactivity
export const playSoundEffect = (type: SoundType, volume = 0.5) => {
  try {
    const path = SOUND_FILES[type];
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (e) {
    // ignore
  }
};
