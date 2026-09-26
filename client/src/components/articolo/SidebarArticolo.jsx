import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function SidebarArticolo({ sidebarArticles }) {
  if (!sidebarArticles || sidebarArticles.length === 0) return null;

  return (
    <div>
      <h4 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">
        Ti potrebbe interessare
      </h4>
      <div className="flex flex-col gap-4">
        {sidebarArticles.slice(0, 3).map((sideArt) => (
          <Link key={sideArt.id} to={`/articolo/${sideArt.id}`} className="flex gap-4 group cursor-pointer">
            <div className="w-24 h-16 flex-shrink-0 border border-gray-800 overflow-hidden relative">
              <img 
                src={getImg(sideArt.url_immagine)} 
                alt={sideArt.titolo} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <h5 className="text-white font-bold text-[13px] leading-snug group-hover:text-[#ff2020] transition-colors line-clamp-3">
              {sideArt.titolo}
            </h5>
          </Link>
        ))}
      </div>
    </div>
  );
}