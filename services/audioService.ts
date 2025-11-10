
import { getAudio, saveAudio } from './dbService';
import { generateSpeech } from './geminiService';

const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

let audioContext: AudioContext;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

const generationPromises = new Map<string, Promise<Blob | null>>();

async function decodeRawAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const fallbackToBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support text-to-speech.");
    }
};

export const playAudio = async (text: string) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    let audioBlob = await getAudio(text);

    if (!audioBlob) {
      if (generationPromises.has(text)) {
        audioBlob = await generationPromises.get(text)!;
      } else {
        const promise = (async () => {
            const base64Audio = await generateSpeech(text);
            if (!base64Audio) {
                console.error("Failed to generate audio, falling back to browser TTS.");
                return null;
            }
            const audioBytes = decode(base64Audio);
            const blob = new Blob([audioBytes], { type: 'application/octet-stream' });
            await saveAudio(text, blob);
            return blob;
        })();
        generationPromises.set(text, promise);
        audioBlob = await promise;
        generationPromises.delete(text);
      }
    }

    if (audioBlob) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await decodeRawAudioData(
          new Uint8Array(arrayBuffer),
          ctx,
          24000,
          1,
        );
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
    } else {
      fallbackToBrowserTTS(text);
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    fallbackToBrowserTTS(text);
  }
};
