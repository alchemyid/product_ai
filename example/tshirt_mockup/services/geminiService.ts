import { GoogleGenAI } from "@google/genai";
import { ThemeOption } from "../types";

// Helper to strip the data:image/png;base64, prefix
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export const generateModelImages = async (
  mockupImage: string, // The composite image from canvas
  faceReference: string | null,
  theme: ThemeOption,
  side: 'Front' | 'Back',
  count: number = 3
): Promise<string[]> => {
  
  // Initialize AI client here to ensure we get the latest API_KEY from the environment
  // after the user has selected it via window.aistudio.openSelectKey()
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const results: string[] = [];
  const model = 'gemini-3-pro-image-preview'; // Using the pro model for best image synthesis

  // We generate images sequentially or in parallel depending on quota, 
  // but here we do sequential to be safe with rate limits and loop logic.
  
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
        {
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64(mockupImage),
          },
        }
      ];

      if (faceReference) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg', // Assuming upload is jpeg/png, API handles detection usually, but we strip header anyway
            data: cleanBase64(faceReference),
          },
        });
      }

      parts.push({
        text: `${basePrompt} Variation ${i + 1}.`,
      });

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: parts,
        },
        config: {
            imageConfig: {
                aspectRatio: "3:4", // Standard fashion portrait ratio
                imageSize: "1K",
            }
        }
      });

      // Extract image
      // Note: The response structure for image generation in GenerateContentResponse
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            // Helper handles the prefix usually, but here we reconstruct for the img tag
            results.push(`data:image/png;base64,${base64EncodeString}`);
        }
      }

    } catch (error) {
      console.error("Error generating image:", error);
      // Re-throw to be handled by the UI
      throw error; 
    }
  }

  return results;
};