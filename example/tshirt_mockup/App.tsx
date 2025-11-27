import React, { useState, useRef, useEffect } from 'react';
import { 
  Shirt, 
  Upload, 
  Download, 
  Sparkles, 
  Palette,
  Camera,
  Tag,
  RefreshCw,
  Key,
  User,
  Move,
  ZoomIn,
  RotateCw
} from 'lucide-react';
import { AppState, ViewSide, ShirtSide } from './types';
import { DEFAULT_POSITION, PHOTOGRAPHY_THEMES, PRESET_SHIRT_COLORS } from './constants';
import CanvasPreview, { CanvasHandle } from './components/CanvasPreview';
import ControlPanel from './components/ControlPanel';
import LoadingOverlay from './components/LoadingOverlay';
import { generateModelImages } from './services/geminiService';

const App: React.FC = () => {
  // --- Refs ---
  const frontCanvasRef = useRef<CanvasHandle>(null);
  const backCanvasRef = useRef<CanvasHandle>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [currentView, setCurrentView] = useState<ViewSide>(ViewSide.FRONT);
  
  const [state, setState] = useState<AppState>({
    shirtColor: '#ffffff',
    previewBackgroundColor: '#0f111a', // Default dark for preview container
    front: {
      baseImage: null,
      design: { image: null, position: { ...DEFAULT_POSITION } },
      label: { image: null, position: { ...DEFAULT_POSITION, scale: 0.2, y: 15 } }
    },
    back: {
      baseImage: null,
      design: { image: null, position: { ...DEFAULT_POSITION } }
    },
    faceReference: null,
    selectedTheme: PHOTOGRAPHY_THEMES[0].id,
    isGenerating: false,
    generatedImages: [],
    hasApiKey: false
  });

  // --- Effects ---
  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      setState(prev => ({ ...prev, hasApiKey: hasKey }));
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setState(prev => ({ ...prev, hasApiKey: true }));
    }
  };

  // --- Handlers ---
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, shirtColor: e.target.value }));
  };

  const updateFront = (updates: Partial<ShirtSide>) => {
    setState(prev => ({ ...prev, front: { ...prev.front, ...updates } }));
  };

  const updateBack = (updates: Partial<ShirtSide>) => {
    setState(prev => ({ ...prev, back: { ...prev.back, ...updates } }));
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setState(prev => ({ ...prev, faceReference: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!state.hasApiKey) {
      await handleSelectKey();
      return; 
    }

    if (!state.front.baseImage && !state.back.baseImage) {
      alert("Please upload at least a base t-shirt image for the front or back.");
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, generatedImages: [] }));

    try {
      const currentTheme = PHOTOGRAPHY_THEMES.find(t => t.id === state.selectedTheme) || PHOTOGRAPHY_THEMES[0];
      const newImages: string[] = [];

      // Generate Front Images
      if (frontCanvasRef.current && state.front.baseImage) {
        const frontMockup = frontCanvasRef.current.getDataURL();
        try {
          const frontResults = await generateModelImages(
            frontMockup,
            state.faceReference,
            currentTheme,
            'Front',
            3
          );
          newImages.push(...frontResults);
        } catch (e) {
            console.error("Front gen error", e);
        }
      }

      // Generate Back Images
      if (backCanvasRef.current && state.back.baseImage) {
        const backMockup = backCanvasRef.current.getDataURL();
        try {
          const backResults = await generateModelImages(
            backMockup,
            state.faceReference,
            currentTheme,
            'Back',
            3
          );
          newImages.push(...backResults);
        } catch (e) {
            console.error("Back gen error", e);
        }
      }

      if (newImages.length === 0) {
          throw new Error("No images generated.");
      }

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        generatedImages: newImages
      }));

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error: any) {
      console.error("Generation failed", error);
       if (error.message?.includes("permission denied") || error.toString().includes("permission denied") || error.status === 403) {
          alert("Permission Denied: Please select a valid paid API key to use the Pro Image Model.");
          setState(prev => ({ ...prev, hasApiKey: false, isGenerating: false }));
          await handleSelectKey();
      } else {
          alert("Failed to generate images. Please try again.");
          setState(prev => ({ ...prev, isGenerating: false }));
      }
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const downloadCanvas = () => {
      const canvasRef = currentView === ViewSide.FRONT ? frontCanvasRef : backCanvasRef;
      if(canvasRef.current) {
          downloadImage(canvasRef.current.getDataURL(), `mockup-${currentView.toLowerCase()}.png`);
      }
  }

  // --- UI Components ---

  return (
    <div className="min-h-screen bg-background text-gray-300 font-sans flex flex-col overflow-hidden">
      
      {/* Loading Overlay */}
      {state.isGenerating && <LoadingOverlay />}

      {/* HEADER */}
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 z-20 relative">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
                <Shirt className="fill-current" size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">MockupGenius</h2>
                <p className="text-xs text-gray-500">AI Model Generator</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
             {!state.hasApiKey && (
                 <button onClick={handleSelectKey} className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors flex items-center gap-2">
                    <Key size={12} /> Select API Key
                 </button>
             )}
             <button onClick={downloadCanvas} className="px-4 py-2 bg-surfaceLight hover:bg-gray-700 text-white text-xs font-medium rounded-lg border border-border transition-colors flex items-center gap-2">
                <Download size={14} /> Export PNG
             </button>
         </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* --- LEFT: CONFIGURATION PANEL (MODEL STUDIO) --- */}
          <aside className="w-full lg:w-[380px] bg-surface border-r border-border p-5 overflow-y-auto shrink-0 flex flex-col gap-6 z-10">
             
             <div>
                 <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                     <Camera size={16} className="text-accent" /> Model Studio
                 </h3>
                 <p className="text-[10px] text-gray-500 mb-4">Configure your product and model settings.</p>

                 {/* Base Uploads */}
                 <div className="space-y-3">
                     <div className="bg-surfaceLight p-3 rounded-xl border border-border">
                         <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Base Mockup ({currentView === ViewSide.FRONT ? 'Front' : 'Back'})</label>
                            {(currentView === ViewSide.FRONT ? state.front.baseImage : state.back.baseImage) && (
                                <button 
                                    onClick={() => currentView === ViewSide.FRONT ? updateFront({baseImage: null}) : updateBack({baseImage: null})} 
                                    className="text-[10px] text-red-400 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                         </div>
                         <label className="flex items-center gap-3 cursor-pointer group">
                             <div className="w-12 h-12 bg-black/30 rounded-lg border border-border border-dashed flex items-center justify-center group-hover:border-primary transition-colors overflow-hidden">
                                 {(currentView === ViewSide.FRONT ? state.front.baseImage : state.back.baseImage) ? (
                                     <img src={(currentView === ViewSide.FRONT ? state.front.baseImage : state.back.baseImage)!} className="w-full h-full object-cover" />
                                 ) : (
                                     <Upload size={16} className="text-gray-500"/>
                                 )}
                             </div>
                             <div className="flex-1">
                                 <div className="text-xs text-gray-300 group-hover:text-primary transition-colors">Upload Base Image</div>
                                 <div className="text-[10px] text-gray-600">PNG Transparent Only</div>
                             </div>
                             <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            if(currentView === ViewSide.FRONT) updateFront({ baseImage: ev.target?.result as string });
                                            else updateBack({ baseImage: ev.target?.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} 
                            />
                         </label>
                     </div>
                 </div>
             </div>

             <div className="h-px bg-border w-full"></div>

             {/* Design & Color */}
             <div className="space-y-4">
                 <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Fabric Color</label>
                     <div className="flex flex-wrap gap-2">
                        {PRESET_SHIRT_COLORS.map((c) => (
                            <button
                            key={`shirt-${c}`}
                            onClick={() => setState(prev => ({...prev, shirtColor: c}))}
                            className={`w-6 h-6 rounded-full border border-gray-600 transition-all hover:scale-110 ${state.shirtColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                            title={c}
                            />
                        ))}
                        <div className="relative group w-6 h-6">
                            <input 
                            type="color" 
                            value={state.shirtColor} 
                            onChange={handleColorChange}
                            className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-0 absolute z-10" 
                            />
                            <div className="w-6 h-6 rounded-full border border-gray-600 border-dashed flex items-center justify-center bg-transparent group-hover:border-white text-gray-500 transition-colors">
                            <Palette size={10}/>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {currentView === ViewSide.FRONT ? (
                     <>
                        <ControlPanel 
                            title="Front Graphic" 
                            layer={state.front.design} 
                            onUpdate={(l) => updateFront({design: l})} 
                        />
                        <ControlPanel 
                            title="Neck Label" 
                            icon={<Tag size={14} className="text-primary"/>}
                            layer={state.front.label!} 
                            onUpdate={(l) => updateFront({label: l})} 
                        />
                     </>
                 ) : (
                    <ControlPanel 
                        title="Back Graphic" 
                        layer={state.back.design} 
                        onUpdate={(l) => updateBack({design: l})} 
                    />
                 )}
             </div>

             <div className="h-px bg-border w-full"></div>

             {/* Model Specs */}
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <User size={12} /> Model Specifications
                </h3>

                <div className="space-y-4">
                    <div className="bg-surfaceLight p-3 rounded-lg border border-border">
                         <label className="text-[10px] text-gray-500 block mb-2">Reference Face (Optional)</label>
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-black/40 overflow-hidden border border-border flex items-center justify-center">
                                 {state.faceReference ? (
                                     <img src={state.faceReference} className="w-full h-full object-cover" />
                                 ) : (
                                     <User size={14} className="text-gray-600"/>
                                 )}
                             </div>
                             <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFaceUpload}
                                className="text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                             />
                         </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Brand Vibe / Theme</label>
                        <select 
                            value={state.selectedTheme}
                            onChange={(e) => setState(prev => ({ ...prev, selectedTheme: e.target.value }))}
                            className="w-full bg-surfaceLight border border-border text-gray-200 text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none"
                        >
                            {PHOTOGRAPHY_THEMES.map(theme => (
                                <option key={theme.id} value={theme.id}>{theme.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
             </div>

             <div className="mt-auto pt-4">
                 {!state.hasApiKey ? (
                     <button 
                        onClick={handleSelectKey}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                     >
                         <Key size={16} /> Select API Key
                     </button>
                 ) : (
                    <button 
                        onClick={handleGenerate}
                        disabled={state.isGenerating}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium shadow-lg shadow-primary/25 transition-all
                        ${state.isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primaryHover hover:scale-[1.02] hover:shadow-primary/40'}`}
                    >
                        {state.isGenerating ? (
                            <>
                                <RefreshCw size={16} className="animate-spin"/> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} /> Generate Model
                            </>
                        )}
                    </button>
                 )}
             </div>

          </aside>

          {/* --- CENTER: PREVIEW AREA --- */}
          <main className="flex-1 overflow-y-auto bg-[#05060a] relative flex flex-col p-6 items-center">
              
              {/* View Toggle */}
              <div className="flex gap-1 bg-surface border border-border p-1 rounded-lg mb-6 shadow-xl relative z-10">
                  <button 
                    onClick={() => setCurrentView(ViewSide.FRONT)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${currentView === ViewSide.FRONT ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'}`}
                  >
                    Front View
                  </button>
                  <button 
                    onClick={() => setCurrentView(ViewSide.BACK)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${currentView === ViewSide.BACK ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'}`}
                  >
                    Back View
                  </button>
              </div>

              {/* Canvas Container */}
              <div className="w-full max-w-[1000px] flex-1 min-h-[500px] flex flex-col">
                  <div 
                    className="relative w-full aspect-square bg-[#0f111a] rounded-2xl border border-border shadow-2xl overflow-hidden group"
                    style={{ backgroundColor: state.previewBackgroundColor !== '#0f111a' ? state.previewBackgroundColor : undefined }}
                  >
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                     
                     {/* Front Canvas */}
                     <div className={`absolute inset-0 transition-opacity duration-300 ${currentView === ViewSide.FRONT ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                         <CanvasPreview ref={frontCanvasRef} side={state.front} shirtColor={state.shirtColor} />
                         {!state.front.baseImage && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-surfaceLight border border-border flex items-center justify-center mx-auto mb-3 text-gray-600">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-gray-500 text-sm">Upload Front Base</p>
                                </div>
                            </div>
                         )}
                     </div>

                     {/* Back Canvas */}
                     <div className={`absolute inset-0 transition-opacity duration-300 ${currentView === ViewSide.BACK ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                         <CanvasPreview ref={backCanvasRef} side={state.back} shirtColor={state.shirtColor} />
                         {!state.back.baseImage && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-surfaceLight border border-border flex items-center justify-center mx-auto mb-3 text-gray-600">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-gray-500 text-sm">Upload Back Base</p>
                                </div>
                            </div>
                         )}
                     </div>
                  </div>

                  {/* --- GENERATED RESULTS (BELOW PREVIEW) --- */}
                  {state.generatedImages.length > 0 && (
                    <div ref={resultsRef} className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" /> Generated Results
                            </h3>
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full">Ready to Download</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {state.generatedImages.map((imgUrl, idx) => (
                                <div key={idx} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border shadow-lg cursor-pointer">
                                    <img src={imgUrl} alt={`Result ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => downloadImage(imgUrl, `generated-model-${idx}.png`)}
                                            className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
              </div>
          </main>
      </div>
    </div>
  );
};

export default App;