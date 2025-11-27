import React, { useState } from 'react';
import { ModelGenerationConfig, AppMode, ObjectType, Gender, AgeRange, Ethnicity, ProductCategory, BrandVibe, BodyPartType } from '@/types';
import { ETHNICITIES, AGES, GENDERS, OBJECT_TYPES, PRODUCT_CATEGORIES, BRAND_VIBES, HAIR_STYLES, BODY_PARTS, ENVIRONMENTS } from '@/constants/model_constants';
import geminiService from '@/services/gemini';
import { Loader2, Wand2, Download, Camera, Layers, ShoppingBag, Palette, MessageSquarePlus, UserSquare2 } from 'lucide-react';
import InputSelect from '@/components/model/InputSelect';

interface GeneratedImage {
    id: string;
    url: string;
    promptUsed: string;
}

const ModelApp: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

    // Config State
    const [mode, setMode] = useState<AppMode>(AppMode.FULL_BODY);
    const [objectType, setObjectType] = useState<string>(ObjectType.HUMAN);
    const [gender, setGender] = useState<string>(Gender.FEMALE);
    const [age, setAge] = useState<string>(AgeRange.YOUNG_ADULT);
    const [ethnicity, setEthnicity] = useState<string>(Ethnicity.EUROPEAN);
    const [productCategory, setProductCategory] = useState<string>(ProductCategory.GENERAL_APPAREL);
    const [brandVibe, setBrandVibe] = useState<string>(BrandVibe.MINIMALIST_CLEAN);
    const [hairStyle, setHairStyle] = useState<string>("");
    const [environment, setEnvironment] = useState<string>("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [bodyPart, setBodyPart] = useState<string>(BodyPartType.HEAD_FACE);

    const handleGenerate = async () => {
        // Basic Validation
        if (mode === AppMode.FULL_BODY && objectType === ObjectType.HUMAN && (!gender || !ethnicity)) {
            alert("Please select Gender and Ethnicity.");
            return;
        }

        setLoading(true);
        setGeneratedImages([]); // Clear previous

        try {
            const config: ModelGenerationConfig = {
                mode,
                objectType: objectType as ObjectType,
                gender: gender as Gender,
                ageRange: age as AgeRange,
                ethnicity: ethnicity as Ethnicity,
                productCategory: productCategory as ProductCategory,
                brandVibe: brandVibe as BrandVibe,
                hairStyle,
                customPrompt,
                bodyPartType: bodyPart as BodyPartType,
                environment
            };

            const images = await geminiService.generateAdvancedModel(config);

            const newImages: GeneratedImage[] = images.map((url, index) => ({
                id: Date.now() + '-' + index,
                url,
                promptUsed: mode === AppMode.CHARACTER_REFERENCE ? 'Character Reference Sheet' : `${productCategory} - ${brandVibe}`
            }));

            setGeneratedImages(newImages);
        } catch (error) {
            console.error(error);
            alert("Generation failed. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-[#0b1120]">
            {/* Sidebar Controls */}
            <aside className="w-[400px] bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto flex flex-col gap-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-400" />
                        Model Studio
                    </h2>

                    {/* Mode Switcher */}
                    <div className="flex bg-slate-800 p-1 rounded-lg mb-6 shadow-inner">
                        <button
                            onClick={() => setMode(AppMode.FULL_BODY)}
                            className={`flex-1 py-2 px-1 rounded-md text-[10px] font-medium transition-all ${mode === AppMode.FULL_BODY ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Full Body
                        </button>
                        <button
                            onClick={() => setMode(AppMode.BODY_PARTS)}
                            className={`flex-1 py-2 px-1 rounded-md text-[10px] font-medium transition-all ${mode === AppMode.BODY_PARTS ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Body Parts
                        </button>
                        <button
                            onClick={() => setMode(AppMode.CHARACTER_REFERENCE)}
                            className={`flex-1 py-2 px-1 rounded-md text-[10px] font-medium transition-all ${mode === AppMode.CHARACTER_REFERENCE ? 'bg-purple-900/50 text-purple-200 shadow-sm border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Face Collage
                        </button>
                    </div>
                </div>

                <div className="space-y-4">

                    {/* Reference Mode Info */}
                    {mode === AppMode.CHARACTER_REFERENCE && (
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <UserSquare2 className="text-purple-400 mt-1 flex-shrink-0" size={16} />
                                <div>
                                    <h3 className="font-bold text-purple-200 text-xs">Face Reference Mode (7-Angle Sheet)</h3>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        Generates a comprehensive character sheet of the <strong>same model</strong> from 7 distinct angles: Front, Right, Left, 3/4 Views, Top, and Bottom. Perfect for training LoRAs or keeping face consistency.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                        <Layers size={14} className="text-slate-500" />
                        <h3 className="font-semibold text-slate-300 text-sm">Model Specifications</h3>
                    </div>

                    {/* Dynamic Form Fields */}
                    {mode !== AppMode.CHARACTER_REFERENCE && (
                        <>
                            <InputSelect label="Product Context" value={productCategory} onChange={setProductCategory} options={PRODUCT_CATEGORIES} />
                            <InputSelect label="Brand Vibe" value={brandVibe} onChange={setBrandVibe} options={BRAND_VIBES} />
                        </>
                    )}

                    <InputSelect label="Gender" value={gender} onChange={setGender} options={GENDERS} />

                    {mode !== AppMode.BODY_PARTS && (
                        <InputSelect label="Object Type" value={objectType} onChange={setObjectType} options={OBJECT_TYPES} />
                    )}

                    {/* Specifics for Human Models or Reference Sheets */}
                    {(objectType === ObjectType.HUMAN || mode === AppMode.CHARACTER_REFERENCE) && (
                        <>
                            <InputSelect label="Ethnicity" value={ethnicity} onChange={setEthnicity} options={ETHNICITIES} />
                            <InputSelect label="Age Range" value={age} onChange={setAge} options={AGES} />
                            <InputSelect label="Hair Style" value={hairStyle} onChange={setHairStyle} options={HAIR_STYLES} placeholder="Default / Auto" />
                        </>
                    )}

                    {mode === AppMode.BODY_PARTS && (
                        <InputSelect label="Body Part Focus" value={bodyPart} onChange={setBodyPart} options={BODY_PARTS} />
                    )}

                    {mode !== AppMode.CHARACTER_REFERENCE && (
                        <InputSelect label="Environment (Optional)" value={environment} onChange={setEnvironment} options={ENVIRONMENTS} placeholder="Auto-match to Vibe" />
                    )}

                    <div className="space-y-1 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquarePlus size={14} className="text-purple-400" />
                            <label className="text-xs font-medium text-slate-300">Custom Emphasis (Optional)</label>
                        </div>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs text-white h-20 resize-none focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                            placeholder={mode === AppMode.CHARACTER_REFERENCE
                                ? "Ex: Blue eyes, small mole on cheek, sharp jawline..."
                                : "Ex: 'Model should be wearing a Hijab' or 'Focus on the golden watch detail'..."}
                        />
                        <p className="text-[10px] text-slate-500">
                            {mode === AppMode.CHARACTER_REFERENCE
                                ? "Define specific facial features for the reference sheet."
                                : "Override categories (e.g., specific clothing item)."}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`mt-auto w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all transform active:scale-[0.99]
                ${loading
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20'}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" />
                            <span>Creating Assets...</span>
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-4 h-4" />
                            <span>{mode === AppMode.CHARACTER_REFERENCE ? "Generate Face Collage" : "Generate Model"}</span>
                        </>
                    )}
                </button>
            </aside>

            {/* Main View / Gallery */}
            <main className="flex-1 p-8 overflow-y-auto">

                {generatedImages.length === 0 && !loading ? (
                    <div className="h-full min-h-[500px] border-2 border-dashed border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-800/20">
                        <Palette size={48} className="mb-4 opacity-50 text-purple-400" />
                        <p className="text-xl font-medium text-slate-300">Start Your Campaign</p>
                        <p className="text-sm opacity-60 mt-2 max-w-md text-center">
                            Select your product category to generate models, or use <span className="text-purple-400 font-medium">Face Reference</span> to create a consistent character sheet.
                        </p>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 ${mode === AppMode.CHARACTER_REFERENCE ? 'md:grid-cols-1 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                        {/* Loading Skeleton */}
                        {loading && Array.from({length: mode === AppMode.CHARACTER_REFERENCE ? 1 : 3}).map((_, i) => (
                            <div key={i} className={`bg-slate-800 rounded-xl animate-pulse flex flex-col items-center justify-center gap-4 border border-slate-700 ${mode === AppMode.CHARACTER_REFERENCE ? 'aspect-video' : 'aspect-[3/4]'}`}>
                                <Loader2 className="text-purple-500 animate-spin" size={32} />
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Rendering 8K Asset...</span>
                            </div>
                        ))}

                        {/* Results */}
                        {generatedImages.map((img) => (
                            <div key={img.id} className={`group relative rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800 ${mode === AppMode.CHARACTER_REFERENCE ? 'aspect-video' : 'aspect-[3/4]'}`}>
                                <img
                                    src={img.url}
                                    alt="Generated Model"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-white font-medium text-sm">{mode === AppMode.CHARACTER_REFERENCE ? "Character Sheet" : productCategory}</p>
                                            <p className="text-slate-400 text-xs">{brandVibe}</p>
                                        </div>
                                        <a
                                            href={img.url}
                                            download={`promodel-${img.id}.png`}
                                            className="p-3 bg-white text-slate-900 rounded-full hover:bg-purple-50 transition-colors shadow-lg"
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModelApp;