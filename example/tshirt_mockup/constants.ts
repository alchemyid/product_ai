import { ThemeOption, Position } from './types';

export const DEFAULT_POSITION: Position = {
  x: 50, // Percentage 0-100
  y: 40, // Percentage 0-100
  scale: 1, // 0.1 - 3
  rotation: 0, // 0 - 360
};

export const PRESET_SHIRT_COLORS = ['#ffffff', '#1a1a1a', '#991b1b', '#1e40af', '#166534', '#d97706', '#5b21b6', '#3f3f46', '#fce7f3', '#f3f4f6'];
export const PRESET_BG_COLORS = ['#f3f4f6', '#ffffff', '#e5e7eb', '#bfdbfe', '#fbcfe8', '#dcfce7'];

export const PHOTOGRAPHY_THEMES: ThemeOption[] = [
  {
    id: 'studio_clean',
    name: 'Studio Clean',
    promptSuffix: 'High-end e-commerce studio photography, plain white background, soft lighting, 85mm lens, sharp focus on texture.',
  },
  {
    id: 'urban_street',
    name: 'Urban Street',
    promptSuffix: 'Streetwear fashion photography, golden hour, blurred city background, bokeh, energetic pose, cinematic color grading.',
  },
  {
    id: 'lifestyle_cafe',
    name: 'Lifestyle Cafe',
    promptSuffix: 'Casual lifestyle photography, inside a modern minimalist cafe, natural window light, candid look.',
  },
  {
    id: 'nature_outdoor',
    name: 'Nature Outdoor',
    promptSuffix: 'Outdoor fashion shoot, forest edge or beach during overcast day, moody tones, desaturated greens.',
  },
  {
    id: 'neon_night',
    name: 'Neon Night',
    promptSuffix: 'Cyberpunk aesthetic, night photography with neon blue and pink rim lighting, dramatic shadows, high contrast.',
  },
  {
    id: 'luxury_editorial',
    name: 'Luxury Editorial',
    promptSuffix: 'High-fashion magazine editorial style, dramatic posing, architectural background, brutalist concrete, dramatic lighting.',
  }
];