import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const MOCK_REVIEW_DATA = {
  testo: "Marvel's Wolverine è un titolo che sa divertire, è capace di intrattenere e soprattutto riesce a soddisfare quel desiderio viscerale di fare a pezzi qualsiasi cosa si muova a schermo con gli artigli di adamantio. La reinterpretazione di Logan e il suo legame con Jean Grey regalano momenti di buona narrazione, supportati da un comparto grafico che mostra i muscoli... Tuttavia, l'opera manca di quell'ambizione necessaria a trasformarlo nel titolo immancabile che speravamo di giocare.",
  pro: [
    "Combattimento viscerale, brutale e immediatamente divertente",
    "Ottima reinterpretazione di Logan e del suo rapporto con Jean Grey",
    "I personaggi, le espressioni e la distruttibilità sono eccellenti",
    "Ottimo il doppiaggio in italiano"
  ],
  contro: [
    "Estremamente derivativo: non aggiunge nulla al genere",
    "Struttura troppo rigida, con confini invisibili che inibiscono l'esplorazione",
    "Una volta completato, rimane ben poco da fare",
    "C'è un po' troppa sporcizia e le animazioni sono talvolta slegate"
  ]
};

const ThumbUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/></svg>;
const ThumbDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.956 14.255c.065.935.952 1.658 1.908 1.42l.261-.065a1.379 1.379 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.072 2.516-.211.518-.173.994-.68 1.2-1.272.184-.532.16-1.162-.234-1.733.058-.12.103-.242.138-.364.077-.27.113-.566.113-.855 0-.289-.036-.586-.113-.855-.039-.135-.09-.273-.16-.404.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465 0-.306-.089-.626-.253-.913C13.1.478 12.437 0 11.5 0H8c-.605 0-1.07.081-1.466.218a4.82 4.82 0 0 0-.97.484l-.048.03c-.504.307-.999.609-2.068.722C2.682 1.536 2 2.154 2 3v4c0 .85.685 1.432 1.357 1.615.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.59z"/></svg>;

