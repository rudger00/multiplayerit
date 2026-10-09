import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function TabNotizie({ news }) {
  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Ultimi aggiornamenti</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>

      {/* Bottoni filtri (Attualmente decorativi) */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {['TUTTI', 'NSW', 'PC', 'PS4', 'PS5', 'XBOXSERIESX'].map(p => (
          <button key={p} className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none ${p === 'TUTTI' ? 'bg-[#ff2020] text-white border-[#ff2020]' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}>{p}</button>
        ))}
      </div>

      <div className="flex flex-col gap-4 text-left mb-10">
        {news.map(art => (
          <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[140px] group cursor-pointer rounded-sm hover:border-gray-600 transition-colors">
            <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-[220px] h-full object-cover" />
            <div className="p-5 flex flex-col justify-center flex-grow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest">{art.categorie?.nome || 'Notizia'} <span className="text-gray-500">• {new Date(art.creato_il).toLocaleDateString('it-IT')}</span></span>
                <span className="text-gray-500 text-xs flex items-center gap-1 font-bold">{art.commenti || 0} <span className="text-[#ff2020] text-base leading-none">●</span></span>
              </div>
              <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff2020] transition-colors">{art.titolo}</h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}