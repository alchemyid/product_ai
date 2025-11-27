import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductApp from '@/apps/ProductApp';
import ModelApp from '@/apps/ModelApp';
import DesignApp from '@/apps/DesignApp';
import VideoApp from '@/apps/VideoApp';
import MockupApp from '@/apps/MockupApp'; // Add import
import DashboardHomePage from './DashboardHomePage';
import { MenuStructure } from '@/types';
import { Construction } from 'lucide-react';

interface DashboardProps {
    onLogout: () => void;
}

const menu: MenuStructure = [
    {
        id: 'product-generator',
        title: 'Product Generator',
        children: [
            { id: 'fashion-generator', title: 'Fashion Generator', description: 'AI Product Photography Studio' },
            { id: 'design-generator', title: 'Design Generator', description: 'AI-Powered Print Generation' },
            { id: 'model-generator', title: 'Model Generator', description: 'AI Model Generator for eCommerce' },
        ],
    },
    {
        id: 'content-generator',
        title: 'Content Generator',
        children: [
            { id: 'tshirt-mockup', title: 'T-shirt Mockup', description: 'Professional Mockup Generator' }, // Added description
            { id: 'image-2-video', title: 'Image 2 Video (Veo)', description: 'Text to Video Generation' },
            { id: 'ai-stylist', title: 'AI Stylist' },
        ],
    },
];

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex-1 flex items-center justify-center bg-[#0b1120]">
        <div className="text-center text-slate-600">
            <Construction className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400">{title}</h2>
            <p className="text-slate-500">Feature under construction.</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [activeItem, setActiveItem] = useState('home');

    const renderContent = () => {
        switch (activeItem) {
            case 'home': return <DashboardHomePage menu={menu} setActiveItem={setActiveItem} />;
            case 'fashion-generator': return <ProductApp />;
            case 'model-generator': return <ModelApp />;
            case 'design-generator': return <DesignApp />;
            case 'image-2-video': return <VideoApp />;
            case 'tshirt-mockup': return <MockupApp />; // Add route
            default:
                const item = menu.flatMap(m => m.children || []).find(c => c.id === activeItem);
                return <Placeholder title={item?.title || 'Coming Soon'} />;
        }
    };

    const activeMenuItem = menu.flatMap(m => m.children || []).find(c => c.id === activeItem);
    const headerDetails = {
        title: activeMenuItem?.title || 'Dashboard',
        description: activeMenuItem?.description || 'Welcome to the AI Content Suite',
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col overflow-hidden">
            <Header details={headerDetails} onLogout={onLogout} />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar menu={menu} activeItem={activeItem} setActiveItem={setActiveItem} />
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;