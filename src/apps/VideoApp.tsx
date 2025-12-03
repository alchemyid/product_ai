import React, { useState } from 'react';
import { SocialPlatform, AIModel, VideoUploadedImage, ScriptScene, VoiceName } from '@/types';
import geminiService from '@/services/gemini';
import { ConfigPanel } from '@/components/video/ConfigPanel';
import { ScriptEditor } from '@/components/video/ScriptEditor';
import { ResultGallery } from '@/components/video/ResultGallery';
import { Wand2, Film } from 'lucide-react';

const VideoApp: React.FC = () => {
  // State
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.TIKTOK);
  const [model, setModel] = useState<AIModel>(AIModel.VEO3);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [targetDuration, setTargetDuration] = useState<number>(8);
  const [productName, setProductName] = useState<string>('');
  
  // Assets
  const [productImages, setProductImages] = useState<VideoUploadedImage[]>([]);
  const [modelImages, setModelImages] = useState<VideoUploadedImage[]>([]);
  
  // Process State
  const [generatedScript, setGeneratedScript] = useState<ScriptScene[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---

  const handleGenerateScript = async () => {
    if (!productName || (productImages.length === 0 && modelImages.length === 0)) {
      setError("Please provide a product name and at least one image.");
      return;
    }
    setError(null);
    setIsGeneratingScript(true);

    try {
      const allImages = [...productImages, ...modelImages].map(img => img.base64);
      
      const script = await geminiService.generateDirectorScript(
        platform, 
        productName, 
        model, 
        targetDuration, 
        allImages
      );
      
      setGeneratedScript(script);
      setTimeout(() => {
        document.getElementById('script-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (e: any) {
      setError(e.message || "Failed to generate script.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const executeVideoGeneration = async () => {
    setShowVideoConfirm(false);
    setIsGeneratingVideo(true);
    
    const scenes = [...generatedScript];
    // Use first product image as seed/reference
    const seedImage = productImages.length > 0 ? productImages[0].base64 : modelImages[0]?.base64;

    try {
      for (let i = 0; i < scenes.length; i++) {
        if (scenes[i].status === 'completed') continue;

        scenes[i].status = 'generating';
        setGeneratedScript([...scenes]); 

        try {
          if (model === AIModel.META) {
              await new Promise(r => setTimeout(r, 2000));
              throw new Error("Meta AI Video API is not integrated.");
          }

          const videoUri = await geminiService.generateVeoVideoFromScript(scenes[i].visualPrompt, seedImage);
          scenes[i].generatedVideoUri = videoUri;
          scenes[i].status = 'completed';
        } catch (err: any) {
          console.error(`Scene ${i+1} failed`, err);
          scenes[i].status = 'failed';
          scenes[i].error = err.message;
        }
        
        setGeneratedScript([...scenes]);
      }
    } catch (globalErr) {
        console.error(globalErr);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0b1120]">
      {/* Container Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-12">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="bg-gradient-to-tr from-purple-600 to-blue-600 p-2 rounded-lg">
                    <Film className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">MarketFlow AI Director</h1>
                    <p className="text-sm text-slate-400">End-to-End AI Video Production (Script • Voice • Video)</p>
                </div>
            </div>

            {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <span className="font-bold">Error:</span> {error}
                <button onClick={() => setError(null)} className="ml-auto hover:text-white">Dismiss</button>
            </div>
            )}

            {/* SECTION 1: CONFIG */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">1</div>
                    <h2 className="text-lg font-bold text-white">Project Setup</h2>
                </div>
                
                <ConfigPanel 
                    platform={platform} setPlatform={setPlatform}
                    model={model} setModel={setModel}
                    selectedVoice={selectedVoice} setVoice={setSelectedVoice}
                    targetDuration={targetDuration} setTargetDuration={setTargetDuration}
                    productName={productName} setProductName={setProductName}
                    productImages={productImages} setProductImages={setProductImages}
                    modelImages={modelImages} setModelImages={setModelImages}
                />
                
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isGeneratingScript ? 'Writing Script...' : 'Generate Director\'s Script'}
                    <Wand2 className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* SECTION 2: SCRIPTING */}
            {generatedScript.length > 0 && (
            <section id="script-section" className="pt-8 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">2</div>
                    <h2 className="text-lg font-bold text-white">Production Board</h2>
                </div>
                
                <ScriptEditor 
                    scenes={generatedScript}
                    setScenes={setGeneratedScript}
                    isGeneratingVideo={isGeneratingVideo}
                    canGenerate={model === AIModel.VEO3}
                    onGenerateVideo={() => setShowVideoConfirm(true)}
                    selectedVoice={selectedVoice}
                />
            </section>
            )}

            {/* SECTION 3: RESULTS */}
            <ResultGallery scenes={generatedScript} />
        </div>
      </main>

      {/* CONFIRM MODAL */}
      {showVideoConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Confirm Production</h3>
                <p className="text-slate-400 mb-6 text-sm">
                    You are about to generate {generatedScript.filter(s => s.status !== 'completed').length} video segments.
                    This process uses the <strong>{model}</strong> model and may take a few minutes.
                </p>
                <div className="flex gap-4 justify-end">
                    <button 
                        onClick={() => setShowVideoConfirm(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeVideoGeneration}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm"
                    >
                        Start Production
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoApp;