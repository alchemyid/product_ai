import React from 'react';
import { ShoppingBag, Bot, Palette, Construction } from 'lucide-react';
import { MenuItem } from '@/types';

interface DashboardHomePageProps {
  menu: MenuItem[];
  setActiveItem: (id: string) => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'fashion-generator': <ShoppingBag className="w-8 h-8 text-blue-400" />,
  'design-generator': <Palette className="w-8 h-8 text-orange-400" />,
  'model-generator': <Bot className="w-8 h-8 text-purple-400" />,
};

const FeatureCard: React.FC<{ item: MenuItem; onClick: () => void }> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-indigo-500 hover:bg-slate-800/50 transition-all group"
  >
    <div className="flex items-start justify-between">
      {iconMap[item.id] || <Construction className="w-8 h-8 text-slate-500" />}
      <span className="text-xs font-bold text-indigo-400 bg-indigo-900/50 border border-indigo-800 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        Launch
      </span>
    </div>
    <h3 className="text-lg font-bold text-slate-200 mt-4">{item.title}</h3>
    <p className="text-sm text-slate-400 mt-1">{item.description || 'Feature coming soon...'}</p>
  </button>
);

const DashboardHomePage: React.FC<DashboardHomePageProps> = ({ menu, setActiveItem }) => {
  const features = menu.flatMap(main => main.children || []);

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-[#0b1120]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to your AI Content Suite</h1>
        <p className="text-slate-400 mb-8">Select a tool to get started or launch a feature from the quick links below.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feature => (
            <FeatureCard key={feature.id} item={feature} onClick={() => setActiveItem(feature.id)} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default DashboardHomePage;