import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../utils/helpers';

export default function ArticleCard({ article, heightClass, titleClass, showComments = true }) {
  const titolo = article.titolo || 'Senza titolo';
  const categoria = article.categorie?.nome || 'NEWS';
  const immagine = getImg(article.url_immagine);

  // Usiamo <Link> invece di un semplice <div> per abilitare la navigazione
  return (
    <Link 
      to={`/articolo/${article.id}`} 
      className={`relative block ${heightClass} w-full overflow-hidden bg-[#141414] group cursor-pointer`}
    >
      <img src={immagine} alt={titolo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
      {showComments && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 flex items-center gap-1 z-10 font-bold">
          💬 {article.commenti ?? 0}
        </div>
      )}
      <div className="absolute bottom-0 left-0 p-4 w-full z-10">
        <p className="text-yellow-400 text-[10px] font-bold mb-1 tracking-wider uppercase">{categoria}</p>
        <h2 className={`${titleClass} font-bold leading-snug text-white group-hover:underline`}>{titolo}</h2>
      </div>
    </Link>
  );
}