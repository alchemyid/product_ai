import React, { useState } from 'react';
import { GenerateVideoParams, VeoModel, VideoResolution, AspectRatio } from '@/types';
import geminiService from '@/services/gemini';
import { Film, Play, Loader2, Video as VideoIcon } from 'lucide-react';

const VideoApp: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setVideoUrl(null);
        try {
            const params: GenerateVideoParams = {
                prompt,
                model: VeoModel.VEO_FAST,
                aspectRatio: AspectRatio.LANDSCAPE,
                resolution: VideoResolution.P720
            };
            // Note: Video generation takes 1-2 minutes typically
            const url = await geminiService.generateVideo(params);
            setVideoUrl(url);
        } catch (error) {
            console.error(error);
            alert("Video generation failed. Please ensure your API Key has Veo access.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-[#0b1120]">
            <aside className="w-[400px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Film className="w-5 h-5 text-pink-500" />
                    Veo Video Studio
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-2 block">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white h-40 resize-none focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            placeholder="Describe a scene: A cinematic drone shot of a futuristic city..."
                        />
                    </div>

                    <div className="bg-pink-900/20 border border-pink-500/20 p-4 rounded-lg">
                        <p className="text-xs text-pink-300">
                            Note: Video generation uses the Veo model and takes significantly longer than image generation (approx 1-2 mins).
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="mt-8 w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
                    Generate Video
                </button>
            </aside>

            <main className="flex-1 p-8 flex items-center justify-center">
                {loading && (
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 animate-pulse">Rendering Video (this takes a while)...</p>
                    </div>
                )}

                {!loading && videoUrl && (
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                        <video src={videoUrl} controls autoPlay loop className="w-full h-full" />
                    </div>
                )}

                {!loading && !videoUrl && (
                    <div className="text-center text-slate-600">
                        <VideoIcon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                        <p>Enter a prompt to start generation</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VideoApp;