export default function PaginaArticolo() {
  const { id } = useParams();
  const { user, openModal } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [game, setGame] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [userVote, setUserVote] = useState('-');
  
  const articleBodyRef = useRef(null);
  const commentInputRef = useRef(null);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('commenti')
      .select(`
        id,
        testo,
        data,
        id_commento_padre,
        utenti ( username, id_ruolo )
      `)
      .eq('id_articolo', parseInt(id))
      .order('data', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  };

  useEffect(() => {
    async function fetchArticolo() {
      setLoading(true);
      const { data, error } = await supabase
        .from('articoli')
        .select(`*, categorie ( nome )`)
        .eq('id', parseInt(id))
        .single();
        
      if (!error && data) {
        setArticle(data);
        if (data.id_gioco) {
          const { data: gameData } = await supabase
            .from('giochi')
            .select('titolo, url_immagine, giochi_generi(generi(nome)), gioco_piattaforma(piattaforme(nome))')
            .eq('id', data.id_gioco)
            .single();
          if (gameData) setGame(gameData);
        }
        await fetchComments();
      }
      setLoading(false);
    }
    window.scrollTo(0, 0);
    fetchArticolo();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleBodyRef.current) return;
      const { top, height } = articleBodyRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollPosition = -top + 56;
      const totalScrollable = height - windowHeight + 150; 
      
      let progress = (scrollPosition / totalScrollable) * 100;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handlePostComment = async () => {
    if (!user) {
      openModal();
      return;
    }
    if (!newComment.trim()) return;

    // Cerca l'utente nella tabella pubblica associata all'Auth ID
    const { data: userData, error: userError } = await supabase
      .from('utenti')
      .select('id')
      .eq('id_auth', user.id)
      .single();

    if (userError || !userData) {
      alert("ATTENZIONE: Il tuo account di test non è sincronizzato nella tabella 'utenti'. Effettua il Logout e registrati nuovamente con un nuovo account.");
      return;
    }

    const { error } = await supabase
      .from('commenti')
      .insert([
        {
          testo: newComment,
          id_articolo: parseInt(id),
          id_utente: userData.id,
          data: new Date().toISOString()
        }
      ]);

    if (!error) {
      setNewComment('');
      fetchComments();
      
      // Aggiorna anche il contatore locale dell'articolo per coerenza immediata
      setArticle(prev => ({ ...prev, commenti: (prev.commenti || 0) + 1 }));
    } else {
      alert("Errore del Database: " + error.message);
    }
  };

  if (loading) return <div className="text-white p-10 text-center font-bold">Caricamento articolo...</div>;
  if (!article) return <div className="text-white p-10 text-center font-bold">Articolo non trovato.</div>;

  const isReview = article.id_categoria === 2;
  const rawDate = new Date(article.creato_il);
  const dateFormatted = `${rawDate.getDate()} ${rawDate.toLocaleDateString('it-IT', { month: 'long' })} ${rawDate.getFullYear()}`;

  const formatCommentDate = (dateString) => {
    const commentDate = new Date(dateString);
    const oreFa = Math.floor((new Date() - commentDate) / (1000 * 60 * 60));
    if (oreFa === 0) {
      const minFa = Math.floor((new Date() - commentDate) / (1000 * 60));
      return minFa === 0 ? "Adesso" : `${minFa} minuti fa`;
    }
    if (oreFa < 24) return `${oreFa} or${oreFa === 1 ? 'a' : 'e'} fa`;
    return commentDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <div className="sticky top-14 left-0 w-full h-[3px] bg-gray-800 z-40">
        <div className="h-full bg-[#ff2020] transition-all duration-150 ease-out" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <main className="max-w-[1000px] mx-auto p-4 mt-8 pb-20">
        
        <div className="mb-8 border-b border-gray-800 pb-6">
          <span className="text-[#ff2020] text-[12px] font-black uppercase tracking-widest">{article.categorie?.nome || 'ARTICOLO'}</span>
          <h1 className="text-3xl md:text-5xl font-black mt-3 mb-4 leading-tight text-white">{article.titolo}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-wide">
            <span>Di <span className="text-white">Redazione</span></span>
            <span>{dateFormatted}</span>
            <span className="flex items-center gap-1 text-[#ff2020] font-black">💬 {comments.length}</span>
          </div>
        </div>

        {article.url_immagine && (
          <img src={getImg(article.url_immagine)} alt="Copertina" className="w-full h-auto max-h-[500px] object-cover mb-10 rounded-sm" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 relative">
          
          <div className="md:col-span-8 flex flex-col" ref={articleBodyRef}>
            <div 
              className="text-gray-300 text-[17px] leading-relaxed font-serif 
                         [&>p]:mb-5 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8
                         [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-3 [&>h3]:mt-6
                         [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-5 [&>ul>li]:mb-1
                         [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-5 [&>ol>li]:mb-1
                         [&>a]:text-[#ff2020] [&>a]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-[#ff2020] [&>blockquote]:pl-4 [&>blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: article.corpo }}
            />

            {isReview && (
              <div className="mt-12 bg-[#1a1a1a] rounded-sm overflow-hidden border border-[#2a2a2a] shadow-2xl">
                <div className="bg-[#7e0f12] py-3 text-center">
                  <h2 className="text-white text-xl font-black uppercase tracking-widest">Conclusioni</h2>
                </div>
                <div className="grid grid-cols-3 border-b border-[#2a2a2a]">
                  <div className="flex flex-col items-center justify-center p-6 border-r border-[#2a2a2a]">
                    <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">Multiplayer.it</span>
                    <span className="text-[#ff2020] text-5xl font-black">{article.voto ? parseFloat(article.voto).toFixed(1) : '-'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 border-r border-[#2a2a2a]">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Il tuo voto</span>
                    <span className="text-white text-4xl font-black mb-3">{userVote}</span>
                    <input type="range" min="0" max="10" step="0.1" value={userVote === '-' ? 5 : userVote} onChange={e => setUserVote(parseFloat(e.target.value).toFixed(1))} className="w-full accent-[#ff2020] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="flex flex-col items-center justify-center p-6">
                    <span className="text-[#00bfff] text-[10px] font-black uppercase tracking-widest mb-1">Lettori ({comments.length})</span>
                    <span className="text-[#00bfff] text-5xl font-black">7.5</span>
                  </div>
                </div>
                <div className="bg-[#5c0a0c] p-6 text-white text-[14px] leading-relaxed font-semibold">{MOCK_REVIEW_DATA.testo}</div>
                <div className="p-6 flex flex-col gap-6 bg-[#161616]">
                  <div className="bg-[#1e1e1e] p-5 border-t-[3px] border-[#107c10]">
                    <h3 className="text-[#107c10] text-lg font-black uppercase mb-3">Pro</h3>
                    <ul className="flex flex-col gap-2">{MOCK_REVIEW_DATA.pro.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-200 font-semibold"><span className="text-[#107c10] text-[10px] mt-1">●</span> {item}</li>)}</ul>
                  </div>
                  <div className="bg-[#1e1e1e] p-5 border-t-[3px] border-[#e50000]">
                    <h3 className="text-[#e50000] text-lg font-black uppercase mb-3">Contro</h3>
                    <ul className="flex flex-col gap-2">{MOCK_REVIEW_DATA.contro.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-200 font-semibold"><span className="text-[#e50000] text-[10px] mt-1">●</span> {item}</li>)}</ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-4 relative">
            {game && (
              <div className="sticky top-24 bg-[#1a1a1a] border border-gray-800 p-4 rounded-sm flex flex-col items-center text-center">
                <img src={getImg(game.url_immagine)} alt={game.titolo} className="w-full h-[180px] object-cover mb-4 rounded-sm shadow-md" />
                <h3 className="text-xl font-black text-white mb-2">{game.titolo}</h3>
                <div className="w-full border-t border-gray-800 my-3"></div>
                <div className="flex flex-col gap-2 w-full text-left text-[12px]">
                  <p className="font-bold text-gray-400">Piattaforme: <span className="text-white">{game.gioco_piattaforma?.map(p => p.piattaforme.nome).join(', ') || 'Varie'}</span></p>
                  <p className="font-bold text-gray-400">Genere: <span className="text-[#ff2020] uppercase">{game.giochi_generi?.map(g => g.generi.nome).join(', ') || 'Non specificato'}</span></p>
                </div>
                {isReview && article.voto && (
                  <div className="mt-5 w-full bg-[#ff2020] text-white py-3 flex flex-col items-center rounded-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Voto Redazione</span>
                    <span className="text-4xl font-black">{parseFloat(article.voto).toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>

        {/* SEZIONE COMMENTI REALI */}
        <div className="mt-16 pt-8 border-t border-gray-800 w-full max-w-[800px]">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">
              <span className="text-[#ff2020]">{comments.length}</span> {comments.length === 1 ? 'COMMENTO' : 'COMMENTI'}
            </h3>
            <span className="text-[#ff2020] text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Regolamento</span>
          </div>

          <div className="bg-[#2a2a2a] p-1 rounded-sm mb-12 flex items-center border border-transparent focus-within:border-[#ff2020] transition-colors">
            <input 
              ref={commentInputRef}
              type="text" 
              placeholder="Lascia un commento..." 
              className="w-full bg-transparent text-gray-200 p-2.5 outline-none text-sm placeholder-gray-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onClick={() => { if (!user) openModal(); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            />
            {newComment.trim() && user && (
              <button onClick={handlePostComment} className="text-[#ff2020] font-black uppercase text-xs px-4 hover:text-white transition-colors">INVIA</button>
            )}
          </div>

          <div className="flex flex-col">
            {comments.map((comment, index) => {
              const username = comment.utenti?.username || 'Utente';
              const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
              
              return (
                <div key={comment.id} className={`flex flex-col py-6 ${index !== comments.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={avatar} alt={username} className="w-11 h-11 rounded-full bg-gray-800 p-1 border border-gray-700" />
                        <div className="absolute -top-1 -right-1 bg-[#00bfff] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                          1
                        </div>
                      </div>
                      <span className="text-white font-bold text-[14px]">{username}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-500 text-[12px] font-semibold">
                      <span>{formatCommentDate(comment.data)}</span>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><ThumbUp /> <span className="text-green-500 bg-[#162a16] px-1.5 rounded-full text-[10px] font-black">0</span></button>
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><ThumbDown /></button>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-[14px] leading-relaxed mb-4 whitespace-pre-wrap">
                    {comment.testo.split(' ').map((word, i) => word.startsWith('@') ? <span key={i} className="text-[#00bfff] font-bold">{word} </span> : `${word} `)}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-4 text-[#ff2020]">
                      <span 
                        onClick={() => {
                          if (!user) {
                            openModal();
                          } else {
                            setNewComment(`@${username} `);
                            commentInputRef.current?.focus();
                            window.scrollTo({ top: commentInputRef.current.offsetTop - 100, behavior: 'smooth' });
                          }
                        }} 
                        className="cursor-pointer hover:text-white transition-colors"
                      >
                        Rispondi
                      </span>
                      <span className="cursor-pointer hover:text-white transition-colors">Permalink</span>
                    </div>
                    <span className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">Segnala</span>
                  </div>
                  
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </>
  );
}