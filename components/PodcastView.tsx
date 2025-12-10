
import React, { useState } from 'react';
import { CloseIcon, YouTubeIcon, PodcastIcon } from './icons';

// --- CONFIGURATION: PODCAST THUMBNAILS ---
const PODCAST_THUMBNAILS = [
    { 
        id: 1, 
        title: "Meet Someone & Talk About Weather", 
        image: "https://img.youtube.com/vi/pwAo98xsOv8/hqdefault.jpg", 
        url: "https://youtu.be/pwAo98xsOv8"
    },
    { 
        id: 2, 
        title: "Asking for Help", 
        image: "https://img.youtube.com/vi/1dj3QI1Z5kI/hqdefault.jpg", 
        url: "https://youtu.be/1dj3QI1Z5kI"
    },
    { 
        id: 3, 
        title: "Travel English", 
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=500&q=60", 
        url: "https://youtube.com/@learnengwitheric?si=HebmKBv0XVOT6j6I"
    }
];

const PodcastView: React.FC = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePodcastClick = (url: string) => {
      const videoId = getYouTubeId(url);
      if (videoId) {
          setPlayingVideoId(videoId);
      } else {
          window.open(url, '_blank');
      }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      {/* Video Player Modal */}
      {playingVideoId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                <button 
                    onClick={() => setPlayingVideoId(null)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                    <CloseIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <div className="relative w-full aspect-video">
                    <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}`} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
      )}

      <div className="animate-fade-in-up">
         <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
            Listen to Podcast
            <span className="ml-3 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">New Episodes</span>
         </h2>

         <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
             {PODCAST_THUMBNAILS.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => handlePodcastClick(item.url)}
                    className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group border-2 sm:border-4 border-white dark:border-gray-700"
                 >
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                     
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-red-600 rounded-full p-2 sm:p-4 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                             <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                     </div>

                     <div className="absolute bottom-0 left-0 p-2 sm:p-4 text-left w-full">
                         <span className="text-[8px] sm:text-[10px] font-bold text-red-500 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm mb-1 inline-block">WATCH</span>
                         <h3 className="text-white font-bold text-xs sm:text-lg leading-tight drop-shadow-md line-clamp-2">{item.title}</h3>
                     </div>
                 </button>
             ))}
         </div>
         
         <div className="space-y-3 max-w-md mx-auto">
            <button
                onClick={() => window.open('https://youtube.com/@learnengwitheric', '_blank')}
                className="w-full flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-1 active:scale-95"
            >
                <YouTubeIcon className="w-6 h-6" />
                <span className="font-bold text-lg">More on YouTube</span>
            </button>
            
            <button
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.english.podcast.studio', '_blank')}
                className="w-full flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95"
            >
                <PodcastIcon className="w-6 h-6" />
                <span className="font-bold text-lg">Download Podcast Studio</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default PodcastView;
