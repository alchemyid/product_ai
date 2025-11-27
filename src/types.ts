// ====== NAVIGATION / MENU TYPES ======
export interface MenuItem {
    id: string;
    title: string;
    description?: string;
    children?: MenuItem[];
}

export type MenuStructure = MenuItem[];
export type AppKey = 'product' | 'model' | 'design' | 'video';

// ====== SHARED ENUMS ======
export enum AspectRatio {
    SQUARE = "1:1",
    PORTRAIT = "3:4",
    LANDSCAPE = "4:3",
    WIDE = "16:9",
}

// ====== PRODUCT APP TYPES ======
export interface ProductState {
    name: string;
    description: string;
    style: string;
    baseImage: string | null; // Base64 string
    isGeneratingBase: boolean;
}

export interface Scenario {
    id: string;
    prompt: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    resultImage: string | null;
}

// ====== MODEL APP TYPES ======
export enum AppMode {
    FULL_BODY = 'FULL_BODY',
    BODY_PARTS = 'BODY_PARTS',
    CHARACTER_REFERENCE = 'CHARACTER_REFERENCE'
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

export interface ModelGenerationConfig {
    mode: AppMode;
    objectType?: ObjectType;
    gender?: Gender;
    ageRange?: AgeRange;
    ethnicity?: Ethnicity;
    environment?: string;
    bodyPartType?: BodyPartType;
    productCategory?: ProductCategory;
    brandVibe?: BrandVibe;
    hairStyle?: string;
    customPrompt?: string;
}

// ====== DESIGN APP TYPES ======
export type VectorStyle =
    | "flat-vector"
    | "vintage-badge"
    | "cyberpunk"
    | "mascot"
    | "outline"
    | "streetwear";

export interface DesignGenerationParams {
    prompt: string;
    style: VectorStyle;
    referenceImage?: string; // Base64
}

// ====== VIDEO APP TYPES ======
export enum VeoModel {
    VEO_FAST = 'veo-3.1-fast-generate-preview',
    VEO = 'veo-3.1-generate-preview',
}

export enum VideoResolution {
    P720 = '720p',
    P1080 = '1080p',
}

export interface GenerateVideoParams {
    prompt: string;
    model: VeoModel;
    aspectRatio: AspectRatio;
    resolution: VideoResolution;
}

// ====== GLOBAL DECLARATIONS ======
declare global {
    interface Window {
        ImageTracer: any;
    }
}