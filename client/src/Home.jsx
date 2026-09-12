<div className="relative">
  <img src={getImg(item.url_immagine)} alt={item.titolo} className="w-full h-full object-cover" />
  
  {/* BADGE DEI COMMENTI REALI SULL'IMMAGINE */}
  <div className="absolute top-0 right-0 bg-black/80 text-white text-[10px] font-bold px-1.5 py-1 flex items-center gap-1 shadow-md">
    💬 {item.commenti || 0}
  </div>
</div>