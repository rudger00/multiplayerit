import React from 'react';

export default function ConclusioniReview({ 
  article, 
  game, 
  user, 
  openModal, 
  myGameVote, 
  setMyGameVote, 
  handleSaveGameVote 
}) {
  if (!article) return null;

  const prosList = article.pro ? article.pro.split('\n').filter(p => p.trim() !== '') : ["Nessun pro specificato"];
  const consList = article.contro ? article.contro.split('\n').filter(p => p.trim() !== '') : ["Nessun contro specificato"];

  return (
    <div className="mt-16 w-full font-sans bg-[#7a1212] shadow-2xl mb-12 flex flex-col">
      {/* Box Titolo & Versione */}
      <div className="pt-8 pb-6 flex flex-col items-center">
        <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-widest drop-shadow-md">Conclusioni</h3>
        {article.versione_testata && (
          <div className="mt-4 text-center flex flex-col items-center">
            <span className="text-gray-300 text-[10px] font-black tracking-widest uppercase mb-1">Versione Testata</span>
            <span className="text-white font-bold text-sm bg-black/20 px-4 py-1 rounded-full">{article.versione_testata}</span>
          </div>
        )}
      </div>

      {/* Fascia Scura Centrale (Voti) */}
      <div className="bg-[#1a1a1a] w-full py-8 px-4 flex flex-row justify-center items-center gap-6 md:gap-24 border-y-2 border-black/30">
        <div className="flex flex-col items-center">
          <span className="text-[#ff2020] text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Multiplayer.it</span>
          <span className="text-[#ff2020] text-5xl md:text-6xl font-black leading-none drop-shadow-sm">
            {article.voto ? parseFloat(article.voto).toFixed(1) : '-'}
          </span>
        </div>
        
        <div className="flex flex-col items-center relative min-w-[120px]">
          <span className="text-gray-400 text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Il Tuo Voto</span>
          <span className="text-white text-3xl md:text-4xl font-black leading-none mb-3">
            {myGameVote ? parseFloat(myGameVote).toFixed(1) : '-'}
          </span>
          {user ? (
            <input 
              type="range" min="1" max="10" step="0.1" 
              value={myGameVote || 5} 
              onChange={(e) => setMyGameVote(e.target.value)} 
              onMouseUp={handleSaveGameVote}
              onTouchEnd={handleSaveGameVote}
              className="w-full accent-[#ff2020] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
            />
          ) : (
            <span className="text-gray-500 text-[10px] font-bold uppercase cursor-pointer hover:text-white transition-colors" onClick={openModal}>
              Accedi per votare
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[#00bfff] text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Lettori ({game?.numero_voti || 0})</span>
          <span className="text-[#00bfff] text-5xl md:text-6xl font-black leading-none drop-shadow-sm">
            {game?.voto_lettori ? parseFloat(game.voto_lettori).toFixed(1) : '-'}
          </span>
        </div>
      </div>

      {/* Testo e Pro/Contro */}
      <div className="p-8 md:p-10 flex flex-col">
        <p className="text-white text-[15px] font-medium leading-relaxed mb-10 text-justify">
          {article.testo_conclusioni || "Nessun commento conclusivo inserito."}
        </p>

        <div className="flex flex-col gap-6 w-full">
          <div className="bg-[#1a1a1a] p-6 md:p-8 border-t-[3px] border-[#28a745]">
            <h4 className="text-[#28a745] font-black text-xl mb-5 uppercase tracking-wide">PRO</h4>
            <ul className="space-y-4">
              {prosList.map((pro, idx) => (
                <li key={idx} className="flex items-start text-white text-[15px] font-medium leading-snug">
                  <span className="text-[#28a745] text-[12px] mr-4 leading-none mt-1">●</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 md:p-8 border-t-[3px] border-[#ff2020]">
            <h4 className="text-[#ff2020] font-black text-xl mb-5 uppercase tracking-wide">CONTRO</h4>
            <ul className="space-y-4">
              {consList.map((con, idx) => (
                <li key={idx} className="flex items-start text-white text-[15px] font-medium leading-snug">
                  <span className="text-[#ff2020] text-[12px] mr-4 leading-none mt-1">●</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}