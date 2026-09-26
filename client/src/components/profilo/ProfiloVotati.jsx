import React from 'react';
import { getImg } from '../../utils/helpers';

export default function ProfiloVotati({ votedGames, navigate }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-2">
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Giochi Votati</h2>
      </div>
      <div className="flex flex-col">
        {votedGames.length > 0 ? votedGames.map(votoItem => (
          <div key={votoItem.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-5 pr-4">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${votoItem.id_gioco}`)}>
              <img src={getImg(votoItem.giochi?.url_immagine)} alt={votoItem.giochi?.titolo} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
              <div className="flex flex-col">
                <span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{votoItem.giochi?.titolo}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Il tuo voto</span>
              <div className="w-10 h-10 rounded-full border-2 border-[#ff4444] text-white flex items-center justify-center font-black text-sm shadow-md bg-[#111]">
                {parseFloat(votoItem.voto).toFixed(1)}
              </div>
            </div>
          </div>
        )) : (<p className="text-gray-500 text-center py-10 font-bold">Non hai ancora votato nessun gioco.</p>)}
      </div>
    </>
  );
}