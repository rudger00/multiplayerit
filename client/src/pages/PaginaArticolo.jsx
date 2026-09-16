import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function PaginaArticolo() {
  const { id } = useParams();
  const { user, openModal } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [game, setGame] = useState(null);
  const [sidebarArticles, setSidebarArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  
  const [myGameVote, setMyGameVote] = useState(null);

  // NUOVI STATI PER GLI ARTICOLI SALVATI
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('commenti')
      .select(`
        id, testo, data, id_commento_padre, upvotes, downvotes, 
        utenti!id_utente ( username, id_ruolo ) 
      `)
      .eq('id_articolo', parseInt(id))
      .order('data', { ascending: true });

    if (!error && data) setCommentsList(data);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: articleData } = await supabase.from('articoli').select(`*, categorie(nome)`).eq('id', parseInt(id)).maybeSingle();

      if (articleData) {
        setArticle(articleData);
        
        if (user) {
          const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
          if (userData) {
            // CONTROLLA SE L'ARTICOLO È GIÀ SALVATO
            const { data: savedData } = await supabase.from('articoli_salvati')
              .select('*').eq('id_utente', userData.id).eq('id_articolo', articleData.id).maybeSingle();
            if (savedData) setIsSaved(true);

            // LOGICA GIOCO (se presente nell'articolo)
            if (articleData.id_gioco) {
              const { data: gameData } = await supabase.from('giochi').select('*').eq('id', articleData.id_gioco).maybeSingle();
              if (gameData) {
                setGame(gameData);
                
                const { data: followData } = await supabase.from('segui_giochi')
                  .select('*').eq('id_utente', userData.id).eq('id_gioco', gameData.id).maybeSingle();
                if (followData) setIsFollowing(true);

                const { data: voteData } = await supabase.from('voti_giochi')
                  .select('voto').eq('id_utente', userData.id).eq('id_gioco', gameData.id).maybeSingle();
                if (voteData) setMyGameVote(voteData.voto);
              }
            }
          }
        } else if (articleData.id_gioco) {
           // Fallback se l'utente non è loggato ma il gioco esiste
           const { data: gameData } = await supabase.from('giochi').select('*').eq('id', articleData.id_gioco).maybeSingle();
           if (gameData) setGame(gameData);
        }

        const { data: sideData } = await supabase.from('articoli').select(`id, titolo, url_immagine, creato_il`).neq('id', parseInt(id)).order('creato_il', { ascending: false }).limit(6);
        if (sideData) setSidebarArticles(sideData);

        await fetchComments();
      }
      setLoading(false);
      window.scrollTo(0, 0);
    }
    fetchData();
  }, [id, user]);

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

  // Funzione per salvare l'articolo in "Articoli Salvati"
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
    if (!user || !game) return;
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    
    if (userData) {
      const votoDaSalvare = parseFloat(myGameVote || 5.0);
      const { error } = await supabase.from('voti_giochi').upsert({ id_gioco: game.id, id_utente: userData.id, voto: votoDaSalvare }, { onConflict: 'id_gioco, id_utente' });
      
      if (!error) {
        const { data: tuttiVoti } = await supabase.from('voti_giochi').select('voto').eq('id_gioco', game.id);
        if (tuttiVoti && tuttiVoti.length > 0) {
          const somma = tuttiVoti.reduce((acc, curr) => acc + curr.voto, 0);
          const mediaReale = (somma / tuttiVoti.length).toFixed(1);
          const numeroVotiReale = tuttiVoti.length;
          
          await supabase.from('giochi').update({ voto_lettori: mediaReale, numero_voti: numeroVotiReale }).eq('id', game.id);
          setGame(prev => ({ ...prev, voto_lettori: mediaReale, numero_voti: numeroVotiReale }));
        }
      }
    }
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim() || !user) { if(!user) openModal(); return; }
    setIsSubmitting(true);
    
    const { data: userData } = await supabase.from('utenti').select('id, username').eq('id_auth', user.id).maybeSingle();
    
    if (userData) {
      const { data: newDbComment, error } = await supabase.from('commenti').insert([{ 
        testo: newCommentText, 
        id_articolo: parseInt(id), 
        id_utente: userData.id, 
        id_commento_padre: replyingTo, 
        data: new Date().toISOString() 
      }]).select().single();

      if (!error) { 
        if (replyingTo) {
          const { data: parentComment } = await supabase.from('commenti').select('id_utente').eq('id', replyingTo).maybeSingle();
          if (parentComment && parentComment.id_utente !== userData.id) {
            await supabase.from('notifiche').insert([{
              id_utente: parentComment.id_utente,
              testo: `${userData.username} ha risposto al tuo commento in "${article.titolo}"`,
              link: `/articolo/${id}#commento-${newDbComment.id}`,
              letta: false
            }]);
          }
        }
        
        setNewCommentText(''); setReplyingTo(null); fetchComments(); 
        setArticle(prev => ({ ...prev, commenti: (prev.commenti || 0) + 1 })); 
      }
    }
    setIsSubmitting(false);
  };

  const handleVote = async (commentId, voteValue) => {
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

  if (loading) return <div className="text-white text-center p-10 font-bold">Caricamento articolo...</div>;
  if (!article) return <div className="text-white text-center p-10 font-bold">Articolo non trovato.</div>;

  const dateStr = new Date(article.creato_il).toLocaleDateString('it-IT');
  const catName = article.categorie?.nome || 'News';
  const isReview = catName.toLowerCase().includes('recension') || article.id_categoria === 2;
  const sommario = article.sommario || "Abbiamo completato l'attesissima esclusiva e siamo finalmente pronti a darvi il nostro giudizio sul viaggio più brutale e controverso.";

  const parentComments = commentsList.filter(c => !c.id_commento_padre);
  const getReplies = (parentId) => commentsList.filter(c => c.id_commento_padre === parentId);

  const prosList = article.pro ? article.pro.split('\n').filter(p => p.trim() !== '') : ["Nessun pro specificato"];
  const consList = article.contro ? article.contro.split('\n').filter(p => p.trim() !== '') : ["Nessun contro specificato"];
  const votoLettoriFinale = game?.voto_lettori || article.voto_lettori ? parseFloat(game?.voto_lettori || article.voto_lettori).toFixed(1) : '-';

  const renderComment = (comment, isReply = false) => {
    const username = comment.utenti?.username || 'Utente';
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    return (
      <div id={`commento-${comment.id}`} key={comment.id} className={`flex flex-col py-6 border-b border-gray-800/60 transition-colors rounded-md px-2 ${isReply ? 'ml-12 border-l-2 border-[#1f1f1f] pl-6 border-b-0 py-4 mt-2 bg-[#141414]' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={avatar} alt={username} className="w-12 h-12 rounded-full bg-gray-800 p-1 border-[2px] border-[#00bfff]" />
              <div className="absolute -top-1 -right-1 bg-[#00bfff] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-[2px] border-[#111111]">1</div>
            </div>
            <span className="text-white font-bold text-[15px]">{username}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[12px] font-semibold">
            <span>{formatCommentDate(comment.data)}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => handleVote(comment.id, 1)} className="flex items-center gap-1 hover:text-green-500 transition-colors"><ThumbUp /> {comment.upvotes > 0 && <span className="text-green-500 bg-[#162a16] px-1.5 rounded-full text-[10px] font-black">{comment.upvotes}</span>}</button>
              <button onClick={() => handleVote(comment.id, -1)} className="flex items-center gap-1 hover:text-red-500 transition-colors"><ThumbDown />{comment.downvotes > 0 && <span className="text-red-500 bg-[#2a1616] px-1.5 rounded-full text-[10px] font-black">{comment.downvotes}</span>}</button>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-[14px] leading-relaxed mb-4 whitespace-pre-wrap ml-[64px]">{comment.testo.split('\n').map((line, idx) => <React.Fragment key={idx}>{line.split(' ').map((word, i) => word.startsWith('@') ? <span key={i} className="text-[#00bfff] font-bold">{word} </span> : `${word} `)}<br /></React.Fragment>)}</p>
        <div className="flex items-center justify-between text-[11px] font-bold ml-[64px]">
          <div className="flex items-center gap-4 text-[#ff2020]"><span onClick={() => handleReplyClick(isReply ? comment.id_commento_padre : comment.id, username)} className="cursor-pointer hover:underline transition-colors font-medium text-[12px]">Rispondi</span><span className="cursor-pointer hover:underline transition-colors font-medium text-[12px]">Permalink</span></div>
          <span className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors font-medium text-[12px]">Segnala</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111111] min-h-screen pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 pt-8 flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-[70%] flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{article.titolo}</h1>
            {isReview && (<div className="mt-2 w-10 h-10 bg-[#ff2020] rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-lg">HOT</div>)}
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mt-6 leading-snug">{sommario}</p>
          <div className="text-[11px] font-black uppercase tracking-widest mt-6"><span className="text-[#ff2020]">{catName}</span><span className="text-gray-400 normal-case font-semibold"> di Pierpaolo Greco — {dateStr}</span></div>
          
          <div className="flex justify-between items-center border-y border-gray-800 py-4 my-6">
            {/* PULSANTE ARTICOLO SALVATO DINAMICO */}
            <button 
              onClick={toggleSaveArticle}
              disabled={loadingSave}
              className={`border transition-colors px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                isSaved 
                  ? 'bg-[#ff2020] border-[#ff2020] text-white shadow-md' 
                  : 'border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>
                  Articolo Salvato
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                  Leggi Dopo
                </>
              )}
            </button>
            
            {/* Icone Social */}
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 bg-[#3b5998] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></button>
              <button className="w-8 h-8 bg-black border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
              <button className="w-8 h-8 bg-[#25D366] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></button>
              <button className="w-8 h-8 bg-[#0088cc] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.26-5.61 3.71-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.36-.49 1-.76 3.91-1.7 6.52-2.82 7.82-3.36 3.72-1.54 4.49-1.81 5-1.82.11 0 .36.03.5.15.12.1.15.24.16.34.02.14 0 .31-.02.43z"/></svg></button>
            </div>
          </div>
          
          <div className="w-full aspect-video bg-[#1a1a1a] mb-6 border border-gray-800">{article.url_immagine && <img src={getImg(article.url_immagine)} alt={article.titolo} className="w-full h-full object-cover" />}</div>

          {game && (
            <div className="bg-[#1a1a1a] border border-gray-800 p-5 rounded-sm shadow-xl mb-10">
              <div className="flex justify-between items-center mb-5">
                <Link to={`/gioco/${game.id}`} className="flex items-center gap-4 group cursor-pointer">
                  <img src={getImg(game.url_immagine)} alt={game.titolo} className="w-14 h-14 object-cover border-2 border-gray-700 shadow-md group-hover:border-[#ff2020] transition-colors" />
                  <h3 className="text-white font-black text-xl group-hover:text-[#ff2020] transition-colors">{game.titolo}</h3>
                </Link>
                <button 
                  onClick={toggleFollow}
                  disabled={loadingFollow}
                  className={`border px-5 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-full transition-colors ${
                    isFollowing 
                      ? 'bg-[#ff2020] border-[#ff2020] text-white hover:bg-red-700' 
                      : 'border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white'
                  }`}
                >
                  {isFollowing ? 'NON SEGUIRE' : 'SEGUI'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to={`/gioco/${game.id}`} state={{ tab: 'recensioni' }} className="border border-gray-600 text-white text-xs font-bold text-center py-2 rounded-full hover:border-white transition-colors">Articoli</Link>
                <Link to={`/gioco/${game.id}`} state={{ tab: 'notizie' }} className="border border-gray-600 text-white text-xs font-bold text-center py-2 rounded-full hover:border-white transition-colors">News</Link>
                <Link to={`/gioco/${game.id}`} state={{ tab: 'video' }} className="border border-gray-600 text-white text-xs font-bold text-center py-2 rounded-full hover:border-white transition-colors">Video</Link>
                <Link to={`/gioco/${game.id}`} state={{ tab: 'video', scrollTo: 'immagini' }} className="border border-gray-600 text-white text-xs font-bold text-center py-2 rounded-full hover:border-white transition-colors">Immagini</Link>
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-300 text-[17px] leading-relaxed custom-quill-content" dangerouslySetInnerHTML={{ __html: article.contenuto }} />

          {isReview && (
            <div className="mt-16 mb-12 w-full font-sans">
              <div className="bg-[#8b0000] text-white text-center py-3 font-black text-2xl tracking-widest">CONCLUSIONI</div>
              <div className="bg-[#a80f0f] text-white flex flex-wrap justify-between items-center text-center p-4 border-b-2 border-black/20 text-xs font-bold uppercase">
                <div className="flex-1 border-r border-black/20 px-2"><div className="text-white/80 text-[10px] mb-1">VERSIONE TESTATA</div>{article.versione_testata || 'Non specificata'}</div>
                <div className="flex-[2] border-r border-black/20 px-2"><div className="text-white/80 text-[10px] mb-1">DIGITAL DELIVERY</div>{article.digital_delivery || 'Non specificato'}</div>
                <div className="flex-1 px-2"><div className="text-white/80 text-[10px] mb-1">PREZZO</div>{article.prezzo ? `${article.prezzo} €` : 'Non specificato'}</div>
              </div>
              <div className="bg-[#1a1a1a] p-6 flex items-center justify-around border-b-[8px] border-[#5e0a0a]">
                
                <div className="text-center">
                  <h4 className="text-[#ff2020] text-[11px] font-black tracking-widest mb-2 uppercase">Multiplayer.it</h4>
                  <div className="text-[#ff2020] text-6xl font-black leading-none">{article.voto_redazione ? parseFloat(article.voto_redazione).toFixed(1) : (article.voto ? parseFloat(article.voto).toFixed(1) : '-')}</div>
                </div>
                
                <div className="text-center flex flex-col items-center w-1/3">
                  <h4 className="text-gray-400 text-[11px] font-black tracking-widest mb-4 uppercase">Il Tuo Voto</h4>
                  <div className="text-gray-400 text-3xl font-black mb-2">{myGameVote ? parseFloat(myGameVote).toFixed(1) : '-'}</div>
                  
                  <div className="w-full relative flex items-center mt-2 group h-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.1" 
                      value={myGameVote || 5.0} 
                      onChange={(e) => {
                        if (!user) { openModal(); return; }
                        setMyGameVote(e.target.value);
                      }}
                      onMouseUp={handleSaveGameVote}
                      onTouchEnd={handleSaveGameVote}
                      className="w-full absolute z-10 opacity-0 cursor-pointer h-full m-0"
                    />
                    <div className="w-full h-1 bg-gray-600 rounded-full relative pointer-events-none overflow-hidden">
                       <div className="h-full bg-[#ff4444] rounded-full transition-all duration-75" style={{ width: `${((myGameVote || 5.0) / 10) * 100}%` }}></div>
                    </div>
                    <div className="w-4 h-4 bg-[#ff4444] rounded-full absolute shadow-lg pointer-events-none group-hover:scale-125 transition-all duration-75" style={{ left: `${((myGameVote || 5.0) / 10) * 100}%`, transform: 'translateX(-50%)' }}></div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-[#00bfff] text-[11px] font-black tracking-widest mb-2 uppercase">Lettori</h4>
                  <div className="text-[#00bfff] text-6xl font-black leading-none">{votoLettoriFinale}</div>
                </div>

              </div>

              <div className="bg-[#5e0a0a] p-8">
                <div className="flex flex-col gap-6">
                  <div className="bg-[#1a1a1a] border-t-2 border-[#28a745] p-5 shadow-lg">
                    <h4 className="text-[#28a745] font-black text-xl mb-4">PRO</h4>
                    <ul className="space-y-3">
                      {prosList.map((pro, idx) => (
                        <li key={idx} className="flex items-start text-white text-[15px] font-medium"><span className="text-[#28a745] text-lg mr-3 leading-none">●</span> {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#1a1a1a] border-t-2 border-[#dc3545] p-5 shadow-lg">
                    <h4 className="text-[#dc3545] font-black text-xl mb-4">CONTRO</h4>
                    <ul className="space-y-3">
                      {consList.map((con, idx) => (
                        <li key={idx} className="flex items-start text-white text-[15px] font-medium"><span className="text-[#dc3545] text-lg mr-3 leading-none">●</span> {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 w-full mb-10 font-sans" id="sezione-commenti">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-6">
              <h3 className="text-white font-black text-lg uppercase tracking-tight"><span className="text-[#ff2020]">{commentsList.length}</span> Commenti</h3>
              <span className="text-[#ff2020] text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Regolamento</span>
            </div>

            <div className="bg-[#2a2a2a] p-1 rounded-sm mb-8 flex items-center border border-transparent focus-within:border-[#ff2020] transition-colors relative shadow-lg">
              <textarea 
                ref={commentInputRef}
                placeholder="Lascia un commento... (Premi Invio per inviare)" 
                className="w-full bg-transparent text-gray-200 p-3 outline-none text-[15px] font-medium placeholder-gray-500 resize-none h-14"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onClick={() => { if (!user) openModal(); }}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePostComment())}
                disabled={isSubmitting}
              />
              {replyingTo && (<div onClick={() => { setReplyingTo(null); setNewCommentText(''); }} className="absolute -top-7 left-0 text-[11px] font-bold text-[#ff2020] hover:text-white cursor-pointer bg-[#1a1a1a] px-2 py-1 rounded-sm border border-[#ff2020]/30 transition-colors">✕ Annulla risposta</div>)}
              {newCommentText.trim() && user && (<button onClick={handlePostComment} disabled={isSubmitting} className="text-[#ff2020] font-black uppercase text-xs px-6 hover:text-white transition-colors h-full disabled:opacity-50">INVIA</button>)}
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-gray-800/50 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-xs"><button className="w-6 h-6 rounded-full border border-gray-600 hover:border-[#ff2020] transition-colors">1</button></div>
              <button className="bg-[#ff2020] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-2">DATA <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            </div>

            <div className="flex flex-col">
              {parentComments.length > 0 ? parentComments.map(parentComment => (
                <React.Fragment key={parentComment.id}>{renderComment(parentComment, false)}{getReplies(parentComment.id).map(reply => renderComment(reply, true))}</React.Fragment>
              )) : <p className="text-gray-500 text-center font-bold">Nessun commento. Sii il primo a rompere il ghiaccio!</p>}
            </div>
          </div>

        </div>

        <div className="lg:w-[30%] flex flex-col gap-10">
          <div>
            <h4 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Ti potrebbe interessare</h4>
            <div className="flex flex-col gap-4">
              {sidebarArticles.slice(0, 3).map(sideArt => (
                <Link key={sideArt.id} to={`/articolo/${sideArt.id}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-24 h-16 flex-shrink-0 border border-gray-800 overflow-hidden relative"><img src={getImg(sideArt.url_immagine)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /></div>
                  <h5 className="text-white font-bold text-[13px] leading-snug group-hover:text-[#ff2020] transition-colors line-clamp-3">{sideArt.titolo}</h5>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Le Notizie più lette</h4>
            <div className="flex flex-col gap-4">
              {sidebarArticles.slice(3, 6).map(sideArt => (
                <Link key={sideArt.id} to={`/articolo/${sideArt.id}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-24 h-16 flex-shrink-0 border border-gray-800 overflow-hidden relative"><img src={getImg(sideArt.url_immagine)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /></div>
                  <h5 className="text-white font-bold text-[13px] leading-snug group-hover:text-[#ff2020] transition-colors line-clamp-3">{sideArt.titolo}</h5>
                </Link>
              ))}
            </div>
            <Link to="/articoli/news" className="block text-right text-[#ff2020] text-[10px] font-black uppercase tracking-widest mt-6 hover:underline">Leggi tutte le notizie &gt;</Link>
          </div>
        </div>

      </div>
    </div>
  );
}