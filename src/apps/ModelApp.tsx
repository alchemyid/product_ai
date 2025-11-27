import React, { useState, useCallback } from 'react';
import { ModelControls } from '@/components/model/ModelControls';
import { ModelViewer } from '@/components/model/ModelViewer';
import geminiService from '@/services/gemini';
import { ModelGenerationParams } from '@/types';
import { DEFAULT_MODEL_PROMPT, DEFAULT_NEGATIVE_PROMPT, DEFAULT_MODEL_STYLE } from '@/constants/model_constants';
import { Loader2, Wand2 } from 'lucide-react';

const ModelApp: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_MODEL_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState<string>(DEFAULT_NEGATIVE_PROMPT);
  const [style, setStyle] = useState<string>(DEFAULT_MODEL_STYLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const params: ModelGenerationParams = { prompt, negativePrompt, style };
      const imageB64 = await geminiService.generateModelImage(params);
      setGeneratedImage(imageB64);
    } catch (error) {
      console.error("Failed to generate model image:", error);
      alert("There was an error generating the image. Please check the console and try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, negativePrompt, style]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = 'generated-model.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT SIDEBAR: Controls */}
      <aside className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Model Configuration
          </h2>
          <ModelControls
            prompt={prompt}
            setPrompt={setPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            style={style}
            setStyle={setStyle}
          />
        </div>
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Model'}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT: Viewer */}
      <main className="flex-1 overflow-hidden bg-[#0b1120] p-8 flex flex-col">
        <ModelViewer
          image={generatedImage}
          isLoading={isGenerating}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
};

export default ModelApp;