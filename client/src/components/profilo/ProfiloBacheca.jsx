import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // AGGIUNTO L'IMPORT MANCANTE

const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function ProfiloBacheca({ 
  bachecaMessages, 
  newBachecaMessage, 
  setNewBachecaMessage, 
  handlePostBacheca, 
  formattaDataBacheca,
  sortBacheca,
  setSortBacheca,
  onOpenReport,
  handleVoteBacheca 
}) {

  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const messaggiOrdinati = [...bachecaMessages].sort((a, b) => {
    if (sortBacheca === 'recenti') return new Date(b.creato_il) - new Date(a.creato_il);
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    return scoreB - scoreA; 
  });

  const handleReplyClick = (username) => {
    setNewBachecaMessage(prev => prev ? `${prev} @${username} ` : `@${username} `);
    const inputEl = document.getElementById('bacheca-input');
    if (inputEl) {
      inputEl.focus();
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePermalink = (msgId) => {
    const url = `${window.location.origin}/profilo#msg-${msgId}`;
    navigator.clipboard.writeText(url);
    alert("Permalink copiato negli appunti! Ora puoi incollarlo dove vuoi.");
  };

  return (
    <div className="flex flex-col animate-fadeIn">
      <h2 className="text-white font-black text-[28px] uppercase tracking-tight mb-6">Bacheca</h2>
      
      <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4">
        <div className="text-white font-black text-[13px] uppercase tracking-widest">
          <span className="text-[#ff2020] mr-1">{bachecaMessages.length}</span> COMMENTI
        </div>
        <div className="text-[#ff2020] font-black text-[11px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
          REGOLAMENTO
        </div>
      </div>

      <div className="bg-[#2a2a2a] p-1 rounded-sm mb-6 flex items-center border border-transparent focus-within:border-gray-500 transition-colors shadow-inner">
        <input 
          id="bacheca-input"
          type="text"
          placeholder="Lascia un commento..." 
          className="w-full bg-transparent text-gray-200 p-2.5 outline-none text-[14px] font-medium placeholder-gray-500"
          value={newBachecaMessage}
          onChange={(e) => setNewBachecaMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handlePostBacheca();
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800 relative">
        <div className="flex gap-2">
          <button className="w-6 h-6 rounded-full bg-[#ff2020] text-white text-[11px] font-bold flex items-center justify-center">1</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">2</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">3</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="bg-[#ff4444] text-white text-[11px] font-black uppercase px-3 py-1.5 flex items-center gap-2 rounded-sm shadow-md hover:bg-red-600 transition-colors"
          >
            {sortBacheca === 'recenti' ? 'DATA' : 'POPOLARITÀ'}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className={`transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
          </button>

          {isSortMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-gray-800 shadow-2xl z-50 flex flex-col">
              <button 
                onClick={() => { setSortBacheca('popolarita'); setIsSortMenuOpen(false); }} 
                className={`text-left px-4 py-2.5 text-[11px] font-black uppercase transition-colors hover:bg-white/5 ${sortBacheca === 'popolarita' ? 'text-[#ff4444]' : 'text-gray-300'}`}
              >
                Popolarità
              </button>
              <button 
                onClick={() => { setSortBacheca('recenti'); setIsSortMenuOpen(false); }} 
                className={`text-left px-4 py-2.5 text-[11px] font-black uppercase transition-colors hover:bg-white/5 ${sortBacheca === 'recenti' ? 'text-[#ff4444]' : 'text-gray-300'}`}
              >
                Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {messaggiOrdinati.length > 0 ? messaggiOrdinati.map(msg => {
          
          const realScore = (msg.upvotes || 0) - (msg.downvotes || 0);
          const isPositive = realScore >= 0;

          const profiliData = msg.utenti?.profili;
          const avatarReale = Array.isArray(profiliData) ? profiliData[0]?.avatar_url : profiliData?.avatar_url;
          const avatarFinale = avatarReale || `https://ui-avatars.com/api/?name=${msg.utenti?.username || 'User'}&background=2a2a2a&color=fff`;

          return (
            <div key={msg.id} id={`msg-${msg.id}`} className="py-6 border-b border-gray-800/60 flex flex-col">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-[2px] border-dashed border-gray-500 p-0.5 flex items-center justify-center">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#222]">
                        <img src={avatarFinale} alt={msg.utenti?.username} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="absolute top-0 -right-1 text-white text-[9px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#1a1a1a] bg-[#00bfff]">
                      48
                    </div>
                  </div>
                  
                  {/* LINK CLICCABILE INSERITO QUI */}
                  {msg.utenti?.username ? (
                    <Link to={`/utente/${msg.utenti.username}`} className="text-white font-bold text-[15px] hover:text-[#ff4444] transition-colors">
                      {msg.utenti.username}
                    </Link>
                  ) : (
                    <span className="text-white font-bold text-[15px]">Utente</span>
                  )}
                  
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-[13px]">{formattaDataBacheca(msg.creato_il)}</span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <button onClick={() => handleVoteBacheca(msg.id, 1)} className="hover:text-white transition-colors"><ThumbUp /></button>
                    
                    <div className={`${isPositive ? 'bg-[#00b259]' : 'bg-[#ff2020]'} text-white rounded-full text-[11px] font-black w-[20px] h-[20px] flex items-center justify-center shadow-sm`}>
                      {Math.abs(realScore)}
                    </div>
                    
                    <button onClick={() => handleVoteBacheca(msg.id, -1)} className="hover:text-white transition-colors"><ThumbDown /></button>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{msg.testo}</p>
              
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex gap-4 text-[#ff4444]">
                  <span onClick={() => handleReplyClick(msg.utenti?.username)} className="cursor-pointer hover:text-red-400 transition-colors">Rispondi</span>
                  <span onClick={() => handlePermalink(msg.id)} className="cursor-pointer hover:text-red-400 transition-colors">Permalink</span>
                </div>
                
                <span onClick={() => onOpenReport(msg.id)} className="text-gray-500 cursor-pointer hover:text-white transition-colors">
                  Segnala
                </span>
              </div>

            </div>
          );
        }) : (
          <p className="text-gray-500 text-[14px] font-bold py-10 text-center">Nessun messaggio presente in bacheca. Scrivi qualcosa per iniziare!</p>
        )}
      </div>
    </div>
  );
}