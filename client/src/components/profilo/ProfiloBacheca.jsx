import React from 'react';

const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function ProfiloBacheca({ bachecaMessages, newBachecaMessage, setNewBachecaMessage, handlePostBacheca, formattaDataBacheca }) {
  return (
    <div className="flex flex-col">
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

      <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-800">
        <div className="flex gap-2">
          <button className="w-6 h-6 rounded-full bg-[#ff2020] text-white text-[11px] font-bold flex items-center justify-center">1</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">2</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">3</button>
          <button className="w-6 h-6 rounded-full border border-[#ff2020] text-[#ff2020] text-[11px] font-bold flex items-center justify-center hover:bg-[#ff2020] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
        </div>
        <button className="bg-[#ff4444] text-white text-[11px] font-black uppercase px-3 py-1.5 flex items-center gap-2 rounded-sm shadow-md hover:bg-red-600 transition-colors">
          POPOLARITÀ
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
        </button>
      </div>

      <div className="flex flex-col">
        {bachecaMessages.length > 0 ? bachecaMessages.map(msg => (
          <div key={msg.id} className="py-6 border-b border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full border-2 overflow-hidden ${msg.id % 2 === 0 ? 'border-[#00bfff]' : 'border-[#ff2020]'}`}>
                    <img src={`https://ui-avatars.com/api/?name=${msg.utenti?.username || 'User'}&background=2a2a2a&color=fff`} alt={msg.utenti?.username} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -top-1 -right-1 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1a1a1a] ${msg.id % 2 === 0 ? 'bg-[#00bfff]' : 'bg-[#ff2020]'}`}>
                    {msg.id % 2 === 0 ? '95' : 'm'}
                  </div>
                </div>
                <span className="text-white font-black text-[15px]">{msg.utenti?.username || 'Utente'}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-[13px] font-semibold">{formattaDataBacheca(msg.creato_il)}</span>
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="hover:text-green-500 transition-colors"><ThumbUp /></button>
                  {msg.id % 3 === 0 && <span className="bg-[#00c853] text-white rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center leading-none">9</span>}
                  <button className="hover:text-red-500 transition-colors"><ThumbDown /></button>
                </div>
              </div>
            </div>
            <p className="text-gray-200 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{msg.testo}</p>
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <div className="flex gap-4 text-[#ff2020]">
                <span className="cursor-pointer hover:text-white transition-colors">Rispondi</span>
                <span className="cursor-pointer hover:text-white transition-colors">Permalink</span>
              </div>
              <span className="text-gray-500 cursor-pointer hover:text-white transition-colors">Segnala</span>
            </div>
          </div>
        )) : (
          <p className="text-gray-500 text-[14px] font-bold py-10 text-center">Nessun messaggio presente in bacheca. Scrivi qualcosa per iniziare!</p>
        )}
      </div>
    </div>
  );
}