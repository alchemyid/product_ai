
export enum AppMode {
  FULL_BODY = 'FULL_BODY',
  BODY_PARTS = 'BODY_PARTS',
  CHARACTER_REFERENCE = 'CHARACTER_REFERENCE' // New Mode for Face Collage
}

export enum ObjectType {
  HUMAN = 'Human',
  MANNEQUIN = 'Mannequin'
}

export enum Gender {
  FEMALE = 'Female',
  MALE = 'Male',
  NON_BINARY = 'Non-binary'
}

export enum AgeRange {
  CHILD = 'Child (5-10)',
  TEEN = 'Teenager (13-19)',
  YOUNG_ADULT = 'Young Adult (20-30)',
  ADULT = 'Adult (31-50)',
  SENIOR = 'Senior (50+)'
}

export enum Ethnicity {
  INDONESIAN = 'Indonesian',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  INDIAN = 'Indian',
  EUROPEAN = 'European (Caucasian)',
  LATIN = 'Latin/Hispanic',
  AFRICAN = 'African',
  MIDDLE_EASTERN = 'Middle Eastern',
  MIXED = 'Mixed Heritage'
}

export enum BodyPartType {
  HEAD_FACE = 'Head & Face (Hair/Makeup Focus)',
  HEADLESS = 'Body Only (Apparel Focus)',
  HANDS = 'Hands Only (Jewelry/Watch Focus)',
  LEGS = 'Legs/Feet Only (Footwear Focus)',
  MIX = 'Mix / Full Detail Collage'
}

// New Enums for Sales Optimization
export enum ProductCategory {
  GENERAL_APPAREL = 'General Clothing / T-Shirt',
  ISLAMIC_FASHION = 'Islamic Fashion (Hijab/Gamis/Koko)',
  LUXURY_FASHION = 'High-End / Evening Wear',
  STREETWEAR = 'Streetwear / Oversized',
  ACTIVEWEAR = 'Activewear / Gym / Yoga',
  SWIMWEAR = 'Swimwear / Lingerie',
  JEWELRY = 'Jewelry (Necklaces/Earrings)',
  WATCHES = 'Watches / Bracelets',
  FOOTWEAR = 'Sneakers / Formal Shoes',
  EYEWEAR = 'Glasses / Sunglasses',
  BEAUTY = 'Skincare / Makeup'
}

export enum BrandVibe {
  MINIMALIST_CLEAN = 'Minimalist & Clean (White/Grey themes)',
  LUXURY_ELEGANT = 'Luxury & Elegant (Warm/Gold tones)',
  URBAN_EDGY = 'Urban & Edgy (High contrast, Street)',
  NATURAL_ORGANIC = 'Natural & Organic (Soft sunlight, Greens)',
  VIBRANT_POP = 'Vibrant & Pop (Bright colors, High energy)',
  MOODY_CINEMATIC = 'Moody & Cinematic (Shadows, Dramatic)'
}

export enum HairStyle {
  SHORT = 'Short Cut',
  LONG = 'Long Flowing',
  MEDIUM = 'Medium Length',
  BALD = 'Bald / Shaved',
  CURLY = 'Curly / Textured',
  STRAIGHT = 'Straight',
  WAVY = 'Wavy',
  UPDO = 'Updo / Bun',
  BOB = 'Bob Cut'
}

export interface GenerationConfig {
  mode: AppMode;
  objectType?: ObjectType;
  gender?: Gender;
  ageRange?: AgeRange;
  ethnicity?: Ethnicity;
  environment?: string; // Kept for backward compatibility or custom override
  bodyPartType?: BodyPartType;
  customStyle?: string;
  // New Fields
  productCategory?: ProductCategory; // Made optional for Character Reference Mode
  brandVibe?: BrandVibe; // Made optional for Character Reference Mode
  hairStyle?: string; // Optional hair style
  customPrompt?: string; // User manual override/emphasis
}

export interface GeneratedImage {
  url: string;
  promptUsed: string;
  id: string;
}