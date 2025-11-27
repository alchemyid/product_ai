import React, { useState, useEffect } from 'react';
import { Download, Share2, Sparkles, FileCode, CheckCircle, RefreshCcw, Layers, Sliders } from 'lucide-react';
import { downloadImage, downloadBlob, removeWhiteBackground } from '../utils';

interface ResultSectionProps {
  imageUrl: string | null;
  isLoading: boolean;
}

type ViewMode = 'original' | 'transparent' | 'vector';

export const ResultSection: React.FC<ResultSectionProps> = ({ imageUrl, isLoading }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [transparentImage, setTransparentImage] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vectorQuality, setVectorQuality] = useState<'smooth' | 'detailed'>('smooth');

  // Reset states when a new image is generated
  useEffect(() => {
    if (imageUrl) {
      setViewMode('original');
      setTransparentImage(null);
      setSvgContent(null);
    }
  }, [imageUrl]);

  const handleProcessImage = async () => {
    if (!imageUrl) return;

    setIsProcessing(true);
    try {
      // 1. Remove background
      const transparentUrl = await removeWhiteBackground(imageUrl);
      setTransparentImage(transparentUrl);

      // 2. Vectorize using ImageTracer
      if (window.ImageTracer) {
        // Configuration tuned for "Smoother" results
        // Higher ltres/qtres = fewer paths/points = smoother look
        const smoothOptions = {
            ltres: 3, // Linear error threshold (higher = straighter lines)
            qtres: 4, // Quadratic error threshold (higher = smoother curves)
            pathomit: 32, // Ignore paths smaller than this (removes speckles/noise)
            rightangleenhance: false, // Turn off to avoid blocky look
            colorsampling: 2, // Deterministic
            numberofcolors: 24, // Reduce colors to flatten the image
            mincolorratio: 0.0,
            blurradius: 2, // Blur input image to smooth jagged pixels before tracing
            blurdelta: 20,
            strokewidth: 1, // Add slight stroke to fill gaps
            linefilter: true,
            scale: 1,
            viewbox: true
        };

        const detailedOptions = {
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            rightangleenhance: true,
            colorsampling: 2,
            numberofcolors: 32,
            mincolorratio: 0.02,
            strokewidth: 0,
            viewbox: true
        };
        
        const options = vectorQuality === 'smooth' ? smoothOptions : detailedOptions;

        window.ImageTracer.imageToSVG(
            transparentUrl,
            (svgString: string) => {
                setSvgContent(svgString);
                setIsProcessing(false);
                setViewMode('vector');
            },
            options
        );
      } else {
          // Fallback if library missing
          setIsProcessing(false);
          setViewMode('transparent');
          alert("ImageTracer library not loaded. Only background removal applied.");
      }

    } catch (e) {
      console.error("Processing failed", e);
      setIsProcessing(false);
    }
  };

  const getCurrentDisplayImage = () => {
    if (viewMode === 'original') return imageUrl;
    if (viewMode === 'transparent') return transparentImage || imageUrl;
    return null; // Vector handled separately
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] bg-dtf-panel rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 relative mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Constructing Vector Data</h3>
            <p className="text-slate-400 text-center max-w-xs">
              Analyzing aesthetics, flattening colors, and rendering high-contrast lines for DTF output...
            </p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="h-full min-h-[400px] bg-dtf-panel rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300">Ready to Forge</h3>
        <p className="text-slate-500 text-center max-w-xs mt-2">
          Configure your design on the left and hit generate to see your vector result here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg w-fit border border-slate-700">
            <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'original' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
            Original (JPG)
            </button>
            <button
            onClick={() => transparentImage ? setViewMode('transparent') : null}
            disabled={!transparentImage}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'transparent' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white disabled:opacity-30'}`}
            >
            Transparent (PNG)
            </button>
            <button
            onClick={() => svgContent ? setViewMode('vector') : null}
            disabled={!svgContent}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'vector' ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20' : 'text-slate-400 hover:text-white disabled:opacity-30'}`}
            >
            Vector (SVG)
            </button>
        </div>

        {/* Vector Settings (Only visible before processing or when re-processing) */}
        {!svgContent && !isProcessing && (
             <div className="flex items-center gap-2 text-xs bg-slate-800/30 px-2 py-1 rounded border border-slate-700/50">
                <span className="text-slate-400 flex items-center gap-1"><Sliders className="w-3 h-3"/> Smoothing:</span>
                <button 
                    onClick={() => setVectorQuality('detailed')}
                    className={`px-2 py-0.5 rounded transition-colors ${vectorQuality === 'detailed' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Low
                </button>
                <button 
                    onClick={() => setVectorQuality('smooth')}
                    className={`px-2 py-0.5 rounded transition-colors ${vectorQuality === 'smooth' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    High
                </button>
            </div>
        )}
      </div>

      <div className="relative group bg-[#ffffff] rounded-xl border border-slate-700 overflow-hidden shadow-2xl min-h-[400px] flex items-center justify-center">
        {/* Checkerboard background for transparency simulation */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: `20px 20px`,
            backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
          }}
        ></div>
        
        {viewMode === 'vector' && svgContent ? (
             <div 
                className="w-full h-full p-4 flex items-center justify-center z-10"
                dangerouslySetInnerHTML={{ __html: svgContent }} 
             />
        ) : (
             <img 
               src={getCurrentDisplayImage() || ''} 
               alt="Generated Design" 
               className="w-full h-auto object-contain relative z-10 max-h-[600px] mx-auto"
             />
        )}
        
        {/* Hover Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex justify-end gap-3">
             {viewMode === 'vector' ? (
                <button 
                    onClick={() => svgContent && downloadBlob(svgContent, `dtf-vector-${Date.now()}.svg`, 'image/svg+xml')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Download className="w-4 h-4" /> Download SVG
                </button>
             ) : viewMode === 'transparent' ? (
                <button 
                    onClick={() => transparentImage && downloadImage(transparentImage, `dtf-transparent-${Date.now()}.png`)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Download className="w-4 h-4" /> Download PNG
                </button>
             ) : (
                <button 
                    onClick={() => imageUrl && downloadImage(imageUrl, `dtf-concept-${Date.now()}.png`)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Download className="w-4 h-4" /> Download JPG
                </button>
             )}
        </div>
      </div>

      <div className="bg-dtf-panel border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                STATUS: {viewMode === 'vector' ? 'VECTORIZED' : 'GENERATION COMPLETE'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
                {viewMode === 'vector' 
                    ? 'Ready for plotting/cutting. Scalable without quality loss.' 
                    : 'Review the design. Convert to vector for best print results.'}
            </p>
        </div>

        {!svgContent && !isProcessing && (
            <button 
                onClick={handleProcessImage}
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
            >
                <Layers className="w-4 h-4" />
                Vectorize & Remove BG
            </button>
        )}
        
        {isProcessing && (
             <button disabled className="w-full md:w-auto bg-slate-700 text-slate-300 px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium cursor-wait">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Processing...
            </button>
        )}
        
        {svgContent && !isProcessing && (
             <button 
                onClick={handleProcessImage}
                className="w-full md:w-auto bg-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm border border-slate-700 hover:border-slate-500 transition-colors"
            >
                Re-process
            </button>
        )}
      </div>
    </div>
  );
};