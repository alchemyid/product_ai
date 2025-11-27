import React, { useRef, useState } from 'react';
import { Upload, X, Wand2, Image as ImageIcon, Terminal, Sparkles, ScanEye } from 'lucide-react';
import { GenerationConfig, VectorStyle } from '../types';
import { fileToBase64 } from '../utils';
import { analyzeImageForPrompt } from '../services/geminiService';

interface InputSectionProps {
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<VectorStyle>("flat-vector");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setReferenceImage(base64);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  const handleAnalyzeImage = async () => {
    if (!referenceImage) return;
    
    setIsAnalyzing(true);
    try {
      const suggestedPrompt = await analyzeImageForPrompt(referenceImage);
      setPrompt(suggestedPrompt);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We only proceed if there is a prompt.
    // We deliberately DO NOT check for referenceImage here for generation logic,
    // because we want the generation to be based on TEXT ONLY for originality.
    if (!prompt.trim()) return;
    
    onGenerate({
      prompt,
      style: selectedStyle,
      aspectRatio: "1:1",
      // Important: We send undefined for referenceImage to ensure Gemini generates 
      // a fresh image from scratch (Text-to-Image) instead of editing the upload.
      referenceImage: undefined 
    });
  };

  const styles: { id: VectorStyle; label: string; desc: string }[] = [
    { id: "flat-vector", label: "Flat Vector", desc: "Clean, no gradients" },
    { id: "streetwear", label: "Streetwear", desc: "Edgy, urban grunge" },
    { id: "vintage-badge", label: "Vintage", desc: "Retro, distressed" },
    { id: "mascot", label: "Mascot", desc: "Bold sports style" },
    { id: "cyberpunk", label: "Cyberpunk", desc: "Neon, futuristic" },
    { id: "outline", label: "Line Art", desc: "B&W lines only" },
  ];

  return (
    <div className="bg-dtf-panel rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      <div className="p-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
      <div className="p-6 space-y-6">
        
        {/* Step 1: Reference Image Upload */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">1</div>
                    Upload Reference (For Prompting)
                </label>
                {referenceImage && !isAnalyzing && !prompt && (
                    <span className="text-xs text-blue-400 animate-pulse">Upload done! Now click analyze below ↓</span>
                )}
            </div>
          
          {!referenceImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Click to upload image</p>
              <p className="text-xs text-slate-500 mt-1">We'll analyze this to create your prompt</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-3">
                <div className="relative h-48 rounded-lg overflow-hidden border border-slate-600 group bg-black/40 flex items-center justify-center">
                    <img src={referenceImage} alt="Ref" className="h-full w-auto object-contain" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); setReferenceImage(null); setPrompt(""); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white">
                        Reference Only (Not used in generation)
                    </div>
                </div>
                
                {/* Analyze Button */}
                <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzing}
                    className="w-full py-2 bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                    {isAnalyzing ? (
                        <>
                            <ScanEye className="w-4 h-4 animate-spin" /> Analyzing Image Structure...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-indigo-400" /> Analyze & Convert to DTF Prompt
                        </>
                    )}
                </button>
            </div>
          )}
        </div>

        {/* Step 2: Command Line Prompt */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">2</div>
                    <Terminal className="w-4 h-4" /> Design Command
                </label>
                <span className="text-xs text-slate-500">Edit as needed</span>
            </div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={referenceImage ? "Click 'Analyze' above to generate a prompt..." : "Describe your design (e.g., 'Angry cybernetic bear head, red eyes, flat vector')"}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 font-mono text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-600">
              {prompt.length} chars
            </div>
          </div>
        </div>

        {/* Style Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Select Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStyle(s.id)}
                className={`px-3 py-2 rounded-md border text-left transition-all ${
                  selectedStyle === s.id 
                    ? "bg-blue-600/20 border-blue-500 text-blue-100" 
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-[10px] opacity-70 truncate">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isGenerating || isAnalyzing || !prompt}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isGenerating || isAnalyzing || !prompt
              ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-600/20"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Forging Original Design...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Design</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};