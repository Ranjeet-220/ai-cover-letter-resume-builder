'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Check, Shield, Sliders } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (model: string, geminiKey: string, anthropicKey: string) => void;
}

export function ApiSettingsModal({ isOpen, onClose, onSave }: ApiSettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const model = localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite';
      const gKey = localStorage.getItem('covercraft_gemini_api_key') || '';
      const aKey = localStorage.getItem('covercraft_anthropic_api_key') || '';
      setSelectedModel(model);
      setGeminiKey(gKey);
      setAnthropicKey(aKey);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('covercraft_selected_model', selectedModel);
      localStorage.setItem('covercraft_gemini_api_key', geminiKey.trim());
      localStorage.setItem('covercraft_anthropic_api_key', anthropicKey.trim());
      window.dispatchEvent(new CustomEvent('covercraft-settings-change'));
    }
    setSavedSuccess(true);
    if (onSave) onSave(selectedModel, geminiKey.trim(), anthropicKey.trim());
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-black border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-black font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span className="gradient-text-animated">AI Engine &amp; Model Settings</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Select latest models and configure custom API keys for ultra-fast generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto min-h-0">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-white" />
              <span>Model & API Key preferences saved successfully!</span>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              Select Preferred AI Model
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Gemini 3.1 Flash Lite (High) */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-zinc-900 border-white shadow-lg'
                    : 'bg-black border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="model"
                    value="gemini-3.1-flash-lite"
                    checked={selectedModel === 'gemini-3.1-flash-lite'}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="accent-white"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-2">
                      Google Gemini 3.1 Flash Lite (High)
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-white text-black border border-white">
                        ⚡ Recommended 2026
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Sub-second response times, ultra-high accuracy, peak ATS formatting.
                    </p>
                  </div>
                </div>
              </label>

              {/* Gemini 3.1 Pro */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-zinc-900 border-white shadow-lg'
                    : 'bg-black border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="model"
                    value="gemini-3.1-pro-preview"
                    checked={selectedModel === 'gemini-3.1-pro-preview'}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="accent-white"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Google Gemini 3.1 Pro
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        🧠 Deep Reasoning
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Best for executive role alignment, multi-paragraph ATS tailoring.
                    </p>
                  </div>
                </div>
              </label>

              {/* Claude Sonnet 4 */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedModel === 'claude-sonnet-4-20250514'
                    ? 'bg-zinc-900 border-white shadow-lg'
                    : 'bg-black border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="model"
                    value="claude-sonnet-4-20250514"
                    checked={selectedModel === 'claude-sonnet-4-20250514'}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="accent-white"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Claude Sonnet 4
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        ✍️ Elite Prose
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Exceptional natural tone, highly tailored storytelling for senior jobs.
                    </p>
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* API Key Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-white" />
                  Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:underline"
                >
                  Get key →
                </a>
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-400" />
                  Anthropic Claude API Key (Optional)
                </span>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:underline"
                >
                  Get key →
                </a>
              </label>
              <input
                type="password"
                placeholder="sk-ant-api..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl gradient-btn font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" /> Save Model & API Key Preferences
          </button>
        </form>

        {/* Footer */}
        <div className="bg-zinc-950 p-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>API Keys are stored securely in your local browser storage only.</span>
        </div>

      </div>
    </div>
  );
}
