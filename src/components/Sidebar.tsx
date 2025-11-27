import React, { useState } from 'react';
import { ChevronDown, Home, ShoppingBag, Bot, Palette, FileText, BarChart2 } from 'lucide-react';
import { MenuItem, MenuStructure } from '@/types';

interface SidebarProps {
  menu: MenuStructure;
  activeItem: string;
  setActiveItem: (id: string) => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'home': <Home className="w-4 h-4" />,
  'product-generator': <ShoppingBag className="w-4 h-4" />,
  'content-generator': <FileText className="w-4 h-4" />,
  'operational': <BarChart2 className="w-4 h-4" />,
  'fashion-generator': <ShoppingBag className="w-4 h-4" />,
  'design-generator': <Palette className="w-4 h-4" />,
  'model-generator': <Bot className="w-4 h-4" />,
};

const Sidebar: React.FC<SidebarProps> = ({ menu, activeItem, setActiveItem }) => {
  const [openMenus, setOpenMenus] = useState<string[]>(['product-generator']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeItem === item.id;
    const isMenuOpen = openMenus.includes(item.id);

    if (item.children) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className="w-full flex justify-between items-center text-left px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <span className="flex items-center gap-3">
              {iconMap[item.id] || <div className="w-4 h-4" />}
              {item.title}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isMenuOpen && (
            <div className="pl-6 pt-2 pb-1 space-y-1">
              {item.children.map(renderMenuItem)}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => setActiveItem(item.id)}
        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-slate-700 font-semibold text-white'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }`}
      >
        {iconMap[item.id] || <div className="w-4 h-4" />}
        {item.title}
      </button>
    );
  };

  return (
    <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col p-4 space-y-2">
      <button
        onClick={() => setActiveItem('home')}
        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors mb-2 ${
          activeItem === 'home'
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        {iconMap['home']}
        Dashboard
      </button>
      {menu.map(renderMenuItem)}
    </aside>
  );
};

export default Sidebar;