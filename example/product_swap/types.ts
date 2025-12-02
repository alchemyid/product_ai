export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  promptSuffix: string;
}

export interface CameraAngle {
  id: string; // The full string provided
  label: string; // Extracted label (e.g. "Front View")
  description: string; // Extracted description
}

export interface SwapSettings {
  themeId: string | null; // Selected environment theme
  customPrompt: string;
  selectedAngles: string[]; // List of full angle strings to generate
}

export interface GeneratedResult {
  imageUrl: string;
  viewLabel: string; // Short label for UI
  fullPromptAngle: string; // Full angle prompt used
  loading: boolean;
  error?: string;
}

// Global window extensions for AI Studio authentication
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}