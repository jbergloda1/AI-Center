import React, { useState, useCallback } from 'react';
import { translateText } from '../services/geminiService';
import { SwitchIcon } from '../components/icons/SwitchIcon';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { GlossaryItem } from '../types';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
];

const CHARACTER_LIMIT = 2000;

const chunkText = (text: string, limit: number): string[] => {
    if (text.length <= limit) {
        return [text];
    }
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > limit && currentChunk) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text]; // Fallback to single chunk if sentence splitting fails
};


const LanguageSelector: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id: string;
}> = ({ value, onChange, id }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
  >
    {languages.map(lang => (
      <option key={lang.code} value={lang.name}>{lang.name}</option>
    ))}
  </select>
);

const TranslatorPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Vietnamese');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setTranslatedText('');
    setGlossary([]);
    try {
      const chunks = chunkText(inputText, CHARACTER_LIMIT);
      const translationPromises = chunks.map(chunk => translateText(chunk, sourceLang, targetLang));
      const results = await Promise.all(translationPromises);

      const combinedTranslation = results.map(r => r.translation).join(' ');
      const glossaryMap = new Map<string, GlossaryItem>();
      
      results.forEach(result => {
        if (result.glossary) {
          result.glossary.forEach(item => {
            if (item.term && item.definition && !glossaryMap.has(item.term.toLowerCase())) {
              glossaryMap.set(item.term.toLowerCase(), item);
            }
          });
        }
      });

      setTranslatedText(combinedTranslation);
      setGlossary(Array.from(glossaryMap.values()));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  const switchLanguages = () => {
    const currentInput = inputText;
    const currentOutput = translatedText;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(currentOutput);
    setTranslatedText(currentInput);
    setGlossary([]);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight">Trình dịch AI</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          {/* Source Language */}
          <div>
            <label htmlFor="source-lang" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Từ</label>
            <LanguageSelector id="source-lang" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} />
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Nhập văn bản để dịch..."
            ></textarea>
          </div>
          {/* Target Language */}
          <div className="relative">
             <button onClick={switchLanguages} className="absolute top-[-2.5rem] left-1/2 -translate-x-1/2 md:top-1/2 md:left-[-1.25rem] md:-translate-y-1/2 p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10" aria-label="Switch languages">
                <SwitchIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <label htmlFor="target-lang" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sang</label>
            <LanguageSelector id="target-lang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} />
            <textarea
              rows={8}
              value={translatedText}
              readOnly
              className="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Bản dịch sẽ xuất hiện ở đây..."
            ></textarea>
          </div>
        </div>
        
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        
        <div className="mt-6 flex justify-center">
            <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
                {isLoading ? 'Đang dịch...' : 'Dịch'}
            </button>
        </div>

        {glossary.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Bảng thuật ngữ</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="space-y-3">
                {glossary.map((item, index) => (
                  <li key={index} className="text-sm flex flex-col sm:flex-row">
                    <strong className="font-semibold text-primary-600 dark:text-primary-400 w-full sm:w-1/3 md:w-1/4 shrink-0">{item.term}:</strong>
                    <span className="ml-0 sm:ml-2 text-gray-600 dark:text-gray-300">{item.definition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorPage;
