import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ShirtSide } from '@/types';

interface CanvasPreviewProps {
    side: ShirtSide;
    shirtColor: string;
    width?: number;
    height?: number;
}

export interface CanvasHandle {
    getDataURL: () => string;
}

const CanvasPreview = forwardRef<CanvasHandle, CanvasPreviewProps>(({ side, shirtColor, width = 1024, height = 1024 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        getDataURL: () => {
            if (canvasRef.current) {
                return canvasRef.current.toDataURL('image/png');
            }
            return '';
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas completely (preserve transparency for the container background)
        ctx.clearRect(0, 0, width, height);

        const loadAndDraw = async () => {
            // 1. Draw Base Shirt
            if (side.baseImage) {
                const shirtImg = await loadImage(side.baseImage);

                // Calculate aspect ratio fit
                const imgAspect = shirtImg.width / shirtImg.height;
                const canvasAspect = width / height;
                let drawW, drawH, drawX, drawY;

                if (imgAspect > canvasAspect) {
                    drawW = width;
                    drawH = width / imgAspect;
                    drawX = 0;
                    drawY = (height - drawH) / 2;
                } else {
                    drawH = height;
                    drawW = height * imgAspect;
                    drawX = (width - drawW) / 2;
                    drawY = 0;
                }

                // Draw original
                ctx.drawImage(shirtImg, drawX, drawY, drawW, drawH);

                // Apply Tint (Multiple blending mode)
                ctx.save();
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = shirtColor;
                ctx.fillRect(drawX, drawY, drawW, drawH);
                ctx.globalCompositeOperation = 'destination-in'; // Clip to shirt
                ctx.drawImage(shirtImg, drawX, drawY, drawW, drawH);
                ctx.restore();

                // Re-draw shadows/highlights (overlay original loosely)
                ctx.save();
                ctx.globalCompositeOperation = 'multiply';
                ctx.globalAlpha = 0.5;
                ctx.drawImage(shirtImg, drawX, drawY, drawW, drawH);
                ctx.restore();

            } else {
                // Fallback Vector Shirt (if no image uploaded)
                drawPlaceholderShirt(ctx, width, height, shirtColor);
            }

            // 2. Draw Design
            if (side.design.image) {
                const designImg = await loadImage(side.design.image);
                drawLayer(ctx, designImg, side.design.position, width, height);
            }

            // 3. Draw Label (only if exists)
            if (side.label && side.label.image) {
                const labelImg = await loadImage(side.label.image);
                drawLayer(ctx, labelImg, side.label.position, width, height);
            }
        };

        loadAndDraw();

    }, [side, shirtColor, width, height]);

    // Helper to load image
    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const drawPlaceholderShirt = (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => {
        const padding = w * 0.1;

        // Center translation
        ctx.translate(w/2, h/2);
        ctx.fillStyle = color;

        // Draw a simple placeholder rect or text
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ccc';
        ctx.fillText("Upload Base Image", 0, 0);
        ctx.font = '16px sans-serif';
        ctx.fillText("for realistic results", 0, 30);

        ctx.resetTransform();
    }

    // Helper to draw a layer with transform
    const drawLayer = (
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        pos: { x: number, y: number, scale: number, rotation: number },
        canvasWidth: number,
        canvasHeight: number
    ) => {
        ctx.save();

        // Convert percentage coordinates to pixels
        const cx = (pos.x / 100) * canvasWidth;
        const cy = (pos.y / 100) * canvasHeight;

        ctx.translate(cx, cy);
        ctx.rotate((pos.rotation * Math.PI) / 180);
        ctx.scale(pos.scale, pos.scale);

        // Initial scale relative to canvas width
        const standardWidth = canvasWidth * 0.4;
        const scaleFactor = standardWidth / img.width;

        const finalWidth = img.width * scaleFactor;
        const finalHeight = img.height * scaleFactor;

        ctx.drawImage(img, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);

        ctx.restore();
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-full object-contain pointer-events-none"
        />
    );
});

export default CanvasPreview;