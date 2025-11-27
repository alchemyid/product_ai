import { Ethnicity, AgeRange, Gender, BodyPartType, ObjectType, ProductCategory, BrandVibe, HairStyle } from "@/types";

export const ETHNICITIES = Object.values(Ethnicity);
export const AGES = Object.values(AgeRange);
export const GENDERS = Object.values(Gender);
export const BODY_PARTS = Object.values(BodyPartType);
export const OBJECT_TYPES = Object.values(ObjectType);
export const PRODUCT_CATEGORIES = Object.values(ProductCategory);
export const BRAND_VIBES = Object.values(BrandVibe);
export const HAIR_STYLES = Object.values(HairStyle);

export const ENVIRONMENTS = [
    "Professional Studio - White Cyclorama",
    "Professional Studio - Dark Grey Textured",
    "Luxury Modern Living Room",
    "Urban Street Style - Blurred City",
    "Tropical Beach - Golden Hour",
    "High-Fashion Runway Spotlight"
];

// Default Constants
export const DEFAULT_MODEL_PROMPT = "A full-body photograph of a professional model.";
export const DEFAULT_NEGATIVE_PROMPT = "ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, blurry, bad anatomy, blurred, watermark, grainy, signature, cut off, draft, no text, no logo, no watermark";
export const DEFAULT_MODEL_STYLE = "8k, photorealistic, professional studio lighting";