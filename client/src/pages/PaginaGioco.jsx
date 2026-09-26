import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

import GiocoHeader from '../components/gioco/GiocoHeader';
import TabGioco from '../components/gioco/TabGioco';
import TabVideo from '../components/gioco/TabVideo';
import TabRecensioni from '../components/gioco/TabRecensioni';
import TabNotizie from '../components/gioco/TabNotizie';

const TabButton = ({ tabId, label, activeTab, setActiveTab, navigate, location }) => (
  <button 
    onClick={() => { 
      setActiveTab(tabId); 
      if(location.state) navigate(location.pathname, { replace: true, state: {} }); 
    }}
    className={`relative px-4 py-4 cursor-pointer font-black uppercase tracking-widest text-[11px] transition-colors outline-none ${activeTab === tabId ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
  >
    {label}
    {activeTab === tabId && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff2020]"></div>}
  </button>
);

export default function PaginaGioco() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); 
  const { user, openModal } = useAuth();
  
  const [game, setGame] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'gioco');
  const [showVoteDropdown, setShowVoteDropdown] = useState(false);
  const [myVote, setMyVote] = useState(5.0);
  const voteRef = useRef(null);
  const hasScrolled = useRef(false); 

  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  const [gameImages, setGameImages] = useState([]);
  const [totalImages, setTotalImages] = useState(35);
  const [loadingImages, setLoadingImages] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: gameData } = await supabase.from('giochi').select(`*, giochi_generi(generi(nome)), gioco_piattaforma(piattaforme(nome))`).eq('id', parseInt(id)).maybeSingle();
      if (gameData) setGame(gameData);

      // FILTRO AGGIUNTO QUI SOTTO: .eq('stato', 'PUBLISHED')
      const { data: articlesData } = await supabase
        .from('articoli')
        .select(`id, titolo, url_immagine, creato_il, commenti, categorie(nome)`)
        .eq('id_gioco', parseInt(id))
        .eq('stato', 'PUBLISHED') 
        .order('creato_il', { ascending: false });
        
      if (articlesData) setArticles(articlesData);

      if (user) {
        const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
        if (userData) {
          const { data: voteData } = await supabase.from('voti_giochi').select('voto').eq('id_gioco', parseInt(id)).eq('id_utente', userData.id).maybeSingle();
          if (voteData) setMyVote(voteData.voto);
          const { data: followData } = await supabase.from('segui_giochi').select('*').eq('id_utente', userData.id).eq('id_gioco', parseInt(id)).maybeSingle();
          if (followData) setIsFollowing(true);
        }
      }
      setLoading(false);
      if (!location.state?.scrollTo) window.scrollTo(0, 0);
    }
    fetchData();
  }, [id, user, location.state]);

  const toggleFollow = async () => {
    if (!user) { openModal(); return; }
    setLoadingFollow(true);
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData && game) {
      if (isFollowing) {
        await supabase.from('segui_giochi').delete().eq('id_utente', userData.id).eq('id_gioco', game.id);
        setIsFollowing(false);
      } else {
        await supabase.from('segui_giochi').insert([{ id_utente: userData.id, id_gioco: game.id }]);
        setIsFollowing(true);
      }
    }
    setLoadingFollow(false);
  };

  useEffect(() => {
    async function fetchYouTubeVideos() {
      if (youtubeVideos.length === 0 && game) {
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
        } catch (error) { console.error("Errore fetch YouTube"); }
        setLoadingVideos(false);
      }
    }
    fetchYouTubeVideos();
  }, [game, youtubeVideos.length]);

  useEffect(() => {
    async function fetchGameImages() {
      if (activeTab === 'video' && gameImages.length === 0 && game) {
        setLoadingImages(true);
        try {
          const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || '';
          if (!UNSPLASH_KEY) throw new Error("Chiave API Unsplash non trovata");
          const keyword = encodeURIComponent(`${game.titolo} video game`);
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${keyword}&per_page=6&client_id=${UNSPLASH_KEY}`);
          const data = await res.json();
          if (data.results && data.results.length >= 6) {
            setGameImages(data.results.map(photo => photo.urls.regular));
            setTotalImages(data.total || 35);
          } else throw new Error("Immagini non sufficienti");
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
    if (location.state?.scrollTo === 'immagini' && activeTab === 'video' && gameImages.length > 0 && !hasScrolled.current) {
      setTimeout(() => {
        const sez = document.getElementById('sezione-immagini');
        if (sez) { sez.scrollIntoView({ behavior: 'smooth' }); hasScrolled.current = true; }
      }, 500); 
    }
  }, [location.state, activeTab, gameImages.length]);

  useEffect(() => {
    const handleClickOutside = (event) => { if (voteRef.current && !voteRef.current.contains(event.target)) setShowVoteDropdown(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'ArrowLeft') prevImage(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const handleSaveVote = async () => {
    if (!user || !game) { openModal(); return; }
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const votoDaSalvare = parseFloat(myVote);
      const { error } = await supabase.from('voti_giochi').upsert({ id_gioco: parseInt(id), id_utente: userData.id, voto: votoDaSalvare }, { onConflict: 'id_gioco, id_utente' });
      if (!error) {
        const { data: tuttiVoti } = await supabase.from('voti_giochi').select('voto').eq('id_gioco', parseInt(id));
        if (tuttiVoti && tuttiVoti.length > 0) {
          const mediaReale = (tuttiVoti.reduce((acc, curr) => acc + curr.voto, 0) / tuttiVoti.length).toFixed(1);
          await supabase.from('giochi').update({ voto_lettori: mediaReale, numero_voti: tuttiVoti.length }).eq('id', parseInt(id));
          setGame(prev => ({ ...prev, voto_lettori: mediaReale, numero_voti: tuttiVoti.length }));
        }
      }
    }
    setShowVoteDropdown(false);
  };

  const openLightbox = (index) => { setCurrentImageIndex(index); setIsLightboxOpen(true); };
  const closeLightbox = () => setIsLightboxOpen(false);
  const nextImage = (e) => { if(e) e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % gameImages.length); };
  const prevImage = (e) => { if(e) e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + gameImages.length) % gameImages.length); };

  if (loading) return <div className="text-white p-10 text-center font-bold">Caricamento gioco...</div>;
  if (!game) return <div className="text-white p-10 text-center font-bold">Gioco non trovato.</div>;

  const reviews = articles.filter(a => a.categorie?.nome === 'Recensione');
  const news = articles.filter(a => a.categorie?.nome !== 'Recensione');

  return (
    <div className="bg-[#111111] min-h-screen pb-20 relative">
      
      {isLightboxOpen && gameImages.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeLightbox}>
          <button className="absolute top-6 left-6 text-white hover:text-[#ff2020] transition-colors p-2 z-[110]" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <button className="absolute left-4 md:left-10 text-white hover:text-[#ff2020] transition-colors p-4 z-[110]" onClick={prevImage}><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <img src={gameImages[currentImageIndex]} alt="Screenshot" className="max-w-[90vw] max-h-[90vh] object-contain select-none shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 md:right-10 text-white hover:text-[#ff2020] transition-colors p-4 z-[110]" onClick={nextImage}><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest text-sm">{currentImageIndex + 1} / {gameImages.length}</div>
        </div>
      )}

      <GiocoHeader 
        game={game} activeTab={activeTab} isFollowing={isFollowing} 
        toggleFollow={toggleFollow} loadingFollow={loadingFollow} 
        myVote={myVote} setMyVote={setMyVote} 
        showVoteDropdown={showVoteDropdown} setShowVoteDropdown={setShowVoteDropdown} 
        handleSaveVote={handleSaveVote} user={user} openModal={openModal} voteRef={voteRef} 
      />

      <div className="w-full border-b border-gray-800 bg-[#111111]">
        <div className="max-w-[1000px] mx-auto flex items-center justify-center flex-wrap gap-x-2 md:gap-x-12">
          <TabButton tabId="gioco" label="Gioco" activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} location={location} />
          <TabButton tabId="recensioni" label="Recensioni e Approfondimenti" activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} location={location} />
          <TabButton tabId="notizie" label="Ultime notizie" activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} location={location} />
          <TabButton tabId="video" label="Video e Immagini" activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} location={location} />
        </div>
      </div>

      <main className="max-w-[1000px] mx-auto px-4 mt-8">
        {activeTab === 'gioco' && <TabGioco game={game} articles={articles} mainVideo={mainVideo} loadingVideos={loadingVideos} />}
        {activeTab === 'recensioni' && <TabRecensioni reviews={reviews} articles={articles} />}
        {activeTab === 'notizie' && <TabNotizie news={news} />}
        {activeTab === 'video' && <TabVideo mainVideo={mainVideo} setMainVideo={setMainVideo} youtubeVideos={youtubeVideos} loadingVideos={loadingVideos} gameImages={gameImages} loadingImages={loadingImages} totalImages={totalImages} openLightbox={openLightbox} />}
      </main>
    </div>
  );
}