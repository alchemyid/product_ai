
import React, { useState } from 'react';
import { ScriptScene, VoiceName } from '../types';
import { Trash2, Clock, Video, Mic, Music, Loader2, Download } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface Props {
  scenes: ScriptScene[];
  setScenes: (scenes: ScriptScene[]) => void;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
  canGenerate: boolean;
  selectedVoice: VoiceName;
}

const ScriptEditor: React.FC<Props> = ({ 
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
    // Extract just the Voiceover part
    const match = fullText.match(/VOICEOVER:\s*([\s\S]*?)(?=(?:AUDIO:)|$)/i);
    const voText = match ? match[1].trim() : "";
    
    if (!voText || voText === '-') {
        alert("No voiceover text found. Ensure 'VOICEOVER: ...' is present.");
        return;
    }

    setLoadingAudioId(sceneId);
    try {
        const audioUri = await generateSpeech(voText, selectedVoice);
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
          <h2 className="text-2xl font-bold text-white mb-2">Director's Script & Storyboard</h2>
          <p className="text-zinc-400 text-sm">Review the generated naskah below. Ensure continuity and flow.</p>
        </div>
        <div className="text-right">
             <span className="text-xs text-zinc-500 block mb-1">Total Runtime</span>
             <span className="text-xl font-mono text-purple-400 font-bold">
               {scenes.reduce((acc, curr) => acc + curr.duration, 0)}s
             </span>
        </div>
      </div>

      <div className="flex flex-col gap-8 relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-zinc-800 hidden md:block"></div>

        {scenes.map((scene, index) => (
          <div key={scene.id} className="relative pl-0 md:pl-12">
            
            {/* Timeline Dot */}
            <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-2 items-center justify-center font-bold hidden md:flex z-10 ${
                scene.status === 'completed' ? 'bg-green-900 border-green-500 text-green-200' : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}>
              {index + 1}
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors shadow-sm">
                {/* Header: Time Range */}
                <div className="bg-zinc-950/50 p-3 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-mono font-bold text-sm tracking-wider px-2 py-1 bg-purple-900/20 rounded">
                            {scene.timeRange || `${index * 8}:00-${(index + 1) * 8}:00`}
                        </span>
                        <div className="h-4 w-px bg-zinc-700"></div>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Durasi: {scene.duration}s
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         {scene.status === 'completed' && <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-900/20 rounded border border-green-900/50">Video Ready</span>}
                         {scene.status === 'failed' && <span className="text-xs text-red-400 font-medium px-2 py-1 bg-red-900/20 rounded border border-red-900/50">Failed</span>}
                         <button onClick={() => deleteScene(scene.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* VISUAL COLUMN */}
                    <div className="p-4 border-b lg:border-b-0 lg:border-r border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Video className="w-3 h-3" /> Visual Prompt (To AI Video)
                            </label>
                            {index === scenes.length - 1 && (
                                <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                                    + Text Overlay
                                </span>
                            )}
                        </div>
                        <textarea
                            value={scene.visualPrompt}
                            onChange={(e) => updateScene(scene.id, 'visualPrompt', e.target.value)}
                            className="w-full bg-black/40 border border-zinc-700/50 rounded-lg p-3 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none min-h-[160px] resize-none leading-relaxed placeholder-zinc-700 font-light"
                            placeholder="Deskripsi visual..."
                        />
                    </div>

                    {/* AUDIO COLUMN */}
                    <div className="p-4 space-y-3 bg-zinc-900/30 flex flex-col h-full">
                        <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Music className="w-3 h-3" /> Audio & Voiceover Script
                        </label>
                        <p className="text-[10px] text-zinc-500 italic">
                            * Note: Only Voiceover will be generated by AI. Audio/BGM direction is for editing reference.
                        </p>
                        <textarea
                            value={scene.audioScript}
                            onChange={(e) => updateScene(scene.id, 'audioScript', e.target.value)}
                            className="w-full bg-black/40 border border-zinc-700/50 rounded-lg p-3 text-sm text-zinc-300 focus:border-orange-500 focus:outline-none min-h-[100px] flex-1 resize-none leading-relaxed font-light mb-3"
                            placeholder="AUDIO: ... VOICEOVER: ..."
                        />
                        
                        {/* Audio Controls */}
                        <div className="mt-auto border-t border-zinc-800 pt-3 flex items-center justify-between">
                            {scene.generatedAudioUri ? (
                                <div className="flex items-center gap-2 w-full max-w-[240px]">
                                    <audio controls src={scene.generatedAudioUri} className="h-8 w-full" />
                                    <button 
                                        onClick={() => handleDownloadAudio(scene.generatedAudioUri!, index)}
                                        className="p-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                                        title="Download Audio"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-zinc-600 italic">No audio generated</span>
                            )}
                            
                            <button
                                onClick={() => handleGenerateAudio(scene.id, scene.audioScript)}
                                disabled={loadingAudioId === scene.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/20 text-orange-400 border border-orange-600/50 rounded-lg text-xs font-medium hover:bg-orange-600/30 transition-colors disabled:opacity-50"
                            >
                                {loadingAudioId === scene.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Mic className="w-3 h-3" />
                                )}
                                Generate VO ({selectedVoice})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex justify-center pt-8 z-30">
         <button
            onClick={onGenerateVideo}
            disabled={!canGenerate || isGeneratingVideo}
            className={`
                group relative px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all border flex items-center gap-3
                ${!canGenerate || isGeneratingVideo 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/30 text-white hover:scale-105 hover:shadow-blue-900/50'
                }
            `}
         >
           {isGeneratingVideo ? (
             <>
               <Loader2 className="animate-spin h-5 w-5 text-white" />
                Processing VEO Generation...
             </>
           ) : (
             <>
                <span>Generate Video Production</span>
                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded ml-1 uppercase tracking-wide border border-white/10">VEO 3</span>
             </>
           )}
         </button>
      </div>
    </div>
  );
};

export default ScriptEditor;
