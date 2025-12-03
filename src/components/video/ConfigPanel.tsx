import React from 'react';
import { AIModel, SocialPlatform, VideoUploadedImage, VoiceName } from '@/types';
import { Upload, X, ImageIcon, Clock, Layers, Smartphone, Mic2 } from 'lucide-react';

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
  productImages: VideoUploadedImage[];
  setProductImages: (imgs: VideoUploadedImage[]) => void;
  modelImages: VideoUploadedImage[];
  setModelImages: (imgs: VideoUploadedImage[]) => void;
}

const VOICES: { name: VoiceName; desc: string }[] = [
  { name: 'Kore', desc: 'Relaxed & Calm' },
  { name: 'Puck', desc: 'Energetic & Youthful' },
  { name: 'Charon', desc: 'Deep & Authoritative' },
  { name: 'Fenrir', desc: 'Strong & Intense' },
  { name: 'Zephyr', desc: 'Soft & Gentle' },
];

export const ConfigPanel: React.FC<Props> = ({
  platform, setPlatform,
  model, setModel,
  selectedVoice, setVoice,
  targetDuration, setTargetDuration,
  productName, setProductName,
  productImages, setProductImages,
  modelImages, setModelImages
}) => {

  const getDurationOptions = () => {
    if (model === AIModel.VEO3) return [8, 16, 24, 32, 40];
    return [5, 10, 15, 20, 25, 30];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'model') => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      const newImages: VideoUploadedImage[] = [];

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
    if (target === 'product') setProductImages(productImages.filter(img => img.id !== id));
    else setModelImages(modelImages.filter(img => img.id !== id));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-8">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Smartphone className="w-4 h-4 text-purple-400" /> Target Platform
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(SocialPlatform).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`p-3 rounded-xl text-xs font-medium transition-all text-left ${
                  platform === p ? 'bg-purple-600/20 border border-purple-500 text-purple-200' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Layers className="w-4 h-4 text-blue-400" /> AI Model
          </label>
          <div className="flex flex-col gap-2">
            {Object.values(AIModel).map((m) => (
              <button
                key={m}
                onClick={() => { setModel(m); setTargetDuration(m === AIModel.VEO3 ? 8 : 5); }}
                className={`p-3 rounded-xl text-xs font-medium transition-all text-left flex justify-between items-center ${
                  model === m ? 'bg-blue-600/20 border border-blue-500 text-blue-200' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>{m}</span>
                {model === m && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice */}
      <div className="space-y-3">
         <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Mic2 className="w-4 h-4 text-red-400" /> Voiceover Persona
         </label>
         <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {VOICES.map((v) => (
                <button
                    key={v.name}
                    onClick={() => setVoice(v.name)}
                    className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-all ${
                        selectedVoice === v.name ? 'bg-red-600/20 border border-red-500 text-red-200' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <span className="font-bold">{v.name}</span>
                    <span className="opacity-70 text-[9px] text-center">{v.desc}</span>
                </button>
            ))}
         </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Upload className="w-4 h-4 text-green-400" /> Product Name
            </label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. SlimFit Yoga Pants"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            />
         </div>
         <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Clock className="w-4 h-4 text-orange-400" /> Target Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {getDurationOptions().map((secs) => (
                <button
                  key={secs}
                  onClick={() => setTargetDuration(secs)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    targetDuration === secs ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-pink-400" /> Reference Imagery
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Product Photos</span>
             <div className="grid grid-cols-4 gap-2">
                {productImages.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700">
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="Product" />
                    <button onClick={() => removeImage(img.id, 'product')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-500 mb-1" />
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} />
                </label>
             </div>
          </div>
          <div className="space-y-2">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Model Photos</span>
             <div className="grid grid-cols-4 gap-2">
                {modelImages.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700">
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="Model" />
                    <button onClick={() => removeImage(img.id, 'model')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-500 mb-1" />
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'model')} />
                </label>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};