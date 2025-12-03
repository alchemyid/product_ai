import React, { useEffect, useState } from 'react';
import { Video, Film, Zap } from 'lucide-react';
import { checkApiKey, openKeySelection } from '../services/geminiService';

const Header: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  const verifyKey = async () => {
    try {
      const exists = await checkApiKey();
      setHasKey(exists);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    verifyKey();
    const interval = setInterval(verifyKey, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-purple-600 to-blue-600 p-2 rounded-lg">
            <Video className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              MarketFlow AI
            </h1>
            <p className="text-xs text-zinc-500">Director's Cut • Image-to-Video</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!hasKey && (
            <button 
              onClick={() => openKeySelection()}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 rounded-full text-sm hover:bg-yellow-600/30 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Select Paid API Key (Required for VEO)
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
            <Film className="w-4 h-4" />
            <span>V 1.0.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
