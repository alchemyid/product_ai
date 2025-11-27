import React, { useState } from 'react';
import { ModelGenerationConfig, AppMode, ObjectType, Gender, AgeRange, Ethnicity, ProductCategory, BrandVibe, BodyPartType } from '@/types';
import { ETHNICITIES, AGES, GENDERS, OBJECT_TYPES, PRODUCT_CATEGORIES, BRAND_VIBES, HAIR_STYLES, BODY_PARTS } from '@/constants/model_constants';
import geminiService from '@/services/gemini';
import { Loader2, Wand2, Download, Camera } from 'lucide-react';
import InputSelect from '@/components/model/InputSelect';

const ModelApp: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Config State
    const [mode, setMode] = useState<AppMode>(AppMode.FULL_BODY);
    const [objectType, setObjectType] = useState<string>(ObjectType.HUMAN);
    const [gender, setGender] = useState<string>(Gender.FEMALE);
    const [age, setAge] = useState<string>(AgeRange.YOUNG_ADULT);
    const [ethnicity, setEthnicity] = useState<string>(Ethnicity.EUROPEAN);
    const [productCategory, setProductCategory] = useState<string>(ProductCategory.GENERAL_APPAREL);
    const [brandVibe, setBrandVibe] = useState<string>(BrandVibe.MINIMALIST_CLEAN);
    const [hairStyle, setHairStyle] = useState<string>("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [bodyPart, setBodyPart] = useState<string>(BodyPartType.HEAD_FACE);

    const handleGenerate = async () => {
        setLoading(true);
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
                bodyPartType: bodyPart as BodyPartType
            };

            const base64 = await geminiService.generateAdvancedModel(config);
            setGeneratedImage(base64);
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
                    <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
                        {Object.values(AppMode).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 text-[10px] py-2 rounded-md font-medium transition-colors ${mode === m ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                {m.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <InputSelect label="Product Context" value={productCategory} onChange={setProductCategory} options={PRODUCT_CATEGORIES} />
                    <InputSelect label="Brand Vibe" value={brandVibe} onChange={setBrandVibe} options={BRAND_VIBES} />

                    <div className="h-px bg-slate-800 my-4" />

                    <InputSelect label="Gender" value={gender} onChange={setGender} options={GENDERS} />

                    {mode !== AppMode.BODY_PARTS && (
                        <InputSelect label="Object Type" value={objectType} onChange={setObjectType} options={OBJECT_TYPES} />
                    )}

                    {objectType === ObjectType.HUMAN && (
                        <>
                            <InputSelect label="Ethnicity" value={ethnicity} onChange={setEthnicity} options={ETHNICITIES} />
                            <InputSelect label="Age" value={age} onChange={setAge} options={AGES} />
                            <InputSelect label="Hair Style" value={hairStyle} onChange={setHairStyle} options={HAIR_STYLES} placeholder="Auto" />
                        </>
                    )}

                    {mode === AppMode.BODY_PARTS && (
                        <InputSelect label="Body Part" value={bodyPart} onChange={setBodyPart} options={BODY_PARTS} />
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">Custom Details</label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white h-24 resize-none focus:outline-none focus:border-purple-500"
                            placeholder="E.g. Blue eyes, wearing a red scarf..."
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="mt-auto w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    Generate Model
                </button>
            </aside>

            {/* Main View */}
            <main className="flex-1 p-8 flex items-center justify-center">
                {generatedImage ? (
                    <div className="relative max-h-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-black">
                        <img src={`data:image/png;base64,${generatedImage}`} className="w-full h-full object-contain" alt="Gen" />
                        <a
                            href={`data:image/png;base64,${generatedImage}`}
                            download="model.png"
                            className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors"
                        >
                            <Download className="w-6 h-6" />
                        </a>
                    </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <Camera className="w-20 h-20 mx-auto mb-4 opacity-20" />
                        <p>Configure settings to start generation</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModelApp;