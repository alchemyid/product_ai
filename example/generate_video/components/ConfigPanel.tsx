
import React, { useState } from 'react';
import { AIModel, SocialPlatform, UploadedImage, VoiceName } from '../types';
import { Upload, X, ImageIcon, Clock, Layers, Smartphone, Mic2, User, Wand2, Loader2 } from 'lucide-react';
import { analyzeImageForDescription } from '../services/geminiService';

interface Props {
  platform: SocialPlatform;
  setPlatform: (p: SocialPlatform) => void;
  model: AIModel;
  setModel: (m: AIModel) => void;
  selectedVoice: VoiceName;
  setVoice: (v: VoiceName) => void;
  targetDuration: number;
  setTargetDuration: (d: number) => void;
  productName: string;
  setProductName: (n: string) => void;
  characterDescription: string;
  setCharacterDescription: (d: string) => void;
  productImages: UploadedImage[];
  setProductImages: (imgs: UploadedImage[]) => void;
  modelImages: UploadedImage[];
  setModelImages: (imgs: UploadedImage[]) => void;
}

const VOICES: { name: VoiceName; desc: string }[] = [
  { name: 'Kore', desc: 'Relaxed & Calm' },
  { name: 'Puck', desc: 'Energetic & Youthful' },
  { name: 'Charon', desc: 'Deep & Authoritative' },
  { name: 'Fenrir', desc: 'Strong & Intense' },
  { name: 'Zephyr', desc: 'Soft & Gentle' },
];

const ConfigPanel: React.FC<Props> = ({
  platform, setPlatform,
  model, setModel,
  selectedVoice, setVoice,
  targetDuration, setTargetDuration,
  productName, setProductName,
  characterDescription, setCharacterDescription,
  productImages, setProductImages,
  modelImages, setModelImages
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dynamic Duration Options
  const getDurationOptions = () => {
    if (model === AIModel.VEO3) {
      return [8, 16, 24, 32, 40];
    }
    return [5, 10, 15, 20, 25, 30];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'model') => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      const newImages: UploadedImage[] = [];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
           const base64Data = base64String.split(',')[1];
          
          newImages.push({
            id: crypto.randomUUID(),
            file,
            previewUrl: base64String,
            base64: base64Data,
            mimeType: file.type
          });

          if (newImages.length === files.length) {
            if (target === 'product') setProductImages([...productImages, ...newImages]);
            else setModelImages([...modelImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (id: string, target: 'product' | 'model') => {
    if (target === 'product') {
      setProductImages(productImages.filter(img => img.id !== id));
    } else {
      setModelImages(modelImages.filter(img => img.id !== id));
    }
  };

  const handleAutoDetect = async () => {
    if (modelImages.length === 0) return;
    setIsAnalyzing(true);
    try {
        const desc = await analyzeImageForDescription(modelImages[0].base64);
        setCharacterDescription(desc);
    } catch (e) {
        console.error(e);
        alert("Failed to analyze image. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-8">
      
      {/* Platform & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Smartphone className="w-4 h-4 text-purple-400" />
            Target Platform
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(SocialPlatform).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  platform === p 
                  ? 'bg-purple-600/20 border border-purple-500 text-purple-200' 
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-750'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Layers className="w-4 h-4 text-blue-400" />
            AI Model
          </label>
          <div className="flex flex-col gap-2">
            {Object.values(AIModel).map((m) => (
              <button
                key={m}
                onClick={() => {
                   setModel(m);
                   setTargetDuration(m === AIModel.VEO3 ? 8 : 5);
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left flex justify-between items-center ${
                  model === m
                  ? 'bg-blue-600/20 border border-blue-500 text-blue-200' 
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-750'
                }`}
              >
                <span>{m}</span>
                {model === m && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
         <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Mic2 className="w-4 h-4 text-red-400" />
            Voiceover Persona
         </label>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {VOICES.map((v) => (
                <button
                    key={v.name}
                    onClick={() => setVoice(v.name)}
                    className={`p-3 rounded-xl text-xs flex flex-col items-center gap-1 transition-all ${
                        selectedVoice === v.name
                        ? 'bg-red-600/20 border border-red-500 text-red-200'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-750'
                    }`}
                >
                    <span className="font-bold">{v.name}</span>
                    <span className="opacity-70 text-[10px] text-center">{v.desc}</span>
                </button>
            ))}
         </div>
      </div>

      {/* Duration & Product Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Upload className="w-4 h-4 text-green-400" />
              Product Name
            </label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. SlimFit Yoga Pants"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
         </div>

         <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Clock className="w-4 h-4 text-orange-400" />
              Target Duration (Seconds)
            </label>
            <div className="flex flex-wrap gap-2">
              {getDurationOptions().map((secs) => (
                <button
                  key={secs}
                  onClick={() => setTargetDuration(secs)}
                  className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                    targetDuration === secs
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' 
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* Image Uploads */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-pink-400" />
          Reference Imagery
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-2">
             <span className="text-xs text-zinc-500 uppercase tracking-wider">Product Photos</span>
             <div className="grid grid-cols-4 gap-2">
                {productImages.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700">
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="Product" />
                    <button 
                      onClick={() => removeImage(img.id, 'product')}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-500">Add</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} />
                </label>
             </div>
          </div>

          {/* Model Images */}
          <div className="space-y-2">
             <span className="text-xs text-zinc-500 uppercase tracking-wider">Model Photos</span>
             <div className="grid grid-cols-4 gap-2">
                {modelImages.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700">
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="Model" />
                    <button 
                      onClick={() => removeImage(img.id, 'model')}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-500">Add</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'model')} />
                </label>
             </div>
          </div>
        </div>
      </div>

      {/* Model Consistency Description */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
         <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <User className="w-4 h-4 text-cyan-400" />
                Model Character Description
            </label>
            <button
                onClick={handleAutoDetect}
                disabled={isAnalyzing || modelImages.length === 0}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded-full border border-cyan-800 hover:bg-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Use Gemini Vision to analyze the first model photo"
            >
                {isAnalyzing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <Wand2 className="w-3 h-3" />
                )}
                Auto-Detect from Image
            </button>
         </div>
         <textarea
            value={characterDescription}
            onChange={(e) => setCharacterDescription(e.target.value)}
            placeholder="e.g. Indonesian woman, 25 years old, short black bob hair, fair skin, wearing a white oversized t-shirt and denim shorts. Friendly expression."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm min-h-[80px]"
         />
         <p className="text-[10px] text-zinc-500">
            * This description will be injected into every video generation prompt to ensure the model looks the same across all scenes.
            {modelImages.length === 0 && <span className="text-orange-500 ml-1">Upload a model photo to use Auto-Detect.</span>}
         </p>
      </div>

    </div>
  );
};

export default ConfigPanel;
