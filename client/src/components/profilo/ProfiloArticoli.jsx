import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function ProfiloArticoli({ articles }) {
  
  // Funzione per formattare la data come "un'ora fa" o "04/10/2026"
  const formattaDataArticolo = (dataIso) => {
    if (!dataIso) return '';
    const dateObj = new Date(dataIso);
    const diffHours = Math.floor((new Date() - dateObj) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Pochi minuti fa";
    if (diffHours === 1) return "un'ora fa";
    if (diffHours < 24) return `${diffHours} ore fa`;
    
    return dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex flex-col animate-fadeIn">
      <h2 className="text-white font-black text-[28px] uppercase tracking-tight mb-6">Articoli</h2>
      
      {articles.length > 0 ? (
        <div className="flex flex-col gap-0 border-t border-gray-800">
          {articles.map(art => (
            <Link to={`/articolo/${art.id}`} key={art.id} className="flex flex-col md:flex-row gap-5 py-5 border-b border-gray-800/60 hover:bg-white/5 transition-colors group">
              
              {/* IMMAGINE QUADRATA A SINISTRA */}
              <div className="w-[140px] h-[140px] shrink-0 overflow-hidden relative">
                <img 
                  src={getImg(art.url_immagine)} 
                  alt={art.titolo} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
              
              {/* CONTENUTO A DESTRA */}
              <div className="flex flex-col justify-start">
                <span className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest mb-1">
                  {art.categorie?.nome || 'ARTICOLO'}
                </span>
                
                <h3 className="text-xl font-bold leading-tight text-white group-hover:text-[#ff2020] transition-colors mb-2">
                  {art.titolo}
                </h3>
                
                <p className="text-[13px] text-gray-300 leading-relaxed line-clamp-3">
                  <span className="text-gray-400 font-semibold mr-1">{formattaDataArticolo(art.creato_il)} -</span>
                  {/* Rimuove eventuali tag HTML dal sommario se presenti */}
                  {art.sommario ? art.sommario.replace(/<[^>]+>/g, '') : 'Nessun testo disponibile per questo articolo.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[#222] p-8 border border-gray-700 rounded-sm text-center flex flex-col items-center justify-center">
          <p className="text-gray-400 text-[15px] font-bold">Non hai ancora pubblicato alcun articolo.</p>
        </div>
      )}
    </div>
  );
}