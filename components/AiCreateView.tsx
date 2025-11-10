import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface AiCategoryGeneratorProps {
  onGenerate: (topic: string) => void;
  isGenerating: boolean;
  generationError: string | null;
}

const AiCategoryGenerator: React.FC<AiCategoryGeneratorProps> = ({ onGenerate, isGenerating, generationError }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isGenerating) {
      onGenerate(topic.trim());
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-400 to-primary-600 dark:from-teal-600 dark:to-primary-800 p-4 sm:p-6 rounded-xl shadow-lg text-white">
      <h3 className="font-bold text-lg mb-3 flex items-center">
        <SparklesIcon className="h-6 w-6 mr-2" />
        Create a Custom Topic
      </h3>
      <p className="text-sm opacity-90 mb-4">Enter any topic, and AI will create a new vocabulary list for you to study!</p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Space Exploration, Cooking Verbs"
            className="w-full px-4 py-2 rounded-md bg-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="px-5 py-2 bg-white text-teal-600 font-semibold rounded-md shadow-md hover:bg-teal-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {generationError && <p className="text-red-200 text-sm mt-2">{generationError}</p>}
      </form>
    </div>
  );
};

interface AiCreateViewProps {
    onGenerateCategory: (topic: string) => void;
    isGenerating: boolean;
    generationError: string | null;
}

const AiCreateView: React.FC<AiCreateViewProps> = ({ onGenerateCategory, isGenerating, generationError }) => {
    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col justify-center min-h-full">
            <AiCategoryGenerator
                onGenerate={onGenerateCategory}
                isGenerating={isGenerating}
                generationError={generationError}
            />
        </div>
    );
};

export default AiCreateView;