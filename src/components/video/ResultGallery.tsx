import React, { useEffect, useState } from 'react';
import { ScriptScene } from '@/types';
import { Download, PlayCircle, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  scenes: ScriptScene[];
}

const VideoPlayer: React.FC<{ uri: string, posterText: string }> = ({ uri, posterText }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchVideo = async () => {
            try {
                const res = await fetch(uri);
                if (!res.ok) throw new Error('Failed to load video');
                const blob = await res.blob();
                const url = URL.createObjectURL(new Blob([blob], { type: 'video/mp4' }));
                if (active) {
                    setBlobUrl(url);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        };
        fetchVideo();
        return () => { active = false; if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }, [uri]);

    if (loading) return <div className="w-full h-full flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 text-slate-600 animate-spin" /></div>;
    if (error || !blobUrl) return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500"><AlertCircle className="w-8 h-8 opacity-50" /></div>;

    return (
        <>
            <video src={blobUrl} controls className="w-full h-full object-cover" loop playsInline />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                <span className="text-[10px] text-white font-mono">{posterText}</span>
            </div>
        </>
    );
};

export const ResultGallery: React.FC<Props> = ({ scenes }) => {
  const completedScenes = scenes.filter(s => s.status === 'completed' && s.generatedVideoUri);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (completedScenes.length === 0) return null;

  const handleDownload = async (scene: ScriptScene) => {
    if (!scene.generatedVideoUri) return;
    setDownloadingId(scene.id);
    try {
        const response = await fetch(scene.generatedVideoUri);
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
        alert("Failed to download.");
    } finally {
        setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 mt-12 pt-12 border-t border-slate-800 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="text-green-400" /> Production Gallery
        </h2>
        <span className="text-xs text-slate-500">{completedScenes.length} videos ready</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {completedScenes.map((scene, idx) => (
          <div key={scene.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="relative aspect-[9/16] bg-black">
                <VideoPlayer uri={scene.generatedVideoUri!} posterText={scene.timeRange} />
            </div>
            <div className="p-4 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  Scene {scene.sequence || idx + 1} <CheckCircle2 className="w-3 h-3 text-green-500" />
              </h3>
              <button 
                onClick={() => handleDownload(scene)}
                disabled={downloadingId === scene.id}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border border-slate-700"
              >
                {downloadingId === scene.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> Download HD</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};