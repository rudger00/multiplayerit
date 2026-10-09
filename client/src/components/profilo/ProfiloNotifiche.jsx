import React from 'react';

export default function ProfiloNotifiche({ notifiche, markAllAsRead, handleNotificationClick, timeAgo }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <h2 className="text-white font-black text-[22px] uppercase tracking-tight">Notifiche</h2>
      </div>
      <div className="flex justify-end mb-6">
        <span onClick={markAllAsRead} className="text-[#ff2020] text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Segna tutte come lette
        </span>
      </div>
      <div className="flex flex-col">
        {notifiche.length > 0 ? notifiche.map(n => (
          <div key={n.id} onClick={() => handleNotificationClick(n)} className="flex items-center justify-between border-b border-gray-800 py-4 cursor-pointer hover:bg-white/5 transition-colors px-2 rounded-sm group">
            <div className="flex items-center gap-4">
              {!n.letta ? (<div className="w-3 h-3 rounded-full border-2 border-[#ff2020] flex-shrink-0"></div>) : (<div className="w-3 h-3 rounded-full border-2 border-gray-600 flex-shrink-0"></div>)}
              <span className="text-white font-bold text-[15px] group-hover:text-gray-200 transition-colors leading-snug">{n.testo}</span>
            </div>
            <span className="text-gray-500 text-[12px] font-bold ml-4 whitespace-nowrap">{timeAgo(n.creato_il)}</span>
          </div>
        )) : (<p className="text-gray-500 text-center py-10 font-bold">Non hai nessuna notifica.</p>)}
      </div>
    </>
  );
}