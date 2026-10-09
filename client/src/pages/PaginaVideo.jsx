import React, { useState, useEffect } from 'react';

const SIDEBAR_PLATFORMS = ['android', 'ipad', 'iphone', 'nsw', 'pc', 'ps4', 'ps5', 'wii', 'wiiu', 'xboxseriesx', 'xone'];
const SIDEBAR_CATEGORIES = ['Rubrica', 'Sala Giochi', 'Storico', 'Superdiretta', 'Trailer', 'Videoanteprima', 'Videodiario', 'Videointervista', 'Videorecensione'];

const ChevronCircle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#e6c200]">
    <circle cx="12" cy="12" r="10" stroke="#e6c200"></circle>
    <polygon points="10 8 16 12 10 16 10 8" fill="#e6c200"></polygon>
  </svg>
);

export default function PaginaVideo() {
  const [videos, setVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Stati Sidebar (Filtri)
  const [activePlatform, setActivePlatform] = useState('tutte');
  const [activeCategory, setActiveCategory] = useState('tutte');
  const [isPiattaformeOpen, setIsPiattaformeOpen] = useState(true);
  const [isCategorieOpen, setIsCategorieOpen] = useState(true);

  // Variabile d'ambiente sicura per il backend
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch dei video dal backend
  const fetchVideos = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    // Costruzione dinamica della query
    let queryTerms = "videogioco ita";
    if (activePlatform !== 'tutte') queryTerms += ` ${activePlatform}`;
    if (activeCategory !== 'tutte') queryTerms += ` ${activeCategory}`;
    else if (activePlatform === 'tutte') queryTerms += " trailer OR gameplay";

    const query = encodeURIComponent(queryTerms);
    
    // Costruiamo l'URL agganciando anche il pageToken se stiamo caricando "altri" video
    let url = `${API_URL}/api/youtube/search?query=${query}`;
    if (isLoadMore && nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        setNextPageToken(data.nextPageToken || null);
        
        if (isLoadMore) {
          setVideos(prev => [...prev, ...data.items]);
        } else {
          setVideos(data.items.slice(1));
          setMainVideo(data.items[0]);
        }
      } else if (!isLoadMore) {
        setVideos([]);
        setMainVideo(null);
        setNextPageToken(null);
      }
    } catch (error) {
      console.error("Errore fetch dal server backend:", error);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchVideos(false);
    window.scrollTo(0, 0);
  }, [activePlatform, activeCategory]);

  // Decodifica sicura HTML Entities (es: &#39;) senza usare dangerouslySetInnerHTML
  const decodeHtmlEntities = (str) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
  };

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex justify-center pb-20">
      <div className="w-full max-w-[1200px] flex flex-col mt-8 px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================= COLONNA SINISTRA (VIDEO) ======================= */}
          <div className="lg:col-span-8 flex flex-col">
            
            {loading ? (
              <div className="flex justify-center items-center h-[500px]">
                <p className="text-white font-bold text-xl">Ricerca video in corso...</p>
              </div>
            ) : mainVideo ? (
              <>
                {/* VIDEO PRINCIPALE */}
                <h1 className="text-white text-3xl font-bold leading-tight mb-4">
                  {decodeHtmlEntities(mainVideo.snippet.title)}
                </h1>
                
                <div className="w-full aspect-video bg-black relative mb-6 shadow-2xl border border-gray-800 rounded-sm overflow-hidden">
                  <iframe 
                    className="w-full h-full" 
                    src={`https://www.youtube.com/embed/${mainVideo.id?.videoId}?autoplay=1&mute=1`} 
                    title={decodeHtmlEntities(mainVideo.snippet.title)} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>

                {/* GRIGLIA VIDEO SECONDARI */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {videos.map((vid) => {
                    // Controllo di sicurezza: se per qualche motivo l'ID del video manca, nascondiamo l'elemento
                    if (!vid.id || !vid.id.videoId) return null;
                    
                    return (
                      <div 
                        key={vid.id.videoId} 
                        className="flex flex-col cursor-pointer group"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setMainVideo(vid);
                        }}
                      >
                        <div className="w-full aspect-video relative rounded-sm overflow-hidden border border-gray-800 group-hover:border-[#ff2020] transition-colors mb-2">
                          <img 
                            src={vid.snippet.thumbnails?.medium?.url || ''} 
                            alt={decodeHtmlEntities(vid.snippet.title)} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/20">
                            <PlayIcon />
                          </div>
                        </div>
                        <h3 className="text-gray-200 text-[12px] font-bold leading-snug line-clamp-3 group-hover:text-[#ff2020] transition-colors">
                          {decodeHtmlEntities(vid.snippet.title)}
                        </h3>
                      </div>
                    );
                  })}
                </div>

                {/* TASTO MOSTRA ALTRI */}
                {nextPageToken && (
                  <div className="flex justify-center mt-4 border-t border-gray-800 pt-8">
                    <button 
                      onClick={() => fetchVideos(true)}
                      disabled={loadingMore}
                      className="bg-[#ff4444] hover:bg-red-600 text-white text-[13px] font-black uppercase tracking-widest px-8 py-3 rounded-sm transition-colors shadow-lg disabled:opacity-50"
                    >
                      {loadingMore ? 'Caricamento...' : 'Mostra Altri'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center h-[500px]">
                <p className="text-gray-500 font-bold text-xl">Nessun video trovato per questi filtri.</p>
              </div>
            )}
            
          </div>

          {/* ======================= COLONNA DESTRA (SIDEBAR FILTRI) ======================= */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-[#1a1a1a] rounded-sm p-5 border border-gray-800 flex flex-col">
              
              <div 
                className={`text-[15px] font-bold cursor-pointer transition-colors mb-4 ${activeCategory === 'tutte' && activePlatform === 'tutte' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => { setActivePlatform('tutte'); setActiveCategory('tutte'); }}
              >
                Tutti i video
              </div>

              {/* ACCORDION PIATTAFORME */}
              <div className="flex flex-col mb-4">
                <div 
                  className={`flex items-center justify-between cursor-pointer py-1.5 group rounded-sm ${isPiattaformeOpen ? 'border-b border-gray-700 pb-2 mb-2' : ''}`}
                  onClick={() => setIsPiattaformeOpen(!isPiattaformeOpen)}
                >
                  <div className="flex items-center gap-2 text-white font-bold text-[14px]">
                    <span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isPiattaformeOpen} /></span>
                    Piattaforme
                  </div>
                  <div className="bg-[#ff4444] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none">
                    {activePlatform === 'tutte' ? 'TUTTE' : activePlatform}
                    {activePlatform !== 'tutte' && (
                      <span 
                        className="ml-1 cursor-pointer hover:text-black transition-colors text-[10px]" 
                        onClick={(e) => { e.stopPropagation(); setActivePlatform('tutte'); }}
                      >✕</span>
                    )}
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPiattaformeOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="flex flex-col gap-1.5 pl-[26px] py-1 text-[13px] font-semibold text-[#888]">
                    {SIDEBAR_PLATFORMS.map(plat => (
                      <li 
                        key={plat} 
                        onClick={() => setActivePlatform(plat)}
                        className={`cursor-pointer transition-colors uppercase ${activePlatform === plat ? 'text-[#ff4444]' : 'hover:text-gray-200'}`}
                      >
                        {plat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ACCORDION CATEGORIE */}
              <div className="flex flex-col border-t border-gray-800 pt-4">
                <div 
                  className={`flex items-center justify-between cursor-pointer py-1.5 group rounded-sm ${isCategorieOpen ? 'border-b border-gray-700 pb-2 mb-2' : ''}`}
                  onClick={() => setIsCategorieOpen(!isCategorieOpen)}
                >
                  <div className="flex items-center gap-2 text-white font-bold text-[14px]">
                    <span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isCategorieOpen} /></span>
                    Categorie
                  </div>
                  <div className="bg-[#ff4444] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none">
                    {activeCategory === 'tutte' ? 'TUTTE' : activeCategory}
                    {activeCategory !== 'tutte' && (
                      <span 
                        className="ml-1 cursor-pointer hover:text-black transition-colors text-[10px]" 
                        onClick={(e) => { e.stopPropagation(); setActiveCategory('tutte'); }}
                      >✕</span>
                    )}
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategorieOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="flex flex-col gap-1.5 pl-[26px] py-1 text-[13px] font-semibold text-[#888]">
                    {SIDEBAR_CATEGORIES.map(cat => (
                      <li 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)}
                        className={`cursor-pointer transition-colors ${activeCategory === cat ? 'text-[#ff4444]' : 'hover:text-gray-200'}`}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}