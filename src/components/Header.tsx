import React from 'react';
import { Layers, LogOut } from 'lucide-react';

interface HeaderProps {
  details: {
    title: string;
    description: string;
  };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ details, onLogout }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {details.title}
          </h1>
          <p className="text-xs text-slate-500 -mt-1">{details.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onLogout} title="Logout" className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;