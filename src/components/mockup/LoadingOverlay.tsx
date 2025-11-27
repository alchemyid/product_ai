import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2">Generating Photoshoot</h2>
                    <p className="text-slate-400 text-sm">
                        AI is synthesizing your design on professional models. <br/>
                        This typically takes 30-60 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;