import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import {
    ModelGenerationConfig,
    DesignGenerationParams,
    ProductCategory,
    BrandVibe,
    AppMode,
    ObjectType,
    Gender,
    BodyPartType,
    GenerateVideoParams
} from "@/types";

// Access key via import.meta.env for Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

class GeminiService {
    private static instance: GeminiService;
    private genAI: GoogleGenAI;

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

    private getPosingLogic(category?: ProductCategory): string {
        if (!category) return "Neutral standing pose.";
        switch (category) {
            case ProductCategory.ISLAMIC_FASHION: return "Modest, elegant, and respectful posing. Standing upright with grace. Hands gently folded. No revealing poses.";
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

    private extractImage(response: any): string {
        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (part?.inlineData?.data) {
            return part.inlineData.data;
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

    // ==========================================
    //  CORE GENERATION METHODS
    // ==========================================

    /**
     * Advanced Model Generation
     */
    public async generateAdvancedModel(config: ModelGenerationConfig): Promise<string> {
        const posingInstructions = this.getPosingLogic(config.productCategory);
        const vibeInstructions = this.getVibeLogic(config.brandVibe);
        const technicalSpecs = "Masterpiece, best quality, 8k resolution, photorealistic, shot on Phase One XF IQ4 150MP.";

        let subjectDescription = "";
        const hairDesc = config.hairStyle ? ` with ${config.hairStyle} hair` : "";
        const modelAdjectives = "stunning, charismatic, professional model";

        if (config.mode === AppMode.CHARACTER_REFERENCE) {
            subjectDescription = `A Comprehensive 7-Angle Character Reference Sheet of a ${config.gender} ${config.ethnicity} model${hairDesc}. Front, Side, Back, 3/4 views.`;
        } else if (config.objectType === ObjectType.MANNEQUIN) {
            subjectDescription = `A high-end 3D ${config.gender} mannequin. Premium matte finish.`;
        } else {
            subjectDescription = `A ${modelAdjectives}, ${config.ageRange}, ${config.gender}, ${config.ethnicity}${hairDesc}.`;

            if (config.mode === AppMode.BODY_PARTS) {
                if (config.bodyPartType === BodyPartType.HANDS) subjectDescription += " Focus on elegant hands.";
                if (config.bodyPartType === BodyPartType.LEGS) subjectDescription += " Focus on toned legs and footwear.";
                if (config.bodyPartType === BodyPartType.HEAD_FACE) subjectDescription += " Extreme close-up beauty portrait.";
            }
        }

        const fullPrompt = `
            Create a professional commercial photography asset.
            SUBJECT: ${subjectDescription}
            CONTEXT: Selling ${config.productCategory || 'Fashion'}.
            POSING: ${posingInstructions}
            VIBE: ${vibeInstructions}
            TECHNICAL: ${technicalSpecs}
            USER NOTE: ${config.customPrompt || ''}
            REQUIREMENTS: Professional, polished, perfect skin texture, commercial standard.
        `;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: { imageConfig: { aspectRatio: config.mode === AppMode.CHARACTER_REFERENCE ? "16:9" : "3:4" } }
        });

        return this.extractImage(response);
    }

    /**
     * FIXED: Design Analysis using correct SDK syntax for parsing text
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
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        return this.extractImage(response);
    }

    /**
     * Product Photography Logic
     */
    public async generateBaseProduct(prompt: string, aspectRatio: string): Promise<string> {
        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Professional product photography of ${prompt}. High quality, sharp focus, isolated.` }] },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });
        return this.extractImage(response);
    }

    public async generateScenarioVariation(baseImage: string, scenarioPrompt: string, aspectRatio: string): Promise<string> {
        const cleanBase64 = baseImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const prompt = `Generate a photorealistic image of this product: ${scenarioPrompt}. Keep product identity 100% consistent.`;

        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
                ]
            },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });
        return this.extractImage(response);
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
}

export default GeminiService.getInstance();