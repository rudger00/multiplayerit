import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

import ProfiloBacheca from '../components/profilo/ProfiloBacheca';
import ProfiloNotifiche from '../components/profilo/ProfiloNotifiche';
import ProfiloSeguiti from '../components/profilo/ProfiloSeguiti';
import ProfiloVotati from '../components/profilo/ProfiloVotati';
import ProfiloSalvati from '../components/profilo/ProfiloSalvati';
import ProfiloCommenti from '../components/profilo/ProfiloCommenti';

export default function PaginaProfilo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Bacheca');
  
  const [userComments, setUserComments] = useState([]);
  const [followedGames, setFollowedGames] = useState([]);
  const [followedEvents, setFollowedEvents] = useState([]);
  const [followedChannels, setFollowedChannels] = useState([]);
  
  const [notifiche, setNotifiche] = useState([]);
  const [votedGames, setVotedGames] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [bachecaMessages, setBachecaMessages] = useState([]);
  const [newBachecaMessage, setNewBachecaMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [userDataId, setUserDataId] = useState(null);
  
  // STATO PER L'AVATAR
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "UtenteSconosciuto";

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;
      setLoading(true);

      const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();

      if (userData) {
        setUserDataId(userData.id);
        
        // Peschiamo l'avatar
        const { data: profileData } = await supabase.from('profili').select('avatar_url').eq('id_utente', userData.id).maybeSingle();
        if (profileData) setAvatarUrl(profileData.avatar_url);
        
        const { data: commentsData } = await supabase.from('commenti').select(`id, testo, data, id_articolo, articoli ( titolo )`).eq('id_utente', userData.id).order('data', { ascending: false });
        if (commentsData) setUserComments(commentsData);

        const { data: seguitiData } = await supabase.from('segui_giochi').select(`creato_il, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (seguitiData) setFollowedGames(seguitiData);

        const { data: canaliData } = await supabase.from('segui_canali').select('*').eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (canaliData) setFollowedChannels(canaliData);

        const { data: eventiData } = await supabase.from('segui_eventi_live').select(`id_palinsesto, creato_il, palinsesto(giorno, orario, titolo)`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (eventiData) setFollowedEvents(eventiData);

        const { data: notifData } = await supabase.from('notifiche').select('*').eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (notifData) setNotifiche(notifData);

        const { data: votiData } = await supabase.from('voti_giochi').select(`voto, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id);
        if (votiData) setVotedGames(votiData);

        const { data: salvatiData } = await supabase.from('articoli_salvati').select(`creato_il, id_articolo, articoli ( id, titolo, url_immagine, categorie(nome) )`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (salvatiData) setSavedArticles(salvatiData);

        const { data: msgData } = await supabase.from('messaggi_bacheca').select(`id, testo, creato_il, id_mittente, utenti!fk_mittente ( username )`).eq('id_profilo', userData.id).order('creato_il', { ascending: false });
        if (msgData) setBachecaMessages(msgData);
      }
      setLoading(false);
    }
    fetchProfileData();
  }, [user]);

  // Gestione rimozione dai seguiti
  const handleUnfollow = async (idGioco) => {
    if (!userDataId) return;
    setFollowedGames(prev => prev.filter(g => g.id_gioco !== idGioco));
    await supabase.from('segui_giochi').delete().eq('id_utente', userDataId).eq('id_gioco', idGioco);
  };
  const handleUnfollowEvent = async (idPalinsesto) => {
    if (!userDataId) return;
    setFollowedEvents(prev => prev.filter(e => e.id_palinsesto !== idPalinsesto));
    await supabase.from('segui_eventi_live').delete().eq('id_utente', userDataId).eq('id_palinsesto', idPalinsesto);
  };
  const handleUnfollowChannel = async (canale) => {
    if (!userDataId) return;
    setFollowedChannels(prev => prev.filter(c => c.canale !== canale));
    await supabase.from('segui_canali').delete().eq('id_utente', userDataId).eq('canale', canale);
  };

  const handlePostBacheca = async () => {
    if (!newBachecaMessage.trim() || !userDataId) return;
    const { data, error } = await supabase.from('messaggi_bacheca').insert([{ id_profilo: userDataId, id_mittente: userDataId, testo: newBachecaMessage }]).select(`id, testo, creato_il, id_mittente, utenti!fk_mittente (username)`).single();
    if (!error && data) {
      setBachecaMessages([data, ...bachecaMessages]);
      setNewBachecaMessage('');
    }
  };

  const markAllAsRead = async () => {
    if (!userDataId) return;
    await supabase.from('notifiche').update({ letta: true }).eq('id_utente', userDataId);
    setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
  };

  const handleNotificationClick = async (n) => {
    if (!n.letta) {
      await supabase.from('notifiche').update({ letta: true }).eq('id', n.id);
      setNotifiche(prev => prev.map(notif => notif.id === n.id ? { ...notif, letta: true } : notif));
    }
    if (n.link) navigate(n.link);
  };

  const handleUnsaveArticle = async (idArticolo) => {
    if (!userDataId) return;
    setSavedArticles(prev => prev.filter(a => a.id_articolo !== idArticolo));
    await supabase.from('articoli_salvati').delete().eq('id_utente', userDataId).eq('id_articolo', idArticolo);
  };

  const formattaData = (dataIso) => {
    if (!dataIso) return '';
    return new Date(dataIso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formattaDataBacheca = (dataIso) => {
    if (!dataIso) return '';
    const dateObj = new Date(dataIso);
    const meseNome = dateObj.toLocaleDateString('it-IT', { month: 'long' });
    return `${dateObj.getDate()} ${meseNome.charAt(0).toUpperCase() + meseNome.slice(1)} ${dateObj.getFullYear()}`;
  };
  const timeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return "Pochi secondi fa";
    if (diff < 3600) return `${Math.floor(diff / 60)} minuti fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} giorni fa`;
    return `${Math.floor(diff / 604800)} settimane fa`;
  };

  const menuItems = [
    { nome: 'Bacheca', count: bachecaMessages.length }, { nome: 'Notifiche', count: notifiche.filter(n => !n.letta).length },
    { nome: 'Messaggi', count: 0 }, { nome: 'Articoli salvati', count: savedArticles.length }, 
    { nome: 'Seguiti', count: followedGames.length + followedEvents.length + followedChannels.length },
    { nome: 'Giochi votati', count: votedGames.length }, { nome: 'Blacklist', count: 0 },
    { nome: 'Ban e Ammonizioni', count: 1 }, { nome: 'Commenti', count: userComments.length },
  ];

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex justify-center pb-10">
      <div className="w-full max-w-[1200px] flex flex-col shadow-2xl mt-8">
        
        {/* HEADER PROFILO */}
        <div className="flex flex-col md:flex-row h-auto md:h-[350px]">
          <div className="w-full md:w-[35%] bg-[#0f0f0f] flex flex-col items-center justify-center py-10 md:py-0 border-b md:border-b-0 md:border-r border-gray-800 relative z-10">
            <button 
              onClick={() => navigate('/impostazioni')}
              className="absolute top-4 -right-4 w-9 h-9 bg-[#ff4444] rounded-full flex items-center justify-center text-white z-20 hover:scale-110 transition-transform shadow-lg cursor-pointer border border-[#ff4444]"
              title="Impostazioni Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            
            <div className="relative mb-4">
              <div className="w-[120px] h-[120px] rounded-full border-[4px] border-dashed border-gray-600 bg-transparent flex items-center justify-center p-2">
                <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                     <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                     <img src={`https://ui-avatars.com/api/?name=${username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover" alt="Avatar di default" />
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 bg-[#00bfff] text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#0f0f0f]">6</div>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">{username}</h1>
          </div>
          <div className="w-full md:w-[65%] bg-[#c2c2c2] relative overflow-hidden flex items-center justify-center h-[200px] md:h-full z-0">
            <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-30 pointer-events-none p-4">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} className="text-white text-7xl font-black italic mr-8 mb-8">m</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[500px]">
          <div className="w-full md:w-[70%] bg-[#1a1a1a] p-6 md:p-10 border-r border-gray-800">
            {loading ? ( <p className="text-gray-400 text-center py-10 font-bold">Caricamento...</p> ) : (
              <>
                {activeTab === 'Bacheca' && <ProfiloBacheca bachecaMessages={bachecaMessages} newBachecaMessage={newBachecaMessage} setNewBachecaMessage={setNewBachecaMessage} handlePostBacheca={handlePostBacheca} formattaDataBacheca={formattaDataBacheca} />}
                {activeTab === 'Notifiche' && <ProfiloNotifiche notifiche={notifiche} markAllAsRead={markAllAsRead} handleNotificationClick={handleNotificationClick} timeAgo={timeAgo} />}
                {activeTab === 'Seguiti' && (
                  <ProfiloSeguiti followedGames={followedGames} handleUnfollow={handleUnfollow} followedEvents={followedEvents} handleUnfollowEvent={handleUnfollowEvent} followedChannels={followedChannels} handleUnfollowChannel={handleUnfollowChannel} formattaData={formattaData} navigate={navigate} />
                )}
                {activeTab === 'Giochi votati' && <ProfiloVotati votedGames={votedGames} navigate={navigate} />}
                {activeTab === 'Articoli salvati' && <ProfiloSalvati savedArticles={savedArticles} handleUnsaveArticle={handleUnsaveArticle} formattaData={formattaData} navigate={navigate} />}
                {activeTab === 'Commenti' && <ProfiloCommenti userComments={userComments} username={username} formattaData={formattaData} navigate={navigate} />}
              </>
            )}
          </div>

          <div className="w-full md:w-[30%] bg-[#222222] p-6">
            <button className="w-full border-2 border-gray-600 hover:border-[#ff4444] text-[#ff4444] font-bold text-[13px] py-3 rounded-sm transition-colors mb-8 shadow-md">Abbonati a Multiplayer.it Plus</button>
            <ul className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => setActiveTab(item.nome)} className="w-full flex items-center justify-between px-2 py-2 hover:bg-white/5 transition-colors group cursor-pointer outline-none">
                    <span className={`text-[13px] font-semibold transition-colors ${activeTab === item.nome ? 'text-[#ff4444]' : 'text-[#ff4444] opacity-90 group-hover:text-[#ff4444]'}`}>{item.nome}</span>
                    <span className="bg-[#e6c200] text-black text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm">{item.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}