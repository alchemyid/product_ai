import React, { useEffect, useState } from 'react';
import { ScriptScene } from '../types';
import { Download, PlayCircle, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  scenes: ScriptScene[];
}

// Sub-component to handle async video fetching for preview
const VideoPlayer: React.FC<{ uri: string, posterText: string }> = ({ uri, posterText }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchVideo = async () => {
            try {
                // Fetch the video securely (using the signed key in the URI)
                const res = await fetch(uri);
                if (!res.ok) throw new Error('Failed to load video');
                const blob = await res.blob();
                // Create a blob URL with correct mime type
                const url = URL.createObjectURL(new Blob([blob], { type: 'video/mp4' }));
                
                if (active) {
                    setBlobUrl(url);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Preview load error", e);
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchVideo();
        return () => {
            active = false;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [uri]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
            </div>
        );
    }

    if (error || !blobUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 flex-col gap-2">
                <AlertCircle className="w-8 h-8 opacity-50" />
                <span className="text-xs">Preview failed</span>
            </div>
        );
    }

    return (
        <>
            <video 
                src={blobUrl} 
                controls 
                className="w-full h-full object-cover"
                loop
                playsInline
            />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                <span className="text-[10px] text-white font-mono">{posterText}</span>
            </div>
        </>
    );
};

const ResultGallery: React.FC<Props> = ({ scenes }) => {
  const completedScenes = scenes.filter(s => s.status === 'completed' && s.generatedVideoUri);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (completedScenes.length === 0) return null;

  const handleDownload = async (scene: ScriptScene) => {
    if (!scene.generatedVideoUri) return;
    
    setDownloadingId(scene.id);
    try {
        const response = await fetch(scene.generatedVideoUri);
        if (!response.ok) throw new Error(`Download failed`);
        const blob = await response.blob();
        
        const videoBlob = new Blob([blob], { type: 'video/mp4' });
        const url = window.URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketflow_scene_${scene.sequence}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert("Failed to download. The API link may have expired.");
    } finally {
        setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-zinc-800 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="text-green-400" />
            Production Gallery
        </h2>
        <span className="text-xs text-zinc-500">{completedScenes.length} videos ready</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {completedScenes.map((scene, idx) => (
          <div key={scene.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-zinc-600 transition-all shadow-xl hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="relative aspect-[9/16] bg-black">
                <VideoPlayer uri={scene.generatedVideoUri!} posterText={scene.timeRange} />
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        Scene {scene.sequence || idx + 1}
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-light italic opacity-80">
                        {scene.visualPrompt.replace('VISUAL:', '')}
                    </p>
                 </div>
              </div>
              
              <button 
                onClick={() => handleDownload(scene)}
                disabled={downloadingId === scene.id}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500"
              >
                {downloadingId === scene.id ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        Download HD Video
                    </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultGallery;