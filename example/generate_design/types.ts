export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "16:9";

export type VectorStyle = 
  | "flat-vector" 
  | "vintage-badge" 
  | "cyberpunk" 
  | "mascot" 
  | "outline"
  | "streetwear";

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  style: VectorStyle;
  referenceImage?: string; // Base64 string
}

export const STYLE_PROMPTS: Record<VectorStyle, string> = {
  "flat-vector": "flat vector art, clean proportional outlines, minimal shading, vibrant solid colors, clear typography, sticker design style, 2D",
  "vintage-badge": "vintage badge style, clean ink lines, limited color palette (max 4 colors), retro typography, solid blocks of color, retro vector",
  "cyberpunk": "cyberpunk vector style, high contrast, bold neon solid blocks, clean black outlines, futuristic font, flat illustration",
  "mascot": "esports mascot logo style, aggressive crisp outlines, solid color filling, bold sports typography, hard shadows only (no soft gradients), vector style",
  "outline": "black and white line art, clean bold lines, clear text lettering, coloring book style, no fill, high contrast, clean vector paths",
  "streetwear": "urban streetwear design, bold graphic vector, solid color chunks, crisp grunge outlines, bold statement typography, high contrast"
};

// Declare external library
declare global {
  interface Window {
    ImageTracer: any;
  }
}