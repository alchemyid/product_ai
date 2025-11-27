
import React, { useState } from 'react';
import { AppMode, GenerationConfig, ObjectType, Gender, AgeRange, Ethnicity, BodyPartType, GeneratedImage, ProductCategory, BrandVibe } from './types';
import { ETHNICITIES, AGES, GENDERS, ENVIRONMENTS, OBJECT_TYPES, BODY_PARTS, PRODUCT_CATEGORIES, BRAND_VIBES, HAIR_STYLES } from './constants';
import { generateImages } from './services/geminiService';
import InputSelect from './components/InputSelect';
import ApiKeyChecker from './components/ApiKeyChecker';
import { Camera, Layers, Wand2, Download, RefreshCw, ShoppingBag, Palette, MessageSquarePlus, UserSquare2 } from 'lucide-react';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // State
  const [mode, setMode] = useState<AppMode>(AppMode.FULL_BODY);
  
  // Form States
  const [objectType, setObjectType] = useState<string>(ObjectType.HUMAN);
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [ethnicity, setEthnicity] = useState<string>("");
  const [hairStyle, setHairStyle] = useState<string>("");
  const [environment, setEnvironment] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>(""); // New state for manual input
  
  // New States for Sales Optimization
  const [productCategory, setProductCategory] = useState<string>("");
  const [brandVibe, setBrandVibe] = useState<string>("");
  
  const [bodyPart, setBodyPart] = useState<string>("");

  const handleGenerate = async () => {
    if (!apiKeyReady) return;

    // Validation
    // Only check product/vibe if NOT in Reference Mode
    if (mode !== AppMode.CHARACTER_REFERENCE) {
      if (!productCategory || !brandVibe) {
          alert("Please select a Product Category and Brand Vibe to optimize for sales.");
          return;
      }
    }

    if (mode === AppMode.FULL_BODY) {
      if (objectType === ObjectType.HUMAN && (!gender || !age || !ethnicity)) {
        alert("Please fill in all Human attributes");
        return;
      }
      if (objectType === ObjectType.MANNEQUIN && !gender) {
         alert("Please select gender");
         return;
      }
    } else if (mode === AppMode.BODY_PARTS) {
      // Body parts validation now includes gender
      if (!ethnicity || !age || !bodyPart || !gender) {
        alert("Please fill in all Body Part attributes (Gender, Ethnicity, Age, Part)");
        return;
      }
    } else if (mode === AppMode.CHARACTER_REFERENCE) {
       // Reference validation
       if (!gender || !age || !ethnicity) {
          alert("Please fill in all Model Attributes (Gender, Age, Ethnicity) to create a reference sheet.");
          return;
       }
    }

    setLoading(true);
    setGeneratedImages([]); // Clear previous

    const config: GenerationConfig = {
      mode,
      objectType: objectType as ObjectType,
      gender: gender as Gender,
      ageRange: age as AgeRange,
      ethnicity: ethnicity as Ethnicity,
      environment, // Optional
      bodyPartType: bodyPart as BodyPartType,
      productCategory: productCategory as ProductCategory,
      brandVibe: brandVibe as BrandVibe,
      hairStyle: hairStyle, // Optional
      customPrompt: customPrompt // Manual user override
    };

    try {
      const base64Images = await generateImages(config);
      
      const newImages: GeneratedImage[] = base64Images.map((url, index) => ({
        id: Date.now() + '-' + index,
        url,
        promptUsed: mode === AppMode.CHARACTER_REFERENCE ? 'Character Reference Sheet (7-Angle)' : `${productCategory} - ${brandVibe}` 
      }));

      setGeneratedImages(newImages);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate images. Ensure your API key has access to Image Generation models.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-brand-500 selection:text-white pb-20">
      <ApiKeyChecker onReady={() => setApiKeyReady(true)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ProModel<span className="font-light text-brand-400">GenAI</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:inline-flex px-2 py-1 rounded bg-brand-900/30 text-brand-300 text-xs border border-brand-500/20">
               Sales Optimized V2
             </span>
             <div className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                Gemini 3.0 Pro
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* Mode Switcher */}
          <div className="p-1 bg-slate-800 rounded-xl flex shadow-inner gap-1">
            <button 
              onClick={() => { setMode(AppMode.FULL_BODY); setGender(""); }}
              className={`flex-1 py-2 px-1 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === AppMode.FULL_BODY ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Full Body
            </button>
            <button 
              onClick={() => { setMode(AppMode.BODY_PARTS); setGender(""); }}
              className={`flex-1 py-2 px-1 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === AppMode.BODY_PARTS ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Body Parts
            </button>
             <button 
              onClick={() => { setMode(AppMode.CHARACTER_REFERENCE); setGender(""); }}
              className={`flex-1 py-2 px-1 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === AppMode.CHARACTER_REFERENCE ? 'bg-brand-900/50 text-brand-200 shadow-sm border border-brand-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Face Collage
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Sales Context Section - HIDE if in Reference Mode */}
            {mode !== AppMode.CHARACTER_REFERENCE && (
              <div className="bg-slate-800/50 border border-brand-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                 <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag size={18} className="text-brand-400" />
                    <h2 className="font-semibold text-white">Target Product Context</h2>
                 </div>
                 <div className="space-y-4">
                    <InputSelect 
                      label="What are you selling?" 
                      value={productCategory} 
                      onChange={setProductCategory} 
                      options={PRODUCT_CATEGORIES}
                      placeholder="Select Product Category..." 
                    />
                     <InputSelect 
                      label="Brand Vibe & Mood" 
                      value={brandVibe} 
                      onChange={setBrandVibe} 
                      options={BRAND_VIBES} 
                      placeholder="Select Brand Style..."
                    />
                 </div>
              </div>
            )}

            {/* Reference Mode Info */}
            {mode === AppMode.CHARACTER_REFERENCE && (
               <div className="bg-brand-900/20 border border-brand-500/30 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-start gap-3">
                    <UserSquare2 className="text-brand-400 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-brand-200 text-sm">Face Reference Mode (7-Angle Sheet)</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Generates a comprehensive character sheet of the <strong>same model</strong> from 7 distinct angles: Front, Right, Left, 3/4 Views, Top, and Bottom. Perfect for training LoRAs or keeping face consistency.
                      </p>
                    </div>
                  </div>
               </div>
            )}

            {/* Model Details Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-700/50">
                <Layers size={18} className="text-slate-400" />
                <h2 className="font-semibold text-white">Model Specifications</h2>
              </div>

              {mode === AppMode.FULL_BODY ? (
                <>
                  <InputSelect 
                    label="Object Type" 
                    value={objectType} 
                    onChange={setObjectType} 
                    options={OBJECT_TYPES} 
                  />
                  
                  <InputSelect 
                    label="Gender" 
                    value={gender} 
                    onChange={setGender} 
                    options={GENDERS} 
                  />

                  {objectType === ObjectType.HUMAN && (
                    <>
                      <InputSelect 
                        label="Age Range" 
                        value={age} 
                        onChange={setAge} 
                        options={AGES} 
                      />
                      <InputSelect 
                        label="Ethnicity" 
                        value={ethnicity} 
                        onChange={setEthnicity} 
                        options={ETHNICITIES} 
                      />
                      <InputSelect 
                        label="Hair Style (Optional)" 
                        value={hairStyle} 
                        onChange={setHairStyle} 
                        options={HAIR_STYLES}
                        placeholder="Default / Auto"
                      />
                    </>
                  )}
                </>
              ) : mode === AppMode.BODY_PARTS ? (
                <>
                  <InputSelect 
                    label="Gender" 
                    value={gender} 
                    onChange={setGender} 
                    options={GENDERS} 
                  />
                   <InputSelect 
                    label="Ethnicity" 
                    value={ethnicity} 
                    onChange={setEthnicity} 
                    options={ETHNICITIES} 
                  />
                  <InputSelect 
                    label="Age Range" 
                    value={age} 
                    onChange={setAge} 
                    options={AGES} 
                  />
                   <InputSelect 
                        label="Hair Style (Optional)" 
                        value={hairStyle} 
                        onChange={setHairStyle} 
                        options={HAIR_STYLES}
                        placeholder="Default / Auto"
                      />
                  <InputSelect 
                    label="Body Part Focus" 
                    value={bodyPart} 
                    onChange={setBodyPart} 
                    options={BODY_PARTS} 
                  />
                </>
              ) : (
                /* CHARACTER REFERENCE INPUTS */
                <>
                   <InputSelect 
                    label="Gender" 
                    value={gender} 
                    onChange={setGender} 
                    options={GENDERS} 
                  />
                   <InputSelect 
                    label="Ethnicity" 
                    value={ethnicity} 
                    onChange={setEthnicity} 
                    options={ETHNICITIES} 
                  />
                  <InputSelect 
                    label="Age Range" 
                    value={age} 
                    onChange={setAge} 
                    options={AGES} 
                  />
                  <InputSelect 
                    label="Hair Style" 
                    value={hairStyle} 
                    onChange={setHairStyle} 
                    options={HAIR_STYLES}
                    placeholder="Default / Auto"
                  />
                </>
              )}
               
               {/* Advanced Environment Toggle - Only for Product Modes */}
               {mode !== AppMode.CHARACTER_REFERENCE && (
                <div className="pt-2 border-t border-slate-700/50">
                    <InputSelect 
                      label="Specific Environment (Optional)" 
                      value={environment} 
                      onChange={setEnvironment} 
                      options={ENVIRONMENTS} 
                      placeholder="Auto-match to Brand Vibe"
                    />
                </div>
               )}
            </div>

            {/* Custom Emphasis Field */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                 <MessageSquarePlus size={16} className="text-brand-400" />
                 <label className="text-sm font-medium text-slate-300">Custom Emphasis (Optional)</label>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={mode === AppMode.CHARACTER_REFERENCE ? "Ex: Blue eyes, small mole on cheek, sharp jawline..." : "Ex: 'Model should be wearing a Hijab' or 'Focus on the golden watch detail'..."}
                className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-3 h-24 resize-none transition-colors placeholder:text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-2">
                {mode === AppMode.CHARACTER_REFERENCE 
                  ? "Define specific facial features for the reference sheet." 
                  : "Use this to override categories (e.g., selling Sneakers but specifically want Islamic Fashion style)."}
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !apiKeyReady}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all transform active:scale-95
                ${loading || !apiKeyReady 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 ring-1 ring-white/10'}`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Creating Assets...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  {mode === AppMode.CHARACTER_REFERENCE ? "Generate Face Collage" : "Generate Professional Models"}
                </>
              )}
            </button>
          </div>
          
        </div>

        {/* Right Panel: Gallery */}
        <div className="lg:col-span-8 xl:col-span-9">
          {generatedImages.length === 0 && !loading ? (
             <div className="h-[600px] border-2 border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-800/20">
                <Palette size={48} className="mb-4 opacity-50 text-brand-400" />
                <p className="text-xl font-medium text-slate-300">Start Your Campaign</p>
                <p className="text-sm opacity-60 mt-2 max-w-md text-center">
                  Select your product category to generate models, or use <span className="text-brand-300">Face Reference</span> to create a consistent character sheet.
                </p>
             </div>
          ) : (
            <div className={`grid grid-cols-1 ${mode === AppMode.CHARACTER_REFERENCE ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
               {loading && Array.from({length: mode === AppMode.CHARACTER_REFERENCE ? 1 : 3}).map((_, i) => (
                  <div key={i} className={`bg-slate-800 rounded-xl animate-pulse flex flex-col items-center justify-center gap-4 ${mode === AppMode.CHARACTER_REFERENCE ? 'aspect-video' : 'aspect-[3/4]'}`}>
                    <RefreshCw className="text-brand-500 animate-spin" size={32} />
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Rendering 8K...</span>
                  </div>
               ))}
               
               {generatedImages.map((img) => (
                 <div key={img.id} className={`group relative rounded-xl overflow-hidden shadow-2xl bg-black ${mode === AppMode.CHARACTER_REFERENCE ? 'aspect-video col-span-1' : 'aspect-[3/4]'} ring-1 ring-white/10`}>
                    <img 
                      src={img.url} 
                      alt="Generated Model" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Clean Overlay with just Download Button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <a 
                        href={img.url} 
                        download={`promodel-${img.id}.png`}
                        className="w-full py-3 bg-white/90 backdrop-blur text-slate-900 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg"
                      >
                        <Download size={16} />
                        Download Asset
                      </a>
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
