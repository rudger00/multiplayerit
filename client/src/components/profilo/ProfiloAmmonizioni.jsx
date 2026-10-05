import React from 'react';

export default function ProfiloAmmonizioni({ ammonizioni, bannato }) {
  
  const hasInfractions = ammonizioni > 0 || bannato;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
        <span className="text-3xl">⚖️</span>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Status Account</h2>
          <p className="text-gray-400 text-[13px] mt-1">Qui puoi verificare eventuali sanzioni disciplinari applicate dalla moderazione.</p>
        </div>
      </div>

      {!hasInfractions ? (
        <div className="bg-[#222] border border-green-600/50 p-6 flex flex-col items-center justify-center text-center rounded-sm">
          <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 className="text-white font-bold text-lg">La tua fedina è pulita!</h3>
          <p className="text-gray-400 text-sm mt-1">Non hai ricevuto nessuna penalità. Grazie per essere un membro rispettoso della community.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {ammonizioni > 0 && !bannato && (
            <div className="bg-[#222] border-l-4 border-[#e6c200] p-5 rounded-sm">
              <h3 className="text-[#e6c200] font-black uppercase text-lg mb-2 flex items-center gap-2">
                <span className="bg-[#e6c200] w-3 h-4 block rounded-sm"></span>
                Ammonizione Ricevuta
              </h3>
              <p className="text-gray-300 text-sm font-medium mb-3">
                Il tuo account ha ricevuto <strong>{ammonizioni} cartellino giallo</strong> per violazione del regolamento del sito.
              </p>
              <p className="text-gray-500 text-xs italic">Nota bene: al raggiungimento di 2 ammonizioni scatta il ban automatico.</p>
            </div>
          )}

          {bannato && (
            <div className="bg-[#2a1111] border-l-4 border-[#ff2020] p-5 rounded-sm">
              <h3 className="text-[#ff2020] font-black uppercase text-lg mb-2 flex items-center gap-2">
                <span className="bg-[#ff2020] w-3 h-4 block rounded-sm"></span>
                Account Bannato
              </h3>
              <p className="text-gray-300 text-sm font-medium">
                Il tuo account è stato <strong>permanentemente disabilitato</strong> dallo staff. Non ti è più permesso lasciare commenti, partecipare alla bacheca o votare i contenuti.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}