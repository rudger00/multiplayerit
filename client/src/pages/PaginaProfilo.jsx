import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImg } from '../utils/helpers';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#a0a0a0" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>
);

export default function PaginaProfilo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'Notifiche');
  
  const [userComments, setUserComments] = useState([]);
  const [followedGames, setFollowedGames] = useState([]);
  const [notifiche, setNotifiche] = useState([]);
  const [votedGames, setVotedGames] = useState([]); // Nuovo stato per i giochi votati
  
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
        
        // 1. Commenti
        const { data: commentsData } = await supabase.from('commenti').select(`id, testo, data, id_articolo, articoli ( titolo )`).eq('id_utente', userData.id).order('data', { ascending: false });
        if (commentsData) setUserComments(commentsData);

        // 2. Seguiti
        const { data: seguitiData } = await supabase.from('segui_giochi').select(`creato_il, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (seguitiData) setFollowedGames(seguitiData);

        // 3. Notifiche
        const { data: notifData } = await supabase.from('notifiche').select('*').eq('id_utente', userData.id).order('creato_il', { ascending: false });
        if (notifData) setNotifiche(notifData);

        // 4. Giochi Votati (NUOVO)
        const { data: votiData } = await supabase.from('voti_giochi').select(`voto, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', userData.id);
        if (votiData) setVotedGames(votiData);
      }
      setLoading(false);
    }
    fetchProfileData();
  }, [user]);

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

  const menuItems = [
    { nome: 'Bacheca', count: userComments.length },
    { nome: 'Notifiche', count: notifiche.filter(n => !n.letta).length },
    { nome: 'Messaggi', count: 0 },
    { nome: 'Articoli salvati', count: 0 },
    { nome: 'Seguiti', count: followedGames.length },
    { nome: 'Giochi votati', count: votedGames.length }, // Aggiornato con il vero count
    { nome: 'Blacklist', count: 0 },
    { nome: 'Ban e Ammonizioni', count: 1 },
    { nome: 'Commenti', count: userComments.length },
  ];

  const formattaData = (dataIso) => {
    if (!dataIso) return '';
    return new Date(dataIso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        
        {/* ===================== HEADER PROFILO ===================== */}
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
                {/* ===================== TAB: NOTIFICHE ===================== */}
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

                {/* ===================== TAB: SEGUITI ===================== */}
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

                {/* ===================== TAB: GIOCHI VOTATI (NUOVA) ===================== */}
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
                            <div className="flex flex-col">
                              <span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{votoItem.giochi?.titolo}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Il tuo voto</span>
                            <div className="w-10 h-10 rounded-full border-2 border-[#ff4444] text-white flex items-center justify-center font-black text-sm shadow-md bg-[#111]">
                              {parseFloat(votoItem.voto).toFixed(1)}
                            </div>
                          </div>

                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-10 font-bold">Non hai ancora votato nessun gioco.</p>
                      )}
                    </div>
                  </>
                )}

                {/* ===================== TAB: BACHECA E COMMENTI ===================== */}
                {(activeTab === 'Bacheca' || activeTab === 'Commenti') && (
                  <>
                    <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-8">{activeTab === 'Bacheca' ? 'Bacheca' : 'I tuoi Commenti'}</h2>
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