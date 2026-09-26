import React from 'react';
import { getImg } from '../../utils/helpers';

export default function ProfiloSalvati({ savedArticles, handleUnsaveArticle, formattaData, navigate }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-2">
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Articoli Salvati</h2>
      </div>
      <div className="flex flex-col">
        {savedArticles.length > 0 ? savedArticles.map(salvato => (
          <div key={salvato.id_articolo} className="flex items-center justify-between border-b border-gray-800 py-5 pr-4">
            <div className="flex items-center gap-5 cursor-pointer group w-[80%]" onClick={() => navigate(`/articolo/${salvato.id_articolo}`)}>
              <img src={getImg(salvato.articoli?.url_immagine)} alt={salvato.articoli?.titolo} className="w-[130px] h-[75px] object-cover rounded-sm shadow-md group-hover:opacity-80 transition-opacity flex-shrink-0" />
              <div className="flex flex-col justify-center">
                <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">{salvato.articoli?.categorie?.nome || 'Articolo'}</span>
                <span className="text-white font-bold text-[15px] group-hover:text-[#ff4444] transition-colors leading-tight">{salvato.articoli?.titolo}</span>
                <span className="text-gray-500 text-[10px] font-bold mt-1">SALVATO IL {formattaData(salvato.creato_il)}</span>
              </div>
            </div>
            <button 
              onClick={() => handleUnsaveArticle(salvato.id_articolo)} 
              className="w-10 h-10 rounded-full border-2 border-[#ff2020] flex items-center justify-center text-[#ff2020] hover:bg-[#ff2020] hover:text-white transition-colors shadow-md flex-shrink-0"
              title="Rimuovi dai salvati"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" width="16" height="16">
                <path d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 93.7c1 2.9 1.6 6 1.6 9.1c0 5.4-2.1 10.6-5.9 14.4s-9 5.9-14.4 5.9H208V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V335.4H21.6c-5.4 0-10.6-2.1-14.4-5.9s-5.9-9-5.9-14.4c0-3.1 .6-6.2 1.6-9.1c13.8-40.5 42.8-73.8 79.5-93.7L93.5 64H64C46.3 64 32 49.7 32 32z"/>
              </svg>
            </button>
          </div>
        )) : (
          <p className="text-gray-500 text-center py-10 font-bold">Non hai salvato nessun articolo. Clicca su "Leggi Dopo" per aggiungerli qui.</p>
        )}
      </div>
    </>
  );
}