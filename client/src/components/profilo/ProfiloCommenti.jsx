import React from 'react';

export default function ProfiloCommenti({ userComments, username, avatarUrl, formattaData, navigate }) {
  
  // Calcolo l'avatar finale: se c'è l'url usa la foto, altrimenti usa l'iniziale
  const avatarFinale = avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=2a2a2a&color=fff`;

  return (
    <>
      <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-8">I tuoi Commenti</h2>
      {userComments.length > 0 ? (
        <div className="flex flex-col">
          {userComments.map(commento => (
            <div key={commento.id} className="border-b border-gray-800 py-6 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-[52px] h-[52px] rounded-full border-[2px] border-[#ff4444] p-[2px] bg-[#111]">
                      {/* Ora usa l'avatar reale! */}
                      <img src={avatarFinale} alt={username} className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[15px]">{username}</span>
                    {commento.articoli?.titolo && (
                      <span className="text-gray-500 text-xs font-semibold mt-0.5">nell'articolo: <span className="text-gray-300">{commento.articoli.titolo}</span></span>
                    )}
                  </div>
                </div>
                <span className="text-gray-400 text-[13px] font-semibold">{formattaData(commento.data)}</span>
              </div>
              <p className="text-gray-200 text-[15px] font-medium mb-6 leading-relaxed ml-[68px] whitespace-pre-wrap">{commento.testo}</p>
              <div className="flex justify-end">
                <button onClick={() => navigate(`/articolo/${commento.id_articolo}#commento-${commento.id}`)} className="bg-[#ff4444] hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-sm transition-colors shadow-md">
                  Vai al commento
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-gray-500 text-center py-10 font-bold">Non hai ancora scritto alcun commento.</p>}
    </>
  );
}