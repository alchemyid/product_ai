import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { GenerationConfig } from './types';
import { generateVectorDesign } from './services/geminiService';

const App: React.FC = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (config: GenerationConfig) => {
    setIsGenerating(true);
    setError(null);
    try {
      const resultUrl = await generateVectorDesign(config);
      setGeneratedImage(resultUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dtf-dark flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2 animate-pulse">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              <InputSection onGenerate={handleGenerate} isGenerating={isGenerating} />
              
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-600">
                  Powered by Gemini 2.5 Flash Image. 
                  <br/>Optimized for Raster-to-Vector conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Result */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ResultSection imageUrl={generatedImage} isLoading={isGenerating} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;