import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function ListaArticoli({ articles, isRecensioni, catInfo, getCategoryLabel }) {
  if (!articles || articles.length === 0) {
    return <p className="text-gray-400 py-10 font-bold">Nessun articolo trovato.</p>;
  }

  return (
    <>
      {articles.map((item) => {
        const dateObj = new Date(item.creato_il);
        const dataCorta = dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const mese = dateObj.toLocaleDateString('it-IT', { month: 'long' });
        const meseCapitalizzato = mese.charAt(0).toUpperCase() + mese.slice(1);
        const dataLunga = `${dateObj.getDate()} ${meseCapitalizzato} ${dateObj.getFullYear()}`;
        const oreFa = Math.floor((new Date() - dateObj) / (1000 * 60 * 60));
        const dataVisualizzata = (oreFa > 0 && oreFa < 24) ? `${oreFa} ore fa` : dataCorta;

        const finalCategoryLabel = getCategoryLabel(item, catInfo);

        return (
          <Link to={`/articolo/${item.id}`} key={item.id} className="flex items-center justify-between py-5 border-b border-gray-800/80 group cursor-pointer">
            <div className="flex items-start gap-4 pr-4">
              
              <div className="relative w-[180px] h-[100px] shrink-0 overflow-hidden rounded-sm">
                <img src={getImg(item.url_immagine)} alt={item.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-1 right-1 bg-[#ff2020] text-white text-[10px] font-black px-1.5 py-0.5 flex items-center gap-1 rounded-sm">💬 {item.commenti ?? 0}</div>
              </div>
              
              <div className="flex flex-col justify-start">
                <h3 className="text-[19px] font-bold leading-tight group-hover:text-gray-300 transition-colors text-white mb-1.5">
                  {item.titolo}
                </h3>
                
                {isRecensioni ? (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest">{finalCategoryLabel}</span>
                    <span className="text-[#ff2020] text-[12px] uppercase">NSW2 PC PS5 XBOXSERIESX</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">Data di uscita: <strong className="text-gray-200">{dataLunga}</strong></span>
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 leading-relaxed mt-0.5 line-clamp-2">
                    <span className="text-[#ff2020] font-black uppercase tracking-widest text-[11px]">{finalCategoryLabel}</span>
                    <span className="font-bold text-gray-300 text-[11px]"> - {dataVisualizzata}</span>
                    <span className="mx-1.5 text-gray-500">|</span>
                    {item.corpo || 'Nessun testo disponibile per questo articolo.'}
                  </p>
                )}
              </div>
            </div>
            
            {/* VOTO REALE PRESO DAL DATABASE */}
            {isRecensioni && (
              <div className="pl-4 shrink-0">
                <span className="text-[#ff2020] text-4xl font-semibold tracking-tighter">
                  {item.voto ? parseFloat(item.voto).toFixed(1) : '-'}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </>
  );
}