import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ModelGenerationParams, DesignGenerationParams } from "@/types";

// This global variable is defined in vite.config.ts
declare const __GEMINI_API_KEY__: string;

const GEMINI_API_KEY = __GEMINI_API_KEY__;

class GeminiService {
    private static instance: GeminiService;
    private genAI: GoogleGenAI;

    private constructor() {
        if (typeof GEMINI_API_KEY === 'undefined' || !GEMINI_API_KEY) {
            throw new Error("API Key is not defined. Check your vite.config.ts and .env file.");
        }
        this.genAI = new GoogleGenAI(GEMINI_API_KEY);
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    private async generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonResponse = JSON.parse(response.text());
        return jsonResponse.image;
    }

    public generateModelImage(params: ModelGenerationParams): Promise<string> {
        const prompt = `Generate a photorealistic image of a model wearing a product.
        - Product: ${params.prompt}
        - Style: ${params.style}
        - Negative Prompt: ${params.negativePrompt}
        - Output: JSON with a single key "image" containing the base64 encoded image.`;
        return this.generateImage(prompt, "3:4");
    }

    public generateVectorImage(params: DesignGenerationParams): Promise<string> {
        const prompt = `Generate a vector style image for a product design.
        - Product: ${params.prompt}
        - Style: ${params.style}
        - Output: JSON with a single key "image" containing the base64 encoded image.`;
        return this.generateImage(prompt, "1:1");
    }

    public async generateBaseProduct(prompt: string, aspectRatio: string): Promise<string> {
        const imagePrompt = `Professional product photography of ${prompt}. High quality, sharp focus, isolated subject, commercial aesthetic.`;
        return this.generateImage(imagePrompt, aspectRatio);
    }

    public async generateScenarioVariation(baseImage: string, scenarioPrompt: string, aspectRatio: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const prompt = `Generate a photorealistic image of this exact product from the following camera angle/perspective: ${scenarioPrompt}. Ensure the product details, logos, materials, and identity remain 100% consistent with the input image. Use professional studio lighting on a neutral or complementary background unless specified otherwise.`;
        const imagePart = { inlineData: { data: baseImage, mimeType: 'image/png' } };
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const jsonResponse = JSON.parse(response.text());
        return jsonResponse.image;
    }
}

const geminiService = GeminiService.getInstance();
export default geminiService;