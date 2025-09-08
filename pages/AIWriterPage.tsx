import React, { useState, useCallback } from 'react';
import { generateArticleContent } from '../services/geminiService';
import type { GeneratedContent } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';

const AIWriterPage: React.FC = () => {
    const [topic, setTopic] = useState('Lợi ích của việc sử dụng AI trong marketing');
    const [audience, setAudience] = useState('Chủ doanh nghiệp nhỏ và các nhà tiếp thị');
    const [length, setLength] = useState('Trung bình (~800 từ)');
    const [tone, setTone] = useState('Trang trọng');

    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim() || !audience.trim()) {
            setError('Vui lòng nhập chủ đề và đối tượng mục tiêu.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        try {
            const content = await generateArticleContent(topic, audience, length, tone);
            setGeneratedContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, audience, length, tone]);

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner className="w-12 h-12 text-primary-500" />
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">AI đang sáng tạo nội dung cho bạn...</p>
                </div>
            );
        }

        if (!generatedContent) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <SparklesIcon className="w-16 h-16 mb-4 text-gray-400" />
                    <p>Nội dung được tạo sẽ xuất hiện ở đây.</p>
                </div>
            );
        }
        
        const { title, metaDescription, outline, article, seoKeywords, hashtags } = generatedContent;

        return (
            <div className="space-y-8">
                <section>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Tiêu đề đề xuất</h3>
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/50 border-l-4 border-primary-500 rounded-r-lg">
                        <p className="text-xl font-semibold text-primary-800 dark:text-primary-200">{title}</p>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Mô tả Meta (SEO)</h3>
                    <p className="text-sm p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg italic text-gray-600 dark:text-gray-300">{metaDescription}</p>
                </section>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <section>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Từ khóa SEO</h3>
                        <div className="flex flex-wrap gap-2">
                            {seoKeywords.map((keyword, index) => (
                                <span key={index} className="bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-1 rounded-full">{keyword}</span>
                            ))}
                        </div>
                    </section>
                     <section>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </section>
                </div>

                <section>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Dàn ý</h3>
                    <ul className="list-decimal list-inside space-y-2 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300">
                        {outline.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </section>

                <section>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Bài viết đầy đủ</h3>
                    <div className="prose prose-lg dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-800 rounded-lg shadow-inner whitespace-pre-wrap">
                        {article}
                    </div>
                </section>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight">Trình viết AI</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Column */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6 h-fit sticky top-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bảng điều khiển</h2>
                    <div>
                        <label htmlFor="topic" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Chủ đề bài viết</label>
                        <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder="ví dụ: 5 xu hướng marketing kỹ thuật số năm 2024"></textarea>
                    </div>
                     <div>
                        <label htmlFor="audience" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Đối tượng mục tiêu</label>
                        <input type="text" id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder="ví dụ: Sinh viên, chủ doanh nghiệp..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="length" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Độ dài</label>
                            <select id="length" value={length} onChange={(e) => setLength(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                                <option>Ngắn (~300 từ)</option>
                                <option>Trung bình (~800 từ)</option>
                                <option>Dài (~1500 từ)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Văn phong</label>
                             <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                                <option>Trang trọng</option>
                                <option>Thân mật</option>
                            </select>
                        </div>
                    </div>
                     <div className="pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                            {isLoading ? 'Đang tạo...' : 'Tạo Nội dung'}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md min-h-[600px]">
                   {renderResults()}
                </div>
            </div>
        </div>
    );
};

export default AIWriterPage;