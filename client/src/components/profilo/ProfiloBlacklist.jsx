import React from 'react';

export default function ProfiloBlacklist({ blacklist, handleUnblock }) {
  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
        <span className="text-3xl">🔒</span>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">La tua Blacklist</h2>
          <p className="text-gray-400 text-[13px] mt-1">Gli utenti in questa lista sono stati bloccati. I loro commenti saranno oscurati.</p>
        </div>
      </div>

      {blacklist.length === 0 ? (
        <p className="text-gray-500 italic text-center py-10 font-bold">La tua blacklist è vuota.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blacklist.map(blockedUser => {
            const avatar = Array.isArray(blockedUser.profili) ? blockedUser.profili[0]?.avatar_url : blockedUser.profili?.avatar_url;
            return (
              <div key={blockedUser.id} className="bg-[#222] border border-gray-800 p-4 flex items-center justify-between rounded-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#111] overflow-hidden border-2 border-gray-600 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#ff2020] font-black text-xl uppercase">{blockedUser.username?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-white font-bold text-[15px]">{blockedUser.username}</span>
                </div>
                <button 
                  onClick={() => handleUnblock(blockedUser.id)} 
                  className="text-[10px] bg-gray-700 hover:bg-gray-500 text-white font-black px-4 py-2 uppercase tracking-widest transition-colors rounded-sm"
                >
                  Sblocca
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}