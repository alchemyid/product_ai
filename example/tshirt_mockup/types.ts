export interface Position {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface LayerConfig {
  image: string | null; // Base64 data
  position: Position;
}

export interface ShirtSide {
  baseImage: string | null;
  design: LayerConfig;
  label?: LayerConfig; // Front only usually has label/tag
}

export interface AppState {
  shirtColor: string;
  previewBackgroundColor: string; // New state for background
  front: ShirtSide;
  back: ShirtSide;
  faceReference: string | null; // Base64 face image
  selectedTheme: string;
  isGenerating: boolean;
  generatedImages: string[]; // URLs of generated images
  hasApiKey: boolean;
}

export interface ThemeOption {
  id: string;
  name: string;
  promptSuffix: string;
}

export enum ViewSide {
  FRONT = 'FRONT',
  BACK = 'BACK'
}