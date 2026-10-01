import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

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
  
  // STATO PER LA BLACKLIST
  const [myBlacklist, setMyBlacklist] = useState([]);

  useEffect(() => {
    async function checkAdminAndBlacklist() {
      if (user) {
        const { data: uData } = await supabase.from('utenti').select('id, id_ruolo').eq('id_auth', user.id).maybeSingle();
        if (uData) {
          if (uData.id_ruolo === 1) setIsAdmin(true);
          
          // Peschiamo la blacklist
          const { data: bl } = await supabase.from('blacklist').select('id_bloccato').eq('id_utente', uData.id);
          if (bl) setMyBlacklist(bl.map(b => b.id_bloccato));
        }
      }
    }
    checkAdminAndBlacklist();
  }, [user]);

  const handleWarn = async (idUtente) => {
    if(!window.confirm("Assegnare un cartellino giallo a questo utente? (Al secondo cartellino verrà bannato in automatico)")) return;
    
    const { data } = await supabase.from('utenti').select('ammonizioni').eq('id', idUtente).single();
    const current = data?.ammonizioni || 0;

    if (current === 1) {
      await supabase.from('utenti').update({ ammonizioni: 2, bannato: true }).eq('id', idUtente);
      await supabase.from('notifiche').insert([{
        id_utente: idUtente,
        testo: `⛔ BAN AUTOMATICO: Hai ricevuto il tuo secondo cartellino giallo in un commento. Non puoi più commentare o votare sul sito.`,
        letta: false
      }]);
      alert("L'utente aveva già un cartellino. È stato BANNATO definitivamente.");
    } else {
      await supabase.from('utenti').update({ ammonizioni: 1 }).eq('id', idUtente);
      await supabase.from('notifiche').insert([{
        id_utente: idUtente,
        testo: `⚠️ AMMONIZIONE: Hai ricevuto un cartellino giallo dallo staff per un tuo commento. Al prossimo sarai bannato.`,
        letta: false
      }]);
      alert("Utente ammonito con successo.");
    }
  };

  const handleBan = async (idUtente) => {
    if(!window.confirm("Sei sicuro di voler BANNARE DEFINITIVAMENTE questo utente?")) return;
    await supabase.from('utenti').update({ bannato: true }).eq('id', idUtente);
    await supabase.from('notifiche').insert([{
      id_utente: idUtente,
      testo: `⛔ SEI STATO BANNATO DEFINITIVAMENTE dallo staff. Non puoi più commentare o votare.`,
      letta: false
    }]);
    alert("Utente bannato dal sito.");
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

  return (
    <div className="mt-16 border-t border-gray-800 pt-8">
      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Commenti ({commentsList.length})</h3>

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

      <div ref={commentInputRef} className="mb-10">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={isBanned ? "🚫 IL TUO ACCOUNT È STATO BANNATO. NON PUOI COMMENTARE." : (user ? "Scrivi la tua opinione..." : "Effettua il login per commentare")}
          disabled={!user || isBanned}
          className="w-full h-24 bg-[#1a1a1a] border border-gray-800 text-white p-4 outline-none focus:border-[#ff2020] resize-none mb-2 placeholder-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-end">
          <button onClick={user ? handlePostComment : openModal} disabled={isSubmitting || !user || isBanned || !newCommentText.trim()} className="bg-[#ff2020] text-white font-black uppercase tracking-widest text-xs px-6 py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isBanned ? 'BANNATO' : (isSubmitting ? 'Pubblicazione...' : (user ? 'Invia' : 'Accedi'))}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {commentsList.map(comment => {
          const score = getScore(comment.upvotes, comment.downvotes);
          const isPositive = score >= 0;
          
          const profiliData = comment.utenti?.profili;
          const avatarUrl = Array.isArray(profiliData) ? profiliData[0]?.avatar_url : profiliData?.avatar_url;

          // CONTROLLO BLACKLIST
          const isBlocked = myBlacklist.includes(comment.id_utente);

          if (isBlocked) {
            return (
              <div key={comment.id} className="py-4 border-b border-gray-800/40 bg-[#161616] flex items-center justify-between px-4 opacity-50 mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">🚫 Commento nascosto (Utente bloccato)</span>
              </div>
            );
          }

          return (
            <div key={comment.id} id={`commento-${comment.id}`} className={`py-6 border-b border-gray-800/60 ${comment.id_commento_padre ? 'ml-8 md:ml-16 pl-4 border-l border-l-gray-800' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <a href={`/utente/${comment.utenti?.username}`}>
                      <div className="w-11 h-11 rounded-full border-[3px] border-gray-700 flex items-center justify-center bg-[#222] text-[#ff2020] font-black shadow-md overflow-hidden cursor-pointer">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          comment.utenti?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </a>
                    <div className="absolute -top-1 -right-2 bg-[#00a2ed] text-white text-[9px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#111111]">64</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {/* LINK AL PROFILO */}
                      <a href={`/utente/${comment.utenti?.username}`} className="text-white font-bold text-[15px] hover:text-[#ff2020] transition-colors cursor-pointer">
                        {comment.utenti?.username}
                      </a>
                      {comment.utenti?.id_ruolo === 1 && <span className="bg-[#ff2020] text-white text-[9px] px-1 py-0.5 rounded-sm font-black uppercase tracking-widest">Admin</span>}
                      {comment.utenti?.id_ruolo === 2 && <span className="bg-[#00bfff] text-white text-[9px] px-1 py-0.5 rounded-sm font-black uppercase tracking-widest">Red</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs mr-2">{formatCommentDate(comment.data)}</span>
                  <button onClick={() => handleVote(comment.id, 1)} className="text-gray-400 hover:text-white transition-colors"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button>
                  <div className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-white text-[11px] font-black ${isPositive ? 'bg-[#00b259]' : 'bg-[#ff2020]'}`}>{Math.abs(score)}</div>
                  <button onClick={() => handleVote(comment.id, -1)} className="text-gray-400 hover:text-white transition-colors"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg></button>
                </div>
              </div>
              <div className="ml-[60px] mb-4">
                <p className="text-gray-300 text-[15px] leading-relaxed">{comment.testo.split(' ').map((word, idx) => word.startsWith('@') ? <span key={idx} className="text-[#00bfff] cursor-pointer mr-1">{word}</span> : <span key={idx} className="mr-1">{word}</span>)}</p>
              </div>
              <div className="ml-[60px] flex justify-between items-center text-[13px] font-semibold">
                <div className="flex gap-4">
                  <button onClick={() => handleReplyClick(comment.id, comment.utenti?.username)} className="text-[#ff4444] hover:text-red-400 transition-colors">Rispondi</button>
                  <button className="text-[#ff4444] hover:text-red-400 transition-colors">Permalink</button>
                </div>
                
                {/* BOTTONI BLOCCA E SEGNALA */}
                <div className="flex gap-4">
                  <button onClick={() => { if(!user) openModal(); else handleBlockUser(comment.id_utente, comment.utenti?.username); }} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1">🔒 Blocca</button>
                  <button onClick={() => { if(!user) openModal(); else setReportingCommentId(comment.id); }} className="text-gray-500 hover:text-white transition-colors">Segnala</button>
                </div>
              </div>

              {isAdmin && comment.id_utente && (
                <div className="ml-[60px] mt-4 pt-3 border-t border-gray-800/80 flex gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase flex items-center mr-2">Admin:</span>
                  <button onClick={() => handleWarn(comment.id_utente)} className="bg-[#e6c200] hover:bg-yellow-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors">Cartellino</button>
                  <button onClick={() => handleBan(comment.id_utente)} className="bg-red-900 border border-[#ff2020] hover:bg-[#ff2020] text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors">Ban Diretto</button>
                </div>
              )}
            </div>
          );
        })}
        {commentsList.length === 0 && <p className="text-gray-500 text-sm italic py-10 text-center">Nessun commento. Sii il primo a scriverne uno!</p>}
      </div>
    </div>
  );
}