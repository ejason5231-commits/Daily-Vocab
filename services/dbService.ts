const DB_NAME = 'EssentialWordsDB';
const AUDIO_STORE_NAME = 'audioCache';
const IMAGE_STORE_NAME = 'imageCache';
const DB_VERSION = 2;

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        dbInstance.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'text' });
      }
      if (!dbInstance.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        dbInstance.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'word' });
      }
    };
  });
};

export const saveAudio = async (text: string, audioData: Blob): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE_NAME);
    const request = store.put({ text, audio: audioData });
    
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error saving audio to DB:', request.error);
      reject(request.error);
    };
  });
};

export const getAudio = async (text: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE_NAME, 'readonly');
    const store = transaction.objectStore(AUDIO_STORE_NAME);
    const request = store.get(text);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.audio);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => {
      console.error('Error getting audio from DB:', request.error);
      reject(request.error);
    };
  });
};

export const saveImage = async (word: string, imageData: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.put({ word, imageData });
    
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error saving image to DB:', request.error);
      reject(request.error);
    };
  });
};

export const getImage = async (word: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.get(word);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.imageData);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => {
      console.error('Error getting image from DB:', request.error);
      reject(request.error);
    };
  });
};