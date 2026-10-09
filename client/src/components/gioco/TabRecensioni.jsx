import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function TabRecensioni({ reviews, articles }) {
  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Recensioni</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>
      
      {reviews.length > 0 ? (
        <div className="flex justify-center mb-16 text-left">
          <Link to={`/articolo/${reviews[0].id}`} className="relative group w-[400px] aspect-square rounded-sm overflow-hidden block border border-gray-800">
            <img src={getImg(reviews[0].url_immagine)} alt={reviews[0].titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
              <span className="text-white text-xs font-black uppercase bg-black/50 w-fit px-2 py-1 mb-2 border border-gray-500">Recensione PC</span>
              <h3 className="text-white font-black text-xl leading-tight group-hover:text-[#ff2020] transition-colors">{reviews[0].titolo}</h3>
            </div>
            <div className="absolute bottom-6 right-6 w-12 h-12 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-[#ff2020] text-white font-black shadow-lg">10</div>
          </Link>
        </div>
      ) : <p className="text-center text-gray-500 mb-16">Nessuna recensione disponibile.</p>}
      
      <div className="flex items-center justify-center mb-8">
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
        <h2 className="text-white font-black text-lg px-4 uppercase tracking-widest text-center">Approfondimenti</h2>
        <div className="flex-1 max-w-[250px] h-[2px] bg-[#ff2020]"></div>
      </div>
      
      {/* Bottoni filtri (Attualmente decorativi) */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {['TUTTI', 'NSW', 'PC', 'PS4', 'PS5', 'XBOXSERIESX'].map(p => (
          <button key={p} className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none ${p === 'TUTTI' ? 'bg-[#ff2020] text-white border-[#ff2020]' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}>{p}</button>
        ))}
      </div>

      <div className="flex flex-col gap-4 text-left mb-10">
        {articles.slice(1, 3).map(art => (
          <Link key={art.id} to={`/articolo/${art.id}`} className="bg-[#1a1a1a] border border-gray-800 flex h-[140px] group cursor-pointer rounded-sm hover:border-gray-600 transition-colors">
            <img src={getImg(art.url_immagine)} alt={art.titolo} className="w-[220px] h-full object-cover" />
            <div className="p-5 flex flex-col justify-center flex-grow relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest">{art.categorie?.nome || 'Approfondimento'} <span className="text-gray-500">• {new Date(art.creato_il).toLocaleDateString('it-IT')}</span></span>
                <span className="text-white text-[10px] font-black bg-[#ff2020] px-2 py-0.5 rounded-full shadow-md">{art.commenti || 0}</span>
              </div>
              <h3 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff2020] transition-colors line-clamp-2">{art.titolo}</h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}