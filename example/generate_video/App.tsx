
import React, { useState } from 'react';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ScriptEditor from './components/ScriptEditor';
import ResultGallery from './components/ResultGallery';
import { AppState, SocialPlatform, AIModel, UploadedImage, ScriptScene, VoiceName } from './types';
import { generateDirectorScript, generateVeoVideo } from './services/geminiService';
import { Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.TIKTOK);
  const [model, setModel] = useState<AIModel>(AIModel.VEO3);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [targetDuration, setTargetDuration] = useState<number>(8);
  const [productName, setProductName] = useState<string>('');
  const [characterDescription, setCharacterDescription] = useState<string>('');
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [modelImages, setModelImages] = useState<UploadedImage[]>([]);
  
  const [generatedScript, setGeneratedScript] = useState<ScriptScene[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -- Handlers --

  const handleGenerateScript = async () => {
    if (!productName || (productImages.length === 0 && modelImages.length === 0)) {
      setError("Please provide a product name and at least one image.");
      return;
    }
    setError(null);
    setIsGeneratingScript(true);

    try {
      // Combine visuals for context
      const allImages = [...productImages, ...modelImages].map(img => img.base64);
      
      const script = await generateDirectorScript(
        platform, 
        productName, 
        model, 
        targetDuration, 
        allImages,
        characterDescription // Pass description for prompt injection
      );
      
      setGeneratedScript(script);
      // Scroll to script section
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
    
    // We update scenes one by one as they complete
    const scenes = [...generatedScript];
    
    // For facial consistency in VEO, prioritizing the MODEL image as the seed is better than the product
    // The product can be described via text or overlay, but the face needs a reference.
    const seedImage = modelImages.length > 0 ? modelImages[0].base64 : productImages[0]?.base64;

    try {
      for (let i = 0; i < scenes.length; i++) {
        // Skip already completed
        if (scenes[i].status === 'completed') continue;

        scenes[i].status = 'generating';
        setGeneratedScript([...scenes]); // Update UI

        try {
          // If the user selected Meta, we simulate or block.
          if (model === AIModel.META) {
              await new Promise(r => setTimeout(r, 2000)); // Fake delay
              throw new Error("Meta AI Video API is not currently integrated. Only VEO is supported for generation.");
          }

          const videoUri = await generateVeoVideo(scenes[i].visualPrompt, seedImage);
          
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
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <span className="font-bold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Step 1: Configuration */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">1</div>
            <h2 className="text-2xl font-bold text-white">Project Setup</h2>
          </div>
          <ConfigPanel 
            platform={platform} setPlatform={setPlatform}
            model={model} setModel={setModel}
            selectedVoice={selectedVoice} setVoice={setSelectedVoice}
            targetDuration={targetDuration} setTargetDuration={setTargetDuration}
            productName={productName} setProductName={setProductName}
            characterDescription={characterDescription} setCharacterDescription={setCharacterDescription}
            productImages={productImages} setProductImages={setProductImages}
            modelImages={modelImages} setModelImages={setModelImages}
          />
          
          <div className="mt-8 flex justify-end">
             <button 
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="bg-zinc-100 text-black px-6 py-3 rounded-full font-bold hover:bg-white hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isGeneratingScript ? 'Dreaming up concepts...' : 'Generate Director\'s Script'}
               <Wand2 className="w-5 h-5" />
             </button>
          </div>
        </section>

        {/* Step 2: Script Editing & Video Gen */}
        {generatedScript.length > 0 && (
          <section id="script-section" className="pt-8 border-t border-zinc-800">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">2</div>
                <h2 className="text-2xl font-bold text-white">Production Review</h2>
             </div>
             
             <ScriptEditor 
                scenes={generatedScript}
                setScenes={setGeneratedScript}
                isGeneratingVideo={isGeneratingVideo}
                canGenerate={model === AIModel.VEO3} // Only allow generation for VEO
                onGenerateVideo={() => setShowVideoConfirm(true)}
                selectedVoice={selectedVoice}
             />

             {model === AIModel.META && (
                <p className="text-center text-zinc-500 mt-4 text-sm">
                    * Video generation is currently optimized for Google VEO. Meta simulation mode creates prompts only.
                </p>
             )}
          </section>
        )}

        {/* Step 3: Results */}
        <ResultGallery scenes={generatedScript} />

      </main>

      {/* Confirmation Modal */}
      {showVideoConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Confirm Production</h3>
                <p className="text-zinc-400 mb-6">
                    You are about to generate {generatedScript.filter(s => s.status !== 'completed').length} video segments using 
                    <span className="text-blue-400 font-bold"> {model}</span>.
                    <br/><br/>
                    This operation will consume significant API credits/quota. Are you sure you want to proceed?
                </p>
                <div className="flex gap-4 justify-end">
                    <button 
                        onClick={() => setShowVideoConfirm(false)}
                        className="px-4 py-2 text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeVideoGeneration}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
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

export default App;
