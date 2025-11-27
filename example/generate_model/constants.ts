
import { AgeRange, BodyPartType, BrandVibe, Ethnicity, Gender, HairStyle, ObjectType, ProductCategory } from "./types";

export const ETHNICITIES = Object.values(Ethnicity);
export const AGES = Object.values(AgeRange);
export const GENDERS = Object.values(Gender);
export const BODY_PARTS = Object.values(BodyPartType);
export const OBJECT_TYPES = Object.values(ObjectType);

// New Constants
export const PRODUCT_CATEGORIES = Object.values(ProductCategory);
export const BRAND_VIBES = Object.values(BrandVibe);
export const HAIR_STYLES = Object.values(HairStyle);

export const ENVIRONMENTS = [
  "Professional Studio - White Cyclorama",
  "Professional Studio - Dark Grey Textured",
  "Luxury Modern Living Room",
  "Urban Street Style - Blurred City",
  "Tropical Beach - Golden Hour",
  "Minimalist Concrete Architecture",
  "Lush Botanical Garden",
  "Abstract Pastel Gradient",
  "High-Fashion Runway Spotlight"
];

export const PHOTOGRAPHY_STYLES = [
  "Cinematic Lighting",
  "Soft Natural Light",
  "High Contrast Editorial",
  "Warm Film Grain",
  "Crisp Commercial Product Photography"
];