import { GoogleGenAI } from "@google/genai";
import { UploadedImage } from "../types";

const MODEL_NAME = 'gemini-3-pro-image-preview';

export const generateProductSwap = async (
  productImages: UploadedImage[],
  referenceFaceImages: UploadedImage[], // Can be empty
  viewAnglePrompt: string, // Full string e.g., "Front view - A direct..."
  themePrompt: string, 
  customInstructions: string
): Promise<string> => {
  
  // Initialize Gemini Client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // 3. Construct the Prompt
    let prompt = `
      Professional Fashion and Commercial Product Photography Task.
      
      ROLE: You are a world-class commercial photographer and art director.
      
      INPUTS:
      1. REFERENCE PRODUCT (${productImages.length} images): Analyze these closely. Texture, material, logos, shape. This object MUST appear in the final image with 100% fidelity.
    `;

    if (faceParts.length > 0) {
      prompt += `
      2. REFERENCE FACE (${referenceFaceImages.length} images): Use these images as the strict reference for the model's facial identity. The final image must look like this person.
      `;
    } else {
      prompt += `
      2. REFERENCE FACE: None provided. You must GENERATE a photorealistic human model suitable for this product type. Ensure the face is consistent, attractive, and high-fidelity.
      `;
    }

    prompt += `
      OBJECTIVE:
      Generate a photorealistic, high-resolution marketing image of a model wearing/using the REFERENCE PRODUCT.
      
      COMPOSITION & ANGLE:
      - ${viewAnglePrompt}
      - The composition must be professional and balanced.
      
      ENVIRONMENT & MOOD:
      - ${themePrompt || "Clean, high-end commercial studio setting. Neutral background that highlights the product."}
      
      CRITICAL INSTRUCTIONS:
      - The REFERENCE PRODUCT must be worn/held naturally by the model.
      - Lighting on the product must match the specified environment.
    `;

    if (faceParts.length > 0) {
      prompt += `- PRESERVE THE IDENTITY of the REFERENCE FACE provided. Match skin tone and facial features exactly.`;
    } else {
      prompt += `- Generate a diverse, professional model fitting for the brand aesthetic.`;
    }

    // Handle Custom Instructions
    if (customInstructions && customInstructions.trim().length > 0) {
      prompt += `
      
      USER OVERRIDES (Highest Priority):
      - ${customInstructions}
      `;
    }

    // 4. Construct API Payload
    // Parts order: Product Images -> Face Images -> Text Prompt
    const allParts = [
      ...productParts,
      ...faceParts,
      { text: prompt }
    ];

    // 5. Call API
    const response = await ai.models.generateContent({
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

    // 6. Extract Image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};