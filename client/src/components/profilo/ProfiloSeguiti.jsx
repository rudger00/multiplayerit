import React from 'react';
import { getImg } from '../../utils/helpers';

export default function ProfiloSeguiti({ 
  followedGames, handleUnfollow, 
  followedEvents, handleUnfollowEvent,
  followedChannels, handleUnfollowChannel,
  formattaData, navigate 
}) {
  return (
    <div className="flex flex-col gap-10">
      
      {/* 1. CANALI TWITCH SEGUITI */}
      <div>
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-2 mb-4">Canali Twitch Seguiti</h2>
        {followedChannels && followedChannels.length > 0 ? (
          <div className="flex flex-col">
            {followedChannels.map(ch => (
              <div key={ch.id} className="flex items-center justify-between border-b border-gray-800 py-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/live')}>
                  <div className="w-12 h-12 bg-[#6441a5] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-[#1a1a1a]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-[17px] capitalize hover:text-[#6441a5] transition-colors">{ch.canale}</span>
                    <span className="text-gray-400 text-[11px] font-bold">Seguito dal {formattaData(ch.creato_il)}</span>
                  </div>
                </div>
                <button onClick={() => handleUnfollowChannel(ch.canale)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors">Rimuovi</button>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 font-bold">Nessun canale seguito.</p>}
      </div>

      {/* 2. EVENTI LIVE SEGUITI */}
      <div>
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-2 mb-4">Prossimi Eventi Seguiti</h2>
        {followedEvents && followedEvents.length > 0 ? (
          <div className="flex flex-col">
            {followedEvents.map(evt => (
              <div key={evt.id_palinsesto} className="flex items-center justify-between border-b border-gray-800 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1a1a1a] border border-[#00bfff] shadow-[0_0_8px_rgba(0,191,255,0.2)] rounded-sm flex flex-col items-center justify-center text-[#00bfff]">
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Ore</span>
                    <span className="text-[15px] font-black leading-none">{evt.palinsesto?.orario}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-[15px] leading-tight">{evt.palinsesto?.titolo}</span>
                    <span className="text-gray-400 text-[11px] font-bold mt-1">{evt.palinsesto?.giorno}</span>
                  </div>
                </div>
                <button onClick={() => handleUnfollowEvent(evt.id_palinsesto)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors">Annulla</button>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 font-bold">Nessun evento in programmazione seguito.</p>}
      </div>

      {/* 3. GIOCHI SEGUITI */}
      <div>
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight border-b border-gray-800 pb-2 mb-4">Giochi Seguiti</h2>
        {followedGames.length > 0 ? (
          <div className="flex flex-col">
            {followedGames.map(segui => (
              <div key={segui.id_gioco} className="flex items-center justify-between border-b border-gray-800 py-4">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/gioco/${segui.id_gioco}`)}>
                  <img src={getImg(segui.giochi?.url_immagine)} alt={segui.giochi?.titolo} className="w-[60px] h-[60px] object-cover bg-gray-800 shadow-md group-hover:opacity-80 transition-opacity" />
                  <div className="flex flex-col">
                    <span className="text-white font-black text-[17px] group-hover:text-[#ff4444] transition-colors">{segui.giochi?.titolo}</span>
                    <span className="text-gray-300 text-[11px] font-black uppercase tracking-widest mt-1">Aggiunto il {formattaData(segui.creato_il)}</span>
                  </div>
                </div>
                <button onClick={() => handleUnfollow(segui.id_gioco)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors shadow-md text-center">Non<br/>Seguire</button>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 font-bold">Non segui ancora nessun gioco.</p>}
      </div>

    </div>
  );
}