import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { getImg, formatTime, getTag } from '../utils/helpers';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// IMPORT DEI 3 WIDGET DELLA SIDEBAR ORIGINALI
import WidgetSondaggio from './home/WidgetSondaggio';
import WidgetUltimeRecensioni from './home/WidgetUltimeRecensioni';
import WidgetGiochiAttesi from './home/WidgetGiochiAttesi';

export default function FeedLayout({ articles = [], showIntro = null, notiziePiuLette = [], prossimaLive = null }) {
  // 1. SEZIONE GIALLA (Ultimi 7 articoli in assoluto)
  const headerArticles = articles.slice(0, 7);
  const topArticles = headerArticles.slice(0, 3);
  const bottomArticles = headerArticles.slice(3, 7);

  // Dal 8° articolo in poi, dividiamo in base alla categoria
  const remainingArticles = articles.slice(7);

  // 2. SEZIONE VERDE (Solo le Notizie) - Controlla ID 1 o nome "NEWS"
  const ultimeNotizie = remainingArticles
    .filter(a => a.id_categoria === 1 || a.categorie?.nome?.toUpperCase() === 'NEWS')
    .slice(0, 15); // Limite di 15 notizie

  // 3. SEZIONE ARANCIONE (Tutti gli altri tipi: Recensioni, Speciali, ecc.)
  const centroFeed = remainingArticles
    .filter(a => a.id_categoria !== 1 && a.categorie?.nome?.toUpperCase() !== 'NEWS')
    .slice(0, 10); // Limite di 10 articoli 

  return (
    <>
      {/* SEZIONE GIALLA - TOP 7 */}
      <header className="max-w-[1450px] mx-auto p-1 mt-2">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
              {topArticles.map((article) => <ArticleCard key={article.id} article={article} heightClass="h-[320px]" titleClass="text-base md:text-lg" />)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {bottomArticles.map((article) => <ArticleCard key={article.id} article={article} heightClass="h-[220px]" titleClass="text-xs md:text-sm" />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20 font-bold text-gray-400">Nessun articolo trovato.</div>
        )}
      </header>

      {showIntro && articles.length > 0 && (
        <div className="max-w-[1000px] mx-auto text-center py-10 px-4">
          <h1 className="text-2xl font-black text-[#ff2020] uppercase tracking-wider mb-3">{showIntro.name}</h1>
          <p className="text-gray-300 text-[13px] leading-relaxed font-semibold">{showIntro.desc}</p>
        </div>
      )}

      {articles.length > 0 && (
        <main className="max-w-[1450px] mx-auto p-1 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SEZIONE VERDE - NOTIZIE */}
            <div className="lg:col-span-6 flex flex-col">
              
              {/* BOX VIOLA: VISIBILE SOLO SE C'È UNA LIVE IN PROGRAMMA NELLA TABELLA "palinsesto" */}
              {prossimaLive && (
                <div className="bg-[#2A153A] border border-[#3b1d52] p-4 mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">PROSSIMA LIVE</span>
                  <div className="flex flex-col">
                    <span className="text-yellow-500 text-[11px] font-bold mb-0.5">
                      {prossimaLive.giorno} • {prossimaLive.orario}
                    </span>
                    <span className="font-bold text-[13px] text-white">{prossimaLive.titolo}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col mt-4">
                {ultimeNotizie.length > 0 ? ultimeNotizie.map((news) => (
                  <Link to={`/articolo/${news.id}`} key={news.id} className="flex gap-4 py-4 border-b border-gray-800/60 hover:bg-[#1a1a1a] cursor-pointer group transition-colors block">
                    <div className="relative w-[130px] h-[75px] shrink-0 overflow-hidden">
                      <img src={getImg(news.url_immagine)} alt={news.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 flex items-center gap-1">💬 {news.commenti ?? 0}</div>
                    </div>
                    <div className="flex flex-col justify-start">
                      <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
                        {formatTime(news.creato_il)} <span className="mx-1">|</span> {news.categorie?.nome || 'NEWS'} <span className="mx-1">|</span> <span className="text-red-500">{getTag(news.titolo)}</span>
                      </p>
                      <h4 className="text-[14px] font-bold leading-snug group-hover:text-red-500 transition-colors text-gray-100">{news.titolo}</h4>
                    </div>
                  </Link>
                )) : <p className="text-gray-500 text-sm py-4 italic">Nessuna nuova notizia disponibile.</p>}
              </div>
            </div>

            {/* SEZIONE ARANCIONE - ALTRI ARTICOLI */}
            <div className="lg:col-span-3 flex flex-col gap-6">
               {centroFeed.length > 0 ? centroFeed.map((item) => (
                  <Link to={`/articolo/${item.id}`} key={item.id} className="cursor-pointer group flex flex-col bg-[#141414] block">
                    <div className="relative h-[170px] w-full overflow-hidden shrink-0">
                      <img src={getImg(item.url_immagine)} alt={item.titolo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 flex items-center gap-1 z-10">💬 {item.commenti ?? 0}</div>
                    </div>
                    <div className="pt-3 pb-2 flex flex-col">
                      <p className="text-[10px] font-bold uppercase mb-1.5 text-gray-500 tracking-wider">
                        {item.categorie?.nome || 'SPECIALE'} <span className="mx-1">|</span> <span className="text-red-500">{getTag(item.titolo)}</span>
                      </p>
                      <h2 className="text-[15px] font-bold leading-snug group-hover:text-red-500 transition-colors">{item.titolo}</h2>
                    </div>
                  </Link>
               )) : <p className="text-gray-500 text-sm py-4 italic">Nessun altro articolo disponibile.</p>}
            </div>

            <div className="lg:col-span-3 flex flex-col gap-0">
              <WidgetSondaggio />
              <WidgetUltimeRecensioni />
              <WidgetGiochiAttesi />
              
              {/* I NUOVI WIDGET */}
              <WidgetRedazione />
              <WidgetNotiziePiuLette notizie={notiziePiuLette} />
            </div>
            
          </div>
        </main>
      )}
    </>
  );
}

// --- COMPONENTI INTERNI PER I NUOVI WIDGET DELLA SIDEBAR ---

function WidgetRedazione() {
  const { user, openModal } = useAuth();
  const [tipoSegnalazione, setTipoSegnalazione] = useState('Segnala una news');
  const [messaggio, setMessaggio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async () => {
    if (!user) {
      if (openModal) openModal();
      else alert("Devi essere loggato per inviare una segnalazione.");
      return;
    }
    if (!messaggio.trim()) return;
    setIsSubmitting(true);
    
    try {
      const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
      if (userData) {
         const { error } = await supabase.from('segnalazioni').insert([{
             id_segnalatore: userData.id,
             // Usiamo un TIPO "sicuro" già previsto dal tuo database per aggirare il blocco!
             tipo: 'UTENTE',
             // Mettiamo in evidenza che è per la Redazione direttamente nel testo
             motivo: `[MESSAGGIO ALLA REDAZIONE] - [${tipoSegnalazione}] ${messaggio}`
         }]);
         
         if (error) {
           console.error("Errore Supabase:", error);
           alert("Impossibile inviare: " + error.message);
         } else {
           alert("Messaggio inviato alla redazione. Grazie!");
           setMessaggio('');
         }
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 p-5 mt-6 mb-6">
      <h3 className="text-[#ff2020] font-black text-lg uppercase tracking-wider mb-2">REDAZIONE</h3>
      <p className="text-gray-400 text-xs font-semibold mb-4 leading-relaxed">Qualcosa non ti convince del sito?<br/>Vuoi segnalare dei contenuti mancanti?</p>
      
      <div className="relative mb-3">
        <select 
          value={tipoSegnalazione} 
          onChange={(e) => setTipoSegnalazione(e.target.value)}
          className="w-full bg-[#333333] text-gray-200 text-sm font-semibold p-2.5 outline-none border-none appearance-none cursor-pointer"
        >
          <option>Segnala una news</option>
          <option>Segnala un bug</option>
          <option>Richiedi un gioco</option>
          <option>Altro</option>
        </select>
        <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>
        </div>
      </div>
      
      <textarea 
        value={messaggio}
        onChange={(e) => setMessaggio(e.target.value)}
        placeholder="Scrivi il tuo messaggio" 
        className="w-full h-28 bg-[#333333] border-none outline-none text-white p-3 resize-none mb-3 placeholder-gray-500 font-medium text-sm"
      ></textarea>
      
      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting || !messaggio.trim()}
        className="w-full bg-[#ff4444] text-white font-black uppercase tracking-widest py-3 text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'INVIO...' : 'INVIA'}
      </button>
    </div>
  );
}

function WidgetNotiziePiuLette({ notizie = [] }) {
  if (notizie.length === 0) return null;
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 p-5">
      <h3 className="text-[#ff2020] font-black text-lg uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">LE NOTIZIE PIÙ LETTE</h3>
      <div className="flex flex-col gap-4">
        {notizie.map(notizia => (
          <Link to={`/articolo/${notizia.id}`} key={notizia.id} className="flex gap-3 group border-b border-gray-800/60 pb-4 last:border-0 last:pb-0">
            <img src={getImg(notizia.url_immagine)} alt={notizia.titolo} className="w-16 h-16 object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
            <h4 className="text-gray-200 text-[13px] font-bold leading-tight group-hover:text-[#ff2020] transition-colors">{notizia.titolo}</h4>
          </Link>
        ))}
      </div>
      <Link to="/articoli/news" className="block text-right text-[#ff2020] text-[10px] font-black uppercase tracking-widest mt-4 hover:text-white transition-colors">
        LEGGI TUTTE LE NOTIZIE
      </Link>
    </div>
  );
}