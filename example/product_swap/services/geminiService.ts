import { GoogleGenAI } from "@google/genai";
import { UploadedImage } from "../types";

const MODEL_NAME = 'gemini-3-pro-image-preview';

export const generateProductSwap = async (
  productImages: UploadedImage[],
  referenceFaceImages: UploadedImage[], // Can be empty
  referenceModelImages: UploadedImage[], // Can be empty
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

    // 7. Extract Image
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