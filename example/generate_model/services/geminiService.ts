
import { GoogleGenAI } from "@google/genai";
import { AppMode, BodyPartType, BrandVibe, Gender, GenerationConfig, ObjectType, ProductCategory } from "../types";

const MODEL_NAME = 'gemini-3-pro-image-preview';

const getPosingLogic = (category?: ProductCategory): string => {
  if (!category) return "Neutral standing pose.";

  switch (category) {
    case ProductCategory.ISLAMIC_FASHION:
      return "Modest, elegant, and respectful posing. Standing upright with grace or sitting politely. Hands gently folded or holding a bag/accessory. No revealing poses. Focus on the flow of the fabric and the modest silhouette. Expression should be serene, kind, and sophisticated.";
    case ProductCategory.JEWELRY:
      return "Model should have exposed neck and ears. Posing should be elegant, perhaps touching the neck lightly or pushing hair back to reveal ear/neck area. Wearing simple strapless or V-neck top to not distract from potential jewelry. Expression: Sophisticated and expensive.";
    case ProductCategory.WATCHES:
      return "Focus on wrists. Arms crossed or hand near face to showcase wrist area. Sleeves rolled up or short sleeves. Pose must be confident and successful.";
    case ProductCategory.FOOTWEAR:
      return "Full body or lower body focus. Dynamic walking pose or sitting with legs extended towards camera to showcase shoes. Wearing shorts or cuffed pants. Legs should look strong and toned.";
    case ProductCategory.EYEWEAR:
      return "Direct eye contact. Face clearly visible. Neutral expression or slight smile. Hair styled away from eyes. Face shape must be symmetrical and photogenic.";
    case ProductCategory.STREETWEAR:
      return "Cool, confident posture. Slouching slightly or leaning against wall. Hands in pockets or crossing arms. Attitude is key. 'Too cool for school' vibe.";
    case ProductCategory.ACTIVEWEAR:
      return "Dynamic movement, stretching, running pose, or fitness stance. Muscles slightly engaged. Energetic look. Body must look fit and athletic.";
    case ProductCategory.SWIMWEAR:
      return "Beach or pool appropriate posing. Confident body language. Maximum skin exposure suitable for swimwear. High-fashion swimsuit model pose.";
    default:
      return "Neutral professional standing pose, arms relaxed by sides or one hand on hip. Ideal for general apparel overlay. Posture must be upright and confident.";
  }
};

const getVibeLogic = (vibe?: BrandVibe): string => {
  if (!vibe) return "Lighting: Neutral studio lighting. Background: Solid white or light grey. Mood: Clinical, clear, reference quality.";

  switch (vibe) {
    case BrandVibe.MINIMALIST_CLEAN:
      return "Lighting: Soft, diffused, evenly lit high-key lighting. Background: Clean, minimal, negative space. Mood: Calm, organized, premium basics. Aesthetic: Kinfolk magazine style.";
    case BrandVibe.LUXURY_ELEGANT:
      return "Lighting: Warm, golden hour or soft spotlighting. Background: Rich textures, marble, velvet, or blurred luxury interior. Mood: Expensive, sophisticated, timeless. Aesthetic: Vogue Editorial.";
    case BrandVibe.URBAN_EDGY:
      return "Lighting: High contrast, dramatic shadows, neon accents or harsh sunlight. Background: Concrete, street textures, grey tones. Mood: Rebellious, cool, modern. Aesthetic: Hypebeast style.";
    case BrandVibe.NATURAL_ORGANIC:
      return "Lighting: Natural daylight, sun flares. Background: Nature elements, plants, wood textures, soft bokeh. Mood: Fresh, eco-friendly, breathable. Aesthetic: Lifestyle commercial.";
    default:
      return "Lighting: Professional studio strobe lighting. Background: Neutral grey or white cyclorama. Mood: Commercial, trustworthy, clear. Aesthetic: E-commerce catalog standard.";
  }
};

// Helper to construct the prompt based on configuration
const buildPrompt = (config: GenerationConfig, angle: string): string => {
  const posingInstructions = getPosingLogic(config.productCategory);
  const vibeInstructions = getVibeLogic(config.brandVibe);
  
  // EMPHASIS ON QUALITY AND AESTHETICS
  const technicalSpecs = "Masterpiece, best quality, 8k resolution, photorealistic, shot on Phase One XF IQ4 150MP. The image must be aesthetically pleasing, beautiful, and highly detailed. Professional commercial photography, magazine cover quality, sharp focus, perfect skin texture.";

  let subjectDescription = "";
  
  // Logic for Hair vs Headwear (Islamic Fashion Override)
  let hairDesc = config.hairStyle ? ` with ${config.hairStyle} hair style` : " with professionally styled hair";
  
  // Logic for Outfit Base
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

  // EMPHASIS ON "PROFESSIONAL MODEL"
  const modelAdjectives = "stunning, charismatic, world-class professional model";

  // USER CUSTOM OVERRIDE
  // This is placed strategically to override or enhance previous instructions
  const userCustomEmphasis = config.customPrompt 
    ? `IMPORTANT USER SPECIFIC REQUIREMENT: ${config.customPrompt}. Ensure this specific instruction is prioritized and integrated into the final image.`
    : "";

  // --- MODE SPECIFIC LOGIC ---
  
  if (config.mode === AppMode.CHARACTER_REFERENCE) {
    // SPECIAL PROMPT FOR FACE COLLAGE
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
    // Note: We now use config.gender in Body Parts too
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
};

export const generateImages = async (config: GenerationConfig): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please select a key.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    // For Reference sheets, we now request the full 7-angle set in every generation.
    // We can ask for slight variations in layout or lighting style in the iterations if needed,
    // but the prompt is consistent for the sheet content.
    angles = [
      "7-Angle Reference Sheet (Variation 1)",
      "7-Angle Reference Sheet (Variation 2)" 
    ];
    aspectRatio = "16:9"; // Wide format is critical for 7-angle layout
  }

  const imagePromises = angles.map(async (angle) => {
    try {
      const prompt = buildPrompt(config, angle);
      
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "2K", 
          }
        }
      });

      // Extract image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error(`Failed to generate angle ${angle}:`, error);
      return null;
    }
  });

  const results = await Promise.all(imagePromises);
  return results.filter((img): img is string => img !== null);
};
