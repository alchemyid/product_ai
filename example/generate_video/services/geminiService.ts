
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ScriptScene, SocialPlatform, AIModel } from "../types";

// Helper to get fresh instance with potentially updated key
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a paid API key using the button below.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        return await (window as any).aistudio.hasSelectedApiKey();
    }
    return !!process.env.API_KEY;
};

export const openKeySelection = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
    }
};

/**
 * Analyzes an uploaded image to generate a consistent character description
 */
export const analyzeImageForDescription = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming png/jpeg compatible
              data: base64Image
            }
          },
          { text: "Analyze this image and provide a concise physical description of the person suitable for a video generation prompt (Character Sheet). Focus on: Age, Ethnicity, Hair style/color, Clothing, and distinctive features. Output a single descriptive paragraph in English. Example: 'A young Indonesian woman, approx 25 years old, with shoulder-length black bob hair, wearing a white oversized t-shirt and denim shorts.'" }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Image analysis failed", error);
    throw error;
  }
};

/**
 * Generates the Director's Script (Visual + Audio prompts)
 */
export const generateDirectorScript = async (
  platform: SocialPlatform,
  productName: string,
  model: AIModel,
  totalDuration: number,
  images: string[], // Base64 strings of images for context
  characterDescription: string // NEW: Physical description
): Promise<ScriptScene[]> => {
  const ai = getAIClient();
  
  // Define time increments based on model
  const isVeo = model === AIModel.VEO3;
  const timeStep = isVeo ? 8 : 5; 
  
  // Calculate rough number of scenes needed
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
    1. **MODEL CONSISTENCY**: The human model in ALL scenes MUST match this description EXACTLY: "${characterDescription || 'Professional model suitable for the product'}". Repeat specific details (hair, clothes, age) in every single visual prompt to ensure consistency.
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
    Visual: "Low angle, wide shot of [INSERT CHARACTER DESC] running on a rocky trail. Golden hour lighting creates lens flares. Camera tracks alongside her at high speed. The sandals [Product] kick up dust."
    Audio: "AUDIO: Energetic trap beat drops. SFX of heavy breathing and footsteps. VOICEOVER: Apapun medannya, langkah lo nggak boleh ragu."
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        sequence: { type: Type.INTEGER },
        timeRange: { type: Type.STRING, description: "e.g. 0:00-0:08" },
        visualPrompt: { type: Type.STRING, description: "VISUAL DESCRIPTION IN ENGLISH. Must include Model Description." },
        audioScript: { type: Type.STRING, description: "Format: 'AUDIO: [English Sound Description] VOICEOVER: [Bahasa Indonesia Script]'" },
        duration: { type: Type.INTEGER }
      },
      required: ["sequence", "timeRange", "visualPrompt", "audioScript", "duration"]
    }
  };

  // Prepare image parts for the model to "see" the product
  const imageParts = images.slice(0, 3).map(base64 => ({
    inlineData: {
      mimeType: 'image/png', // Assuming converted to PNG or similar
      data: base64
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Good for reasoning/text generation
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
    
    // Hydrate with IDs and status
    return parsed.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      status: 'pending'
    }));

  } catch (error) {
    console.error("Script Generation Error:", error);
    throw error;
  }
};

/**
 * Generates Speech (TTS) from text
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    const ai = getAIClient();
    
    // Clean text to remove "VOICEOVER:" prefix if present
    const match = text.match(/VOICEOVER:\s*([\s\S]*?)(?=(?:AUDIO:)|$)/i);
    // If regex match found use it, otherwise fall back to full text cleaning (rare case)
    let cleanText = match ? match[1].trim() : text.replace(/^(VOICEOVER|AUDIO):/i, '').trim();
    
    // Remove specific audio directions if they leaked into the capture group
    cleanText = cleanText.replace(/AUDIO:[\s\S]*/i, '').trim();

    if (!cleanText || cleanText === '-') throw new Error("No text to speak");

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: cleanText }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data generated");

        // Convert raw PCM base64 to WAV Blob URL for playback
        const wavBlob = base64PcmToWavBlob(base64Audio);
        return URL.createObjectURL(wavBlob);

    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

/**
 * Generates the actual video using VEO
 */
export const generateVeoVideo = async (
  prompt: string,
  inputImageBase64?: string
): Promise<string> => {
  const ai = getAIClient();
  const modelName = 'veo-3.1-fast-generate-preview'; 

  try {
    let operation;
    
    // CLEANING PROMPT FOR VEO
    // The prompt comes from visualPrompt (which is now English).
    // We just remove the headers if they exist, though the UI separates them now.
    let cleanVisualPrompt = prompt
      .replace(/VISUAL:/gi, '')
      .replace(/AUDIO:[\s\S]*/gi, '') // Remove Audio instructions from video prompt
      .replace(/VOICEOVER:[\s\S]*/gi, '') // Remove VO instructions
      .trim();

    // Ensure strict cinematic keywords are present if missing
    if (!cleanVisualPrompt.toLowerCase().includes('cinematic')) {
        cleanVisualPrompt = "Cinematic 4k shot. " + cleanVisualPrompt;
    }

    const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16', // Vertical for social media
    };

    const request: any = {
        model: modelName,
        prompt: cleanVisualPrompt,
        config
    };

    if (inputImageBase64) {
        request.image = {
            imageBytes: inputImageBase64,
            mimeType: 'image/png' 
        };
    }

    console.log("Starting VEO generation...", request);
    operation = await ai.models.generateVideos(request);
    
    // Polling
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        console.log("Polling video status...");
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation completed but no URI returned.");

    // The URI needs the API key appended for access
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};


// --- HELPER: PCM to WAV ---
// Gemini TTS returns raw PCM (24kHz, 1 channel usually). Browsers can't play raw PCM directly in <audio>.
// We must wrap it in a WAV container.
function base64PcmToWavBlob(base64Pcm: string): Blob {
    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Config for Gemini TTS
    const numChannels = 1;
    const sampleRate = 24000;
    const bitsPerSample = 16; 
    
    // WAV Header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // "RIFF" chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
    view.setUint16(34, bitsPerSample, true);
    
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, len, true);
    
    return new Blob([wavHeader, bytes], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
