import React, { useEffect, useState } from 'react';

interface Props {
  onReady: () => void;
}

const ApiKeyChecker: React.FC<Props> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    try {
      // --- LOCAL DEVELOPMENT FIX ---
      // First, check if the API key is provided via .env.local for local development.
      if (process.env.GEMINI_API_KEY) {
        setHasKey(true);
        onReady();
        return; // Key found, no need to check for AI Studio.
      }
      // Cast window to any to handle aistudio presence dynamically
      const win = window as any;
      if (win.aistudio && await win.aistudio.hasSelectedApiKey()) {
        setHasKey(true);
        onReady();
      } else {
        setHasKey(false);
      }
    } catch (e) {
      console.error(e);
      setHasKey(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    setError(null);
    const win = window as any;
    if (!win.aistudio) {
      setError("AI Studio interface not found.");
      return;
    }
    try {
      await win.aistudio.openSelectKey();
      // Assume success after dialog closes (race condition mitigation)
      setHasKey(true);
      onReady();
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
         setError("Project not found. Please select a valid paid GCP project.");
         setHasKey(false);
      } else {
        console.error(e);
        // Even if error, try to proceed as per instructions to assume success if it was just a dialog close
        setHasKey(true); 
        onReady();
      }
    }
  };

  if (checking) return <div className="p-4 text-brand-300">Initializing AI Services...</div>;

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Verification Required</h2>
        <p className="text-slate-300 mb-6">
          To generate high-fidelity 8K models, this application requires a specialized Google Cloud Project with the Veo/Imagen API enabled.
        </p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
                {error}
            </div>
        )}

        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-lg shadow-brand-500/30 transition-all transform hover:scale-[1.02]"
        >
          Connect Google Cloud Project
        </button>
        
        <p className="mt-4 text-xs text-slate-500 text-center">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-brand-300">
            Read about billing & requirements
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyChecker;