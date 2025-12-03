import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerativeModel, Type, Modality } from "@google/genai";
import {
    ModelGenerationConfig,
    DesignGenerationParams,
    ProductCategory,
    BrandVibe,
    AppMode,
    ObjectType,
    Gender,
    BodyPartType,
    GenerateVideoParams,
    ThemeOption,
    UploadedImage,
    SocialPlatform,
    AIModel,
    ScriptScene
} from "@/types";


// Access key via import.meta.env for Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

class GeminiService {
    private static instance: GeminiService;
    private genAI: GoogleGenAI;
    private visionModel: GenerativeModel;

    private constructor() {
        if (!API_KEY) {
            console.error("VITE_GEMINI_API_KEY is missing in .env file");
            throw new Error("API Key is not defined. Please check your .env file.");
        }
        this.genAI = new GoogleGenAI({ apiKey: API_KEY });
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    // ==========================================
    //  HELPER LOGIC
    // ==========================================

    // Helper to strip the data:image/png;base64, prefix
    private cleanBase64(dataUrl: string): string {
        if (dataUrl.includes(',')) {
            return dataUrl.split(',')[1];
        }
        return dataUrl;
    }
    
    private getPosingLogic(category?: ProductCategory): string {
        if (!category) return "Neutral standing pose.";
        switch (category) {
            case ProductCategory.ISLAMIC_FASHION: return "Modest, elegant, and respectful posing. Standing upright with grace or sitting politely. Hands gently folded or holding a bag/accessory. No revealing poses. Focus on the flow of the fabric and the modest silhouette. Expression should be serene, kind, and sophisticated.";
            case ProductCategory.JEWELRY: return "Model should have exposed neck and ears. Elegant hand placement near face. Sophisticated expression.";
            case ProductCategory.WATCHES: return "Focus on wrists. Arms crossed or hand near face to showcase wrist area.";
            case ProductCategory.FOOTWEAR: return "Dynamic walking pose or sitting with legs extended towards camera.";
            case ProductCategory.STREETWEAR: return "Cool, confident posture. Slouching slightly, hands in pockets. 'Too cool for school' vibe.";
            case ProductCategory.ACTIVEWEAR: return "Dynamic movement, stretching, or fitness stance. Muscles slightly engaged.";
            default: return "Neutral professional standing pose, confident posture.";
        }
    }

    private getVibeLogic(vibe?: BrandVibe): string {
        if (!vibe) return "Lighting: Neutral studio lighting. Background: Solid white/grey.";
        switch (vibe) {
            case BrandVibe.MINIMALIST_CLEAN: return "Lighting: Soft diffused. Background: Clean, minimal negative space.";
            case BrandVibe.LUXURY_ELEGANT: return "Lighting: Warm, golden hour or spotlight. Background: Rich textures or blurred luxury interior.";
            case BrandVibe.URBAN_EDGY: return "Lighting: High contrast, neon accents. Background: Concrete, street textures.";
            default: return "Lighting: Professional studio strobe. Background: Neutral cyclorama.";
        }
    }

    // Robust image extraction that handles MIME types correctly
    private extractImageURI(response: any): string {
        // Try to find a part with inlineData
        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

        if (part?.inlineData?.data) {
            // Critical Fix: Use the mimeType from the response, default to jpeg if missing.
            // The API often returns 'image/jpeg' for photorealistic images.
            const mimeType = part.inlineData.mimeType || 'image/jpeg';
            return `data:${mimeType};base64,${part.inlineData.data}`;
        }

        throw new Error("No image data found in response");
    }

    private extractText(response: any): string {
        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
        if (part?.text) {
            return part.text;
        }
        return "";
    }

    private buildPrompt(config: ModelGenerationConfig, angle: string): string {
        const posingInstructions = this.getPosingLogic(config.productCategory);
        const vibeInstructions = this.getVibeLogic(config.brandVibe);
        const technicalSpecs = "Masterpiece, best quality, 8k resolution, photorealistic, shot on Phase One XF IQ4 150MP. The image must be aesthetically pleasing, beautiful, and highly detailed. Professional commercial photography, magazine cover quality, sharp focus, perfect skin texture.";

        let subjectDescription = "";
        // Logic for Hair vs Headwear (Islamic Fashion Override)
        let hairDesc = config.hairStyle ? ` with ${config.hairStyle} hair style` : " with professionally styled hair";
        let outfitDesc = "";

        if (config.productCategory === ProductCategory.ISLAMIC_FASHION) {
            if (config.gender === Gender.FEMALE) {
                hairDesc = " wearing a beautiful, stylish, high-quality Hijab (headscarf)";
                outfitDesc = "She is wearing a fashionable, modest Gamis or Abaya dress with modern layering. The outfit is elegant and covers the aurat appropriately for high fashion.";
            } else if (config.gender === Gender.MALE) {
                hairDesc = " wearing a stylish Peci (Kopiah/Cap) and neat grooming";
                outfitDesc = "He is wearing a modern Baju Koko or Kurta shirt. Modest Islamic men's fashion.";
            }
        }

        const modelAdjectives = "stunning, charismatic, world-class professional model";
        const userCustomEmphasis = config.customPrompt
            ? `IMPORTANT USER SPECIFIC REQUIREMENT: ${config.customPrompt}. Ensure this specific instruction is prioritized and integrated into the final image.`
            : "";

        // --- MODE SPECIFIC LOGIC ---
        if (config.mode === AppMode.CHARACTER_REFERENCE) {
            const ethnicity = config.ethnicity || "International";
            const gender = config.gender || "Female";
            const age = config.ageRange || "Young Adult";

            return `
            Create a Comprehensive 7-Angle Professional Character Reference Sheet (Face Collage).
            
            SUBJECT: A ${modelAdjectives}, ${age}, ${gender}, ${ethnicity}${hairDesc}.
            
            COMPOSITION: A clean grid or collage showing the SAME person's face from 7 distinct angles for 3D modeling and AI consistency training:
            1. Front View (Direct eye contact)
            2. Right Profile (Side View 90°)
            3. Left Profile (Side View 90°)
            4. Right 3/4 View
            5. Left 3/4 View
            6. High Angle View (From above)
            7. Low Angle View (From below)
            
            DETAILS: 
            - CRITICAL: The face structure, skin texture, and features MUST be identical across all views.
            - Neutral to slightly pleasant expression.
            - Makeup should be natural and polished (unless specified otherwise).
            - Lighting: Flat, even, high-quality studio lighting (Butterfly lighting) to show facial geography clearly without harsh shadows.
            - Background: Solid White or Light Grey (Clean studio background).
            - Style: Professional Model Agency Composite Card / 3D Texture Reference.
            
            ${outfitDesc ? `OUTFIT: ${outfitDesc}` : "OUTFIT: Simple black or white crew neck t-shirt/tank top to keep focus on the face."}
            
            TECHNICAL: ${technicalSpecs}
            
            ${userCustomEmphasis}
            `;
        } else if (config.mode === AppMode.FULL_BODY) {
            if (config.objectType === ObjectType.MANNEQUIN) {
                subjectDescription = `A high-end, realistic 3D ${config.gender} mannequin. Material: Premium matte finish suitable for ${config.productCategory}. Sculpted to perfection.`;
            } else {
                subjectDescription = `A ${modelAdjectives}, ${config.ageRange}, ${config.gender}, ${config.ethnicity} ethnicity${hairDesc}. The model has a symmetrical face and an aesthetically pleasing physique suitable for high-fashion. ${outfitDesc}`;
            }
        } else {
            // Body Parts specific prompts
            switch (config.bodyPartType) {
                case BodyPartType.HEAD_FACE:
                    subjectDescription = `Close-up beauty portrait of a ${modelAdjectives} (${config.ethnicity}, ${config.gender}, ${config.ageRange})${hairDesc}. Focus on flawless skin and captivating eyes. ${config.productCategory === ProductCategory.ISLAMIC_FASHION ? 'Emphasis on the styling of the Hijab/Peci and facial beauty.' : ''}`;
                    break;
                case BodyPartType.HANDS:
                    subjectDescription = `Macro beauty shot of elegant hands of a ${config.ethnicity} ${config.gender} professional model. Fingers are long and graceful, skin is smooth.`;
                    break;
                case BodyPartType.LEGS:
                    subjectDescription = `Lower body fashion shot focusing on legs/feet of a ${config.ethnicity} ${config.gender} professional model. Legs are toned and skin is flawless.`;
                    break;
                default:
                    subjectDescription = `Cropped artistic fashion shot of a ${config.ethnicity} ${config.gender} professional model${hairDesc}. ${outfitDesc}`;
            }
        }

        // Construct the final narrative for Normal Modes
        return `
            Create a professional e-commerce product photography asset.
            
            SUBJECT: ${subjectDescription}
            CONTEXT: The model is posing to sell products in this category: ${config.productCategory}.
            POSING INSTRUCTIONS: ${posingInstructions}
            ANGLE/COMPOSITION: ${angle}.
            
            ATMOSPHERE & VIBE: ${vibeInstructions}
            ENVIRONMENT: ${config.environment || 'Consistent with the Vibe'}.
            
            TECHNICAL: ${technicalSpecs}
            
            ${userCustomEmphasis}

            IMPORTANT GUIDELINES:
            1. AESTHETICS: The model MUST look professional, attractive, and polished. No imperfections.
            2. CLOTHING: The model should wear neutral, non-distracting clothing (unless specified in USER SPECIFIC REQUIREMENT or Category) to allow for product context.
            3. LIGHTING: The lighting should perfectly illuminate the areas where a product would be placed.
            4. FOCUS: Ensure the subject is the absolute focus of the image.
        `;
    }

    // ==========================================
    //  CORE GENERATION METHODS
    // ==========================================

    /**
     * Advanced Model Generation - Generates multiple images (Campaign) or Single Sheet
     */
    public async generateAdvancedModel(config: ModelGenerationConfig): Promise<string[]> {
        // Define angles based on mode to provide variety
        let angles = [
            "Front facing view, symmetrical, looking at camera",
            "45-degree side angle view, editorial pose",
            "Dynamic motion or lifestyle pose, engaging",
        ];

        let aspectRatio = "3:4"; // Default portrait

        if (config.mode === AppMode.BODY_PARTS) {
            angles = [
                "Detail shot, straight on, perfect symmetry",
                "Artistic side angle, depth of field",
                "Contextual lifestyle angle, natural movement"
            ];
            aspectRatio = "1:1";
        } else if (config.mode === AppMode.CHARACTER_REFERENCE) {
            // CHANGED: Only one sheet is needed as per user request
            angles = ["7-Angle Reference Sheet"];
            aspectRatio = "16:9"; // Wide format is critical for 7-angle layout
        }

        // Switch to gemini-2.5-flash-image-preview as requested/suggested by environment compatibility
        // The user mentioned 'gemini-3-pro-image-preview' from their example, but in this specific runtime
        // environment, we typically map to accessible models.
        // However, to honor the user's request to use the model from the example:
        const MODEL_NAME = 'gemini-3-pro-image-preview';

        const imagePromises = angles.map(async (angle) => {
            try {
                const prompt = this.buildPrompt(config, angle);
                const response = await this.genAI.models.generateContent({
                    model: MODEL_NAME,
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        imageConfig: {
                            aspectRatio: aspectRatio,
                            sampleCount: 1
                        }
                    }
                });
                // Use the new helper to ensure MIME type is correct
                return this.extractImageURI(response);
            } catch (error) {
                console.error(`Failed to generate angle ${angle}:`, error);
                return null;
            }
        });

        const results = await Promise.all(imagePromises);
        return results.filter((img): img is string => img !== null);
    }

