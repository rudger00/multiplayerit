import React from 'react';
import { Link } from 'react-router-dom';

const ChevronCircle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>
);

export default function SidebarFiltri({ 
  isRecensioni, 
  isTipologiaOpen, 
  setIsTipologiaOpen, 
  currentCatKey, 
  navigate, 
  CATEGORY_MAP, 
  isPiattaformeOpen, 
  setIsPiattaformeOpen, 
  activePlatform, 
  setActivePlatform, 
  SIDEBAR_PLATFORMS 
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-sm p-5 border border-gray-800">
      <div className="flex flex-col gap-3 font-bold text-[14px]">
        
        {isRecensioni && (
          <>
            <Link to="/giochi" className="block hover:text-white text-gray-300 transition-colors">In uscita</Link>
            <Link to="/giochi" className="block hover:text-white text-gray-300 transition-colors mb-2">I migliori</Link>
          </>
        )}
        
        <div className={`flex flex-col border-t border-gray-800 pt-3 ${!isRecensioni ? 'border-t-0 pt-0' : ''}`}>
          <div className="flex items-center justify-between cursor-pointer py-1 group" onClick={() => setIsTipologiaOpen(!isTipologiaOpen)}>
            <div className="flex items-center gap-2 text-white"><span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isTipologiaOpen} /></span>Tipologia</div>
            <div className="bg-[#ff2020] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none h-5">
              {currentCatKey === 'tutte' ? 'TUTTI' : currentCatKey}
              {currentCatKey !== 'tutte' && <span className="ml-0.5 cursor-pointer hover:text-black transition-colors text-[10px]" onClick={(e) => { e.stopPropagation(); navigate('/articoli/tutte'); }}>✕</span>}
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isTipologiaOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <ul className="flex flex-col gap-2 pl-[26px] pb-2 text-[13px] font-semibold text-[#888]">
              {Object.keys(CATEGORY_MAP).filter(k => k !== 'tutte' && k !== 'notizie').map(key => (
                <li key={key} onClick={() => navigate(`/articoli/${key}`)} className={`cursor-pointer transition-colors capitalize ${currentCatKey === key ? 'text-[#ff2020]' : 'hover:text-gray-200'}`}>{key}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col border-t border-gray-800 pt-3 mt-1">
          <div className={`flex items-center justify-between cursor-pointer py-1 group rounded-sm ${isPiattaformeOpen ? 'ring-1 ring-gray-600 px-2 -mx-2 bg-[#222]' : ''}`} onClick={() => setIsPiattaformeOpen(!isPiattaformeOpen)}>
            <div className="flex items-center gap-2 text-white"><span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isPiattaformeOpen} /></span>Piattaforme</div>
            <div className="bg-[#ff2020] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none h-5">
              {activePlatform === 'tutte' ? 'TUTTE' : activePlatform}
              {activePlatform !== 'tutte' && <span className="ml-0.5 cursor-pointer hover:text-black transition-colors text-[10px]" onClick={(e) => { e.stopPropagation(); setActivePlatform('tutte'); }}>✕</span>}
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPiattaformeOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <ul className="flex flex-col gap-2 pl-[26px] pb-2 text-[13px] font-semibold text-[#888]">
              {SIDEBAR_PLATFORMS.map(plat => (
                <li key={plat} onClick={() => setActivePlatform(plat)} className={`cursor-pointer transition-colors uppercase ${activePlatform === plat ? 'text-[#ff2020]' : 'hover:text-gray-200'}`}>{plat}</li>
              ))}
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}