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

    // New helper to get full URI with Mime Type to prevent "Black Blank" images
    private extractImageURI(response: any): string {
        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (part?.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/jpeg'; // Default to jpeg if missing
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
     * Advanced Model Generation - Generates multiple images (Campaign)
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
            // CHANGED: Just one sheet as requested
            angles = [
                "7-Angle Reference Sheet"
            ];
            aspectRatio = "16:9"; // Wide format is critical for 7-angle layout
        }

        const imagePromises = angles.map(async (angle) => {
            try {
                const prompt = this.buildPrompt(config, angle);
                const response = await this.genAI.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        imageConfig: {
                            aspectRatio: aspectRatio
                        }
                    }
                });
                // CHANGED: Use extractImageURI to get the proper mime type (fixes black/blank image)
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