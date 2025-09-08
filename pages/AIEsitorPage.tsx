import React, { useState, useCallback } from 'react';
import { generateEditingPlan } from '../services/geminiService';
import type { EditingPlan } from '../types';
import { UploadIcon } from '../components/icons/UploadIcon';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const AIEsitorPage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('xóa nền và tăng độ sáng');
    const [editingPlan, setEditingPlan] = useState<EditingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                setEditingPlan(null);
                setError(null);
            } else {
                setError('Vui lòng chọn một tệp hình ảnh.');
            }
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(isOver);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer.files;
        handleFileChange(files);
    };

    const handleGeneratePlan = useCallback(async () => {
        if (!imageFile || !prompt) {
            setError('Vui lòng tải lên một hình ảnh và nhập yêu cầu chỉnh sửa.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditingPlan(null);

        try {
            const plan = await generateEditingPlan(imageFile, prompt);
            setEditingPlan(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);

    const renderPlan = () => {
        if (!editingPlan) return null;
        return (
            <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Kế hoạch Chỉnh sửa</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3 rounded-l-lg">Tên Biến đổi</th>
                                    <th scope="col" className="px-6 py-3">Mô tả</th>
                                    <th scope="col" className="px-6 py-3 rounded-r-lg">Tham số</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editingPlan.steps.map((step, index) => (
                                    <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{step.name}</th>
                                        <td className="px-6 py-4">{step.description}</td>
                                        <td className="px-6 py-4 font-mono">{step.parameters}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right pt-4">
                         <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Ước tính thời gian xử lý:</span> 
                            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md ml-2">{editingPlan.estimated_compute.gpu_seconds.toFixed(2)} giây GPU</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight">Trình sửa AI</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                    <div>
                        <label htmlFor="image-upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">1. Tải lên Hình ảnh</label>
                        <div
                            onDragEnter={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDrop={handleDrop}
                            className={`relative flex justify-center items-center w-full h-48 px-4 transition bg-white dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-primary-500/50 ${isDragOver ? 'border-primary-500' : ''}`}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Xem trước" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : (
                                <div className="text-center">
                                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">Nhấn để tải lên</span> hoặc kéo và thả
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (tối đa 10MB)</p>
                                </div>
                            )}
                            <input id="image-upload-input" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
                             <label htmlFor="image-upload-input" className="absolute w-full h-full cursor-pointer"></label>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="desired_edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">2. Mô tả yêu cầu chỉnh sửa</label>
                        <textarea
                            id="desired_edit"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="ví dụ: xóa phông nền, làm cho màu sắc điện ảnh hơn..."
                        ></textarea>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleGeneratePlan}
                            disabled={isLoading || !imageFile || !prompt}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
                            {isLoading ? 'Đang xử lý...' : 'Tạo Kế hoạch'}
                        </button>
                    </div>
                     {error && <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Kết quả từ AI</h2>
                   {isLoading && (
                       <div className="flex flex-col items-center justify-center h-full">
                           <LoadingSpinner className="w-10 h-10 text-primary-500" />
                           <p className="mt-4 text-gray-600 dark:text-gray-300">AI đang phân tích yêu cầu của bạn...</p>
                       </div>
                   )}
                   {!isLoading && !editingPlan && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                            <p>Kế hoạch chỉnh sửa sẽ xuất hiện ở đây.</p>
                        </div>
                   )}
                   {renderPlan()}
                </div>
            </div>
        </div>
    );
};

export default AIEsitorPage;