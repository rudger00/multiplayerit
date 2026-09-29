import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Importiamo il nostro fantastico componente universale per i commenti!
import SezioneCommenti from '../components/articolo/SezioneCommenti';

export default function PaginaSondaggio() {
  const { id } = useParams();
  const { user, openModal } = useAuth();
  
  const [sondaggio, setSondaggio] = useState(null);
  const [opzioni, setOpzioni] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [haVotato, setHaVotato] = useState(false);
  const [opzioneSelezionata, setOpzioneSelezionata] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATI PER I COMMENTI E BAN ---
  const [isBanned, setIsBanned] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const commentInputRef = useRef(null);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('commenti')
      .select(`id, testo, data, id_commento_padre, upvotes, downvotes, id_utente, utenti!id_utente ( username, id_ruolo )`)
      .eq('id_sondaggio', parseInt(id)) // Peschiamo i commenti di QUESTO sondaggio
      .order('data', { ascending: true });
    if (!error && data) setCommentsList(data);
  };

  useEffect(() => {
    async function fetchSondaggio() {
      setLoading(true);
      const { data: sData } = await supabase.from('sondaggi').select(`*, utenti!id_autore(username)`).eq('id', parseInt(id)).maybeSingle();

      if (sData) {
        setSondaggio(sData);
        const { data: oData } = await supabase.from('sondaggi_opzioni').select('*').eq('id_sondaggio', sData.id).order('id');
        if (oData) setOpzioni(oData);

        if (user) {
          const { data: userData } = await supabase.from('utenti').select('id, bannato').eq('id_auth', user.id).maybeSingle();
          if (userData) {
            setIsBanned(userData.bannato); // Salviamo lo stato BAN per i commenti
            const { data: vData } = await supabase.from('sondaggi_voti').select('*').eq('id_sondaggio', sData.id).eq('id_utente', userData.id).maybeSingle();
            if (vData) setHaVotato(true);
          }
        }
        // Carichiamo i commenti alla fine
        await fetchComments();
      }
      setLoading(false);
    }
    fetchSondaggio();
  }, [id, user]);

  // Gestione click sul commento con l'ancora
  useEffect(() => {
    if (commentsList.length > 0 && window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-[#ff2020]/20', 'transition-colors', 'duration-1000');
          setTimeout(() => element.classList.remove('bg-[#ff2020]/20'), 2000);
        }, 300);
      }
    }
  }, [commentsList]);

  // --- LOGICA VOTO SONDAGGIO ---
  const handleVota = async () => {
    if (!user) { openModal(); return; }
    if (!opzioneSelezionata) { alert("Seleziona un'opzione prima di votare!"); return; }
    setIsSubmitting(true);

    if (isBanned) { alert("Il tuo account è bannato."); setIsSubmitting(false); return; }

    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const { error } = await supabase.from('sondaggi_voti').insert([{ id_sondaggio: sondaggio.id, id_utente: userData.id, id_opzione: opzioneSelezionata }]);
      if (!error) {
        const opzioneDb = opzioni.find(o => o.id === opzioneSelezionata);
        await supabase.from('sondaggi_opzioni').update({ voti: opzioneDb.voti + 1 }).eq('id', opzioneSelezionata);
        setOpzioni(opzioni.map(o => o.id === opzioneSelezionata ? { ...o, voti: o.voti + 1 } : o));
        setHaVotato(true);
      }
    }
    setIsSubmitting(false);
  };

  // --- LOGICA COMMENTI ---
  const handlePostComment = async () => {
    if (isBanned) { alert("Il tuo account è bannato. Non puoi commentare."); return; }
    if (!newCommentText.trim() || !user) { if(!user) openModal(); return; }
    setIsSubmitting(true);
    
    const { data: userData } = await supabase.from('utenti').select('id, username').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const { data: newDbComment, error } = await supabase.from('commenti').insert([{ 
        testo: newCommentText, 
        id_sondaggio: parseInt(id), // Colleghiamo il commento al SONDAGGIO
        id_utente: userData.id, 
        id_commento_padre: replyingTo, 
        data: new Date().toISOString() 
      }]).select().single();

      if (!error) { 
        if (replyingTo) {
          const { data: parentComment } = await supabase.from('commenti').select('id_utente').eq('id', replyingTo).maybeSingle();
          if (parentComment && parentComment.id_utente !== userData.id) {
            await supabase.from('notifiche').insert([{ id_utente: parentComment.id_utente, testo: `${userData.username} ha risposto al tuo commento nel sondaggio "${sondaggio.titolo}"`, link: `/sondaggio/${id}#commento-${newDbComment.id}`, letta: false }]);
          }
        }
        setNewCommentText(''); setReplyingTo(null); fetchComments(); 
      }
    }
    setIsSubmitting(false);
  };

  const handleVote = async (commentId, voteValue) => {
    if (isBanned) { alert("Il tuo account è bannato. Non puoi valutare i commenti."); return; }
    if (!user) { openModal(); return; }
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      await supabase.from('commenti_voti').upsert({ id_commento: commentId, id_utente: userData.id, voto: voteValue }, { onConflict: 'id_commento, id_utente' });
      const { data: allVotes } = await supabase.from('commenti_voti').select('voto').eq('id_commento', commentId);
      let newUpvotes = 0, newDownvotes = 0;
      allVotes?.forEach(v => { if (v.voto === 1) newUpvotes++; if (v.voto === -1) newDownvotes++; });
      await supabase.from('commenti').update({ upvotes: newUpvotes, downvotes: newDownvotes }).eq('id', commentId);
      fetchComments();
    }
  };

  const handleReplyClick = (commentId, username) => {
    if (!user) { openModal(); return; }
    setReplyingTo(commentId);
    setNewCommentText(`@${username} `);
    commentInputRef.current?.focus();
    window.scrollTo({ top: commentInputRef.current.offsetTop - 100, behavior: 'smooth' });
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)); 
    if (diffDays === 1) return 'Oggi'; if (diffDays === 2) return 'Ieri'; if (diffDays <= 30) return `${diffDays - 1} giorni fa`;
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Caricamento sondaggio...</div>;
  if (!sondaggio) return <div className="text-white text-center py-20 font-bold">Sondaggio non trovato.</div>;

  const totaliVoti = opzioni.reduce((acc, curr) => acc + curr.voti, 0);

  return (
    <div className="bg-[#111111] min-h-screen pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 pt-8 flex flex-col lg:flex-row gap-8">
        
        {/* COLONNA PRINCIPALE */}
        <div className="lg:w-[70%] flex flex-col">
          <div className="bg-[#1a1a1a] p-6 md:p-10 border border-gray-800 rounded-sm shadow-xl relative mb-12">
            
            <div className="absolute top-6 right-6 w-10 h-10 bg-[#ff4444] rounded-full flex items-center justify-center text-white text-[12px] font-black shadow-lg cursor-pointer">
              {commentsList.length}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4 pr-12">{sondaggio.titolo}</h1>
            <p className="text-gray-300 text-[17px] leading-relaxed mb-4">{sondaggio.descrizione}</p>
            <div className="text-sm font-semibold mb-8 text-gray-400">
              di <span className="text-[#ff4444] font-bold">{sondaggio.utenti?.username || 'Redazione'}</span>
            </div>

            <h3 className="text-white font-black text-xl mb-6">{!haVotato ? "Vota per vedere i risultati." : "Risultati del sondaggio"}</h3>

            <div className="flex justify-end gap-2 border-b border-gray-800 pb-4 mb-6">
               <div className="w-8 h-8 bg-[#3b5998] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity"><span className="font-bold">f</span></div>
               <div className="w-8 h-8 bg-black flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity"><span className="font-bold">X</span></div>
               <div className="w-8 h-8 bg-[#25D366] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity"><span className="font-bold">W</span></div>
            </div>

            <div className="flex flex-col gap-5 border-b border-gray-800 pb-8 mb-6">
              {opzioni.map((opz) => {
                const percentuale = totaliVoti > 0 ? Math.round((opz.voti / totaliVoti) * 100) : 0;
                
                return (
                  <div key={opz.id} className="relative">
                    {!haVotato ? (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" name="sondaggio_opzioni" value={opz.id}
                          onChange={() => setOpzioneSelezionata(opz.id)}
                          className="w-4 h-4 accent-[#ff4444] bg-transparent border-gray-500 cursor-pointer" 
                        />
                        <span className="text-white font-bold text-lg group-hover:text-[#ff4444] transition-colors">{opz.testo}</span>
                      </label>
                    ) : (
                      <div className="flex flex-col mb-2 mt-1">
                        <div className="flex justify-between text-white font-bold text-[15px] mb-1 z-10 relative">
                          <span>{opz.testo}</span>
                          <span>{percentuale}% ({opz.voti} voti)</span>
                        </div>
                        <div className="w-full bg-[#333] h-3 rounded-full overflow-hidden">
                          <div className="bg-[#e6c200] h-full" style={{ width: `${percentuale}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[13px] font-semibold">Voti totali: {totaliVoti}</span>
              {!haVotato && (
                <button 
                  onClick={handleVota} disabled={isSubmitting || !opzioneSelezionata}
                  className="bg-[#ff4444] text-white font-black uppercase tracking-widest px-10 py-3 rounded-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'VOTO...' : 'VOTA'}
                </button>
              )}
            </div>
          </div>

          {/* COMPONENTE SEZIONE COMMENTI */}
          <div className="-mt-8">
            <SezioneCommenti 
              commentsList={commentsList} 
              newCommentText={newCommentText} 
              setNewCommentText={setNewCommentText} 
              replyingTo={replyingTo} 
              setReplyingTo={setReplyingTo} 
              isSubmitting={isSubmitting} 
              handlePostComment={handlePostComment} 
              handleVote={handleVote} 
              handleReplyClick={handleReplyClick} 
              formatCommentDate={formatCommentDate} 
              commentInputRef={commentInputRef} 
              user={user} 
              openModal={openModal} 
              isBanned={isBanned} 
            />
          </div>

        </div>

        {/* SIDEBAR LATERALE */}
        <div className="lg:w-[30%] flex flex-col gap-6">
          <Link to="/sondaggi" className="w-full bg-[#ff4444] hover:bg-red-600 text-white font-black text-center text-[15px] tracking-widest uppercase py-4 rounded-sm shadow-md transition-colors">
            VAI A TUTTI I SONDAGGI
          </Link>

          <div className="bg-[#1a1a1a] border border-gray-800 p-5 mt-4">
             <h4 className="text-[#ff4444] font-black text-sm uppercase tracking-widest mb-4">LE NOTIZIE PIÙ LETTE</h4>
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-3 border-b border-gray-800 pb-3 last:border-0 cursor-pointer group">
                   <div className="w-16 h-16 bg-gray-700 shrink-0"></div>
                   <p className="text-gray-300 text-xs font-bold leading-snug group-hover:text-[#ff4444] transition-colors">Notizia simulata numero {i} molto interessante per mantenere il layout intatto.</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}