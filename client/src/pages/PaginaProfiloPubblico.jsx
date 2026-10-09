import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProfiloBacheca from '../components/profilo/ProfiloBacheca';
import ProfiloArticoli from '../components/profilo/ProfiloArticoli';
import ProfiloSeguiti from '../components/profilo/ProfiloSeguiti';
import ProfiloVotati from '../components/profilo/ProfiloVotati';
import ProfiloCommenti from '../components/profilo/ProfiloCommenti';

export default function PaginaProfiloPubblico() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, openModal } = useAuth();
  
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Bacheca');
  
  const [bachecaMessages, setBachecaMessages] = useState([]);
  const [newBachecaMessage, setNewBachecaMessage] = useState('');
  
  const [sortBacheca, setSortBacheca] = useState('recenti');
  const [reportingMsgId, setReportingMsgId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  const [hasBlocked, setHasBlocked] = useState(false);
  const [currentUserDataId, setCurrentUserDataId] = useState(null);

  const [userStats, setUserStats] = useState({ bacheca: 0, seguiti: 0, votati: 0, commenti: 0 });
  
  // Stati per i dati estratti
  const [writtenArticles, setWrittenArticles] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [followedGames, setFollowedGames] = useState([]);
  const [followedEvents, setFollowedEvents] = useState([]);
  const [followedChannels, setFollowedChannels] = useState([]);
  const [votedGames, setVotedGames] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function loadPageData() {
      setLoading(true);
      
      const { data: tUser } = await supabase
        .from('utenti')
        .select(`id, username, id_ruolo, profili ( avatar_url, gamertag_steam, gamertag_psn, gamertag_xbox )`)
        .ilike('username', username)
        .maybeSingle();

      if (tUser) {
        const prof = tUser.profili ? (Array.isArray(tUser.profili) ? tUser.profili[0] : tUser.profili) : {};
        setTargetUser({ ...tUser, profile: prof });

        // Bacheca
        const { data: msgData } = await supabase.from('messaggi_bacheca')
          .select(`id, testo, creato_il, id_mittente, upvotes, downvotes, utenti!fk_mittente ( username, profili (avatar_url) )`)
          .eq('id_profilo', tUser.id)
          .order('creato_il', { ascending: false });
        
        if (msgData) setBachecaMessages(msgData);

        // Articoli (se Admin o Redattore)
        if (tUser.id_ruolo === 1 || tUser.id_ruolo === 2) {
          const { data: artData } = await supabase
            .from('articoli')
            .select('id, titolo, sommario, url_immagine, creato_il, categorie(nome)')
            .eq('id_autore', tUser.id)
            .eq('stato', 'PUBLISHED')
            .order('creato_il', { ascending: false });
          if (artData) setWrittenArticles(artData);
        }

        // Estrazione Dati Reali
        const { data: commentsData } = await supabase.from('commenti').select(`id, testo, data, id_articolo, articoli ( titolo )`).eq('id_utente', tUser.id).order('data', { ascending: false });
        if (commentsData) setUserComments(commentsData);

        const { data: seguitiData } = await supabase.from('segui_giochi').select(`creato_il, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', tUser.id).order('creato_il', { ascending: false });
        if (seguitiData) setFollowedGames(seguitiData);

        const { data: eventiData } = await supabase.from('segui_eventi_live').select(`id_palinsesto, creato_il, palinsesto(giorno, orario, titolo)`).eq('id_utente', tUser.id).order('creato_il', { ascending: false });
        if (eventiData) setFollowedEvents(eventiData);

        const { data: canaliData } = await supabase.from('segui_canali').select('*').eq('id_utente', tUser.id).order('creato_il', { ascending: false });
        if (canaliData) setFollowedChannels(canaliData);

        const { data: votiData } = await supabase.from('voti_giochi').select(`voto, id_gioco, giochi ( id, titolo, url_immagine )`).eq('id_utente', tUser.id);
        if (votiData) setVotedGames(votiData);

        // Imposta Statistiche basate sulla lunghezza degli array
        setUserStats({
          bacheca: msgData ? msgData.length : 0,
          seguiti: (seguitiData?.length || 0) + (eventiData?.length || 0) + (canaliData?.length || 0),
          votati: votiData?.length || 0,
          commenti: commentsData?.length || 0
        });

        // Controllo loggato & Blacklist
        if (user) {
          const { data: cUser } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
          if (cUser) {
            setCurrentUserDataId(cUser.id);
            if (cUser.id === tUser.id) { navigate('/profilo'); return; }
            
            const { data: blData } = await supabase.from('blacklist').select('*').eq('id_utente', cUser.id).eq('id_bloccato', tUser.id).maybeSingle();
            if (blData) setHasBlocked(true);
          }
        }
      }
      setLoading(false);
    }
    
    loadPageData();
  }, [username, user, navigate]);

  const getMyId = async () => {
    if (currentUserDataId) return currentUserDataId;
    if (!user) return null;
    const { data } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (data) { setCurrentUserDataId(data.id); return data.id; }
    return null;
  };

  const clickMessaggio = () => {
    if (!user) { openModal(); return; }
    alert("I messaggi privati saranno attivati a breve!");
  };

  const clickSegnala = () => {
    if (!user) { openModal(); return; }
    setReportingMsgId(null);
    setShowReportModal(true);
  };

  const clickBlocca = async () => {
    if (!user) { openModal(); return; }
    const myId = await getMyId();
    if (!myId || !targetUser) return;

    if (hasBlocked) {
      if(!window.confirm(`Vuoi sbloccare ${targetUser.username}?`)) return;
      const { error } = await supabase.from('blacklist').delete().eq('id_utente', myId).eq('id_bloccato', targetUser.id);
      if (error) alert("Errore del server: " + error.message);
      else { setHasBlocked(false); alert("Utente sbloccato con successo!"); }
    } else {
      if(!window.confirm(`Vuoi bloccare ${targetUser.username}? Non potrai più vedere la sua bacheca.`)) return;
      const { error } = await supabase.from('blacklist').insert([{ id_utente: myId, id_bloccato: targetUser.id }]);
      if (error) alert("Errore del server: " + error.message);
      else { setHasBlocked(true); alert("Utente bloccato."); }
    }
  };

  const eseguiSegnalazione = async () => {
    if (!reportReason.trim()) { alert("Devi inserire un motivo."); return; }
    const myId = await getMyId();
    if (!myId) return;

    const testoFinale = reportingMsgId 
      ? `[Segnalazione Messaggio ID ${reportingMsgId}] ${reportReason}`
      : `[Segnalazione Utente] ${reportReason}`;

    const { error } = await supabase.from('segnalazioni').insert([{ 
      id_segnalatore: myId, 
      tipo: 'UTENTE', 
      id_utente_segnalato: targetUser.id,
      motivo: testoFinale 
    }]);

    if (error) {
      alert("Errore del server: " + error.message);
    } else {
      alert("Segnalazione inviata allo staff con successo.");
      setShowReportModal(false);
      setReportReason('');
      setReportingMsgId(null);
    }
  };

  const handleVoteBacheca = async (msgId, voteValue) => {
    if (!user) { openModal(); return; }
    const myId = await getMyId();
    if (!myId) return;
    
    await supabase.from('bacheca_voti').upsert({ id_messaggio: msgId, id_utente: myId, voto: voteValue }, { onConflict: 'id_messaggio, id_utente' });
    
    const { data: allVotes } = await supabase.from('bacheca_voti').select('voto').eq('id_messaggio', msgId);
    let newUp = 0; let newDown = 0;
    allVotes?.forEach(v => { if (v.voto === 1) newUp++; else if (v.voto === -1) newDown++; });

    await supabase.from('messaggi_bacheca').update({ upvotes: newUp, downvotes: newDown }).eq('id', msgId);
    setBachecaMessages(prev => prev.map(m => m.id === msgId ? { ...m, upvotes: newUp, downvotes: newDown } : m));
  };

  const handlePostBacheca = async () => {
    if (!user) { openModal(); return; }
    const myId = await getMyId();
    if (!newBachecaMessage.trim() || !myId || !targetUser) return;
    
    if (hasBlocked) { alert("Hai bloccato questo utente. Sbloccalo per poter scrivere."); return; }

    const { data, error } = await supabase.from('messaggi_bacheca')
      .insert([{ id_profilo: targetUser.id, id_mittente: myId, testo: newBachecaMessage }])
      .select(`id, testo, creato_il, id_mittente, upvotes, downvotes, utenti!fk_mittente (username, profili (avatar_url))`).single();
      
    if (error) { alert("Errore: " + error.message); return; }
    
    if (data) {
      setBachecaMessages([data, ...bachecaMessages]);
      setNewBachecaMessage('');
      setUserStats(prev => ({...prev, bacheca: prev.bacheca + 1}));
    }
  };

  const formattaData = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const m = d.toLocaleDateString('it-IT', { month: 'long' });
    return `${d.getDate()} ${m.charAt(0).toUpperCase() + m.slice(1)} ${d.getFullYear()}`;
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Caricamento profilo...</div>;
  if (!targetUser) return <div className="text-white text-center py-20 font-bold text-2xl">Utente non trovato.</div>;

  const prof = targetUser.profile;
  const initName = targetUser.username.substring(0, 2).toUpperCase();

  const menuItems = [
    { nome: 'Bacheca', count: userStats.bacheca }
  ];
  if (targetUser.id_ruolo === 1 || targetUser.id_ruolo === 2) {
    menuItems.push({ nome: 'Articoli', count: writtenArticles.length });
  }
  menuItems.push(
    { nome: 'Seguiti', count: userStats.seguiti },
    { nome: 'Giochi votati', count: userStats.votati }, 
    { nome: 'Commenti', count: userStats.commenti }
  );

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex flex-col items-center pb-10">
      
      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] w-full max-w-[850px] flex flex-col shadow-2xl border border-gray-800 relative">
            <button onClick={() => {setShowReportModal(false); setReportReason(''); setReportingMsgId(null);}} className="absolute top-4 right-6 text-gray-500 hover:text-white text-2xl">&times;</button>
            <div className="p-8 text-center pb-6">
              <h2 className="text-[#ff4444] font-black text-[22px] tracking-widest uppercase">Segnala {reportingMsgId ? 'Messaggio' : 'Utente'}</h2>
            </div>
            {!reportingMsgId && (
              <div className="px-10 pb-4 text-gray-200 text-[15px] leading-loose flex flex-col gap-4">
                <p>Se l'utente ti importuna puoi bloccarlo toccando il lucchetto presente nella sua bacheca.</p>
                <p>In questo modo non potrà inviarti messaggi privati, né citarti nei commenti, non avrà accesso alla tua bacheca e non riceverai alcuna notifica che lo riguarda.</p>
                <p className="mt-2 text-white font-bold">Se invece vuoi proseguire, allora puoi descrivere il problema e cliccare questo pulsante:</p>
              </div>
            )}
            <div className="px-10 pb-6">
               <textarea 
                 value={reportReason} 
                 onChange={(e) => setReportReason(e.target.value)} 
                 placeholder="Motivo della segnalazione (obbligatorio per lo staff)..." 
                 className="w-full h-32 bg-[#2a2a2a] text-white p-4 outline-none border border-gray-700 focus:border-[#ff2020] resize-none"
               ></textarea>
            </div>
            <div className="flex justify-between items-center px-10 pb-10">
              <button onClick={() => {setShowReportModal(false); setReportReason(''); setReportingMsgId(null);}} className="text-[#ff4444] border border-[#ff4444] px-8 py-2.5 text-[14px] font-medium tracking-wide hover:bg-[#ff4444]/10 transition-colors">Chiudi</button>
              <button onClick={eseguiSegnalazione} className="bg-[#ff4444] text-white px-8 py-2.5 text-[14px] font-medium tracking-wide hover:bg-red-600 transition-colors">Segnala</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1200px] flex flex-col mt-8 shadow-2xl relative">

        <div className="relative w-full flex flex-col md:flex-row h-auto md:h-[350px] bg-[#1a1a1a]">
          
          <div className="w-full md:w-[35%] bg-[#0f0f0f] flex flex-col items-center justify-center py-10 border-b md:border-b-0 border-gray-800 relative z-20 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
            
            <div className="absolute bottom-0 translate-y-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-0 md:translate-x-1/2 flex flex-row md:flex-col gap-3 z-[999] pointer-events-auto">
              
              <button onClick={clickMessaggio} className="w-9 h-9 bg-[#ff4444] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer border-none" title="Invia Messaggio">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </button>
              
              <button onClick={clickSegnala} className="w-9 h-9 bg-[#ff4444] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer border-none" title="Segnala Utente">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </button>
              
              <div className="relative group/lock flex items-center">
                <button onClick={clickBlocca} className={`w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer border-none relative z-10 ${hasBlocked ? 'bg-[#ff2020] ring-2 ring-white' : 'bg-[#ff4444]'}`} title="Blocca/Sblocca">
                  {hasBlocked ? (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><line x1="9" y1="14" x2="15" y2="19"></line><line x1="15" y1="14" x2="9" y2="19"></line></svg>
                  ) : (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  )}
                </button>
                {hasBlocked && (
                  <div className="absolute hidden md:flex left-full ml-3 top-1/2 -translate-y-1/2 bg-[#ff2020] text-white px-3 py-1.5 text-xs font-bold whitespace-nowrap rounded-sm opacity-0 group-hover/lock:opacity-100 pointer-events-none z-0 transition-opacity">
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-[#ff2020] border-b-4 border-b-transparent"></div>
                    Sblocca utente
                  </div>
                )}
              </div>

            </div>

            <div className="relative mb-6">
              <div className="w-[120px] h-[120px] rounded-full border-[2px] border-dashed border-[#00bfff] bg-transparent flex items-center justify-center p-1.5">
                <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden border border-gray-800">
                  {prof.avatar_url ? (
                     <img src={prof.avatar_url} className="w-full h-full object-cover" alt="Foto Profilo" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  ) : null}
                  <span className="text-white text-4xl font-light tracking-widest w-full h-full items-center justify-center" style={{ display: prof.avatar_url ? 'none' : 'flex' }}>{initName}</span>
                </div>
              </div>

              <div className="absolute top-0 right-0 bg-[#00bfff] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0f0f0f]">
                92
              </div>
            </div>
            
            <h1 className="text-white text-2xl font-bold tracking-tight border-b-2 border-[#e6c200] pb-1 px-4 mb-4">
              {targetUser.username} <span className="text-[#e6c200]">+</span>
            </h1>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-400">
              {prof.gamertag_steam && <span>STEAM | <span className="text-white">{prof.gamertag_steam}</span></span>}
              {prof.gamertag_xbox && <span>XBOX | <span className="text-white">{prof.gamertag_xbox}</span></span>}
              {prof.gamertag_psn && <span>PLAYSTATION | <span className="text-white">{prof.gamertag_psn}</span></span>}
            </div>
          </div>
          
          <div className="w-full md:w-[65%] bg-[#c2c2c2] relative overflow-hidden flex items-center justify-center h-[200px] md:h-full z-0">
            <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-30 pointer-events-none p-4">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} className="text-white text-7xl font-black italic mr-8 mb-8">m</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[500px]">
          {hasBlocked ? (
            <div className="w-full bg-[#1a1a1a] p-20 text-center flex flex-col items-center justify-center border-t border-r border-gray-800">
               <span className="text-6xl mb-6">🚫</span>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Utente Bloccato</h2>
               <p className="text-gray-400">Hai bloccato questo utente. Sbloccalo dal lucchetto per vedere la sua bacheca.</p>
            </div>
          ) : (
            <div className="w-full md:w-[70%] bg-[#1a1a1a] p-6 md:p-10 border-r border-t border-gray-800">
              
              {activeTab === 'Bacheca' && (
                <ProfiloBacheca 
                  bachecaMessages={bachecaMessages} 
                  newBachecaMessage={newBachecaMessage} 
                  setNewBachecaMessage={setNewBachecaMessage} 
                  handlePostBacheca={handlePostBacheca} 
                  formattaDataBacheca={formattaData} 
                  sortBacheca={sortBacheca}
                  setSortBacheca={setSortBacheca}
                  handleVoteBacheca={handleVoteBacheca}
                  onOpenReport={(id) => {setReportingMsgId(id); setShowReportModal(true);}}
                />
              )}
              
              {activeTab === 'Articoli' && <ProfiloArticoli articles={writtenArticles} />}
              
              {activeTab === 'Seguiti' && (
                <ProfiloSeguiti followedGames={followedGames} followedEvents={followedEvents} followedChannels={followedChannels} formattaData={formattaData} navigate={navigate} />
              )}
              
              {activeTab === 'Giochi votati' && (
                <ProfiloVotati votedGames={votedGames} navigate={navigate} />
              )}
              
              {activeTab === 'Commenti' && (
                <ProfiloCommenti userComments={userComments} username={targetUser.username} avatarUrl={prof.avatar_url} formattaData={formattaData} navigate={navigate} />
              )}
              
            </div>
          )}

          <div className="w-full md:w-[30%] bg-[#222222] p-6 border-t border-gray-800">
            <ul className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => setActiveTab(item.nome)} className="w-full flex items-center justify-between px-2 py-3 border-b border-gray-800/50 hover:bg-white/5 transition-colors group cursor-pointer outline-none">
                    <span className={`text-[13px] font-semibold transition-colors ${activeTab === item.nome ? 'text-[#ff4444]' : 'text-[#ff4444] opacity-90 group-hover:text-[#ff4444]'}`}>
                      {item.nome}
                    </span>
                    <span className="bg-[#e6c200] text-black text-[10px] font-black px-2 py-0.5 rounded-sm">
                      {item.count}
                    </span>
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