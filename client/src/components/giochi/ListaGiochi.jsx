import React from 'react';
import { Link } from 'react-router-dom';

export default function ListaGiochi({ groupedGames, viewMode, meseNome, anno, handlePrevMonth, handleNextMonth, prevMonthLabel, nextMonthLabel }) {
  if (Object.keys(groupedGames).length === 0) {
    return (
      <p className="text-gray-400 py-10 font-bold">
        Nessun gioco {viewMode === 'uscita' ? `in uscita a ${meseNome} ${anno}` : 'trovato per i filtri selezionati'}.
      </p>
    );
  }

  return (
    <>
      {Object.keys(groupedGames).map((weekGroup, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          {viewMode === 'uscita' && (
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2 mb-2">
              {weekGroup}
            </h2>
          )}

          <div className="flex flex-col">
            {groupedGames[weekGroup].map((game) => (
              <div key={game.id} className="flex items-center justify-between py-5 border-b border-gray-800/80 group">
                
                <div className="flex items-center gap-5 pr-4">
                  <Link to={`/gioco/${game.id}`}>
                    <img src={game.img} alt={game.title} className="w-[85px] h-[85px] object-cover rounded-sm shadow-md hover:opacity-80 transition-opacity" />
                  </Link>
                  <div className="flex flex-col justify-center text-left">
                    <Link to={`/gioco/${game.id}`}>
                      <h3 className="text-[22px] font-black leading-tight text-white mb-1 hover:text-[#ff2020] transition-colors">
                        {game.title}
                      </h3>
                    </Link>
                    <p className="text-[12px] font-semibold mb-1 leading-snug">
                      <span className="text-[#ff2020]">{game.genres}</span>
                      <span className="text-gray-500 mx-1">per</span>
                      <span className="text-[#ff2020]">{game.platforms}</span>
                    </p>
                    <p className="text-[11px] font-bold text-gray-500">
                      Data di uscita: <strong className="text-gray-300">{game.date}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 shrink-0 pl-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">Redazione</span>
                    {game.reviewId && game.redazione !== '-' ? (
                      <Link 
                        to={`/articolo/${game.reviewId}`} 
                        className="text-[#ff2020] text-[32px] font-black leading-none hover:text-white transition-colors cursor-pointer"
                        title="Leggi la recensione"
                      >
                        {game.redazione}
                      </Link>
                    ) : (
                      <span className="text-[#ff2020] text-[32px] font-black leading-none">{game.redazione}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[#00bfff] text-[10px] font-black uppercase tracking-widest mb-1">Lettori</span>
                    <span className="text-[#00bfff] text-[32px] font-black leading-none">{game.lettori}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      ))}

      {viewMode === 'uscita' ? (
        <div className="flex justify-between mt-10 mb-8 border-t border-gray-800 pt-6">
          <button onClick={handlePrevMonth} className="border border-gray-600 hover:border-[#ff2020] hover:text-[#ff2020] text-gray-300 font-black text-[12px] uppercase px-6 py-3 rounded-full tracking-widest transition-colors">
            ‹ {prevMonthLabel}
          </button>
          <button onClick={handleNextMonth} className="border border-gray-600 hover:border-[#ff2020] hover:text-[#ff2020] text-gray-300 font-black text-[12px] uppercase px-6 py-3 rounded-full tracking-widest transition-colors">
            {nextMonthLabel} ›
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 mt-12 mb-8 border-t border-gray-800 pt-8">
          <button className="w-8 h-8 rounded-full bg-[#ff2020] text-white font-black text-sm flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">2</button>
          <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">›</button>
        </div>
      )}
    </>
  );
}