import React, { useState, useCallback } from 'react';
import { DesignControls } from '@/components/design/DesignControls';
import { DesignPreview } from '@/components/design/DesignPreview';
import geminiService from '@/services/gemini';
import { DesignGenerationParams } from '@/types';

const DesignApp: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [rasterImage, setRasterImage] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string | null>(null);

    const handleGenerate = useCallback(async (params: DesignGenerationParams) => {
        setIsGenerating(true);
        setRasterImage(null);
        setSvgContent(null);

        try {
            const imageB64 = await geminiService.generateVectorDesign(params);
            setRasterImage(imageB64);

            // Use ImageTracer to convert to SVG
            if (imageB64) {
                if ((window as any).ImageTracer) {
                    (window as any).ImageTracer.imageToSVG(
                        `data:image/png;base64,${imageB64}`,
                        (svgString: string) => {
                            setSvgContent(svgString);
                        },
                        {
                            ltres: 1,
                            qtres: 1,
                            pathomit: 8,
                            rightangleenhance: true,
                            numberofcolors: 16,
                            viewbox: true
                        }
                    );
                } else {
                    console.warn("ImageTracer not loaded");
                }
            }
        } catch (error) {
            console.error("Failed to generate design:", error);
            alert("There was an error generating the design. Please check the console and try again.");
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const handleDownload = (type: 'svg' | 'png') => {
        if (type === 'svg' && svgContent) {
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `design-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        } else if (type === 'png' && rasterImage) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${rasterImage}`;
            link.download = `design-${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* LEFT SIDEBAR: Controls */}
            <aside className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                    <DesignControls
                        isGenerating={isGenerating}
                        onGenerate={handleGenerate}
                    />
                </div>
            </aside>

            {/* RIGHT CONTENT: Preview */}
            <main className="flex-1 overflow-hidden bg-[#0b1120] p-8 flex flex-col">
                <DesignPreview
                    isLoading={isGenerating}
                    rasterImage={rasterImage}
                    svgContent={svgContent}
                    onDownload={handleDownload}
                />
            </main>
        </div>
    );
};

export default DesignApp;