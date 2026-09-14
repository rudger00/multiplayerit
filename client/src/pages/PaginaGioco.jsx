import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function PaginaGioco() {
  const { id } = useParams();
  const { user, openModal } = useAuth();
  
  const [game, setGame] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stati per la UI
  const [activeTab, setActiveTab] = useState('gioco');
  const [showVoteDropdown, setShowVoteDropdown] = useState(false);
  const [myVote, setMyVote] = useState(5.0);
  const voteRef = useRef(null);

  // Stati per YouTube e Immagini
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  const [gameImages, setGameImages] = useState([]);
  const [totalImages, setTotalImages] = useState(35);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: gameData } = await supabase
        .from('giochi')
        .select(`*, giochi_generi(generi(nome)), gioco_piattaforma(piattaforme(nome))`)
        .eq('id', parseInt(id))
        .single();

      if (gameData) setGame(gameData);

      const { data: articlesData } = await supabase
        .from('articoli')
        .select(`id, titolo, url_immagine, creato_il, commenti, categorie(nome)`)
        .eq('id_gioco', parseInt(id))
        .order('creato_il', { ascending: false });

      if (articlesData) setArticles(articlesData);

      if (user) {
        const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).single();
        if (userData) {
          const { data: voteData } = await supabase
            .from('voti_giochi')
            .select('voto')
            .eq('id_gioco', parseInt(id))
            .eq('id_utente', userData.id)
            .single();
            
          if (voteData) setMyVote(voteData.voto);
        }
      }

      setLoading(false);
    }
    window.scrollTo(0, 0);
    fetchData();
  }, [id, user]);

  // YouTube API Call
  useEffect(() => {
    async function fetchYouTubeVideos() {
      if (activeTab === 'video' && youtubeVideos.length === 0 && game) {
        setLoadingVideos(true);
        const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''; 
        const query = encodeURIComponent(`${game.titolo} official trailer ita`);
        
        try {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=5&type=video&key=${API_KEY}`);
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setYoutubeVideos(data.items);
            setMainVideo(data.items[0]);
          }
        } catch (error) {
          console.error("Errore fetch YouTube:", error);
        }
        setLoadingVideos(false);
      }
    }
    fetchYouTubeVideos();
  }, [activeTab, game, youtubeVideos.length]);

  // Caricamento immagini dinamico tramite Unsplash (senza errori 403)
  useEffect(() => {
    async function fetchGameImages() {
      if (activeTab === 'video' && gameImages.length === 0 && game) {
        setLoadingImages(true);
        try {
          const keyword = encodeURIComponent(`${game.titolo} video game wallpaper`);
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${keyword}&per_page=6&client_id=demo`);
          const data = await res.json();
          
          if (data.results && data.results.length >= 6) {
            setGameImages(data.results.map(photo => photo.urls.regular));
            setTotalImages(data.total || 35);
          } else {
            throw new Error("Fallback");
          }
        } catch (error) {
          const fallbackImg = getImg(game.url_immagine);
          setGameImages([fallbackImg, fallbackImg, fallbackImg, fallbackImg, fallbackImg, fallbackImg]);
          setTotalImages(35);
        }
        setLoadingImages(false);
      }
    }
    fetchGameImages();
  }, [activeTab, game, gameImages.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (voteRef.current && !voteRef.current.contains(event.target)) setShowVoteDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveVote = async () => {
    if (!user) {
      openModal();
      return;
    }
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).single();
    if (userData) {
      const { error } = await supabase
        .from('voti_giochi')
        .upsert(
          { id_gioco: parseInt(id), id_utente: userData.id, voto: parseFloat(myVote) }, 
          { onConflict: 'id_gioco, id_utente' }
        );
      
      if (!error) {
        setGame(prev => ({ 
          ...prev, 
          voto_lettori: ((parseFloat(prev.voto_lettori || 0) * (prev.numero_voti || 0) + parseFloat(myVote)) / ((prev.numero_voti || 0) + 1)).toFixed(1),
          numero_voti: (prev.numero_voti || 0) + 1 
        }));
      }
    }
    setShowVoteDropdown(false);
  };

  if (loading) return <div className="text-white p-10 text-center font-bold">Caricamento gioco...</div>;
  if (!game) return <div className="text-white p-10 text-center font-bold">Gioco non trovato.</div>;

  const coverUrl = getImg(game.url_immagine);
  const releaseDate = game.data_uscita ? new Date(game.data_uscita).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Da definire';
  const platforms = game.gioco_piattaforma?.map(p => p.piattaforme.nome).join(' - ') || 'Non specificate';
  const genres = game.giochi_generi?.map(g => g.generi.nome).join(', ') || 'Non specificato';
  
  const reviews = articles.filter(a => a.categorie?.nome === 'Recensione');
  const news = articles.filter(a => a.categorie?.nome !== 'Recensione');
  
  const featuredArticle = articles[0];
  const listArticles = articles.slice(1, 5);
  
  const TabButton = ({ id, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`relative px-4 py-4 cursor-pointer font-black uppercase tracking-widest text-[11px] transition-colors outline-none ${
        activeTab === id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff2020]"></div>
      )}
    </button>
  );

  return (
    <div className="bg-[#111111] min-h-screen pb-20">
      
      {/* HEADER */}
      <div className="relative w-full h-[350px] md:h-[400px] flex justify-center pt-8">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-40 scale-110" style={{ backgroundImage: `url(${coverUrl})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/80 to-[#111111]"></div>
        
        <div className="absolute top-4 left-4 md:left-[10%] text-white text-xs font-bold z-10">
          <Link to="/" className="hover:text-[#ff2020]">Multiplayer.it</Link> <span className="text-gray-500">/</span> <Link to="/giochi" className="hover:text-[#ff2020]">Giochi</Link> <span className="text-gray-500">/</span> {game.titolo}
        </div>

        <div className="relative z-10 w-full max-w-[1000px] px-4 flex flex-col md:flex-row items-end gap-6 pb-10">
          <img src={coverUrl} alt={game.titolo} className="w-[180px] md:w-[220px] rounded-md shadow-2xl border-4 border-[#1a1a1a]" />
          
          <div className="bg-[#1a1a1a]/90 backdrop-blur-sm p-6 flex-grow rounded-sm shadow-xl flex flex-col justify-center border border-gray-800">
            <div className="flex items-center gap-4 mb-4">
              <button className="text-[#ff2020] border border-[#ff2020] rounded-full font-black uppercase text-xs px-6 py-2 hover:bg-[#ff2020] hover:text-white transition-colors">Segui</button>
              
              <div>
                {activeTab === 'gioco' && <h1 className="text-3xl font-black text-white">{game.titolo}</h1>}
                {activeTab === 'recensioni' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Recensioni</span> di<br/>{game.titolo}</h1>}
                {activeTab === 'notizie' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Notizie</span> di<br/>{game.titolo}</h1>}
                {activeTab === 'video' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Video e immagini</span> di<br/>{game.titolo}</h1>}
              </div>
            </div>
            
            {activeTab === 'gioco' && (
              <div className="flex items-center gap-6 mb-4 relative" ref={voteRef}>
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 bg-[#ff2020] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">10</div>
                  
                  <div 
                    onClick={() => { if(!user) openModal(); else setShowVoteDropdown(!showVoteDropdown); }}
                    className="w-10 h-10 border border-gray-500 rounded-full flex items-center justify-center text-gray-300 font-black text-[10px] uppercase shadow-md cursor-pointer hover:border-white hover:text-white transition-colors"
                  >
                    {myVote !== 5.0 ? parseFloat(myVote).toFixed(1) : 'VOTA!'}
                  </div>
                  
                  <div className="w-10 h-10 border border-[#00bfff] rounded-full flex items-center justify-center text-[#00bfff] font-black text-sm shadow-md">
                    {game.voto_lettori && game.voto_lettori > 0 ? parseFloat(game.voto_lettori).toFixed(1) : '-'}
                  </div>

                  {showVoteDropdown && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#2a2a2a] p-4 rounded-md shadow-2xl border border-gray-700 w-64 z-50 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-white font-bold">
                        <span className="text-xs text-gray-400">Il tuo voto</span>
                        <span className="text-xl text-[#ff2020]">{parseFloat(myVote).toFixed(1)}</span>
                      </div>
                      <input type="range" min="0" max="10" step="0.1" value={myVote} onChange={(e) => setMyVote(e.target.value)} className="w-full accent-[#ff2020]" />
                      <button onClick={handleSaveVote} className="w-full bg-[#ff2020] text-white text-xs font-bold uppercase py-2 rounded-sm hover:bg-red-700">Conferma Voto</button>
                    </div>
                  )}
                </div>
                <div className="h-10 w-[1px] bg-gray-700"></div>
                <div className="text-xs text-gray-300 font-semibold leading-relaxed text-left">
                  <p><span className="text-[#ff2020]">●</span> Uscita: <span className="text-white">{releaseDate}</span></p>
                  <p><span className="text-[#ff2020]">●</span> Disponibile per: <span className="text-white">{platforms}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full border-b border-gray-800 bg-[#111111]">
        <div className="max-w-[1000px] mx-auto flex items-center justify-center flex-wrap gap-x-2 md:gap-x-12">
          <TabButton id="gioco" label="Gioco" />
          <TabButton id="recensioni" label="Recensioni e Approfondimenti" />
          <TabButton id="notizie" label="Ultime notizie" />
          <TabButton id="video" label="Video e Immagini" />
        </div>
      </div>

      <main className="max-w-[1000px] mx-auto px-4 mt-8">
        
        {/* ==================== TAB GIOCO ==================== */}
        {activeTab === 'gioco' && (
          <>
            <div className="text-gray-300 text-sm font-semibold leading-relaxed mb-12 text-left">
              <p className="mb-2"><strong className="text-white">{game.titolo}</strong> è un titolo sviluppato da Team Cherry.</p>
              <p>
                {game.descrizione || "Descrizione non disponibile al momento."}
                <span className="text-[#ff2020] cursor-pointer hover:underline ml-2 font-bold">Leggi tutto</span>
              </p>
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest whitespace-nowrap text-center">Video in evidenza</h2>
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-sm border border-gray-800 mb-16 shadow-lg flex flex-col items-center">
              {loadingVideos ? (
                <div className="w-full aspect-video flex items-center justify-center bg-black rounded-sm">
                  <span className="text-white font-bold">Ricerca trailer in corso...</span>
                </div>
              ) : mainVideo ? (
                <>
                  <div className="w-full aspect-video bg-black relative flex items-center justify-center rounded-sm overflow-hidden mb-4">
                    <iframe 
                      className="w-full h-full" 
                      src={`https://www.youtube.com/embed/${mainVideo.id.videoId}?autoplay=0`} 
                      title={mainVideo.snippet.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h3 className="text-white font-bold text-xl text-center leading-tight px-4 pb-2">{mainVideo.snippet.title}</h3>
                </>
              ) : (
                <>
                  <div className="w-full aspect-video bg-black relative flex items-center justify-center cursor-pointer group rounded-sm overflow-hidden mb-4">
                    <img src={coverUrl} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
                    <div className="relative z-10 w-16 h-12 bg-white flex items-center justify-center pl-2 rounded-sm shadow-xl">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-transparent border-l-black"></div>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-xl text-center leading-tight px-4 pb-2">{game.titolo} - Trailer Ufficiale</h3>
                </>
              )}
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest whitespace-nowrap text-center">I contenuti più discussi</h2>
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-1 mb-16">
                
                {featuredArticle && (
                  <div className="md:col-span-6 bg-[#1a1a1a] border border-gray-800 group cursor-pointer flex flex-col relative">
                    <Link to={`/articolo/${featuredArticle.id}`} className="block h-full">
                      <div className="relative w-full h-[250px] overflow-hidden">
                        <img src={getImg(featuredArticle.url_immagine)} alt={featuredArticle.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute -bottom-3 right-4 bg-[#ff2020] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-md z-10">
                          {featuredArticle.commenti || 0}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow text-left">
                        <h3 className="text-white font-black text-2xl leading-tight mb-3 group-hover:text-[#ff2020] transition-colors">{featuredArticle.titolo}</h3>
                        <p className="text-gray-400 text-sm font-semibold line-clamp-3 mb-4">Approfondimento e discussione sul titolo più atteso del momento. Scopriamo le ultime novità e cosa ne pensa la community.</p>
                        <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-[#ff2020]">{featuredArticle.categorie?.nome || 'Notizia'}</span>
                          <span className="text-gray-500">{new Date(featuredArticle.creato_il).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                <div className="md:col-span-6 flex flex-col gap-1">
                  {listArticles.map(art => (
                    <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[115px] group cursor-pointer relative overflow-visible text-left">
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <h4 className="text-white font-bold text-[15px] leading-tight group-hover:text-[#ff2020] transition-colors line-clamp-2">{art.titolo}</h4>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-500 hover:text-[#ff2020] transition-colors">{art.categorie?.nome || 'Notizia'}</span>
                          <span className="text-gray-600">{new Date(art.creato_il).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                      <div className="w-[180px] h-full relative flex-shrink-0 overflow-hidden">
                        <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 right-2 bg-[#ff2020] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10">
                          {art.commenti || 0}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            ) : (
              <p className="text-center text-gray-500 mb-16">Nessun articolo trovato per questo gioco.</p>
            )}

            <div className="bg-[#1a1a1a] border-t-2 border-[#ff2020] p-8 flex flex-col md:flex-row gap-8 mb-10 shadow-lg text-left">
              <div className="md:w-1/3">
                <h3 className="text-[#ff2020] font-black text-xl leading-tight mb-4">Informazioni dettagliate<br/>di {game.titolo}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold">
                  <span className="text-gray-400">Prima uscita:</span>
                  <span className="text-white font-bold">{releaseDate}</span>
                  <span className="text-gray-400">Tipologia di gioco:</span>
                  <span className="text-white font-bold border-b border-gray-600 w-fit">{genres}</span>
                </div>
              </div>
              
              <div className="md:w-2/3 grid grid-cols-2 text-xs font-semibold gap-y-2">
                <span className="text-gray-400">Sviluppato da:</span>
                <span className="text-white font-bold">Team Cherry</span>
                <span className="text-gray-400">Giocatori:</span>
                <span className="text-white font-bold">1</span>
                <span className="text-gray-400">Lingua:</span>
                <span className="text-white font-bold">Ita (testi)</span>
                <span className="text-gray-400">PEGI:</span>
                <span className="text-white font-bold">7+</span>
                <span className="text-gray-400">Supporto:</span>
                <span className="text-white font-bold">Download</span>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB RECENSIONI ==================== */}
        {activeTab === 'recensioni' && (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Recensioni</h2>
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
            </div>
            
            {reviews.length > 0 ? (
              <div className="flex justify-center mb-16 text-left">
                <Link to={`/articolo/${reviews[0].id}`} className="relative group w-[400px] aspect-square rounded-sm overflow-hidden block border border-gray-800">
                  <img src={getImg(reviews[0].url_immagine)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                    <span className="text-white text-xs font-black uppercase bg-black/50 w-fit px-2 py-1 mb-2 border border-gray-500">Recensione PC</span>
                    <h3 className="text-white font-black text-xl leading-tight group-hover:text-[#ff2020] transition-colors">{reviews[0].titolo}</h3>
                  </div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-[#ff2020] text-white font-black shadow-lg">10</div>
                </Link>
              </div>
            ) : (<p className="text-center text-gray-500 mb-16">Nessuna recensione disponibile.</p>)}
            
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Approfondimenti</h2>
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
            </div>
            
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {['TUTTI', 'NSW', 'PC', 'PS4', 'PS5', 'XBOXSERIESX'].map(p => (
                <button key={p} className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none ${p === 'TUTTI' ? 'bg-[#ff2020] text-white border-[#ff2020]' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}>{p}</button>
              ))}
            </div>

            <div className="flex flex-col gap-4 text-left">
              {articles.slice(1, 3).map(art => (
                <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[140px] group cursor-pointer rounded-sm hover:border-gray-600 transition-colors">
                  <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-[220px] h-full object-cover" />
                  <div className="p-5 flex flex-col justify-center flex-grow relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest">{art.categorie?.nome || 'Approfondimento'} <span className="text-gray-500">• {new Date(art.creato_il).toLocaleDateString('it-IT')}</span></span>
                      <span className="text-white text-[10px] font-black bg-[#ff2020] px-2 py-0.5 rounded-full shadow-md">{art.commenti || 0}</span>
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff2020] transition-colors line-clamp-2">{art.titolo}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ==================== TAB NOTIZIE ==================== */}
        {activeTab === 'notizie' && (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Ultimi aggiornamenti</h2>
              <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
            </div>

            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {['TUTTI', 'NSW', 'PC', 'PS4', 'PS5', 'XBOXSERIESX'].map(p => (
                <button key={p} className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none ${p === 'TUTTI' ? 'bg-[#ff2020] text-white border-[#ff2020]' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}>{p}</button>
              ))}
            </div>

            <div className="flex flex-col gap-4 text-left">
              {news.map(art => (
                <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[140px] group cursor-pointer rounded-sm hover:border-gray-600 transition-colors">
                  <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-[220px] h-full object-cover" />
                  <div className="p-5 flex flex-col justify-center flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest">{art.categorie?.nome || 'Notizia'} <span className="text-gray-500">• {new Date(art.creato_il).toLocaleDateString('it-IT')}</span></span>
                      <span className="text-gray-500 text-xs flex items-center gap-1 font-bold">{art.commenti || 0} <span className="text-[#ff2020] text-base leading-none">●</span></span>
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff2020] transition-colors">{art.titolo}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ==================== TAB VIDEO E IMMAGINI ==================== */}
        {activeTab === 'video' && (
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
                  <iframe 
                    className="w-full h-full" 
                    src={`https://www.youtube.com/embed/${mainVideo.id.videoId}?autoplay=0`} 
                    title={mainVideo.snippet.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>

                <h3 className="text-[#ff2020] font-black text-xl text-center px-4 mb-6">{mainVideo.snippet.title}</h3>

                <div className="flex items-center justify-center gap-4 mb-16">
                  <button className="w-10 h-10 flex-shrink-0 bg-[#2a2a2a] hover:bg-[#ff2020] rounded-full flex items-center justify-center text-white font-black transition-colors shadow-lg">&lt;</button>
                  
                  <div className="flex gap-4 overflow-hidden w-full max-w-[850px]">
                    {youtubeVideos.slice(0, 4).map((video) => (
                      <div 
                        key={video.id.videoId} 
                        onClick={() => setMainVideo(video)}
                        className="flex-shrink-0 w-[calc(25%-12px)] cursor-pointer group"
                      >
                        <div className={`w-full aspect-video relative mb-3 border-2 transition-colors ${mainVideo.id.videoId === video.id.videoId ? 'border-white' : 'border-transparent group-hover:border-gray-500'}`}>
                          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-white text-[12px] font-bold leading-tight line-clamp-3 text-center px-1">{video.snippet.title}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-10 h-10 flex-shrink-0 bg-[#2a2a2a] hover:bg-[#ff2020] rounded-full flex items-center justify-center text-white font-black transition-colors shadow-lg">&gt;</button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 mb-16">Video non disponibili.</p>
            )}

            {/* SEZIONE TUTTE LE IMMAGINI CON GRIGLIA ASIMMETRICA */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 max-w-[300px] h-[1px] bg-gray-600"></div>
              <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Tutte le immagini</h2>
              <div className="flex-1 max-w-[300px] h-[1px] bg-gray-600"></div>
            </div>

            {loadingImages ? (
              <p className="text-center text-white font-bold pb-12">Caricamento immagini in corso...</p>
            ) : gameImages.length >= 6 ? (
              <div className="grid grid-cols-6 gap-0 pb-12">
                
                {/* 1. Immagine grande in alto (6 colonne) */}
                <div className="col-span-6 h-[400px] md:h-[500px] overflow-hidden cursor-pointer">
                  <img src={gameImages[0]} alt="Screenshot 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                
                {/* 2. Immagini centrali (3 colonne ciascuna) */}
                <div className="col-span-3 h-[200px] md:h-[300px] overflow-hidden cursor-pointer">
                  <img src={gameImages[1]} alt="Screenshot 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="col-span-3 h-[200px] md:h-[300px] overflow-hidden cursor-pointer">
                  <img src={gameImages[2]} alt="Screenshot 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>

                {/* 3. Immagini in basso (2 colonne ciascuna, l'ultima con overlay) */}
                <div className="col-span-2 h-[120px] md:h-[200px] overflow-hidden cursor-pointer">
                  <img src={gameImages[3]} alt="Screenshot 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="col-span-2 h-[120px] md:h-[200px] overflow-hidden cursor-pointer">
                  <img src={gameImages[4]} alt="Screenshot 5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="col-span-2 h-[120px] md:h-[200px] relative overflow-hidden cursor-pointer group">
                  <img src={gameImages[5]} alt="Screenshot 6" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#ff2020]/80 flex items-center justify-center transition-colors hover:bg-[#ff2020]/90">
                    <span className="text-white font-black text-2xl md:text-4xl drop-shadow-md">
                      +{totalImages > 6 ? totalImages - 5 : 34}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-center text-gray-500 pb-12">Nessuna immagine trovata.</p>
            )}

          </>
        )}

      </main>
    </div>
  );
}