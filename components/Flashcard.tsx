

import React, { useState, useRef, useEffect } from 'react';
import { VocabularyWord } from '../types';
import { SpeakerIcon, CheckCircleIcon, CheckCircleIconSolid, SpinnerIcon, MicrophoneIcon, StopIcon, PlayIcon } from './icons';
import { playAudio } from '../services/audioService';

interface FlashcardProps {
  wordData: VocabularyWord;
  isLearned: boolean;
  onToggleLearned: (word: string) => void;
  microphoneEnabled: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordData, isLearned, onToggleLearned, microphoneEnabled }) => {
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioURL, setUserAudioURL] = useState<string | null>(null);
  const [supportedMimeType, setSupportedMimeType] = useState<string>('');

  useEffect(() => {
    // Determine a supported MIME type once on component mount.
    const mimeTypes = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
    ];
    const foundType = mimeTypes.find(type => {
      try {
        return MediaRecorder.isTypeSupported(type);
      } catch (e) {
        return false;
      }
    });
    setSupportedMimeType(foundType || '');
  }, []);

  useEffect(() => {
    // Cleanup function to revoke the object URL and prevent memory leaks
    return () => {
      if (userAudioURL) {
        URL.revokeObjectURL(userAudioURL);
      }
    };
  }, [userAudioURL]);

  const wordText = wordData.word.split('(')[0].trim();

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

  const handleStartRecording = async () => {
    if (userAudioURL) {
      URL.revokeObjectURL(userAudioURL);
      setUserAudioURL(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setUserAudioURL(audioUrl);
        stream.getTracks().forEach(track => track.stop()); // Release microphone
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for this feature. Please enable it in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayUserAudio = () => {
    if (userAudioURL) {
      const audio = new Audio(userAudioURL);
      audio.play().catch(e => console.error("Error playing user audio:", e));
    }
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${isLearned ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}>
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

        {microphoneEnabled && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Practice Pronunciation</h4>
            <div className="flex items-center space-x-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500"
                  aria-label="Start recording"
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="p-2 rounded-full text-red-500 bg-red-100 dark:bg-red-900/50 animate-pulse"
                  aria-label="Stop recording"
                >
                  <StopIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={handlePlayUserAudio}
                disabled={!userAudioURL || isRecording}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Play your recording"
              >
                <PlayIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;