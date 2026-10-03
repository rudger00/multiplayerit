import React from 'react';
import { Link } from 'react-router-dom';

export default function ListaGiochi({
  groupedGames, 
  viewMode, 
  meseNome, 
  anno, 
  handlePrevMonth, 
  handleNextMonth, 
  prevMonthLabel, 
  nextMonthLabel 
}) {

  const hasGames = Object.keys(groupedGames).length > 0;

  return (
    <div className="flex flex-col w-full font-sans">
      
      {/* SEZIONE GIOCHI O MESSAGGIO VUOTO */}
      <div className="min-h-[300px]">
        {hasGames ? (
          Object.entries(groupedGames).map(([week, weekGames]) => (
            <div key={week} className="mb-8">
              {/* HEADER SETTIMANA */}
              <h2 className="text-[13px] text-gray-200 font-bold uppercase tracking-wide border-b border-gray-800 pb-2 mb-2">
                {week}
              </h2>
              
              <div className="flex flex-col gap-0">
                {weekGames.map((game) => (
                  <Link to={`/gioco/${game.id}`} key={game.id} className="flex flex-row items-center gap-4 py-4 border-b border-gray-800/60 hover:bg-white/5 transition-colors group px-1">
                    
                    {/* IMMAGINE PICCOLA E QUADRATA */}
                    <div className="w-[85px] h-[85px] shrink-0 overflow-hidden relative">
                      <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    
                    {/* TESTI CENTRALI */}
                    <div className="flex flex-col flex-grow justify-center">
                      <h3 className="text-[22px] font-black text-gray-100 group-hover:text-[#ff2020] transition-colors leading-tight mb-1">
                        {game.title}
                      </h3>
                      
                      <div className="text-[12px] mb-1.5">
                        <span className="text-[#ff2020] font-semibold">{game.genres}</span>
                        <span className="text-gray-400 mx-1.5">per</span>
                        <span className="text-[#ff2020] font-semibold">{game.platforms}</span>
                      </div>

                      <div className="text-[11px] text-gray-400">
                        Data di uscita: <strong className="text-gray-200">{game.date}</strong>
                      </div>
                    </div>

                    {/* VOTI A DESTRA INCOLONNATI */}
                    <div className="flex items-center gap-6 ml-auto shrink-0 pr-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">Redazione</span>
                        <span className="text-[32px] font-black text-[#ff2020] leading-none drop-shadow-sm">{game.redazione}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[#00bfff] text-[10px] font-black uppercase tracking-widest mb-1">Lettori</span>
                        <span className="text-[32px] font-black text-[#00bfff] leading-none drop-shadow-sm">{game.lettori}</span>
                      </div>
                    </div>

                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-20 border border-gray-800 bg-[#161616] rounded-sm">
            <p className="text-gray-400 font-bold text-[15px]">Nessun gioco in uscita a {meseNome} {anno}.</p>
          </div>
        )}
      </div>

      {/* PULSANTI DI NAVIGAZIONE MESE - SEMPRE VISIBILI */}
      {viewMode === 'uscita' && (
        <div className="flex items-center justify-between border-t border-gray-800 pt-6 mt-6">
          <button 
            onClick={handlePrevMonth}
            className="flex items-center gap-2 text-[#ff2020] hover:text-white transition-colors font-black text-[11px] uppercase tracking-widest"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            {prevMonthLabel}
          </button>
          
          <button 
            onClick={handleNextMonth}
            className="flex items-center gap-2 text-[#ff2020] hover:text-white transition-colors font-black text-[11px] uppercase tracking-widest"
          >
            {nextMonthLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}

    </div>
  );
}