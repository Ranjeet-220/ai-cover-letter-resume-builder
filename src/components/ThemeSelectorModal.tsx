'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  ThemeMode,
  AccentPreset,
  ACCENT_PRESETS,
  getStoredThemeMode,
  getStoredAccentPreset,
  saveThemeMode,
  saveAccentPreset,
} from '../lib/theme';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState<AccentPreset>('monochrome');

  useEffect(() => {
    if (isOpen) {
      setMode(getStoredThemeMode());
      setAccent(getStoredAccentPreset());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectMode = (newMode: ThemeMode) => {
    setMode(newMode);
    saveThemeMode(newMode);
  };

  const handleSelectAccent = (newAccent: AccentPreset) => {
    setAccent(newAccent);
    saveAccentPreset(newAccent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white z-10 animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white text-black font-bold shadow-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
                <span className="gradient-text-animated">Visual Aesthetics &amp; Customization</span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  LIVE STUDIO THEME
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize your workspace mode and accent color highlights.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer"
            aria-label="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Light / Dark Mode Toggle */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-zinc-300" /> Interface Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSelectMode('dark')}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  mode === 'dark'
                    ? 'bg-zinc-900 border-white ring-1 ring-white shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black border border-zinc-700 text-white">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Dark Mode</div>
                    <div className="text-[11px] text-zinc-400">Obsidian high-contrast dark</div>
                  </div>
                </div>
                {mode === 'dark' && (
                  <span className="p-1 rounded-full bg-white text-black">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('light')}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  mode === 'light'
                    ? 'bg-zinc-100 border-zinc-900 ring-1 ring-zinc-900 text-zinc-900 shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-zinc-300 text-zinc-900">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${mode === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                      Light Mode
                    </div>
                    <div className={mode === 'light' ? 'text-zinc-600 text-[11px]' : 'text-zinc-400 text-[11px]'}>
                      Crisp daytime paper mode
                    </div>
                  </div>
                </div>
                {mode === 'light' && (
                  <span className="p-1 rounded-full bg-zinc-900 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Accent Theme Presets */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-300" /> Accent Color Presets
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accent === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectAccent(preset.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-white ring-1 ring-white shadow-xl scale-[1.01]'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-md inline-block"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span className="text-sm font-bold text-white">{preset.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        {preset.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mb-3">{preset.description}</p>

                    {/* Color Swatch Bar */}
                    <div className="w-full h-2.5 rounded-full overflow-hidden bg-zinc-950 flex border border-zinc-800">
                      <div
                        className="h-full flex-1"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className="h-full flex-1 opacity-70"
                        style={{ backgroundColor: preset.borderHex }}
                      />
                      <div
                        className="h-full flex-1 opacity-40"
                        style={{ backgroundColor: preset.bgHex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Theme settings automatically sync to your browser preference.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl gradient-btn font-extrabold transition shadow-md cursor-pointer"
          >
            Apply & Done
          </button>
        </div>

      </div>
    </div>
  );
}
