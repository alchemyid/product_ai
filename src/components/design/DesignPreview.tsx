import React, { useState } from 'react';
import { Loader2, Download, Sparkles } from 'lucide-react';

interface DesignPreviewProps {
    isLoading: boolean;
    rasterImage: string | null;
    svgContent: string | null;
    onDownload: (type: 'svg' | 'png') => void;
}

export const DesignPreview: React.FC<DesignPreviewProps> = ({
                                                                isLoading,
                                                                rasterImage,
                                                                svgContent,
                                                                onDownload,
                                                            }) => {
    const [viewMode, setViewMode] = useState<'raster' | 'vector'>('raster');

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="mt-4 text-sm font-medium text-blue-400 tracking-wider">FORGING VECTOR...</p>
                </div>
            );
        }

        if (!rasterImage) {
            return (
                <div className="text-center text-slate-600">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300">Ready to Forge</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                        Configure your design on the left and hit generate to see your vector result here.
                    </p>
                </div>
            );
        }

        if (viewMode === 'vector' && svgContent) {
            return <div className="w-full h-full p-8" dangerouslySetInnerHTML={{ __html: svgContent }} />;
        }

        return <img src={`data:image/png;base64,${rasterImage}`} alt="Generated Design" className="max-w-full max-h-full object-contain p-8" />;
    };

    return (
        <div className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-950/50">

            {/* Background Grid Pattern for Transparency */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                    backgroundSize: `20px 20px`,
                    backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
                }}
            ></div>

            {renderContent()}

            {rasterImage && !isLoading && (
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700 backdrop-blur-md">
                        <button onClick={() => setViewMode('raster')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'raster' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>PNG</button>
                        <button onClick={() => setViewMode('vector')} disabled={!svgContent} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'vector' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white disabled:opacity-50'}`}>SVG</button>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700 backdrop-blur-md">
                        <button onClick={() => onDownload('png')} title="Download PNG" className="p-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <button onClick={() => onDownload('svg')} disabled={!svgContent} title="Download SVG" className="p-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};