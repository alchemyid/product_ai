import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel, PHOTOGRAPHY_THEMES } from './components/SettingsPanel';
import { UploadedImage, SwapSettings, GeneratedResult } from './types';
import { generateProductSwap } from './services/geminiService';
import { Wand2, Loader2, Download, RefreshCw, Camera, Lock, ExternalLink, ArrowRight, User } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [keyCheckComplete, setKeyCheckComplete] = useState<boolean>(false);
  
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [referenceFaceImages, setReferenceFaceImages] = useState<UploadedImage[]>([]);
  
  const [settings, setSettings] = useState<SwapSettings>({
    themeId: null,
    customPrompt: '',
    selectedAngles: []
  });
  
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for API Key
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const has = await window.aistudio.hasSelectedApiKey();
          setHasKey(has);
        } else {
          setHasKey(!!process.env.API_KEY);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setKeyCheckComplete(true);
      }
    };
    checkKey();
  }, []);

  // Handlers
  const handleConnectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleProcessFile = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;
        
        resolve({
          file,
          previewUrl: base64String,
          base64: base64Data,
          mimeType
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProductUpload = async (files: FileList) => {
    const newImages = await Promise.all(Array.from(files).map(handleProcessFile));
    setProductImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const handleFaceUpload = async (files: FileList) => {
    const newImages = await Promise.all(Array.from(files).map(handleProcessFile));
    setReferenceFaceImages(prev => [...prev, ...newImages].slice(0, 3)); // Limit to 3 faces
  };

  const handleRemoveProduct = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFace = (index: number) => {
    setReferenceFaceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (productImages.length === 0 || settings.selectedAngles.length === 0) return;

    setIsGenerating(true);
    setResults([]); // Clear previous results

    // Create placeholders based on SELECTED ANGLES QUEUE
    const placeholders: GeneratedResult[] = settings.selectedAngles.map(angleStr => {
      const label = angleStr.split(' - ')[0];
      return {
        imageUrl: '',
        viewLabel: label,
        fullPromptAngle: angleStr,
        loading: true,
        promptUsed: ''
      };
    });
    setResults(placeholders);

    // Get Theme Prompt
    let themePrompt = '';
    if (settings.themeId) {
      const theme = PHOTOGRAPHY_THEMES.find(t => t.id === settings.themeId);
      if (theme) themePrompt = theme.promptSuffix;
    }

    // Generate for each angle in the queue
    const generationPromises = settings.selectedAngles.map(async (angleStr, index) => {
      try {
        const imageUrl = await generateProductSwap(
          productImages,
          referenceFaceImages,
          angleStr,
          themePrompt,
          settings.customPrompt
        );

        setResults(prev => prev.map((res, i) => 
          i === index 
            ? { ...res, imageUrl, loading: false } 
            : res
        ));
      } catch (error: any) {
        console.error(`Error generating ${angleStr}:`, error);
        
        let errorMessage = "Failed to generate image.";
        if (error.message?.includes("The caller does not have permission") || error.status === 403) {
            errorMessage = "Permission denied. Please ensure your API key has access to Gemini 3 Pro.";
            setHasKey(false);
        } else if (error.message?.includes("Requested entity was not found")) {
            setHasKey(false);
            errorMessage = "API Key invalid or project not found. Please reconnect.";
        }

        setResults(prev => prev.map((res, i) => 
          i === index 
            ? { ...res, loading: false, error: errorMessage } 
            : res
        ));
      }
    });

    await Promise.all(generationPromises);
    setIsGenerating(false);
  };

  // 1. Loading State
  if (!keyCheckComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // 2. Auth State
  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Google Cloud</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                To use the professional <b>Gemini 3 Pro</b> model for high-fidelity product photography and model generation, you must connect a Google Cloud Project with billing enabled.
              </p>
            </div>

            <button
              onClick={handleConnectKey}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 group"
            >
              Connect API Key
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-4 border-t border-slate-700">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors"
              >
                Learn about Gemini API billing <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Main Application
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-8 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-700 pb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-sm font-bold shadow-lg shadow-indigo-900/50">1</span>
              Assets
            </h2>
            
            <ImageUploader 
              label="Product Images"
              description="Upload clean, high-res photos of your product."
              images={productImages}
              onUpload={handleProductUpload}
              onRemove={handleRemoveProduct}
              multiple={true}
              maxFiles={5}
            />
            
            <ImageUploader 
              label="Reference Face (Optional)"
              description="Upload 1-3 photos of a specific face to maintain identity. Leave empty for AI-generated model."
              images={referenceFaceImages}
              onUpload={handleFaceUpload}
              onRemove={handleRemoveFace}
              multiple={true}
              maxFiles={3}
              icon={<User className="w-5 h-5" />}
            />
          </div>

          <SettingsPanel settings={settings} setSettings={setSettings} />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || productImages.length === 0 || settings.selectedAngles.length === 0}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-95
              ${isGenerating || productImages.length === 0 || settings.selectedAngles.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Planning Shoot...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                Run Photoshoot ({settings.selectedAngles.length} Shots)
              </>
            )}
          </button>

        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-sm font-bold shadow-lg shadow-indigo-900/50">2</span>
                Gallery
              </h2>
              {results.length > 0 && !isGenerating && (
                <button 
                  onClick={() => setResults([])}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" /> Clear All
                </button>
              )}
           </div>

           {results.length === 0 ? (
             <div className="h-[600px] border-2 border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-800/20 backdrop-blur-sm">
               <div className="bg-slate-800 p-6 rounded-full mb-6 shadow-2xl">
                 <Camera className="w-10 h-10 text-slate-600" />
               </div>
               <p className="text-xl font-semibold text-slate-300">No Photos Generated</p>
               <p className="text-sm mt-3 max-w-sm text-center text-slate-500 leading-relaxed">
                 Add angles to the queue and run the photoshoot to see results here.
               </p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {results.map((result, idx) => (
                 <div key={idx} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50 animate-fadeIn hover:border-indigo-500/50 transition-colors">
                   <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center backdrop-blur-sm">
                     <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <Camera className="w-3 h-3" />
                        {result.viewLabel}
                     </span>
                     {!result.loading && !result.error && (
                       <a 
                        href={result.imageUrl} 
                        download={`swap-studio-${result.viewLabel.replace(/\s+/g, '-').toLowerCase()}.png`}
                        className="p-2 hover:bg-indigo-600 rounded-lg transition-all text-slate-400 hover:text-white"
                        title="Download High-Res"
                       >
                         <Download className="w-4 h-4" />
                       </a>
                     )}
                   </div>
                   
                   <div className="aspect-[3/4] relative bg-slate-900 group-hover:bg-slate-800 transition-colors">
                     {result.loading ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                         <div className="relative">
                            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                         </div>
                         <span className="text-xs text-indigo-300 animate-pulse font-medium tracking-wide">GENERATING...</span>
                       </div>
                     ) : result.error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <p className="text-red-400 font-medium mb-2">Generation Failed</p>
                          <p className="text-xs text-slate-500">{result.error}</p>
                          {result.error.includes("Permission denied") && (
                            <button 
                              onClick={() => setHasKey(false)}
                              className="mt-4 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
                            >
                              Reconnect API Key
                            </button>
                          )}
                        </div>
                     ) : (
                       <img 
                        src={result.imageUrl} 
                        alt={`Result ${result.viewLabel}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                       />
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;