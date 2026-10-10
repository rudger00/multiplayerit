import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

const PLATFORMS = ['TUTTI', 'NSW', 'PC', 'PS4', 'PS5', 'XBOXSERIESX'];

function matchesPlatform(article, platform) {
  if (platform === 'TUTTI') return true;
  const platformData = [
    article.piattaforma,
    article.platform,
    article.piattaforme,
    article.nome_piattaforma,
    article.gioco_piattaforma,
  ]
    .flat(Infinity)
    .filter(Boolean)
    .map(value => typeof value === 'object' ? (value.nome || value.name || '') : String(value))
    .join(' ');
  const text = `${platformData} ${article.titolo || ''}`.toUpperCase();
  const aliases = {
    NSW: ['NSW', 'NINTENDO SWITCH', 'SWITCH'],
    PC: ['PC', 'WINDOWS', 'STEAM'],
    PS4: ['PS4', 'PLAYSTATION 4', 'PLAYSTATION4'],
    PS5: ['PS5', 'PLAYSTATION 5', 'PLAYSTATION5'],
    XBOXSERIESX: ['XBOXSERIESX', 'XBOX SERIES X', 'XBOX SERIES S', 'XBOX SERIES'],
  };
  return aliases[platform].some(alias => text.includes(alias));
}

export default function TabRecensioni({ reviews = [], articles = [] }) {
  const [selectedPlatform, setSelectedPlatform] = useState('TUTTI');
  const filteredArticles = useMemo(
    () => articles.filter(article => matchesPlatform(article, selectedPlatform)),
    [articles, selectedPlatform]
  );
  const filteredReviews = useMemo(
    () => reviews.filter(article => matchesPlatform(article, selectedPlatform)),
    [reviews, selectedPlatform]
  );
  const featuredReview = filteredReviews[0];

  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]" />
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Recensioni</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]" />
      </div>

      {featuredReview ? (
        <div className="flex justify-center mb-16 text-left">
          <Link to={`/articolo/${featuredReview.id}`} className="relative group w-[400px] max-w-full aspect-square rounded-sm overflow-hidden block border border-gray-800">
            <img src={getImg(featuredReview.url_immagine)} alt={featuredReview.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
              <span className="text-white text-xs font-black uppercase bg-black/50 w-fit px-2 py-1 mb-2 border border-gray-500">Recensione</span>
              <h3 className="text-white font-black text-xl leading-tight group-hover:text-[#ff2020] transition-colors">{featuredReview.titolo}</h3>
            </div>
            <div className="absolute bottom-6 right-6 w-12 h-12 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-[#ff2020] text-white font-black shadow-lg">{featuredReview.voto ?? '-'}</div>
          </Link>
        </div>
      ) : <p className="text-center text-gray-500 mb-16">Nessuna recensione disponibile per {selectedPlatform}.</p>}

      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]" />
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Approfondimenti</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]" />
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap" role="group" aria-label="Filtra approfondimenti per piattaforma">
        {PLATFORMS.map(platform => (
          <button
            key={platform}
            type="button"
            onClick={() => setSelectedPlatform(platform)}
            aria-pressed={selectedPlatform === platform}
            className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none transition-colors ${selectedPlatform === platform ? 'bg-[#ff2020] text-white border-[#ff2020]' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 text-left mb-10">
        {filteredArticles.filter(article => article.categorie?.nome !== 'Recensione').length > 0 ? (
          filteredArticles.filter(article => article.categorie?.nome !== 'Recensione').slice(0, 3).map(art => (
            <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex min-h-[140px] group cursor-pointer rounded-sm hover:border-gray-600 transition-colors overflow-hidden">
              <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-[220px] min-h-[140px] object-cover" />
              <div className="p-5 flex flex-col justify-center flex-grow">
                <div className="flex justify-between items-center mb-2 gap-3">
                  <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest">{art.categorie?.nome || 'Approfondimento'} <span className="text-gray-500">• {art.creato_il ? new Date(art.creato_il).toLocaleDateString('it-IT') : ''}</span></span>
                  <span className="text-white text-[10px] font-black bg-[#ff2020] px-2 py-0.5 rounded-full shadow-md">{art.commenti || 0}</span>
                </div>
                <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff2020] transition-colors line-clamp-2">{art.titolo}</h3>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Nessun approfondimento trovato per {selectedPlatform}. Prova un'altra piattaforma o seleziona TUTTI.</p>
        )}
      </div>
    </>
  );
}
