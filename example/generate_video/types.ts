
export enum SocialPlatform {
  TIKTOK = 'TikTok',
  INSTAGRAM = 'Instagram',
  YOUTUBE = 'YouTube Shorts',
  ECOMMERCE = 'E-commerce (Shopee/Tokopedia)'
}

export enum AIModel {
  VEO3 = 'VEO 3 (Google)',
  META = 'Meta AI (Simulation)'
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface ScriptScene {
  id: string;
  sequence: number;
  timeRange: string; // e.g. "0:00-0:08"
  duration: number; // in seconds
  visualPrompt: string;
  audioScript: string;
  generatedVideoUri?: string;
  generatedAudioUri?: string; // New field for TTS
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface AppState {
  platform: SocialPlatform;
  model: AIModel;
  selectedVoice: VoiceName;
  targetDuration: number;
  productName: string;
  productImages: UploadedImage[];
  modelImages: UploadedImage[];
  generatedScript: ScriptScene[];
  isGeneratingScript: boolean;
  isGeneratingVideo: boolean;
  activeStep: number; // 0: Config, 1: Script, 2: Video
}
