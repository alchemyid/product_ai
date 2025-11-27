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
import { AppState as MockupAppState, ViewSide, ShirtSide } from '@/types';
import { DEFAULT_POSITION, PHOTOGRAPHY_THEMES, PRESET_SHIRT_COLORS } from '@/constants/mockup_constants';
import CanvasPreview, { CanvasHandle } from '@/components/mockup/CanvasPreview';
import ControlPanel from '@/components/mockup/ControlPanel';
import LoadingOverlay from '@/components/mockup/LoadingOverlay';
import geminiService from '@/services/gemini';

// Note: Using MockupAppState interface defined in types.ts but locally initialized state structure.

const MockupApp: React.FC = () => {
    // --- Refs ---
    const frontCanvasRef = useRef<CanvasHandle>(null);
    const backCanvasRef = useRef<CanvasHandle>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // --- State ---
    const [currentView, setCurrentView] = useState<ViewSide>(ViewSide.FRONT);

    // Simplified local state management for this app
    const [shirtColor, setShirtColor] = useState<string>('#ffffff');
    const [previewBackgroundColor, setPreviewBackgroundColor] = useState<string>('#0f111a');

    const [front, setFront] = useState<ShirtSide>({
        baseImage: null,
        design: { image: null, position: { ...DEFAULT_POSITION } },
        label: { image: null, position: { ...DEFAULT_POSITION, scale: 0.2, y: 15 } }
    });

    const [back, setBack] = useState<ShirtSide>({
        baseImage: null,
        design: { image: null, position: { ...DEFAULT_POSITION } }
    });

    const [faceReference, setFaceReference] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string>(PHOTOGRAPHY_THEMES[0].id);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);

    // --- Handlers ---
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShirtColor(e.target.value);
    };

    const updateFront = (updates: Partial<ShirtSide>) => {
        setFront(prev => ({ ...prev, ...updates }));
    };

    const updateBack = (updates: Partial<ShirtSide>) => {
        setBack(prev => ({ ...prev, ...updates }));
    };

    const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFaceReference(event.target?.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!front.baseImage && !back.baseImage) {
            alert("Please upload at least a base t-shirt image for the front or back.");
            return;
        }

        setIsGenerating(true);
        setGeneratedImages([]);

        try {
            const currentThemeOption = PHOTOGRAPHY_THEMES.find(t => t.id === selectedTheme) || PHOTOGRAPHY_THEMES[0];
            const newImages: string[] = [];

            // Generate Front Images
            if (frontCanvasRef.current && front.baseImage) {
                const frontMockup = frontCanvasRef.current.getDataURL();
                try {
                    const frontResults = await geminiService.generateModelImages(
                        frontMockup,
                        faceReference,
                        currentThemeOption,
                        'Front',
                        3
                    );
                    newImages.push(...frontResults);
                } catch (e) {
                    console.error("Front gen error", e);
                }
            }

            // Generate Back Images
            if (backCanvasRef.current && back.baseImage) {
                const backMockup = backCanvasRef.current.getDataURL();
                try {
                    const backResults = await geminiService.generateModelImages(
                        backMockup,
                        faceReference,
                        currentThemeOption,
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

            setGeneratedImages(newImages);
            setIsGenerating(false);

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);

        } catch (error: any) {
            console.error("Generation failed", error);
            alert("Failed to generate images. Ensure your API Key has Image Gen access.");
            setIsGenerating(false);
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

    return (
        <div className="flex-1 flex overflow-hidden bg-[#0b1120]">

            {/* Loading Overlay */}
            {isGenerating && <LoadingOverlay />}

            {/* --- LEFT: CONFIGURATION PANEL (MODEL STUDIO) --- */}
            <aside className="w-[380px] bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 z-10">

                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                        <Camera size={16} className="text-indigo-400" /> Model Studio
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4">Configure your product and model settings.</p>

                    {/* Base Uploads */}
                    <div className="space-y-3">
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Base Mockup ({currentView === ViewSide.FRONT ? 'Front' : 'Back'})</label>
                                {(currentView === ViewSide.FRONT ? front.baseImage : back.baseImage) && (
                                    <button
                                        onClick={() => currentView === ViewSide.FRONT ? updateFront({baseImage: null}) : updateBack({baseImage: null})}
                                        className="text-[10px] text-red-400 hover:text-white"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-12 h-12 bg-black/30 rounded-lg border border-slate-700 border-dashed flex items-center justify-center group-hover:border-indigo-500 transition-colors overflow-hidden">
                                    {(currentView === ViewSide.FRONT ? front.baseImage : back.baseImage) ? (
                                        <img src={(currentView === ViewSide.FRONT ? front.baseImage : back.baseImage)!} className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload size={16} className="text-slate-500"/>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-slate-300 group-hover:text-indigo-400 transition-colors">Upload Base Image</div>
                                    <div className="text-[10px] text-slate-600">PNG Transparent Only</div>
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

                <div className="h-px bg-slate-800 w-full"></div>

                {/* Design & Color */}
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Fabric Color</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_SHIRT_COLORS.map((c) => (
                                <button
                                    key={`shirt-${c}`}
                                    onClick={() => setShirtColor(c)}
                                    className={`w-6 h-6 rounded-full border border-slate-600 transition-all hover:scale-110 ${shirtColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                            <div className="relative group w-6 h-6">
                                <input
                                    type="color"
                                    value={shirtColor}
                                    onChange={handleColorChange}
                                    className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-0 absolute z-10"
                                />
                                <div className="w-6 h-6 rounded-full border border-slate-600 border-dashed flex items-center justify-center bg-transparent group-hover:border-white text-slate-500 transition-colors">
                                    <Palette size={10}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {currentView === ViewSide.FRONT ? (
                        <>
                            <ControlPanel
                                title="Front Graphic"
                                layer={front.design}
                                onUpdate={(l) => updateFront({design: l})}
                            />
                            <ControlPanel
                                title="Neck Label"
                                icon={<Tag size={14} className="text-indigo-500"/>}
                                layer={front.label!}
                                onUpdate={(l) => updateFront({label: l})}
                            />
                        </>
                    ) : (
                        <ControlPanel
                            title="Back Graphic"
                            layer={back.design}
                            onUpdate={(l) => updateBack({design: l})}
                        />
                    )}
                </div>

                <div className="h-px bg-slate-800 w-full"></div>

                {/* Model Specs */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <User size={12} /> Model Specifications
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="text-[10px] text-slate-500 block mb-2">Reference Face (Optional)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black/40 overflow-hidden border border-slate-700 flex items-center justify-center">
                                    {faceReference ? (
                                        <img src={faceReference} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={14} className="text-slate-600"/>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaceUpload}
                                    className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">Brand Vibe / Theme</label>
                            <select
                                value={selectedTheme}
                                onChange={(e) => setSelectedTheme(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                                {PHOTOGRAPHY_THEMES.map(theme => (
                                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all
                  ${isGenerating ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/40'}`}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw size={16} className="animate-spin"/> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} /> Generate Model
                            </>
                        )}
                    </button>
                </div>

            </aside>

            {/* --- CENTER: PREVIEW AREA --- */}
            <main className="flex-1 overflow-y-auto bg-[#05060a] relative flex flex-col p-6 items-center">

                {/* View Toggle */}
                <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg mb-6 shadow-xl relative z-10">
                    <button
                        onClick={() => setCurrentView(ViewSide.FRONT)}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${currentView === ViewSide.FRONT ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
                    >
                        Front View
                    </button>
                    <button
                        onClick={() => setCurrentView(ViewSide.BACK)}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${currentView === ViewSide.BACK ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
                    >
                        Back View
                    </button>
                </div>

                {/* Canvas Container */}
                <div className="w-full max-w-[1000px] flex-1 min-h-[500px] flex flex-col">
                    <div
                        className="relative w-full aspect-square bg-[#0f111a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group"
                        style={{ backgroundColor: previewBackgroundColor !== '#0f111a' ? previewBackgroundColor : undefined }}
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                        {/* Front Canvas */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${currentView === ViewSide.FRONT ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <CanvasPreview ref={frontCanvasRef} side={front} shirtColor={shirtColor} />
                            {!front.baseImage && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-600">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-slate-500 text-sm">Upload Front Base</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Back Canvas */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${currentView === ViewSide.BACK ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <CanvasPreview ref={backCanvasRef} side={back} shirtColor={shirtColor} />
                            {!back.baseImage && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-600">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-slate-500 text-sm">Upload Back Base</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Button */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={downloadCanvas} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-2 shadow-lg">
                                <Download size={14} /> Export PNG
                            </button>
                        </div>
                    </div>

                    {/* --- GENERATED RESULTS (BELOW PREVIEW) --- */}
                    {generatedImages.length > 0 && (
                        <div ref={resultsRef} className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Sparkles size={14} className="text-indigo-500" /> Generated Results
                                </h3>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full">Ready to Download</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {generatedImages.map((imgUrl, idx) => (
                                    <div key={idx} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg cursor-pointer">
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
    );
};

export default MockupApp;