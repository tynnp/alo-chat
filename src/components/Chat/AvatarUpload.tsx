import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, X, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '../../services/api';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUploadSuccess?: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatar, onUploadSuccess }) => {
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, token, updateUser } = useAuthStore();

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImage(reader.result as string);
                setShowModal(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number, y: number, width: number, height: number }): Promise<Blob | null> => {
        const image = new Image();
        image.src = imageSrc;

        return new Promise((resolve) => {
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(null);
                    return;
                }

                canvas.width = 400;
                canvas.height = 400;

                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    400,
                    400
                );

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg');
            };
        });
    };

    const handleUpload = async () => {
        if (!image || !croppedAreaPixels) return;

        try {
            setIsUploading(true);
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);

            if (!croppedBlob) throw new Error('Failed to crop image');

            const formData = new FormData();
            formData.append('file', croppedBlob, 'avatar.jpg');

            const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const fullAvatarUrl = `${API_BASE_URL}${data.avatar_url}`;

            updateUser({ avatarUrl: fullAvatarUrl });
            if (onUploadSuccess) onUploadSuccess(fullAvatarUrl);

            setShowModal(false);
            setImage(null);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mb-1 border border-blue-200 cursor-pointer overflow-hidden relative"
            >
                {currentAvatar ? (
                    <img src={currentAvatar.startsWith('http') ? currentAvatar : `${API_BASE_URL}${currentAvatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span>{user?.displayName?.charAt(0).toUpperCase()}</span>
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Chỉnh sửa ảnh đại diện</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="relative h-80 bg-gray-900">
                            {image && (
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            )}
                        </div>

                        <div className="p-6 bg-white space-y-4">
                            <div className="flex items-center gap-4">
                                <ZoomOut className="w-4 h-4 text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <ZoomIn className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        "Lưu thay đổi"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;