'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Settings, 
  ChevronDown, 
  Cpu, 
  SlidersHorizontal,
  Check,
  Zap,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  activePreset?: string;
  onPresetChange?: (preset: string) => void;
  onOpenSettings?: () => void;
}

export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Fast & Smart', icon: Zap },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', badge: 'High Precision', icon: Bot },
];

export const QUICK_PRESETS = [
  { id: 'senior-dev', label: 'Senior Developer' },
  { id: 'product-mgr', label: 'Product Manager' },
  { id: 'data-scientist', label: 'Data Scientist' },
  { id: 'corporate', label: 'Corporate Executive' },
  { id: 'creative', label: 'Creative / General' },
];

export default function Navbar({
  selectedModel = 'gemini-2.5-flash',
  onModelChange,
  activePreset = 'senior-dev',
  onPresetChange,
  onOpenSettings,
}: NavbarProps) {
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [currentPreset, setCurrentPreset] = useState(activePreset);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  const handleModelSelect = (modelId: string) => {
    setCurrentModel(modelId);
    if (onModelChange) onModelChange(modelId);
    setIsModelDropdownOpen(false);
  };

  const handlePresetSelect = (presetId: string) => {
    setCurrentPreset(presetId);
    if (onPresetChange) onPresetChange(presetId);
    setIsPresetDropdownOpen(false);
  };

  const activeModelObj = AI_MODELS.find((m) => m.id === currentModel) || AI_MODELS[0];
  const activePresetObj = QUICK_PRESETS.find((p) => p.id === currentPreset) || QUICK_PRESETS[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md text-slate-100 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 group cursor-pointer">
            <Sparkles className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="gradient-text-animated">CoverCraft AI</span>
            </h1>
            <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 -mt-1 hidden sm:block">
              AI Cover Letter Generator
            </p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active Preset Quick Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsPresetDropdownOpen(!isPresetDropdownOpen);
                setIsModelDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition-all shadow-sm"
              aria-expanded={isPresetDropdownOpen}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline text-slate-400">Preset:</span>
              <span className="font-semibold text-slate-200">{activePresetObj.label}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isPresetDropdownOpen && "rotate-180")} />
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                  Select Quick Preset
                </div>
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors",
                      preset.id === currentPreset ? "text-indigo-400 font-medium bg-indigo-500/10" : "text-slate-300"
                    )}
                  >
                    <span>{preset.label}</span>
                    {preset.id === currentPreset && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Selector Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsModelDropdownOpen(!isModelDropdownOpen);
                setIsPresetDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/60 text-slate-200 transition-all shadow-sm group"
              aria-expanded={isModelDropdownOpen}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse" />
              <span>{activeModelObj.name}</span>
              <span className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeModelObj.badge}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isModelDropdownOpen && "rotate-180")} />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                  AI Model Engine
                </div>
                {AI_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = model.id === currentModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors",
                        isSelected ? "text-indigo-400 bg-indigo-500/10 font-medium" : "text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("w-4 h-4", isSelected ? "text-indigo-400" : "text-slate-400")} />
                        <div>
                          <div className="font-semibold text-slate-100">{model.name}</div>
                          <div className="text-[10px] text-slate-400">{model.badge}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title="Settings & API Keys"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
          </button>
        </div>

      </div>
    </header>
  );
}
