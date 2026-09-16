import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImg } from '../utils/helpers';

// Icone per i voti
const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function PaginaProfilo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Bacheca');
  
  const [userComments, setUserComments] = useState([]);
  const [followedGames, setFollowedGames] = useState([]);
  const [notifiche, setNotifiche] = useState([]);
  const [votedGames, setVotedGames] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  
  // STATI PER LA BACHECA
  const [bachecaMessages, setBachecaMessages] = useState([]);
  const [newBachecaMessage, setNewBachecaMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [userDataId, setUserDataId] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "UtenteSconosciuto";

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;
      setLoading(true);

      const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();

      if (userData) {
        setUserDataId(userData.id);
        
        const { data: commentsData } = await supabase.from('commenti').select(`id, testo, data, id_articolo, articoli ( titolo )`).eq('id_utente', userData.id).order('data', { ascending: false });
        if (commentsData) setUserComments(commentsData);

        const { data: seguitiData } = await supabase.from('segui_giochi').select(`creato_il, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (seguitiData) setFollowedGames(seguitiData);

        const { data: notifData } = await supabase.from('notifiche').select('*').eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (notifData) setNotifiche(notifData);

        const { data: votiData } = await supabase.from('voti_giochi').select(`voto, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id);
        if (votiData) setVotedGames(votiData);

        const { data: salvatiData } = await supabase.from('articoli_salvati').select(`creato_il, id_articolo, articoli ( id, titolo, url_immagine, categorie(nome) )`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (salvatiData) setSavedArticles(salvatiData);

        // Fetch MESSAGGI BACHECA
        const { data: msgData } = await supabase
          .from('messaggi_bacheca')
          .select(`id, testo, creato_il, id_mittente, utenti!fk_mittente ( username )`)
          .eq('id_profilo', userData.id)
          .order('creato_il', { ascending: false });
        if (msgData) setBachecaMessages(msgData);
      }
      setLoading(false);
    }
    fetchProfileData();
  }, [user]);

  // Invio di un messaggio pubblico sulla bacheca
  const handlePostBacheca = async () => {
    if (!newBachecaMessage.trim() || !userDataId) return;
    const { data, error } = await supabase.from('messaggi_bacheca').insert([{
      id_profilo: userDataId, 
      id_mittente: userDataId, 
      testo: newBachecaMessage
    }]).select(`id, testo, creato_il, id_mittente, utenti!fk_mittente (username)`).single();

    if (!error && data) {
      setBachecaMessages([data, ...bachecaMessages]);
      setNewBachecaMessage('');
    }
  };

  const handleUnfollow = async (idGioco) => {
    if (!userDataId) return;
    setFollowedGames(prev => prev.filter(g => g.id_gioco !== idGioco));
    await supabase.from('segui_giochi').delete().eq('id_utente', userDataId).eq('id_gioco', idGioco);
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

  const menuItems = [
    { nome: 'Bacheca', count: bachecaMessages.length },
    { nome: 'Notifiche', count: notifiche.filter(n => !n.letta).length },
    { nome: 'Messaggi', count: 0 },
    { nome: 'Articoli salvati', count: savedArticles.length }, 
    { nome: 'Seguiti', count: followedGames.length },
    { nome: 'Giochi votati', count: votedGames.length }, 
    { nome: 'Blacklist', count: 0 },
    { nome: 'Ban e Ammonizioni', count: 1 },
    { nome: 'Commenti', count: userComments.length },
  ];

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

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex justify-center pb-10">
      <div className="w-full max-w-[1200px] flex flex-col shadow-2xl mt-8">
        
        {/* HEADER PROFILO */}
        <div className="flex flex-col md:flex-row h-auto md:h-[350px]">
          <div className="w-full md:w-[35%] bg-[#0f0f0f] flex flex-col items-center justify-center py-10 md:py-0 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="relative mb-4">
              <div className="w-[120px] h-[120px] rounded-full border-[4px] border-dashed border-gray-600 bg-transparent flex items-center justify-center p-2">
                <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute top-0 right-0 bg-[#00bfff] text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#0f0f0f]">6</div>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">{username}</h1>
          </div>
          <div className="w-full md:w-[65%] bg-[#c2c2c2] relative overflow-hidden flex items-center justify-center h-[200px] md:h-full">
            <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-30 pointer-events-none p-4">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} className="text-white text-7xl font-black italic mr-8 mb-8">m</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[500px]">
          <div className="w-full md:w-[70%] bg-[#1a1a1a] p-6 md:p-10 border-r border-gray-800">
            {loading ? ( <p className="text-gray-400 text-center py-10 font-bold">Caricamento...</p> ) : (
              <>
                
                {/* ===================== TAB: BACHECA (STYLE SCREENSHOT) ===================== */}
                {activeTab === 'Bacheca' && (
                  <div className="flex flex-col">
                    <h2 className="text-white font-black text-[28px] uppercase tracking-tight mb-6">Bacheca</h2>
                    
                    {/* Header Commenti & Regolamento */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4">
                      <div className="text-white font-black text-[13px] uppercase tracking-widest">
                        <span className="text-[#ff2020] mr-1">{bachecaMessages.length}</span> COMMENTI
                      </div>
                      <div className="text-[#ff2020] font-black text-[11px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                        REGOLAMENTO
                      </div>
                    </div>

                    {/* Input Nuovo Messaggio */}
                    <div className="bg-[#2a2a2a] p-1 rounded-sm mb-6 flex items-center border border-transparent focus-within:border-gray-500 transition-colors shadow-inner">
                      <input 
                        type="text"
                        placeholder="Lascia un commento..." 
                        className="w-full bg-transparent text-gray-200 p-2.5 outline-none text-[14px] font-medium placeholder-gray-500"
                        value={newBachecaMessage}
                        onChange={(e) => setNewBachecaMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePostBacheca();
                        }}
                      />
                    </div>

                    {/* Paginazione & Popolarità */}
                    <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-800">
                      <div className="flex gap-2">
                        <button className="w-6 h-6 rounded-full bg-[#ff2020] text-white text-[11px] font-bold flex items-center justify-center">1</button>
                        <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">2</button>
                        <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">3</button>
                        <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                        </button>
                      </div>
                      <button className="bg-[#ff4444] text-white text-[11px] font-black uppercase px-3 py-1.5 flex items-center gap-2 rounded-sm shadow-md hover:bg-red-600 transition-colors">
                        POPOLARITÀ
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                      </button>
                    </div>

                    {/* LISTA MESSAGGI (Stile Screenshot) */}
                    <div className="flex flex-col">
                      {bachecaMessages.length > 0 ? bachecaMessages.map(msg => (
                        <div key={msg.id} className="py-6 border-b border-gray-800 flex flex-col">
                          
                          {/* Header Messaggio: Avatar + Nome + Data + Voti */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden ${msg.id % 2 === 0 ? 'border-[#00bfff]' : 'border-[#ff2020]'}`}>
                                  <img src={`https://ui-avatars.com/api/?name=${msg.utenti?.username || 'User'}&background=2a2a2a&color=fff`} className="w-full h-full object-cover" />
                                </div>
                                <div className={`absolute -top-1 -right-1 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1a1a1a] ${msg.id % 2 === 0 ? 'bg-[#00bfff]' : 'bg-[#ff2020]'}`}>
                                  {msg.id % 2 === 0 ? '95' : 'm'}
                                </div>
                              </div>
                              <span className="text-white font-black text-[15px]">{msg.utenti?.username || 'Utente'}</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500 text-[13px] font-semibold">{formattaDataBacheca(msg.creato_il)}</span>
                              <div className="flex items-center gap-2 text-gray-400">
                                <button className="hover:text-green-500 transition-colors"><ThumbUp /></button>
                                {/* Simuliamo un voto positivo per estetica come da screen */}
                                {msg.id % 3 === 0 && <span className="bg-[#00c853] text-white rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center leading-none">9</span>}
                                <button className="hover:text-red-500 transition-colors"><ThumbDown /></button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Testo del Messaggio */}
                          <p className="text-gray-200 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{msg.testo}</p>
                          
                          {/* Azioni del Messaggio */}
                          <div className="flex items-center justify-between text-[13px] font-semibold">
                            <div className="flex gap-4 text-[#ff2020]">
                              <span className="cursor-pointer hover:text-white transition-colors">Rispondi</span>
                              <span className="cursor-pointer hover:text-white transition-colors">Permalink</span>
                            </div>
                            <span className="text-gray-500 cursor-pointer hover:text-white transition-colors">Segnala</span>
                          </div>

                        </div>
                      )) : (
                        <p className="text-gray-500 text-[14px] font-bold py-10 text-center">Nessun messaggio presente in bacheca. Scrivi qualcosa per iniziare!</p>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB: NOTIFICHE */}
                {activeTab === 'Notifiche' && (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                      <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Notifiche</h2>
                    </div>
                    <div className="flex justify-end mb-6">
                       <span onClick={markAllAsRead} className="text-[#ff2020] text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center gap-2">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Segna tutte come lette
                       </span>
                    </div>
                    <div className="flex flex-col">
                      {notifiche.length > 0 ? notifiche.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className="flex items-center justify-between border-b border-gray-800 py-4 cursor-pointer hover:bg-white/5 transition-colors px-2 rounded-sm group">
                          <div className="flex items-center gap-4">
                            {!n.letta ? (<div className="w-3 h-3 rounded-full border-2 border-[#ff2020] flex-shrink-0"></div>) : (<div className="w-3 h-3 rounded-full border-2 border-gray-600 flex-shrink-0"></div>)}
                            <span className="text-white font-bold text-[15px] group-hover:text-gray-200 transition-colors leading-snug">{n.testo}</span>
                          </div>
                          <span className="text-gray-500 text-[12px] font-bold ml-4 whitespace-nowrap">{timeAgo(n.creato_il)}</span>
                        </div>
                      )) : (<p className="text-gray-500 text-center py-10 font-bold">Non hai nessuna notifica.</p>)}
                    </div>
                  </>
                )}

                {/* TAB: SEGUITI */}
                {activeTab === 'Seguiti' && (
                   <>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-2"><h2 className="text-white font-black text-[22px] uppercase tracking-tight">Gestione Seguiti</h2></div>
                    <div className="flex flex-col">
                      {followedGames.length > 0 ? followedGames.map(segui => (
                        <div key={segui.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-5">
                          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${segui.id_gioco}`)}>
                            <img src={getImg(segui.giochi?.url_immagine)} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
                            <div className="flex flex-col"><span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{segui.giochi?.titolo}</span><span className="text-gray-300 text-[11px] font-black uppercase tracking-widest mt-1">Aggiunto ai preferiti il {formattaData(segui.creato_il)}</span></div>
                          </div>
                          <button onClick={() => handleUnfollow(segui.id_gioco)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors shadow-md text-center">Non<br/>Seguire</button>
                        </div>
                      )) : <p className="text-gray-500 text-center py-10 font-bold">Non segui ancora nessun gioco.</p>}
                    </div>
                  </>
                )}

                {/* TAB: GIOCHI VOTATI */}
                {activeTab === 'Giochi votati' && (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-2">
                      <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Giochi Votati</h2>
                    </div>
                    <div className="flex flex-col">
                      {votedGames.length > 0 ? votedGames.map(votoItem => (
                        <div key={votoItem.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-5 pr-4">
                          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${votoItem.id_gioco}`)}>
                            <img src={getImg(votoItem.giochi?.url_immagine)} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
                            <div className="flex flex-col"><span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{votoItem.giochi?.titolo}</span></div>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Il tuo voto</span>
                            <div className="w-10 h-10 rounded-full border-2 border-[#ff4444] text-white flex items-center justify-center font-black text-sm shadow-md bg-[#111]">
                              {parseFloat(votoItem.voto).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      )) : (<p className="text-gray-500 text-center py-10 font-bold">Non hai ancora votato nessun gioco.</p>)}
                    </div>
                  </>
                )}

                {/* TAB: ARTICOLI SALVATI */}
                {activeTab === 'Articoli salvati' && (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-2">
                      <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Articoli Salvati</h2>
                    </div>
                    <div className="flex flex-col">
                      {savedArticles.length > 0 ? savedArticles.map(salvato => (
                        <div key={salvato.id_articolo} className="flex items-center justify-between border-b border-gray-800 py-5 pr-4">
                          <div className="flex items-center gap-5 cursor-pointer group w-[80%]" onClick={() => navigate(`/articolo/${salvato.id_articolo}`)}>
                            <img src={getImg(salvato.articoli?.url_immagine)} className="w-[130px] h-[75px] object-cover rounded-sm shadow-md group-hover:opacity-80 transition-opacity flex-shrink-0" />
                            <div className="flex flex-col justify-center">
                              <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">{salvato.articoli?.categorie?.nome || 'Articolo'}</span>
                              <span className="text-white font-bold text-[15px] group-hover:text-[#ff4444] transition-colors leading-tight">{salvato.articoli?.titolo}</span>
                              <span className="text-gray-500 text-[10px] font-bold mt-1">SALVATO IL {formattaData(salvato.creato_il)}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleUnsaveArticle(salvato.id_articolo)} 
                            className="w-10 h-10 rounded-full border-2 border-[#ff2020] flex items-center justify-center text-[#ff2020] hover:bg-[#ff2020] hover:text-white transition-colors shadow-md flex-shrink-0"
                            title="Rimuovi dai salvati"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" width="16" height="16">
                              <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93.7c1 2.9 1.6 6 1.6 9.1c0 5.4-2.1 10.6-5.9 14.4s-9 5.9-14.4 5.9H208V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V335.4H21.6c-5.4 0-10.6-2.1-14.4-5.9s-5.9-9-5.9-14.4c0-3.1 .6-6.2 1.6-9.1c13.8-40.5 42.8-73.8 79.5-93.7L93.5 64H64C46.3 64 32 49.7 32 32z"/>
                            </svg>
                          </button>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-10 font-bold">Non hai salvato nessun articolo. Clicca su "Leggi Dopo" per aggiungerli qui.</p>
                      )}
                    </div>
                  </>
                )}

                {/* TAB: COMMENTI (Separati) */}
                {activeTab === 'Commenti' && (
                  <>
                    <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-8">I tuoi Commenti</h2>
                    {userComments.length > 0 ? (
                      <div className="flex flex-col">
                        {userComments.map(commento => (
                          <div key={commento.id} className="border-b border-gray-800 py-6 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-4">
                                <div className="relative"><div className="w-[52px] h-[52px] rounded-full border-[2px] border-[#ff4444] p-[2px] bg-[#111]"><img src={`https://ui-avatars.com/api/?name=${username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover rounded-full" /></div></div>
                                <div className="flex flex-col"><span className="text-white font-bold text-[15px]">{username}</span>{commento.articoli?.titolo && (<span className="text-gray-500 text-xs font-semibold mt-0.5">nell'articolo: <span className="text-gray-300">{commento.articoli.titolo}</span></span>)}</div>
                              </div>
                              <span className="text-gray-400 text-[13px] font-semibold">{formattaData(commento.data)}</span>
                            </div>
                            <p className="text-gray-200 text-[15px] font-medium mb-6 leading-relaxed ml-[68px] whitespace-pre-wrap">{commento.testo}</p>
                            <div className="flex justify-end"><button onClick={() => navigate(`/articolo/${commento.id_articolo}#commento-${commento.id}`)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-sm transition-colors shadow-md">Vai al commento</button></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-500 text-center py-10 font-bold">Non hai ancora scritto alcun commento.</p>}
                  </>
                )}

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