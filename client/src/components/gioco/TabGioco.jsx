import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function TabGioco({ game, articles, mainVideo, loadingVideos }) {
  const coverUrl = getImg(game.url_immagine);
  const sviluppatore = game.sviluppatore || 'Non specificato';
  const publisher = game.publisher || 'Non specificato';
  const giocatori = game.giocatori || 'Non specificato';
  const lingua = game.lingua || 'Non specificata';
  const pegi = game.pegi || 'Non classificato';
  const supporto = game.supporto || 'Fisico / Digitale';
  const genres = game.giochi_generi?.map(g => g.generi.nome).join(', ') || 'Non specificato';
  const releaseDate = game.data_uscita ? new Date(game.data_uscita).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Da definire';
  
  const featuredArticle = articles[0];
  const listArticles = articles.slice(1, 5);

  return (
    <>
      <div className="text-gray-300 text-sm font-semibold leading-relaxed mb-12 text-left">
        <p className="mb-2"><strong className="text-white">{game.titolo}</strong> è un titolo sviluppato da {sviluppatore !== 'Non specificato' ? sviluppatore : 'vari sviluppatori'}.</p>
        <p>{game.descrizione || "Descrizione non disponibile al momento."} {game.descrizione && <span className="text-[#ff2020] cursor-pointer hover:underline ml-2 font-bold">Leggi tutto</span>}</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest whitespace-nowrap text-center">Video in evidenza</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>

      <div className="bg-[#1a1a1a] p-4 rounded-sm border border-gray-800 mb-16 shadow-lg flex flex-col items-center">
        {loadingVideos ? (
          <div className="w-full aspect-video flex items-center justify-center bg-black rounded-sm"><span className="text-white font-bold">Ricerca trailer in corso...</span></div>
        ) : mainVideo ? (
          <>
            <div className="w-full aspect-video bg-black relative flex items-center justify-center rounded-sm overflow-hidden mb-4">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${mainVideo.id.videoId}?autoplay=0`} title={mainVideo.snippet.title} frameBorder="0" allowFullScreen></iframe>
            </div>
            <h3 className="text-white font-bold text-xl text-center leading-tight px-4 pb-2">{mainVideo.snippet.title}</h3>
          </>
        ) : (
          <>
            <div className="w-full aspect-video bg-black relative flex items-center justify-center cursor-pointer group rounded-sm overflow-hidden mb-4">
              <img src={coverUrl} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
              <div className="relative z-10 w-16 h-12 bg-white flex items-center justify-center pl-2 rounded-sm shadow-xl">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-transparent border-l-black"></div>
              </div>
            </div>
            <h3 className="text-white font-bold text-xl text-center leading-tight px-4 pb-2">{game.titolo} - Trailer Ufficiale</h3>
          </>
        )}
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest whitespace-nowrap text-center">I contenuti più discussi</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1 mb-16">
          {featuredArticle && (
            <div className="md:col-span-6 bg-[#1a1a1a] border border-gray-800 group cursor-pointer flex flex-col relative">
              <Link to={`/articolo/${featuredArticle.id}`} className="block h-full">
                <div className="relative w-full h-[250px] overflow-hidden">
                  <img src={getImg(featuredArticle.url_immagine)} alt={featuredArticle.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute -bottom-3 right-4 bg-[#ff2020] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-md z-10">{featuredArticle.commenti || 0}</div>
                </div>
                <div className="p-5 flex flex-col flex-grow text-left">
                  <h3 className="text-white font-black text-2xl leading-tight mb-3 group-hover:text-[#ff2020] transition-colors">{featuredArticle.titolo}</h3>
                  <p className="text-gray-400 text-sm font-semibold line-clamp-3 mb-4">Scopri tutte le novità, le analisi e cosa ne pensa la community.</p>
                  <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[#ff2020]">{featuredArticle.categorie?.nome || 'Notizia'}</span>
                    <span className="text-gray-500">{new Date(featuredArticle.creato_il).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
          <div className="md:col-span-6 flex flex-col gap-1">
            {listArticles.map(art => (
              <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[115px] group cursor-pointer relative overflow-visible text-left">
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h4 className="text-white font-bold text-[15px] leading-tight group-hover:text-[#ff2020] transition-colors line-clamp-2">{art.titolo}</h4>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500 hover:text-[#ff2020] transition-colors">{art.categorie?.nome || 'Notizia'}</span>
                    <span className="text-gray-600">{new Date(art.creato_il).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
                <div className="w-[180px] h-full relative flex-shrink-0 overflow-hidden">
                  <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 bg-[#ff2020] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10">{art.commenti || 0}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (<p className="text-center text-gray-500 mb-16">Nessun articolo trovato per questo gioco.</p>)}

      <div className="bg-[#1a1a1a] border-t-2 border-[#ff2020] p-8 flex flex-col md:flex-row gap-8 mb-10 shadow-lg text-left">
        <div className="md:w-1/3">
          <h3 className="text-[#ff2020] font-black text-xl leading-tight mb-4">Informazioni dettagliate<br/>di {game.titolo}</h3>
          <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold">
            <span className="text-gray-400">Prima uscita:</span><span className="text-white font-bold">{releaseDate}</span>
            <span className="text-gray-400">Tipologia:</span><span className="text-white font-bold border-b border-gray-600 w-fit">{genres}</span>
          </div>
        </div>
        <div className="md:w-2/3 grid grid-cols-2 text-xs font-semibold gap-y-2">
          <span className="text-gray-400">Sviluppato da:</span><span className="text-white font-bold">{sviluppatore}</span>
          <span className="text-gray-400">Publisher:</span><span className="text-white font-bold">{publisher}</span>
          <span className="text-gray-400">Giocatori:</span><span className="text-white font-bold">{giocatori}</span>
          <span className="text-gray-400">Lingua:</span><span className="text-white font-bold">{lingua}</span>
          <span className="text-gray-400">PEGI:</span><span className="text-white font-bold">{pegi}</span>
          <span className="text-gray-400">Supporto:</span><span className="text-white font-bold">{supporto}</span>
        </div>
      </div>
    </>
  );
}