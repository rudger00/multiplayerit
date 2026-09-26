import React from 'react';

export default function TabVideo({ 
  mainVideo, setMainVideo, youtubeVideos, loadingVideos, 
  gameImages, loadingImages, totalImages, openLightbox 
}) {
  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Tutti i video</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>

      {loadingVideos ? (
        <p className="text-center text-white font-bold mb-16">Ricerca video su YouTube in corso...</p>
      ) : mainVideo ? (
        <>
          <div className="w-full aspect-video bg-black relative flex items-center justify-center mb-8 border border-gray-800 shadow-xl">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${mainVideo.id.videoId}?autoplay=0`} title={mainVideo.snippet.title} frameBorder="0" allowFullScreen></iframe>
          </div>
          <h3 className="text-[#ff2020] font-black text-xl text-center px-4 mb-6">{mainVideo.snippet.title}</h3>
          <div className="flex items-center justify-center gap-4 mb-16">
            <button className="w-10 h-10 flex-shrink-0 bg-[#2a2a2a] hover:bg-[#ff2020] rounded-full text-white font-black transition-colors">&lt;</button>
            <div className="flex gap-4 overflow-hidden w-full max-w-[850px]">
              {youtubeVideos.slice(0, 4).map((video) => (
                <div key={video.id.videoId} onClick={() => setMainVideo(video)} className="flex-shrink-0 w-[calc(25%-12px)] cursor-pointer group">
                  <div className={`w-full aspect-video relative mb-3 border-2 transition-colors ${mainVideo.id.videoId === video.id.videoId ? 'border-white' : 'border-transparent group-hover:border-gray-500'}`}>
                    <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-white text-[12px] font-bold leading-tight line-clamp-3 text-center px-1">{video.snippet.title}</p>
                </div>
              ))}
            </div>
            <button className="w-10 h-10 flex-shrink-0 bg-[#2a2a2a] hover:bg-[#ff2020] rounded-full text-white font-black transition-colors">&gt;</button>
          </div>
        </>
      ) : (<p className="text-center text-gray-500 mb-16">Video non disponibili.</p>)}

      <div id="sezione-immagini" className="flex items-center justify-center mb-8 pt-8">
        <div className="flex-1 max-w-[300px] h-[1px] bg-gray-600"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Tutte le immagini</h2>
        <div className="flex-1 max-w-[300px] h-[1px] bg-gray-600"></div>
      </div>

      {loadingImages ? (
        <p className="text-center text-white font-bold pb-12">Caricamento immagini in corso...</p>
      ) : gameImages.length >= 6 ? (
        <div className="grid grid-cols-6 gap-0 pb-12">
          <div className="col-span-6 h-[400px] md:h-[500px] overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
            <img src={gameImages[0]} alt="Screen 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="col-span-3 h-[200px] md:h-[300px] overflow-hidden cursor-pointer" onClick={() => openLightbox(1)}>
            <img src={gameImages[1]} alt="Screen 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="col-span-3 h-[200px] md:h-[300px] overflow-hidden cursor-pointer" onClick={() => openLightbox(2)}>
            <img src={gameImages[2]} alt="Screen 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="col-span-2 h-[120px] md:h-[200px] overflow-hidden cursor-pointer" onClick={() => openLightbox(3)}>
            <img src={gameImages[3]} alt="Screen 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="col-span-2 h-[120px] md:h-[200px] overflow-hidden cursor-pointer" onClick={() => openLightbox(4)}>
            <img src={gameImages[4]} alt="Screen 5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="col-span-2 h-[120px] md:h-[200px] relative overflow-hidden cursor-pointer group" onClick={() => openLightbox(5)}>
            <img src={gameImages[5]} alt="Screen 6" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-[#ff2020]/80 flex items-center justify-center transition-colors hover:bg-[#ff2020]/90">
              <span className="text-white font-black text-2xl md:text-4xl drop-shadow-md">+{totalImages > 6 ? totalImages - 5 : 34}</span>
            </div>
          </div>
        </div>
      ) : (<p className="text-center text-gray-500 pb-12">Nessuna immagine trovata.</p>)}
    </>
  );
}