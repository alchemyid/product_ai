import React from 'react';
import { Loader2, Sparkles, Upload, FileInput } from 'lucide-react';
import { STYLE_PRESETS } from '@/constants/product_constants';
import { ProductState } from '@/types';

interface ProductFormProps {
  product: ProductState;
  setProduct: React.Dispatch<React.SetStateAction<ProductState>>;
  onGenerate: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  setProduct, 
  onGenerate,
  onImageUpload
}) => {
  return (
    <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileInput className="w-4 h-4 text-indigo-400" />
            Define Product
        </h2>

        <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Product Name (Optional)</label>
            <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. ChronoMax Watch"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            </div>

            <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Visual Description</label>
            <textarea
                value={product.description}
                onChange={(e) => setProduct(p => ({ ...p, description: e.target.value }))}
                placeholder="A matte black stainless steel analog watch with gold indices..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
            </div>

            <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Artistic Style</label>
            <select
                value={product.style}
                onChange={(e) => setProduct(p => ({ ...p, style: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer"
            >
                {STYLE_PRESETS.map(style => (
                <option key={style} value={style}>{style}</option>
                ))}
            </select>
            </div>

            <div className="pt-2 flex gap-3">
            <button
                onClick={onGenerate}
                disabled={!product.description || product.isGeneratingBase}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-900/20"
            >
                {product.isGeneratingBase ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
            </button>
            
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={product.isGeneratingBase}
                />
                <button className="h-full px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center" title="Upload existing product image">
                    <Upload className="w-4 h-4" />
                </button>
            </div>
            </div>
        </div>
    </div>
  );
};