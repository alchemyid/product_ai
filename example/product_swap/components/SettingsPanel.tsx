import React, { useState } from 'react';
import { SwapSettings, ThemeOption } from '../types';
import { Settings2, MapPin, Camera, MessageSquarePlus, Plus, X, ListPlus } from 'lucide-react';

interface SettingsPanelProps {
  settings: SwapSettings;
  setSettings: React.Dispatch<React.SetStateAction<SwapSettings>>;
}

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

export const DEFAULT_ANGLES = [
    "Front view - A direct, head-on shot of the product.",
    "Side view - A profile shot from the left or right side.",
    "Top down view - Shot from directly above, also known as a flat lay.",
    "45 degree angle view - A three-quarter perspective, showing the front and one side.",
    "Close-up detail shot - A macro shot focusing on a specific feature or texture.",
    "In context lifestyle shot - The product being used in a natural setting.",
    "Floating or suspended shot - Product appears to be floating against a clean background.",
    "Back view - Shows the reverse side of the product.",
    "Hero shot - A premium, stylized angle highlighting the product's best features.",
    "Low angle shot - Camera placed below the product to create a powerful presence.",
    "High angle shot - Camera slightly above for an elegant top perspective.",
    "Over the shoulder shot - Great for demonstrating usage in lifestyle scenarios.",
    "Macro extreme close-up - Ultra-detailed view of texture, material, or logo.",
    "Symmetrical centered shot - Balanced composition for clean eCommerce layouts.",
    "Diagonal dynamic angle - Adds motion and energy for fashion or sports items.",
    "Editorial portrait angle - For fashion products worn by models.",
    "Packaging shot - Full view of the box or container alongside the product.",
    "Group layout shot - Multiple variants/colors arranged together.",
    "Exploded layout shot - Product elements separated for a tech/engineering look."
];

// Helper to parse the angle string
const parseAngle = (fullString: string) => {
  const parts = fullString.split(' - ');
  return {
    label: parts[0] || fullString,
    desc: parts[1] || ''
  };
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [currentAngleSelection, setCurrentAngleSelection] = useState<string>(DEFAULT_ANGLES[0]);

  const handleAddAngle = () => {
    // Avoid duplicates
    if (!settings.selectedAngles.includes(currentAngleSelection)) {
      setSettings(prev => ({
        ...prev,
        selectedAngles: [...prev.selectedAngles, currentAngleSelection]
      }));
    }
  };

  const handleRemoveAngle = (angleToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      selectedAngles: prev.selectedAngles.filter(a => a !== angleToRemove)
    }));
  };

  const handleThemeSelect = (id: string) => {
    setSettings(prev => ({
      ...prev,
      themeId: prev.themeId === id ? null : id
    }));
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-8">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
        <Settings2 className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Creative Direction</h2>
      </div>

      {/* Environment Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <label className="font-medium text-sm">Environment / Theme</label>
          </div>
          <span className="text-xs text-slate-500">
            {settings.themeId ? 'Theme Selected' : 'AI Auto-Detect'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
          {PHOTOGRAPHY_THEMES.map((theme) => {
            const isSelected = settings.themeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`
                  relative text-left p-2.5 rounded-lg border transition-all duration-200
                  ${isSelected 
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50' 
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                    {theme.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {theme.promptSuffix}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Prompts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <MessageSquarePlus className="w-4 h-4 text-indigo-400" />
          <label className="font-medium text-sm">Specific Adjustments</label>
        </div>
        <textarea
          value={settings.customPrompt}
          onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
          placeholder='e.g. "Change the hat color to red", "Make the model smile", "Ensure the logo is visible"...'
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[80px] resize-none"
        />
      </div>

      {/* Angles / Queue System */}
      <div className="space-y-4 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-slate-200">
          <Camera className="w-4 h-4 text-indigo-400" />
          <label className="font-medium text-sm">Photoshoot Plan (Angles)</label>
        </div>
        
        <div className="flex flex-col gap-3">
            {/* Dropdown & Add Button */}
            <div className="flex gap-2">
                <select 
                    value={currentAngleSelection}
                    onChange={(e) => setCurrentAngleSelection(e.target.value)}
                    className="flex-grow bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                    {DEFAULT_ANGLES.map((angle) => {
                        const { label } = parseAngle(angle);
                        return <option key={angle} value={angle}>{label}</option>
                    })}
                </select>
                <button 
                    onClick={handleAddAngle}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
                    title="Add to queue"
                >
                    <ListPlus className="w-5 h-5" />
                </button>
            </div>
            <p className="text-[10px] text-slate-500 px-1">
                {parseAngle(currentAngleSelection).desc}
            </p>

            {/* Selected Queue */}
            <div className="mt-2 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Shot Queue ({settings.selectedAngles.length})
                </div>
                {settings.selectedAngles.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-slate-700 rounded-lg text-slate-600 text-xs italic">
                        No angles selected. Add angles to start photoshoot.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {settings.selectedAngles.map((angleString, idx) => {
                            const { label, desc } = parseAngle(angleString);
                            return (
                                <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-700 group">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm text-slate-200 font-medium truncate">{label}</span>
                                        <span className="text-[10px] text-slate-500 truncate">{desc}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveAngle(angleString)}
                                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};