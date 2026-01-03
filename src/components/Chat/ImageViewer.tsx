import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

interface ImageViewerProps {
    imageUrl: string;
    fileName?: string;
    onClose: () => void;
}

export default function ImageViewer({ imageUrl, fileName = 'image.jpg', onClose }: ImageViewerProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Đóng modal khi nhấn Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Zoom bằng cuộn chuột
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                setScale(s => Math.min(s + 0.1, 5));
            } else {
                setScale(s => Math.max(s - 0.1, 0.1));
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 5));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.1));
    const handleRotate = () => setRotation(r => (r + 90) % 360);
    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const filePath = await save({
                defaultPath: fileName,
                filters: [
                    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!filePath) {
                setIsDownloading(false);
                return;
            }

            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Download failed');

            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            await writeFile(filePath, uint8Array);
            alert('Tải ảnh thành công!');
        } catch (error) {
            console.error('Failed to download image:', error);
            alert('Không thể tải ảnh. Vui lòng thử lại.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <button
                    onClick={handleZoomOut}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Thu nhỏ (-)"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Phóng to (+)"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/30 mx-1" />
                <button
                    onClick={handleRotate}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Xoay ảnh"
                >
                    <RotateCw className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/30 mx-1" />
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                    title="Tải xuống"
                >
                    <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                </button>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Đóng (Esc)"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Image container */}
            <div
                ref={containerRef}
                className="relative z-0 flex items-center justify-center w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
                onDoubleClick={handleReset}
            >
                <img
                    src={imageUrl}
                    alt={fileName}
                    className="max-w-[90vw] max-h-[85vh] object-contain select-none transition-transform duration-200"
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                    }}
                    draggable={false}
                />
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
                Cuộn chuột để zoom, Double-click để reset, Esc để đóng
            </div>
        </div>
    );
}
