import React from 'react';
import { Printer, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-700 bg-dtf-panel/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DTF Vector Forge</h1>
            <p className="text-xs text-slate-400 font-mono">AI-POWERED PRINT GENERATION</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Layers className="w-3 h-3" />
                <span>Model: Gemini 2.5 Flash</span>
            </div>
        </div>
      </div>
    </header>
  );
};