import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImg } from '../utils/helpers';

// Icone vettoriali per i pulsanti laterali
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 4l10 8 10-8"></path></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default function PaginaUtente() {
  const { username } = useParams();
  const { user, openModal } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Bacheca');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stati per le attività dell'utente visitato
  const [bachecaMessages, setBachecaMessages] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [followedGames, setFollowedGames] = useState([]);
  const [votedGames, setVotedGames] = useState([]);
  
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchPublicProfile() {
      setLoading(true);

      // CONTROLLO: Se lo username cliccato è uguale al TUO username, ti rimanda alla TUA pagina privata
      const myUsername = user?.user_metadata?.username || user?.email?.split('@')[0];
      if (myUsername && myUsername.toLowerCase() === username.toLowerCase()) {
        navigate('/profilo', { replace: true });
        return; // Ferma l'esecuzione del codice qui
      }
      
      // Altrimenti, cerca l'utente pubblico in base allo username passato nell'URL
      const { data: utenteTrovato, error } = await supabase
        .from('utenti')
        .select('id, username')
        .eq('username', username)
        .maybeSingle();

      if (utenteTrovato) {
        setTargetUser(utenteTrovato);
        
        // Carica Bacheca
        const { data: msgData } = await supabase.from('messaggi_bacheca').select(`id, testo, creato_il, id_mittente, utenti!fk_mittente ( username )`).eq('id_profilo', utenteTrovato.id).order('creato_il', { ascending: false });
        if (msgData) setBachecaMessages(msgData);

        // Carica Commenti
        const { data: commentsData } = await supabase.from('commenti').select(`id, testo, data, id_articolo, articoli ( titolo )`).eq('id_utente', utenteTrovato.id).order('data', { ascending: false });
        if (commentsData) setUserComments(commentsData);

        // Carica Seguiti
        const { data: seguitiData } = await supabase.from('segui_giochi').select(`creato_il, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', utenteTrovato.id).order('creato_il', { ascending: false });
        if (seguitiData) setFollowedGames(seguitiData);

        // Carica Voti
        const { data: votiData } = await supabase.from('voti_giochi').select(`voto, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', utenteTrovato.id);
        if (votiData) setVotedGames(votiData);
      }
      setLoading(false);
    }
    fetchPublicProfile();
  }, [username, user, navigate]);

  // Invio messaggio sulla bacheca dell'utente visitato
  const handlePostBacheca = async () => {
    if (!newMessage.trim() || !targetUser) return;
    if (!user) { openModal(); return; }

    const { data: myData } = await supabase.from('utenti').select('id, username').eq('id_auth', user.id).maybeSingle();
    if (myData) {
      const { data, error } = await supabase.from('messaggi_bacheca').insert([{
        id_profilo: targetUser.id, 
        id_mittente: myData.id, 
        testo: newMessage
      }]).select(`id, testo, creato_il, id_mittente, utenti!fk_mittente (username)`).single();

      if (!error && data) {
        setBachecaMessages([data, ...bachecaMessages]);
        setNewMessage('');
      }
    }
  };

  const menuItems = [
    { nome: 'Bacheca', count: bachecaMessages.length },
    { nome: 'Seguiti', count: followedGames.length },
    { nome: 'Giochi votati', count: votedGames.length },
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
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Caricamento profilo...</div>;
  if (!targetUser) return <div className="text-white text-center py-20 font-bold">Utente non trovato.</div>;

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex justify-center pb-10">
      <div className="w-full max-w-[1200px] flex flex-col shadow-2xl mt-8">
        
        {/* ===================== HEADER PROFILO ===================== */}
        <div className="flex flex-col md:flex-row h-auto md:h-[350px]">
          
          <div className="w-full md:w-[35%] bg-[#0f0f0f] flex flex-col items-center justify-center py-10 md:py-0 relative z-10">
            <div className="relative mb-6">
              <div className="w-[110px] h-[110px] rounded-full border-[3px] border-[#00bfff] bg-[#1a1a1a] flex items-center justify-center p-1 border-dashed">
                <img src={`https://ui-avatars.com/api/?name=${targetUser.username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover rounded-full" alt="Avatar" />
              </div>
              <div className="absolute top-2 -right-2 bg-[#00bfff] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-[3px] border-[#0f0f0f]">
                92
              </div>
            </div>
            
            <div className="flex items-center gap-1 border-b-2 border-[#d4b94a] pb-1">
              <h1 className="text-white text-2xl font-black tracking-tight">{targetUser.username}</h1>
              <span className="text-[#d4b94a] text-2xl font-black leading-none">+</span>
            </div>

            {/* BOTTONI FLUTTUANTI */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <button className="w-9 h-9 rounded-full bg-[#ff4444] text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-[#ff4444] transition-colors" title="Invia un messaggio">
                <MailIcon />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#ff4444] text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-[#ff4444] transition-colors" title="Segnala utente">
                <AlertIcon />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#ff4444] text-white flex items-center justify-center shadow-lg hover:bg-white hover:text-[#ff4444] transition-colors" title="Blocca utente">
                <LockIcon />
              </button>
            </div>
          </div>

          <div className="w-full md:w-[65%] bg-[#c2c2c2] relative overflow-hidden flex items-center justify-center h-[200px] md:h-full z-0">
            <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-40 pointer-events-none p-4">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} className="text-white text-7xl font-black italic mr-8 mb-8">m</span>)}
            </div>
          </div>
        </div>

        {/* ===================== CONTENUTO INFERIORE ===================== */}
        <div className="flex flex-col md:flex-row min-h-[500px]">
          
          <div className="w-full md:w-[70%] bg-[#1a1a1a] p-6 md:p-10 border-r border-gray-800">
            
            {/* ===================== TAB: BACHECA ===================== */}
            {activeTab === 'Bacheca' && (
              <div className="flex flex-col">
                <h2 className="text-white font-black text-[28px] uppercase tracking-tight mb-6">Bacheca</h2>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4">
                  <div className="text-white font-black text-[13px] uppercase tracking-widest">
                    <span className="text-[#ff2020] mr-1">{bachecaMessages.length}</span> COMMENTI
                  </div>
                  <div className="text-[#ff2020] font-black text-[11px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                    REGOLAMENTO
                  </div>
                </div>

                <div className="bg-[#2a2a2a] p-1 rounded-sm mb-6 flex items-center border border-transparent focus-within:border-gray-500 transition-colors shadow-inner">
                  <input 
                    type="text"
                    placeholder={`Lascia un commento sulla bacheca di ${targetUser.username}...`} 
                    className="w-full bg-transparent text-gray-200 p-2.5 outline-none text-[14px] font-medium placeholder-gray-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePostBacheca(); }}
                  />
                </div>

                <div className="flex flex-col">
                  {bachecaMessages.length > 0 ? bachecaMessages.map(msg => (
                    <div key={msg.id} className="py-6 border-b border-gray-800 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full border-2 overflow-hidden ${msg.id % 2 === 0 ? 'border-[#00bfff]' : 'border-[#ff2020]'}`}>
                            <img src={`https://ui-avatars.com/api/?name=${msg.utenti?.username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover" />
                          </div>
                          <Link to={`/utente/${msg.utenti?.username}`} className="text-white font-black text-[15px] hover:text-[#ff2020] transition-colors">
                            {msg.utenti?.username}
                          </Link>
                        </div>
                        <span className="text-gray-500 text-[13px] font-semibold">{formattaDataBacheca(msg.creato_il)}</span>
                      </div>
                      <p className="text-gray-200 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{msg.testo}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-[14px] font-bold py-10 text-center">Nessun messaggio presente in bacheca.</p>
                  )}
                </div>
              </div>
            )}

            {/* ===================== TAB: SEGUITI ===================== */}
            {activeTab === 'Seguiti' && (
              <>
                <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-4 mb-2">Giochi Seguiti da {targetUser.username}</h2>
                <div className="flex flex-col">
                  {followedGames.length > 0 ? followedGames.map(segui => (
                    <div key={segui.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-5">
                      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${segui.id_gioco}`)}>
                        <img src={getImg(segui.giochi?.url_immagine)} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
                        <div className="flex flex-col">
                          <span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{segui.giochi?.titolo}</span>
                          <span className="text-gray-300 text-[11px] font-black uppercase tracking-widest mt-1">Aggiunto ai preferiti il {formattaData(segui.creato_il)}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-center py-10 font-bold">{targetUser.username} non segue ancora nulla.</p>}
                </div>
              </>
            )}

            {/* ===================== TAB: GIOCHI VOTATI ===================== */}
            {activeTab === 'Giochi votati' && (
              <>
                <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-4 mb-2">Giochi Votati da {targetUser.username}</h2>
                <div className="flex flex-col">
                  {votedGames.length > 0 ? votedGames.map(votoItem => (
                    <div key={votoItem.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-5 pr-4">
                      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${votoItem.id_gioco}`)}>
                        <img src={getImg(votoItem.giochi?.url_immagine)} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
                        <div className="flex flex-col"><span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{votoItem.giochi?.titolo}</span></div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Voto</span>
                        <div className="w-10 h-10 rounded-full border-2 border-[#ff4444] text-white flex items-center justify-center font-black text-sm shadow-md bg-[#111]">
                          {parseFloat(votoItem.voto).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  )) : (<p className="text-gray-500 text-center py-10 font-bold">{targetUser.username} non ha ancora votato nessun gioco.</p>)}
                </div>
              </>
            )}

            {/* ===================== TAB: COMMENTI ===================== */}
            {activeTab === 'Commenti' && (
              <>
                <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-4 mb-2">I Commenti di {targetUser.username}</h2>
                {userComments.length > 0 ? (
                  <div className="flex flex-col">
                    {userComments.map(commento => (
                      <div key={commento.id} className="border-b border-gray-800 py-6 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-[52px] h-[52px] rounded-full border-[2px] border-[#ff4444] p-[2px] bg-[#111]">
                                <img src={`https://ui-avatars.com/api/?name=${targetUser.username}&background=2a2a2a&color=fff`} className="w-full h-full object-cover rounded-full" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-[15px]">{targetUser.username}</span>
                              {commento.articoli?.titolo && (
                                <span className="text-gray-500 text-xs font-semibold mt-0.5">
                                  nell'articolo: <Link to={`/articolo/${commento.id_articolo}`} className="text-gray-300 hover:text-[#ff2020] transition-colors">{commento.articoli.titolo}</Link>
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-400 text-[13px] font-semibold">{formattaData(commento.data)}</span>
                        </div>
                        <p className="text-gray-200 text-[15px] font-medium mb-6 leading-relaxed ml-[68px] whitespace-pre-wrap">{commento.testo}</p>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => navigate(`/articolo/${commento.id_articolo}#commento-${commento.id}`)} 
                            className="bg-[#2a2a2a] border border-gray-700 hover:bg-[#ff4444] hover:border-transparent text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-sm transition-colors shadow-md"
                          >
                            Vai al commento
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-center py-10 font-bold">{targetUser.username} non ha ancora scritto alcun commento.</p>}
              </>
            )}

          </div>

          <div className="w-full md:w-[30%] bg-[#222222] p-6">
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