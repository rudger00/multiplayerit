import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { apiUrl } from '../../utils/api';

const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function SezioneCommenti({
  commentsList, newCommentText, setNewCommentText, replyingTo, setReplyingTo,
  isSubmitting, handlePostComment, handleVote, handleReplyClick,
  formatCommentDate, commentInputRef, user, openModal, 
  isBanned
}) {
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [reportText, setReportText] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('popolarita');
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myBlacklist, setMyBlacklist] = useState([]);

  useEffect(() => {
    async function checkAdminAndBlacklist() {
      if (user) {
        const { data: uData } = await supabase.from('utenti').select('id, id_ruolo').eq('id_auth', user.id).maybeSingle();
        if (uData) {
          setCurrentUserId(uData.id); 
          if (uData.id_ruolo === 1) setIsAdmin(true);
          
          const { data: bl } = await supabase.from('blacklist').select('id_bloccato').eq('id_utente', uData.id);
          if (bl) setMyBlacklist(bl.map(b => b.id_bloccato));
        }
      } else {
        setCurrentUserId(null);
      }
    }
    checkAdminAndBlacklist();
  }, [user]);

  const handleWarn = async (idUtente) => {
    if(!window.confirm("Assegnare un cartellino giallo a questo utente? (Al raggiungimento di 3 ammonizioni verrà bannato in automatico)")) return;
    
    const { data } = await supabase.from('utenti').select('ammonizioni').eq('id', idUtente).single();
    const current = data?.ammonizioni || 0;

    try {
      // 1. Recupero il token della sessione attuale di Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      // 2. Mando la richiesta al server allegando il token per superare il buttafuori
      await fetch(apiUrl('/api/admin/users/warn'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ id_utente: idUtente, current_warns: current })
      });

      if (current === 1) {
        alert("L'utente aveva già un cartellino. È stato BANNATO definitivamente.");
      } else {
        alert("Utente ammonito con successo.");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore di connessione al server.");
    }
  };

  const handleBan = async (idUtente) => {
    if(!window.confirm("Sei sicuro di voler BANNARE DEFINITIVAMENTE questo utente?")) return;
    
    try {
      // 1. Recupero il token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      // 2. Mando la richiesta sicura
      await fetch(apiUrl('/api/admin/users/toggle-ban'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_utente: idUtente, is_banned: false }) 
      });
      
      alert("Utente bannato dal sito.");
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore di connessione al server.");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim() || !user || !reportingCommentId) return;
    setIsReporting(true);
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const payload = { id_segnalatore: userData.id, tipo: 'COMMENTO', id_commento_segnalato: reportingCommentId, motivo: reportText };
      const { error } = await supabase.from('segnalazioni').insert([payload]);
      if (!error) { alert("Segnalazione inviata con successo."); setReportText(''); setReportingCommentId(null); }
    }
    setIsReporting(false);
  };

  const handleBlockUser = async (idDaBloccare, usernameDaBloccare) => {
    if(!window.confirm(`Vuoi aggiungere ${usernameDaBloccare} alla tua Blacklist? I suoi commenti verranno oscurati.`)) return;
    const { data: uData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (uData) {
      await supabase.from('blacklist').insert([{ id_utente: uData.id, id_bloccato: idDaBloccare }]);
      setMyBlacklist([...myBlacklist, idDaBloccare]);
      alert("Utente bloccato con successo!");
    }
  };

  const getScore = (up, down) => (up || 0) - (down || 0);

  const sortedComments = [...commentsList].sort((a, b) => {
    if (sortOrder === 'recenti') return new Date(b.data) - new Date(a.data);
    const scoreA = getScore(a.upvotes, a.downvotes);
    const scoreB = getScore(b.upvotes, b.downvotes);
    return scoreB - scoreA;
  });

  return (
    <div className="mt-16 border-t border-[#1a1a1a] pt-8 bg-[#111111] animate-fadeIn">
      
      {/* HEADER COMMENTI */}
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-[18px] font-black text-white uppercase tracking-tight">
          <span className="text-[#ff4444] mr-1">{commentsList.length}</span> COMMENTI
        </h3>
        <a href="/regolamento" className="text-[#ff4444] font-black text-[12px] uppercase tracking-widest hover:text-white transition-colors">
          REGOLAMENTO
        </a>
      </div>

      {reportingCommentId && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] w-full max-w-[600px] border border-gray-800 p-8 relative shadow-2xl">
            <button onClick={() => setReportingCommentId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl">&times;</button>
            <h2 className="text-[#ff2020] font-black text-center text-sm tracking-widest uppercase mb-4">Segnala Commento</h2>
            <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full h-40 bg-[#333333] border-none outline-none text-white p-4 resize-none mb-6 font-medium"></textarea>
            <div className="flex justify-end">
              <button onClick={handleReportSubmit} disabled={isReporting || !reportText.trim()} className="bg-[#ff4444] text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-600 disabled:opacity-50">{isReporting ? 'Invio...' : 'Segnala'}</button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT COMMENTO */}
      <div ref={commentInputRef} className="mb-6 relative">
        <div className="bg-[#2a2a2a] p-1 rounded-sm flex items-center border border-transparent focus-within:border-gray-500 transition-colors shadow-inner h-[50px] relative pr-[80px]">
          <input 
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={isBanned ? "🚫 BANNATO." : (user ? "Lascia un commento..." : "Accedi per commentare")}
            disabled={!user || isBanned}
            className="w-full h-full bg-transparent text-gray-200 px-3 outline-none text-[15px] font-medium placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePostComment();
            }}
          />
          <div className="absolute right-1 top-1 bottom-1 flex flex-col items-center justify-center gap-1 border-l border-[#1a1a1a] px-2 bg-[#2a2a2a]">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="text-gray-500 hover:text-white cursor-pointer" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/></svg>
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="text-gray-500 hover:text-white cursor-pointer" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/></svg>
          </div>
        </div>
      </div>

      {/* RIGA FILTRI E IMPAGINAZIONE */}
      <div className="flex items-center justify-between pb-6 border-b border-[#1a1a1a] mb-6">
        <div className="flex gap-2 items-center">
          <button className="w-8 h-8 rounded-full bg-[#ff4444] text-white text-[13px] font-bold flex items-center justify-center shadow-md">1</button>
          <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-400 text-[13px] font-bold flex items-center justify-center hover:border-[#ff4444] hover:text-[#ff4444] transition-colors">2</button>
          <span className="text-gray-500 text-[12px] font-bold">...</span>
          <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-400 text-[13px] font-bold flex items-center justify-center hover:border-[#ff4444] hover:text-[#ff4444] transition-colors">10</button>
          <button className="w-8 h-8 rounded-full border border-[#ff4444] text-[#ff4444] text-[13px] font-bold flex items-center justify-center hover:bg-[#ff4444] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="bg-[#ff4444] text-white text-[11px] font-black uppercase px-4 py-2 flex items-center gap-2 rounded-sm shadow-md hover:bg-red-600 transition-colors"
          >
            {sortOrder === 'recenti' ? 'DATA' : 'POPOLARITÀ'}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className={`transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
          </button>

          {isSortMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-gray-800 shadow-2xl z-50 flex flex-col">
              <button 
                onClick={() => { setSortOrder('popolarita'); setIsSortMenuOpen(false); }} 
                className={`text-left px-4 py-2.5 text-[11px] font-black uppercase transition-colors hover:bg-white/5 ${sortOrder === 'popolarita' ? 'text-[#ff4444]' : 'text-gray-300'}`}
              >
                Popolarità
              </button>
              <button 
                onClick={() => { setSortOrder('recenti'); setIsSortMenuOpen(false); }} 
                className={`text-left px-4 py-2.5 text-[11px] font-black uppercase transition-colors hover:bg-white/5 ${sortOrder === 'recenti' ? 'text-[#ff4444]' : 'text-gray-300'}`}
              >
                Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {sortedComments.map(comment => {
          const score = getScore(comment.upvotes, comment.downvotes);
          const isPositive = score >= 0;
          
          const profiliData = comment.utenti?.profili;
          const avatarUrl = Array.isArray(profiliData) ? profiliData[0]?.avatar_url : profiliData?.avatar_url;
          const finalAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${comment.utenti?.username || 'User'}&background=2a2a2a&color=fff`;

          const isBlocked = myBlacklist.includes(comment.id_utente);
          const isMyComment = currentUserId === comment.id_utente;

          if (isBlocked) {
            return (
              <div key={comment.id} className="py-4 border-b border-[#1a1a1a] flex items-center justify-between px-4 opacity-50 mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">🚫 Commento nascosto (Utente bloccato)</span>
              </div>
            );
          }

          return (
            <div key={comment.id} id={`commento-${comment.id}`} className={`py-6 border-b border-[#1a1a1a] flex flex-col ${comment.id_commento_padre ? 'ml-12 pl-4 border-l border-l-[#1a1a1a]' : ''}`}>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <a href={`/utente/${comment.utenti?.username}`}>
                      <div className="w-14 h-14 rounded-full border-[2px] border-dashed border-[#00bfff] p-0.5 flex items-center justify-center cursor-pointer">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#222]">
                          <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </a>
                    <div className="absolute top-0 -right-1 bg-[#00bfff] text-white text-[10px] font-black w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-[#111111]">
                      88
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <a href={`/utente/${comment.utenti?.username}`} className="text-white font-bold text-[16px] hover:text-[#ff4444] transition-colors cursor-pointer">
                        {comment.utenti?.username}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-[13px]">{formatCommentDate(comment.data)}</span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <button onClick={() => handleVote(comment.id, 1)} className="hover:text-white transition-colors"><ThumbUp /></button>
                    
                    <div className="relative flex items-center justify-center">
                       <svg width="28" height="28" viewBox="0 0 24 24" fill={isPositive ? '#00b259' : '#ff2020'} className="drop-shadow-md">
                         <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                       </svg>
                       <span className="absolute text-white text-[11px] font-black">{Math.abs(score)}</span>
                    </div>

                    <button onClick={() => handleVote(comment.id, -1)} className="hover:text-white transition-colors"><ThumbDown /></button>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 text-[16px] leading-relaxed whitespace-pre-wrap">
                  {comment.testo.split(' ').map((word, idx) => word.startsWith('@') ? <span key={idx} className="text-[#00bfff] cursor-pointer mr-1">{word}</span> : <span key={idx} className="mr-1">{word}</span>)}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-[13px]">
                <div className="flex gap-4 font-semibold">
                  <button onClick={() => handleReplyClick(comment.id, comment.utenti?.username)} className="text-[#ff4444] hover:text-red-400 transition-colors">Rispondi</button>
                  <button className="text-[#ff4444] hover:text-red-400 transition-colors">Permalink</button>
                </div>
                
                <div className="flex gap-4">
                  {!isMyComment && (
                    <>
                      <button onClick={() => { if(!user) openModal(); else handleBlockUser(comment.id_utente, comment.utenti?.username); }} className="text-gray-500 font-semibold hover:text-white transition-colors flex items-center gap-1">Blocca</button>
                      <button onClick={() => { if(!user) openModal(); else setReportingCommentId(comment.id); }} className="text-gray-500 font-semibold hover:text-white transition-colors">Segnala</button>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && !isMyComment && comment.id_utente && (
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase flex items-center mr-2">Admin:</span>
                  <button onClick={() => handleWarn(comment.id_utente)} className="bg-[#e6c200] hover:bg-yellow-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors">Cartellino</button>
                  <button onClick={() => handleBan(comment.id_utente)} className="bg-red-900 border border-[#ff2020] hover:bg-[#ff2020] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors">Ban Diretto</button>
                </div>
              )}
            </div>
          );
        })}
        {commentsList.length === 0 && <p className="text-gray-500 text-[15px] font-bold py-10 text-center">Nessun commento. Sii il primo a scriverne uno!</p>}
      </div>
    </div>
  );
}