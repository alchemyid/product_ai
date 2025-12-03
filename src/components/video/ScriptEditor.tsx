import React, { useState } from 'react';
import { ScriptScene, VoiceName } from '@/types';
import geminiService from '@/services/gemini';
import { Trash2, Clock, Video, Mic, Music, Loader2, Download } from 'lucide-react';

interface Props {
  scenes: ScriptScene[];
  setScenes: (scenes: ScriptScene[]) => void;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
  canGenerate: boolean;
  selectedVoice: VoiceName;
}

export const ScriptEditor: React.FC<Props> = ({ 
  scenes, 
  setScenes, 
  onGenerateVideo,
  isGeneratingVideo,
  canGenerate,
  selectedVoice
}) => {
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const updateScene = (id: string, field: 'visualPrompt' | 'audioScript', value: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const handleGenerateAudio = async (sceneId: string, fullText: string) => {
    setLoadingAudioId(sceneId);
    try {
        const audioUri = await geminiService.generateSpeech(fullText, selectedVoice);
        setScenes(scenes.map(s => s.id === sceneId ? { ...s, generatedAudioUri: audioUri } : s));
    } catch (e: any) {
        alert("Failed to generate audio: " + e.message);
    } finally {
        setLoadingAudioId(null);
    }
  };

  const handleDownloadAudio = (uri: string, sceneIndex: number) => {
    const a = document.createElement('a');
    a.href = uri;
    a.download = `voiceover_scene_${sceneIndex + 1}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Director's Script & Storyboard</h2>
          <p className="text-slate-400 text-xs">Review the generated script below before generating video.</p>
        </div>
        <div className="text-right">
             <span className="text-xs text-slate-500 block mb-1">Total Runtime</span>
             <span className="text-lg font-mono text-purple-400 font-bold">
               {scenes.reduce((acc, curr) => acc + curr.duration, 0)}s
             </span>
        </div>
      </div>

      <div className="flex flex-col gap-8 relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 hidden md:block"></div>

        {scenes.map((scene, index) => (
          <div key={scene.id} className="relative pl-0 md:pl-12">
            <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-2 items-center justify-center font-bold hidden md:flex z-10 ${
                scene.status === 'completed' ? 'bg-green-900 border-green-500 text-green-200' : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}>
              {index + 1}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-mono font-bold text-xs tracking-wider px-2 py-1 bg-purple-900/20 rounded">
                            {scene.timeRange}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Durasi: {scene.duration}s
                        </span>
                    </div>
                    <button onClick={() => deleteScene(scene.id)} className="text-slate-600 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Visual */}
                    <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-2">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Video className="w-3 h-3" /> Visual Prompt (To AI Video)
                        </label>
                        <textarea
                            value={scene.visualPrompt}
                            onChange={(e) => updateScene(scene.id, 'visualPrompt', e.target.value)}
                            className="w-full bg-black/40 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none h-[120px] resize-none"
                        />
                    </div>

                    {/* Audio */}
                    <div className="p-4 space-y-2 bg-slate-900/30 flex flex-col">
                        <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Music className="w-3 h-3" /> Audio & VO
                        </label>
                        <textarea
                            value={scene.audioScript}
                            onChange={(e) => updateScene(scene.id, 'audioScript', e.target.value)}
                            className="w-full bg-black/40 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-300 focus:border-orange-500 focus:outline-none h-[80px] resize-none"
                        />
                        <div className="mt-auto pt-2 flex justify-between items-center">
                            {scene.generatedAudioUri ? (
                                <div className="flex items-center gap-2">
                                    <audio controls src={scene.generatedAudioUri} className="h-6 w-32" />
                                    <button onClick={() => handleDownloadAudio(scene.generatedAudioUri!, index)} className="p-1 bg-slate-800 rounded hover:bg-slate-700 text-white"><Download className="w-3 h-3" /></button>
                                </div>
                            ) : <span className="text-xs text-slate-600">No audio</span>}
                            
                            <button
                                onClick={() => handleGenerateAudio(scene.id, scene.audioScript)}
                                disabled={loadingAudioId === scene.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/20 text-orange-400 border border-orange-600/50 rounded-lg text-xs font-medium hover:bg-orange-600/30"
                            >
                                {loadingAudioId === scene.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
                                Generate VO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex justify-center pt-4 z-30">
         <button
            onClick={onGenerateVideo}
            disabled={!canGenerate || isGeneratingVideo}
            className={`
                group px-8 py-3 rounded-full font-bold text-sm shadow-2xl transition-all border flex items-center gap-3
                ${!canGenerate || isGeneratingVideo 
                    ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/30 text-white hover:scale-105'
                }
            `}
         >
           {isGeneratingVideo ? (
             <>
               <Loader2 className="animate-spin h-4 w-4 text-white" />
                Processing VEO Generation...
             </>
           ) : (
             <>
                <span>Generate Video Production</span>
                <span className="text-[9px] bg-black/30 px-2 py-0.5 rounded ml-1 uppercase tracking-wide border border-white/10">VEO 3</span>
             </>
           )}
         </button>
      </div>
    </div>
  );
};