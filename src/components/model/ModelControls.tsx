import React from 'react';
import { Bot, Ban, Sparkles } from 'lucide-react';

interface ModelControlsProps {
  prompt: string;
  setPrompt: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  style: string;
  setStyle: (value: string) => void;
}

export const ModelControls: React.FC<ModelControlsProps> = ({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  style,
  setStyle,
}) => {
  const renderTextarea = (
    label: string,
    value: string,
    setter: (val: string) => void,
    Icon: React.ElementType,
    rows: number = 5
  ) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => setter(e.target.value)}
        rows={rows}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {renderTextarea('Prompt', prompt, setPrompt, Bot, 6)}
      {renderTextarea('Negative Prompt', negativePrompt, setNegativePrompt, Ban, 3)}
      {renderTextarea('Style', style, setStyle, Sparkles, 3)}
    </div>
  );
};