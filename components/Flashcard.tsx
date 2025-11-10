
import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import { SpeakerIcon, CheckCircleIcon, CheckCircleIconSolid, SpinnerIcon, ImageIcon } from './icons';
import { playAudio } from '../services/audioService';
import { getImage, saveImage } from '../services/dbService';
import { generateImageForWord } from '../services/geminiService';

interface FlashcardProps {
  wordData: VocabularyWord;
  isLearned: boolean;
  onToggleLearned: (word: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordData, isLearned, onToggleLearned }) => {
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const wordText = wordData.word.split('(')[0].trim();

  useEffect(() => {
    // Reset state for new word
    setImageUrl(null);
    setIsGeneratingImage(false);

    const loadImageAndGenerateIfNeeded = async () => {
        const cachedImage = await getImage(wordText);
        if (cachedImage) {
            setImageUrl(`data:image/png;base64,${cachedImage}`);
        } else if (navigator.onLine) {
            setIsGeneratingImage(true);
            try {
                const base64Image = await generateImageForWord(wordText);
                if (base64Image) {
                    await saveImage(wordText, base64Image);
                    setImageUrl(`data:image/png;base64,${base64Image}`);
                } else {
                    console.error("Image generation returned no data for word:", wordText);
                }
            } catch (error) {
                console.error("Error auto-generating image:", error);
            } finally {
                setIsGeneratingImage(false);
            }
        }
    };

    loadImageAndGenerateIfNeeded();
  }, [wordText]);


  const handlePlaySound = async (e: React.MouseEvent, textToSpeak: string) => {
    e.stopPropagation();
    if (isSpeaking) return;

    setIsSpeaking(textToSpeak);
    try {
      await playAudio(textToSpeak);
    } catch (error) {
      console.error("Error playing audio for:", textToSpeak, error);
    } finally {
      setIsSpeaking(null);
    }
  };

  const handleToggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLearned(wordData.word);
  };
  
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${isLearned ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}>
      <div className="relative w-full h-40 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        {isGeneratingImage ? (
          <div className="flex items-center justify-center h-full">
            <SpinnerIcon className="h-8 w-8 text-primary-500" />
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={wordText} className="w-full h-full object-cover" />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
            aria-label={`Image for ${wordText} is not available offline`}
          >
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-sm text-center px-2 font-semibold">Image unavailable offline</span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleToggleLearned}
        className={`absolute top-2 right-2 p-1 rounded-full transition-colors duration-200 z-10 ${isLearned ? 'text-green-500 bg-white/70' : 'text-gray-400 hover:text-green-500 bg-white/70'}`}
        aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
      >
        {isLearned ? <CheckCircleIconSolid className="h-7 w-7" /> : <CheckCircleIcon className="h-7 w-7" />}
      </button>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{wordData.word}</h3>
            <button
              onClick={(e) => handlePlaySound(e, wordText)}
              className="ml-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500"
              aria-label={`Pronounce ${wordData.word}`}
              disabled={!!isSpeaking}
            >
              {isSpeaking === wordText ? <SpinnerIcon className="h-6 w-6" /> : <SpeakerIcon className="h-6 w-6" />}
            </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mt-2">{wordData.definition}</p>

        <div className="flex items-start text-gray-500 dark:text-gray-400 mt-2">
          <p className="italic text-sm flex-grow">"{wordData.example}"</p>
          <button
            onClick={(e) => handlePlaySound(e, wordData.example)}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500 flex-shrink-0"
            aria-label={`Pronounce example sentence`}
            disabled={!!isSpeaking}
          >
            {isSpeaking === wordData.example ? <SpinnerIcon className="h-5 w-5" /> : <SpeakerIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