    /**
     * Design Analysis
     */
    public async analyzeImageForDesign(base64Image: string): Promise<string> {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        const prompt = `
            Analyze this image to create a strict text command for generating a VECTOR ART design.
            Extract ANY text visible. Describe the subject, pose, and items.
            FORCE "Solid Pure White Background".
            Demand "Clean, crisp black outlines", "Flat solid spot colors".
            Output ONLY the prompt.
        `;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
                ]
            }
        });

        return this.extractText(response);
    }

    public async generateVectorDesign(params: DesignGenerationParams): Promise<string> {
        const dtfSuffix = " . professional vector art, clean proportional black outlines, flat solid colors, cel-shaded, isolated on white background. NEGATIVE_PROMPT: gradients, shading, noise, realism, 3d.";
        const fullPrompt = `t-shirt design, ${params.prompt}. Style: ${params.style}. ${dtfSuffix}`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [{ text: fullPrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        // Use the new helper here too
        return this.extractImageURI(response);
    }

    /**
     * Product Photography Logic
     */
    public async generateBaseProduct(prompt: string, aspectRatio: string): Promise<string> {
        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [{ text: `Professional product photography of ${prompt}. High quality, sharp focus, isolated.` }] },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });
        return this.extractImageURI(response);
    }

    public async generateScenarioVariation(baseImage: string, scenarioPrompt: string, aspectRatio: string): Promise<string> {
        const cleanBase64 = baseImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const prompt = `Generate a photorealistic image of this product: ${scenarioPrompt}. Keep product identity 100% consistent.`;

        // Note: Image-to-Image usually requires Gemini Flash, not Imagen directly in this SDK version
        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
                ]
            },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });
        return this.extractImageURI(response);
    }

    /**
     * Video Generation Logic (VEO)
     */
    public async generateVideo(params: GenerateVideoParams): Promise<string> {
        console.log("Starting Video Gen...", params);

        const videoPayload: any = {
            model: params.model,
            prompt: params.prompt,
            config: {
                aspectRatio: params.aspectRatio,
                resolution: params.resolution
            }
        };

        let operation = await this.genAI.models.generateVideos(videoPayload);

        while (!operation.done) {
            await new Promise(r => setTimeout(r, 5000));
            operation = await this.genAI.operations.getVideosOperation({ operation });
            console.log("Generating video...", operation.metadata);
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            const uri = operation.response.generatedVideos[0].video.uri;
            const videoRes = await fetch(`${uri}&key=${API_KEY}`);
            const blob = await videoRes.blob();
            return URL.createObjectURL(blob);
        }

        throw new Error("Video generation failed or returned no URI.");
    }

    // ==========================================
    //  NEW: AI DIRECTOR VIDEO SUITE
    // ==========================================

    // 1. Script Generation
    public generateDirectorScript = async (
        platform: SocialPlatform,
        productName: string,
        model: AIModel,
        totalDuration: number,
        imagesBase64: string[]
    ): Promise<ScriptScene[]> => {
        const isVeo = model === AIModel.VEO3;
        const timeStep = isVeo ? 8 : 5;
        const sceneCount = Math.ceil(totalDuration / timeStep);

        // INSTRUCTION: MIXED LANGUAGE (English Visuals + Indo VO)
        const systemInstruction = `
            You are a World-Class Commercial Director & Cinematographer (DoP).
            Task: Create a high-end cinematic video script for a product named "${productName}" tailored for ${platform}.

            *** LANGUAGE RULES (CRITICAL) ***
            1. VISUAL PROMPTS: MUST be in ENGLISH. Use professional cinematographic terminology.
            2. CAMERA MOVEMENT: MUST be in ENGLISH.
            3. AUDIO/SFX DESCRIPTION: MUST be in ENGLISH.
            4. VOICEOVER (Spoken Word): MUST be in BAHASA INDONESIA (Indonesian).

            TECHNICAL RULES:
            1. Total video duration: ${totalDuration} seconds.
            2. Segments: Generate exactly ${sceneCount} scenes, each approx ${timeStep} seconds long.
            
            VISUAL RULES (STRICT):
            1. **ALWAYS USE A MODEL**: Never show the product floating in void. Show a human model (specify age, style, gender) using/wearing it.
            2. **CINEMATIC DETAIL**:
            - LIGHTING: Specify (e.g., "Golden hour backlighting", "Soft diffused studio light", "Neon cyberpunk lighting").
            - COLOR: Specify (e.g., "Warm earth tones", "High contrast teal and orange", "Pastel aesthetic").
            - TEXTURE: Describe surface details (e.g., "Sweat on skin", "Rough fabric texture", "Glistening water droplets").
            3. **DYNAMIC CAMERA**:
            - NO STATIC SHOTS.
            - Use keywords: "Slow Dolly In", "Fast Pan Right", "Truck Left", "Low Angle Tracking", "Dutch Angle", "Speed Ramp (Slow-mo to Fast)".
            
            CONTINUITY RULES:
            - Scene 2+ MUST visually connect to the previous scene (e.g., "Match cut from previous scene", "Model continues walking").

            BRANDING:
            - FINAL SCENE (Scene ${sceneCount}) VISUAL MUST include: "Text Overlay: [${productName}]" or "Logo Animation".

            FORMATTING:
            - Return a JSON array.
            
            EXAMPLE OUTPUT FORMAT:
            Visual: "Low angle, wide shot of a fit male model (20s) running on a rocky trail. Golden hour lighting creates lens flares. Camera tracks alongside him at high speed. The sandals [Product] kick up dust."
            Audio: "AUDIO: Energetic trap beat drops. SFX of heavy breathing and footsteps. VOICEOVER: Apapun medannya, langkah lo nggak boleh ragu."
        `;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sequence: { type: Type.INTEGER },
                    timeRange: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING },
                    audioScript: { type: Type.STRING },
                    duration: { type: Type.INTEGER }
                },
                required: ["sequence", "timeRange", "visualPrompt", "audioScript", "duration"]
            }
        };

        const imageParts = imagesBase64.slice(0, 3).map(b64 => ({
            inlineData: { mimeType: 'image/png', data: b64 }
        }));

        try {
            const response = await this.genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    role: 'user',
                    parts: [
                        ...imageParts,
                        { text: `Create a cinematic script for product: ${productName}. Platform: ${platform}. Total Duration: ${totalDuration}s (${sceneCount} scenes).` }
                    ]
                },
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const text = response.text;
            if (!text) throw new Error("No script generated");

            const parsed = JSON.parse(text);
            return parsed.map((item: any) => ({
                ...item,
                id: crypto.randomUUID(),
                status: 'pending'
            }));

        } catch (error) {
            console.error("Script Generation Error:", error);
            throw error;
        }
    }

    // 2. TTS Generation
    public generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
        const match = text.match(/VOICEOVER:\s*([\s\S]*?)(?=(?:AUDIO:)|$)/i);
        let cleanText = match ? match[1].trim() : text.replace(/^(VOICEOVER|AUDIO):/i, '').trim();
        cleanText = cleanText.replace(/AUDIO:[\s\S]*/i, '').trim();

        if (!cleanText || cleanText === '-') throw new Error("No text to speak");

        try {
            const response = await this.genAI.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: { parts: [{ text: cleanText }] },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data generated");

            return URL.createObjectURL(this.base64PcmToWavBlob(base64Audio));
        } catch (error) {
            console.error("TTS Error:", error);
            throw error;
        }
    }

    // 3. VEO Video Generation
    public generateVeoVideoFromScript = async (prompt: string, inputImageBase64?: string): Promise<string> => {
        const modelName = 'veo-3.1-fast-generate-preview'; 

        let cleanVisualPrompt = prompt
            .replace(/VISUAL:/gi, '')
            .replace(/AUDIO:[\s\S]*/gi, '')
            .replace(/VOICEOVER:[\s\S]*/gi, '')
            .trim();

        if (!cleanVisualPrompt.toLowerCase().includes('cinematic')) {
            cleanVisualPrompt = "Cinematic 4k shot. " + cleanVisualPrompt;
        }

        const request: any = {
            model: modelName,
            prompt: cleanVisualPrompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16', 
            }
        };

        if (inputImageBase64) {
            request.image = {
                imageBytes: inputImageBase64,
                mimeType: 'image/png' 
            };
        }

        try {
            let operation = await this.genAI.models.generateVideos(request);
            
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await this.genAI.operations.getVideosOperation({ operation });
            }

            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!videoUri) throw new Error("Video generation completed but no URI returned.");

            return `${videoUri}&key=${API_KEY}`;
        } catch (error) {
            console.error("Video Generation Error:", error);
            throw error;
        }
    }

    // --- HELPER: PCM to WAV ---
    private base64PcmToWavBlob(base64Pcm: string): Blob {
        const binaryString = atob(base64Pcm);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const numChannels = 1;
        const sampleRate = 24000;
        const bitsPerSample = 16; 
        
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        
        const writeString = (view: DataView, offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + len, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); 
        view.setUint16(20, 1, true); 
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
        view.setUint16(32, numChannels * (bitsPerSample / 8), true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, len, true);
        
        return new Blob([wavHeader, bytes], { type: 'audio/wav' });
    }

    // --- NEW MOCKUP METHOD ---
    public async generateModelImages(
        mockupImage: string,
        faceReference: string | null,
        theme: ThemeOption,
        side: 'Front' | 'Back',
        count: number = 3
    ): Promise<string[]> {
        const results: string[] = [];
        // Ensure using the model requested by user for high fidelity
        const model = 'gemini-3-pro-image-preview';

        const basePrompt = `
            Professional fashion photography.
            Task: Generate a photorealistic image of a fashion model wearing the EXACT t-shirt design shown in the first reference image.
            
            Constraint 1 (The Shirt): The t-shirt design, logo placement, and color MUST match the provided mockup image exactly.
            Constraint 2 (The Model): ${faceReference ? 'The model must have the facial features and likeness of the person in the second reference image.' : 'Use a diverse, professional fashion model.'}
            Constraint 3 (The Vibe): ${theme.promptSuffix}
            
            View: ${side} view of the t-shirt.
            Angles: Generate a unique angle/pose suitable for an e-commerce product gallery (e.g., straight on, slight turn, close up).
            Quality: 4k, highly detailed, realistic texture.
        `;

        for (let i = 0; i < count; i++) {
            try {
                const parts: any[] = [
                    { inlineData: { mimeType: 'image/png', data: this.cleanBase64(mockupImage) } }
                ];

                if (faceReference) {
                    parts.push({
                        inlineData: { mimeType: 'image/jpeg', data: this.cleanBase64(faceReference) }
                    });
                }

                parts.push({ text: `${basePrompt} Variation ${i + 1}.` });

                const response = await this.genAI.models.generateContent({
                    model: model,
                    contents: { parts: parts },
                    config: { imageConfig: { aspectRatio: "3:4", sampleCount: 1 } }
                });

                // Using our robust extractor
                results.push(this.extractImageURI(response));

            } catch (error) {
                console.error("Error generating image:", error);
                // Continue loop to try generating other variations even if one fails
            }
        }
        return results;
    }

        // --- NEW SWAP METHOD ---
    public async generateProductSwap(
        productImages: UploadedImage[],
        referenceFaceImages: UploadedImage[], // Can be empty
        referenceModelImages: UploadedImage[], // Can be empty
        viewAnglePrompt: string, // Full string e.g., "Front view - A direct..."
        themePrompt: string, 
        customInstructions: string
    ): Promise<string> {
        
        const MODEL_NAME = 'gemini-3-pro-image-preview';

        try {
            // 1. Prepare Product Image Parts
            const productParts = productImages.map((img) => ({
                inlineData: {
                    data: img.base64,
                    mimeType: img.mimeType
                }
            }));

            // 2. Prepare Reference Face Parts (if any)
            const faceParts = referenceFaceImages.map((img) => ({
                inlineData: {
                    data: img.base64,
                    mimeType: img.mimeType
                }
            }));

            // 3. Prepare Reference Model Parts (if any)
            const modelParts = referenceModelImages.map((img) => ({
                inlineData: {
                    data: img.base64,
                    mimeType: img.mimeType
                }
            }));

            // 4. Construct the Prompt
            let prompt = `
                Professional Fashion and Commercial Product Photography Task.
                
                ROLE: You are a world-class commercial photographer and art director.
                
                INPUTS PROVIDED:
                1. REFERENCE PRODUCT (${productImages.length} images): This item MUST appear in the final image. Preserve details, logos, and texture.
            `;

            if (faceParts.length > 0) {
                prompt += `
                2. REFERENCE FACE (${referenceFaceImages.length} images): Use this person's facial identity.
                `;
            }

            if (modelParts.length > 0) {
                prompt += `
                3. REFERENCE MODEL BODY (${modelParts.length} images): Use this image as the BASE for pose and body type.
                `;
            }

            prompt += `
                OBJECTIVE:
                Generate a photorealistic marketing image.
            `;

            // --- LOGIC FOR COMBINATIONS ---
            if (modelParts.length > 0 && faceParts.length > 0) {
                prompt += `
                TASK: SWAP & DRESS.
                1. Take the POSE and BODY from the REFERENCE MODEL BODY images.
                2. Replace the face with the REFERENCE FACE identity (seamless face swap).
                3. Dress the model in the REFERENCE PRODUCT.
                `;
            } else if (modelParts.length > 0) {
                prompt += `
                TASK: VIRTUAL TRY-ON.
                1. Use the REFERENCE MODEL BODY image as the base.
                2. Dress the model in the REFERENCE PRODUCT.
                3. Keep the original face/identity of the model image (unless it is a mannequin, then generate a realistic face).
                `;
            } else if (faceParts.length > 0) {
                prompt += `
                TASK: GENERATE MODEL WITH SPECIFIC FACE.
                1. Generate a new human body and pose based on the requested ANGLE.
                2. Use the REFERENCE FACE for the identity.
                3. Dress the generated model in the REFERENCE PRODUCT.
                `;
            } else {
                prompt += `
                TASK: GENERATE FULL MODEL.
                1. Generate a photorealistic human model (consistent face across shots if multiple generated).
                2. Dress the model in the REFERENCE PRODUCT.
                `;
            }
            // -----------------------------

            prompt += `
                DETAILS:
                - ANGLE/COMPOSITION: ${viewAnglePrompt}
                - ENVIRONMENT: ${themePrompt || "Clean professional studio."}
                
                CRITICAL:
                - The product must look real and interact naturally with the body.
                - Lighting must be cohesive.
            `;

            // Handle Custom Instructions
            if (customInstructions && customInstructions.trim().length > 0) {
                prompt += `
                USER OVERRIDES (Highest Priority):
                - ${customInstructions}
                `;
            }

            // 5. Construct API Payload
            // Parts order matters: Product -> Face -> Model -> Text
            // This gives context to "Input 1", "Input 2" etc in the prompt text.
            const allParts = [
                ...productParts,
                ...faceParts,
                ...modelParts,
                { text: prompt }
            ];

            // 6. Call API
            const response = await this.genAI.models.generateContent({
                model: MODEL_NAME,
                contents: {
                    parts: allParts
                },
                config: {
                    imageConfig: {
                        imageSize: "1K",
                        aspectRatio: "3:4" 
                    }
                }
            });

            // 7. Extract Image
            return this.extractImageURI(response);

        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }
}

export default GeminiService.getInstance();