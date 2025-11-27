export type AppKey = 'product' | 'model' | 'design';

// ====== NAVIGATION / MENU TYPES ======
export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  children?: MenuItem[];
}

export type MenuStructure = MenuItem[];
// ====== PRODUCT APP TYPES ======

export interface ProductState {
  name: string;
  description: string;
  style: string;
  baseImage: string | null;
  isGeneratingBase: boolean;
}

export interface Scenario {
  id: string;
  prompt: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  resultImage: string | null;
}

// ====== MODEL APP TYPES ======

export interface ModelGenerationParams {
  prompt: string;
  negativePrompt: string;
  style: string;
}

// ====== DESIGN APP TYPES ======

export interface DesignGenerationParams {
  prompt: string;
  style: string;
}

// This allows ImageTracer to be used globally after being loaded from the CDN
declare global {
    interface Window {
        ImageTracer: any;
    }
}