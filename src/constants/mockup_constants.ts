import { ThemeOption, Position } from '@/types';

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
    },

    // --- Tambahan Profesional ---
    {
        id: 'minimal_product_showcase',
        name: 'Minimal Product Showcase',
        promptSuffix: 'Premium product photography, seamless light grey backdrop, soft diffused top light, 50mm macro lens, shadow-controlled, ultra-clean aesthetic.',
    },
    {
        id: 'moody_shadow',
        name: 'Moody Dramatic Shadow',
        promptSuffix: 'Studio fashion photography with hard light and deep shadows, black background, crisp rim-light, 35mm lens, sculpted contrast for dramatic mood.',
    },
    {
        id: 'warm_home_lifestyle',
        name: 'Warm Home Lifestyle',
        promptSuffix: 'Warm cozy lifestyle photography, soft morning sunlight through curtains, wooden interior, shallow depth of field, natural candid vibe.',
    },
    {
        id: 'color_pop_pastel',
        name: 'Color Pop Pastel',
        promptSuffix: 'Vibrant pastel backdrop, colorful modern studio photography, bold shadows, playful composition, 35mm lens, high-energy editorial feel.',
    },
    {
        id: 'black_gold_luxury',
        name: 'Black & Gold Luxury',
        promptSuffix: 'Ultra-premium luxury product photography, black velvet backdrop, warm gold edge lighting, glossy reflections, macro detail emphasis.',
    },
    {
        id: 'vintage_film',
        name: 'Vintage Film Aesthetic',
        promptSuffix: 'Retro 90s film photography look, Kodak Portra color tones, grainy texture, soft ambient light, natural candid posing.',
    },
    {
        id: 'sport_active',
        name: 'Sport Active Motion',
        promptSuffix: 'Dynamic sports photography, mid-motion freeze, outdoor track or gym setting, dramatic side lighting, energetic & powerful composition.',
    },
    {
        id: 'flatlay_modern',
        name: 'Flatlay Modern',
        promptSuffix: 'Top-down flatlay photography, balanced composition, textured backdrop, soft shadows, color-coordinated props, crisp detail.',
    },
    {
        id: 'monochrome_elegant',
        name: 'Elegant Monochrome',
        promptSuffix: 'High-end black and white fashion editorial, high contrast, clean backdrop, strong jawline lighting, timeless cinematic look.',
    },
    {
        id: 'soft_dreamy',
        name: 'Soft Dreamy Aesthetic',
        promptSuffix: 'Dreamy soft-focus photography, pastel color grading, backlight glow, hazy highlights, cinematic feminine energy.',
    },
];
