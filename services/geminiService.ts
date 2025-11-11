
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VocabularyWord } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const vocabularySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: {
        type: Type.STRING,
        description: 'A single English word. Include parts of speech like (v.) or (n.) where appropriate.',
      },
      definition: {
        type: Type.STRING,
        description: 'A simple, concise definition of the word, suitable for a language learner.',
      },
      example: {
        type: Type.STRING,
        description: 'An example sentence using the word in a natural context.',
      },
    },
    required: ['word', 'definition', 'example'],
  },
};

export const getVocabularyForCategory = async (category: string): Promise<VocabularyWord[]> => {
  try {
    const prompt = `Generate 15 essential English words for daily conversation in the category "${category}". For each word, provide a simple definition suitable for a language learner and an example sentence.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: vocabularySchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedData)) {
      throw new Error("API did not return a valid array.");
    }

    return parsedData as VocabularyWord[];
  } catch (error) {
    console.error('Error fetching vocabulary from Gemini API:', error);
    throw new Error('Failed to fetch vocabulary. Please check your API key and try again.');
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error('Error generating speech from Gemini API:', error);
    return null;
  }
};
