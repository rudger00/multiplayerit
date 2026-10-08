import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

import SidebarArticolo from '../components/articolo/SidebarArticolo';
import ConclusioniReview from '../components/articolo/ConclusioniReview';
import SezioneCommenti from '../components/articolo/SezioneCommenti';

export default function PaginaArticolo() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const { user, openModal } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [game, setGame] = useState(null);
  const [sidebarArticles, setSidebarArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false); 

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [myGameVote, setMyGameVote] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // --- STATI E REFS PER LA READING PROGRESS BAR ---
  const [readingProgress, setReadingProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const articleContentRef = useRef(null);
  const commentsSectionRef = useRef(null);
  // ------------------------------------------------

  const fetchComments = async (validId) => {
    const { data, error } = await supabase
      .from('commenti')
      .select(`id, testo, data, id_commento_padre, upvotes, downvotes, id_utente, utenti!id_utente ( username, id_ruolo, profili ( avatar_url ) )`)
      .eq('id_articolo', validId)
      .order('data', { ascending: true });
    if (!error && data) setCommentsList(data);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        console.error("ID articolo non valido:", id);
        navigate('/'); 
        return;
      }

      const { data: articleData } = await supabase.from('articoli').select(`*, categorie(nome)`).eq('id', parsedId).maybeSingle();

      if (articleData) {
        if (articleData.id_autore) {
           const { data: authorData } = await supabase.from('utenti').select('username').eq('id', articleData.id_autore).maybeSingle();
           articleData.autore_username = authorData?.username || 'Redazione';
        } else {
           articleData.autore_username = 'Redazione';
        }
        setArticle(articleData);
        
        if (user) {
          const { data: userData } = await supabase.from('utenti').select('id, id_ruolo, bannato').eq('id_auth', user.id).maybeSingle();
          if (userData) {
            if (userData.id_ruolo === 1) setIsAdmin(true);
            setIsBanned(userData.bannato); 

            const { data: savedData } = await supabase.from('articoli_salvati').select('*').eq('id_utente', userData.id).eq('id_articolo', articleData.id).maybeSingle();
            if (savedData) setIsSaved(true);

            if (articleData.id_gioco) {
              const { data: gameData } = await supabase.from('giochi').select('*').eq('id', articleData.id_gioco).maybeSingle();
              if (gameData) {
                setGame(gameData);
                const { data: followData } = await supabase.from('segui_giochi').select('*').eq('id_utente', userData.id).eq('id_gioco', gameData.id).maybeSingle();
                if (followData) setIsFollowing(true);
                const { data: voteData } = await supabase.from('voti_giochi').select('voto').eq('id_utente', userData.id).eq('id_gioco', gameData.id).maybeSingle();
                if (voteData) setMyGameVote(voteData.voto);
              }
            }
          }
        } else if (articleData.id_gioco) {
           const { data: gameData } = await supabase.from('giochi').select('*').eq('id', articleData.id_gioco).maybeSingle();
           if (gameData) setGame(gameData);
        }

        const { data: sideData } = await supabase.from('articoli').select(`id, titolo, url_immagine, creato_il`).neq('id', parsedId).order('creato_il', { ascending: false }).limit(6);
        if (sideData) setSidebarArticles(sideData);

        await fetchComments(parsedId);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    }
    
    fetchData();
  }, [id, user, navigate]); 

  // --- EFFETTO PER LA READING PROGRESS BAR ---
  useEffect(() => {
    const handleScroll = () => {
      if (!articleContentRef.current) return;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      const articleTop = articleContentRef.current.offsetTop;
      const articleHeight = articleContentRef.current.offsetHeight;
      const articleBottom = articleTop + articleHeight;

      let commentsTop = Infinity;
      if (commentsSectionRef.current) {
        commentsTop = commentsSectionRef.current.offsetTop;
      }

      let progress = 0;
      if (scrollY + windowHeight > articleTop) {
        const scrolledPastArticleStart = (scrollY + windowHeight) - articleTop;
        progress = (scrolledPastArticleStart / articleHeight) * 100;
      }
      
      progress = Math.max(0, Math.min(100, progress));
      setReadingProgress(progress);

      if (scrollY + windowHeight > commentsTop + 100) {
        setShowProgressBar(false);
      } else {
        setShowProgressBar(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, loading]);
  // ------------------------------------------

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

  const handleDeleteArticle = async () => {
    if (window.confirm("Attenzione! Sei sicuro di voler ELIMINARE DEFINITIVAMENTE questo articolo? L'azione è irreversibile.")) {
      const { error } = await supabase.from('articoli').delete().eq('id', article.id);
      if (!error) {
        alert("Articolo eliminato con successo.");
        navigate('/'); 
      } else {
        alert("Errore durante l'eliminazione: " + error.message);
      }
    }
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim() || !user) return;
    setIsReporting(true);
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const payload = { id_segnalatore: userData.id, tipo: 'ARTICOLO', id_articolo_segnalato: article.id, motivo: reportText };
      const { error } = await supabase.from('segnalazioni').insert([payload]);
      if (!error) { alert("Segnalazione inviata con successo. La redazione verificherà a breve, grazie!"); setReportText(''); setShowReportModal(false); }
    }
    setIsReporting(false);
  };

  const toggleSaveArticle = async () => {
    if (!user) { openModal(); return; }
    setLoadingSave(true);
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData && article) {
      if (isSaved) {
        await supabase.from('articoli_salvati').delete().eq('id_utente', userData.id).eq('id_articolo', article.id);
        setIsSaved(false);
      } else {
        await supabase.from('articoli_salvati').insert([{ id_utente: userData.id, id_articolo: article.id }]);
        setIsSaved(true);
      }
    }
    setLoadingSave(false);
  };

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

  const handleSaveGameVote = async () => {
    if (isBanned) { alert("Il tuo account è bannato. Non puoi votare."); return; }
    if (!user || !game || myGameVote === null) return;
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const votoDaSalvare = parseFloat(myGameVote);
      const { error } = await supabase.from('voti_giochi').upsert({ id_gioco: game.id, id_utente: userData.id, voto: votoDaSalvare }, { onConflict: 'id_gioco, id_utente' });
      if (!error) {
        const { data: tuttiVoti } = await supabase.from('voti_giochi').select('voto').eq('id_gioco', game.id);
        if (tuttiVoti && tuttiVoti.length > 0) {
          const somma = tuttiVoti.reduce((acc, curr) => acc + curr.voto, 0);
          const mediaReale = (somma / tuttiVoti.length).toFixed(1);
          await supabase.from('giochi').update({ voto_lettori: mediaReale, numero_voti: tuttiVoti.length }).eq('id', game.id);
          setGame(prev => ({ ...prev, voto_lettori: mediaReale, numero_voti: tuttiVoti.length }));
        }
      }
    }
  };

  const handlePostComment = async () => {
    if (isBanned) { alert("Il tuo account è bannato. Non puoi commentare."); return; }
    if (!newCommentText.trim() || !user) { if(!user) openModal(); return; }
    setIsSubmitting(true);
    const { data: userData } = await supabase.from('utenti').select('id, username').eq('id_auth', user.id).maybeSingle();
    if (userData) {
      const parsedId = parseInt(id, 10);
      const { data: newDbComment, error } = await supabase.from('commenti').insert([{ 
        testo: newCommentText, id_articolo: parsedId, id_utente: userData.id, id_commento_padre: replyingTo, data: new Date().toISOString() 
      }]).select().single();

      if (!error) { 
        if (replyingTo) {
          const { data: parentComment } = await supabase.from('commenti').select('id_utente').eq('id', replyingTo).maybeSingle();
          if (parentComment && parentComment.id_utente !== userData.id) {
            await supabase.from('notifiche').insert([{ id_utente: parentComment.id_utente, testo: `${userData.username} ha risposto al tuo commento in "${article.titolo}"`, link: `/articolo/${id}#commento-${newDbComment.id}`, letta: false }]);
          }
        }
        setNewCommentText(''); setReplyingTo(null); fetchComments(parsedId); 
        setArticle(prev => ({ ...prev, commenti: (prev.commenti || 0) + 1 })); 
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
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) fetchComments(parsedId);
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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="text-white text-center p-10 font-bold">Caricamento articolo...</div>;
  if (!article) return <div className="text-white text-center p-10 font-bold">Articolo non trovato.</div>;

  const dateStr = new Date(article.creato_il).toLocaleDateString('it-IT');
  const catName = article.categorie?.nome || 'News';
  const isReview = catName.toLowerCase().includes('recension') || article.id_categoria === 2;
  const embedUrl = getYouTubeEmbedUrl(article.url_video);

  return (
    <div className="bg-[#111111] min-h-screen pb-20 font-sans relative">
      
      {/* --- READING PROGRESS BAR --- */}
      <div 
        className="fixed top-14 left-0 w-full h-[2px] z-[90] transition-opacity duration-300"
        style={{ opacity: showProgressBar ? 1 : 0 }}
      >
        <div 
          className="h-full bg-[#ff2020] transition-all duration-100 ease-out" 
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      {/* ---------------------------- */}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] w-full max-w-[600px] border border-gray-800 p-8 relative flex flex-col shadow-2xl">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            <h2 className="text-[#ff2020] font-black text-center text-sm tracking-widest uppercase mb-4">Segnalazione Errore</h2>
            <h3 className="text-white font-bold text-center text-lg mb-6">{article.titolo}</h3>
            <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Descrivi l'errore o l'inesattezza..." className="w-full h-40 bg-[#333333] border-none outline-none text-white p-4 resize-none mb-6 placeholder-gray-500 font-medium"></textarea>
            <div className="flex justify-end">
              <button onClick={handleReportSubmit} disabled={isReporting || !reportText.trim()} className="bg-[#ff4444] text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-600 disabled:opacity-50">{isReporting ? 'Invio...' : 'Segnala'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 pt-8 flex flex-col lg:flex-row gap-8">
        
        {/* CORPO PRINCIPALE */}
        <div className="lg:w-[70%] flex flex-col" ref={articleContentRef}>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{article.titolo}</h1>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {isAdmin && <button onClick={handleDeleteArticle} className="bg-red-900 border border-red-500 text-red-100 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg">Elimina</button>}
              {commentsList.length > 10 ? <div className="mt-2 w-10 h-10 bg-[#ff2020] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">HOT</div> : <div className="mt-2 w-10 h-10 bg-[#1a1a1a] border border-gray-700 rounded-full flex items-center justify-center text-[#ff2020] text-[14px] font-black shadow-lg">{commentsList.length}</div>}
            </div>
          </div>
          {article.sommario && <p className="text-xl md:text-2xl text-gray-300 mt-6 leading-snug">{article.sommario}</p>}
          <div className="text-[11px] font-black uppercase tracking-widest mt-6">
            <span className="text-[#ff2020]">{catName}</span><span className="text-gray-400 normal-case font-semibold"> di {article.autore_username} — {dateStr}</span>
          </div>
          
          <div className="flex justify-between items-center border-y border-gray-800 py-4 my-6">
            <button onClick={toggleSaveArticle} disabled={loadingSave} className={`border transition-colors px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isSaved ? 'bg-[#ff2020] border-[#ff2020] text-white' : 'border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white'}`}>
              {isSaved ? (<><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg> Articolo Salvato</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg> Leggi Dopo</>)}
            </button>
          </div>
          
          <div className="w-full aspect-video bg-[#1a1a1a] mb-6 border border-gray-800">{article.url_immagine && <img src={getImg(article.url_immagine)} alt={article.titolo} className="w-full h-full object-cover" />}</div>
          {embedUrl && (<div className="w-full aspect-video bg-black relative mb-8 shadow-xl rounded-sm overflow-hidden border-2 border-gray-800"><iframe className="w-full h-full" src={embedUrl} title="Trailer" frameBorder="0" allowFullScreen></iframe></div>)}

          {game && (
            <div className="bg-[#1a1a1a] border border-gray-800 p-5 rounded-sm shadow-xl mb-10">
              <div className="flex justify-between items-center mb-5">
                <Link to={`/gioco/${game.id}`} className="flex items-center gap-4 group cursor-pointer">
                  <img src={getImg(game.url_immagine)} alt={game.titolo} className="w-14 h-14 object-cover border-2 border-gray-700 shadow-md group-hover:border-[#ff2020] transition-colors" />
                  <h3 className="text-white font-black text-xl group-hover:text-[#ff2020] transition-colors">{game.titolo}</h3>
                </Link>
                <button onClick={toggleFollow} disabled={loadingFollow} className={`border px-5 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-full transition-colors ${isFollowing ? 'bg-[#ff2020] border-[#ff2020] text-white hover:bg-red-700' : 'border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white'}`}>{isFollowing ? 'NON SEGUIRE' : 'SEGUI'}</button>
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-300 text-[17px] leading-relaxed break-words [&_img]:block [&_img]:mx-auto [&_img]:my-8 [&_img]:max-w-full [&_img]:rounded-md [&_img]:shadow-xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:my-8" dangerouslySetInnerHTML={{ __html: article.corpo }} />

          {isReview && (
            <ConclusioniReview article={article} game={game} user={user} openModal={openModal} myGameVote={myGameVote} setMyGameVote={setMyGameVote} handleSaveGameVote={handleSaveGameVote} />
          )}

          {user && (
            <div className="mt-12 mb-8 flex justify-start">
              <button onClick={() => setShowReportModal(true)} className="border border-[#ff2020] text-[#ff2020] font-black uppercase tracking-widest text-[13px] px-6 py-3 hover:bg-[#ff2020] hover:text-white transition-colors">
                Hai notato errori?
              </button>
            </div>
          )}

          {/* DIV CON REF PER I COMMENTI */}
          <div ref={commentsSectionRef}>
            <SezioneCommenti 
              commentsList={commentsList} newCommentText={newCommentText} setNewCommentText={setNewCommentText} 
              replyingTo={replyingTo} setReplyingTo={setReplyingTo} isSubmitting={isSubmitting} 
              handlePostComment={handlePostComment} handleVote={handleVote} handleReplyClick={handleReplyClick} 
              formatCommentDate={formatCommentDate} commentInputRef={commentInputRef} 
              user={user} openModal={openModal} 
              isBanned={isBanned} 
            />
          </div>

        </div>

        <div className="lg:w-[30%] flex flex-col gap-10">
          <SidebarArticolo sidebarArticles={sidebarArticles} />
        </div>

      </div>
    </div>
  );
}