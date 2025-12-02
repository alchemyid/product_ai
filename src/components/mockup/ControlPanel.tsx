import React from 'react';
import { LayerConfig, Position } from '@/types';
import { Upload, Trash2, RotateCcw, Move, ZoomIn, RotateCw, Image as ImageIcon } from 'lucide-react';

interface ControlPanelProps {
    title: string;
    icon?: React.ReactNode;
    layer: LayerConfig;
    onUpdate: (updated: LayerConfig) => void;
    allowDelete?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ title, icon, layer, onUpdate, allowDelete = true }) => {

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onUpdate({ ...layer, image: event.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const updatePos = (key: keyof Position, value: number) => {
        onUpdate({
            ...layer,
            position: { ...layer.position, [key]: value }
        });
    };

    const handleRemove = () => {
        onUpdate({ ...layer, image: null });
    };

    const handleReset = () => {
        onUpdate({
            ...layer,
            position: { x: 50, y: 40, scale: 1, rotation: 0 }
        });
    };

    // Helper component for the small number inputs
    const NumberInput = ({
        value,
        onChange,
        min,
        max,
        step = 1,
        unit = ""
    }: {
        value: number,
        onChange: (val: number) => void,
        min: number,
        max: number,
        step?: number,
        unit?: string
    }) => (
        <div className="flex items-center bg-slate-900 border border-slate-600 rounded px-2 py-2 w-16 min-h-[28px] focus-within:border-indigo-500 transition-colors relative">
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-transparent text-[10px] text-white text-right outline-none m-0 py-0.5"
            />
            {unit && <span className="text-[10px] text-slate-500 ml-1 flex-shrink-0">{unit}</span>}
        </div>
    );

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                    {icon || <ImageIcon size={16} className="text-indigo-500" />}
                    {title}
                </h2>
                {layer.image && allowDelete && (
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-1 text-slate-500 hover:text-indigo-400 transition-colors" title="Reset Position">
                            <RotateCcw size={14} />
                        </button>
                        <button onClick={handleRemove} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 transition-colors">
                            <Trash2 size={10} /> Remove
                        </button>
                    </div>
                )}
            </div>

            {!layer.image ? (
                <label className="flex flex-col items-center justify-center w-full h-20 border border-dashed border-slate-600 rounded-lg cursor-pointer bg-black/20 hover:bg-black/40 hover:border-indigo-500 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-1">
                        <Upload className="w-5 h-5 mb-1 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-[10px] text-slate-500 text-center">Click to Upload</p>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            ) : (
                <div className="space-y-4 pt-2">
                    {/* Position Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Move size={10} /> Position
                        </label>
                        
                        {/* Stack X and Y vertically for better UI spacing */}
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 w-3 font-medium">X</span>
                            <input
                                type="range" min="0" max="100"
                                value={layer.position.x}
                                onChange={(e) => updatePos('x', Number(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <NumberInput value={layer.position.x} onChange={(v) => updatePos('x', v)} min={0} max={100} unit="%" />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 w-3 font-medium">Y</span>
                            <input
                                type="range" min="0" max="100"
                                value={layer.position.y}
                                onChange={(e) => updatePos('y', Number(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <NumberInput value={layer.position.y} onChange={(v) => updatePos('y', v)} min={0} max={100} unit="%" />
                        </div>
                    </div>

                    <div className="h-px bg-slate-700/50 w-full my-2"></div>

                    {/* Scale & Rotate Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Scale */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <ZoomIn size={10} /> Scale
                                </label>
                                <NumberInput value={layer.position.scale} onChange={(v) => updatePos('scale', v)} min={0.1} max={3} step={0.1} />
                            </div>
                            <input
                                type="range" min="0.1" max="3" step="0.1"
                                value={layer.position.scale}
                                onChange={(e) => updatePos('scale', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        {/* Rotation */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <RotateCw size={10} /> Rotate
                                </label>
                                <NumberInput value={layer.position.rotation} onChange={(v) => updatePos('rotation', v)} min={0} max={360} unit="°" />
                            </div>
                            <input
                                type="range" min="0" max="360"
                                value={layer.position.rotation}
                                onChange={(e) => updatePos('rotation', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlPanel;