import React, { useState, useCallback } from 'react';
import { DesignControls } from '@/components/design/DesignControls';
import { DesignPreview } from '@/components/design/DesignPreview';
import geminiService from '@/services/gemini';
import { DesignGenerationParams } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';
import { DEFAULT_DESIGN_PROMPT, DEFAULT_DESIGN_STYLE } from '@/constants/design_constants';

const DesignApp: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_DESIGN_PROMPT);
  const [style, setStyle] = useState<string>(DEFAULT_DESIGN_STYLE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [rasterImage, setRasterImage] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setRasterImage(null);
    setSvgContent(null);

    try {
      const params: DesignGenerationParams = { prompt, style };
      const imageB64 = await geminiService.generateVectorImage(params);
      setRasterImage(imageB64);

      // Use ImageTracer to convert to SVG
      if (imageB64) {
        (window as any).ImageTracer.imageToSVG(
          `data:image/png;base64,${imageB64}`,
          (svgString: string) => {
            setSvgContent(svgString);
          },
          {
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            rightangleenhance: true,
            numberofcolors: 16,
          }
        );
      }
    } catch (error) {
      console.error("Failed to generate design:", error);
      alert("There was an error generating the design. Please check the console and try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style]);

  const handleDownload = (type: 'svg' | 'png') => {
    if (type === 'svg' && svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design.svg';
      link.click();
      URL.revokeObjectURL(url);
    } else if (type === 'png' && rasterImage) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${rasterImage}`;
      link.download = 'design.png';
      link.click();
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT SIDEBAR: Controls */}
      <aside className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Vector Design Brief
          </h2>
          <DesignControls
            prompt={prompt}
            setPrompt={setPrompt}
            style={style}
            setStyle={setStyle}
          />
        </div>
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Design'}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT: Preview */}
      <main className="flex-1 overflow-hidden bg-[#0b1120] p-8 flex flex-col">
        <DesignPreview
          isLoading={isGenerating}
          rasterImage={rasterImage}
          svgContent={svgContent}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
};

export default DesignApp;