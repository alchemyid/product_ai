import React, { useRef } from 'react';
import { Upload, X, Plus, User } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  description: string;
  images: UploadedImage[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  multiple?: boolean;
  maxFiles?: number;
  icon?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  images,
  onUpload,
  onRemove,
  multiple = false,
  maxFiles = 1,
  icon
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    // Reset input so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const remainingSlots = maxFiles - images.length;
  const canUpload = remainingSlots > 0;
  const hasImages = images.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {icon && <span className="text-indigo-400">{icon}</span>}
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{label}</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {images.length}/{maxFiles}
        </span>
      </div>

      {/* Empty State - Large Drop Zone */}
      {!hasImages && (
        <div 
          onClick={() => inputRef.current?.click()}
          className="group relative h-40 w-full border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <div className="p-3 bg-slate-800 rounded-full group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
            {icon ? (
                <div className="text-slate-400 group-hover:text-indigo-400">{icon}</div>
            ) : (
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
            )}
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Click to upload {multiple ? "images" : "image"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* Filled State - Gallery Grid */}
      {hasImages && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shadow-sm">
              <img 
                src={img.previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onRemove(idx)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Small Add Button if slots remain */}
          {canUpload && (
             <div 
               onClick={() => inputRef.current?.click()}
               className="aspect-square rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-indigo-500/50 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all group"
             >
               <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
               <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-300">Add More</span>
             </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};