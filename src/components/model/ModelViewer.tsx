import React from 'react';
import { Loader2, User, Download } from 'lucide-react';

interface ModelViewerProps {
  image: string | null;
  isLoading: boolean;
  onDownload: () => void;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ image, isLoading, onDownload }) => {
  return (
    <div className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-950/50">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <p className="mt-4 text-sm font-medium text-purple-400 tracking-wider">GENERATING MODEL...</p>
        </div>
      )}

      {!isLoading && !image && (
        <div className="text-center text-slate-600">
          <User className="w-16 h-16 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-400">Your Generated Model Will Appear Here</h3>
          <p className="text-sm text-slate-500 mt-1">Configure the settings and click "Generate Model"</p>
        </div>
      )}

      {image && (
        <>
          <img
            src={`data:image/png;base64,${image}`}
            alt="Generated Model"
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={onDownload}
              className="bg-slate-800/50 hover:bg-slate-700/70 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};