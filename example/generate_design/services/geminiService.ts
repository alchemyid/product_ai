import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, STYLE_PROMPTS } from "../types";

// Helper to ensure we have the key
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API_KEY not found in environment");
  }
  return key;
};

export const analyzeImageForPrompt = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    // Extract base64 data strictly
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const model = 'gemini-2.5-flash';
    
    // Updated prompt: Forces White Background AND Text Extraction
    const prompt = `
      Analyze this image to create a strict text command for generating a VECTOR ART design.
      
      CRITICAL OBJECTIVE: The output image must be easily convertible to SVG (Vector).
      
      Your Output Prompt MUST follow these rules:
      1. TYPOGRAPHY (CRITICAL): Look for ANY text/words written on the design. EXTRACT them exactly. Format: Text "THE WORDS" in [Font Style] at [Position]. If no text, ignore this.
      2. SUBJECT: Describe the core subject clearly (pose, items, expression).
      3. BACKGROUND: FORCE "Solid Pure White Background". Even if the image is on black, you MUST write "White Background" in the prompt.
      4. LINEWORK: Demand "Clean, crisp, proportional black outlines" (professional inking).
      5. COLORING: Demand "Flat, solid spot colors". NO gradients, NO shading, NO lighting effects, NO texture.
      6. COMPLEXITY: "Simplify shapes". Reduce details to basic geometric forms.
      7. STYLE: "Vector illustration, Cel-shaded, Esports Logo style".
      
      Example of the tone I need:
      "A stylized wolf head facing forward. Text 'WOLF GANG' in bold distressed red varsity font above the head. Text 'EST. 1990' in small sans-serif below. Clean proportional black outlines. Flat solid grey and white fur. Solid Pure White Background. No gradients. High contrast."
      
      Write ONLY the prompt description.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try a different image.");
  }
};

export const generateVectorDesign = async (config: GenerationConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Constructed Suffix to FORCE 'Traceable' Aesthetics
  const baseStyle = STYLE_PROMPTS[config.style];
  
  // NEGATIVE_PROMPT: Explicitly ban black/dark backgrounds and gradients
  const dtfSuffix = " . masterpiece, professional vector art, clean proportional black outlines, flat solid colors, cel-shaded, clear typography, posterized style. NEGATIVE_PROMPT: black background, dark background, night, gradients, soft shadows, texture, noise, photography, realism, thin lines, complex details, fuzzy edges, 3d render, watermark, blurry text.";
  
  // PREFIX: Force isolation on white
  const prefix = "t-shirt design, ISOLATED ON PURE WHITE BACKGROUND, ";
  
  const finalPrompt = `${prefix}${config.prompt}. Style details: ${baseStyle}${dtfSuffix}`;

  try {
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [];

    if (config.referenceImage) {
       const base64Data = config.referenceImage.includes('base64,') 
        ? config.referenceImage.split('base64,')[1] 
        : config.referenceImage;

       parts.push({
         inlineData: {
           mimeType: 'image/png',
           data: base64Data
         }
       });
       
       parts.push({ text: finalPrompt });
    } else {
       parts.push({ text: finalPrompt });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: {}
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated.");
    }

    const generatedPart = candidates[0].content.parts.find(part => part.inlineData);

    if (!generatedPart || !generatedPart.inlineData || !generatedPart.inlineData.data) {
      const textPart = candidates[0].content.parts.find(part => part.text);
      if (textPart) {
        throw new Error(`Generation failed: ${textPart.text}`);
      }
      throw new Error("No valid image data found in response.");
    }

    return `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};