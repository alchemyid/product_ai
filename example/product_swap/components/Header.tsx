import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SwapStudio AI</h1>
            <p className="text-xs text-slate-400">Marketing Asset Generator</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-900/20 px-3 py-1.5 rounded-full border border-indigo-500/30">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Powered by Gemini 3 Pro</span>
        </div>
      </div>
    </header>
  );
};
