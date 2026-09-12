import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';

const CATEGORY_MAP = {
  'anteprime': { id: 5, title: 'ANTEPRIME', label: 'ANTEPRIMA' },
  'interviste': { id: 6, title: 'INTERVISTE', label: 'INTERVISTA' },
  'news': { id: 1, title: 'TUTTE LE NEWS', label: 'NEWS' },
  'notizie': { id: 1, title: 'TUTTE LE NOTIZIE', label: 'NEWS' },
  'provati': { id: 4, title: 'PROVATI', label: 'PROVATO' },
  'recensioni': { id: 2, title: 'RECENSIONI VIDEOGIOCHI', label: 'RECENSIONE' },
  'rubriche': { id: 7, title: 'RUBRICHE', label: 'RUBRICA' },
  'soluzioni': { id: 8, title: 'SOLUZIONI', label: 'SOLUZIONE' },
  'speciali': { id: 3, title: 'SPECIALI', label: 'SPECIALE' },
  'trucchi': { id: 9, title: 'TRUCCHI', label: 'TRUCCO' },
  'video': { id: 10, title: 'VIDEO', label: 'VIDEO' },
  'tutte': { id: null, title: 'ARTICOLI VIDEOGIOCHI', label: 'ARTICOLO' }
};

const SIDEBAR_PLATFORMS = ['ANDROID', 'IPAD', 'IPHONE', 'NSW', 'PC', 'PS4', 'PS5', 'WII', 'WIIU', 'XBOXSERIESX', 'XONE'];
const PLATFORM_ID_MAP = {
  'PC': 1, 'PS5': 2, 'PS4': 3, 'XBOXSERIESX': 4, 'XONE': 5, 'NSW': 6, 'IOS': 7, 'IPHONE': 7, 'IPAD': 7, 'ANDROID': 8
};

const ChevronCircle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>
);

const getCategoryLabel = (item, catInfo) => {
  const joinName = Array.isArray(item.categorie) ? item.categorie[0]?.nome : item.categorie?.nome;
  if (joinName) return joinName.toUpperCase();
  const found = Object.values(CATEGORY_MAP).find(c => c.id === item.id_categoria);
  if (found && found.label) return found.label.toUpperCase();
  return catInfo.label.toUpperCase();
};

export default function PaginaCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  
  const currentCatKey = CATEGORY_MAP[categoria?.toLowerCase()] ? categoria.toLowerCase() : 'tutte';
  const catInfo = CATEGORY_MAP[currentCatKey];
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTipologiaOpen, setIsTipologiaOpen] = useState(true);
  const [isPiattaformeOpen, setIsPiattaformeOpen] = useState(true);
  const [activePlatform, setActivePlatform] = useState('tutte');

  useEffect(() => {
    async function fetchCategoryArticles() {
      setLoading(true);
      let query;

      if (activePlatform !== 'tutte' && PLATFORM_ID_MAP[activePlatform]) {
        const platformId = PLATFORM_ID_MAP[activePlatform];
        query = supabase.from('articoli').select(`*, categorie ( nome ), articoli_piattaforme!inner(id_piattaforma)`).eq('articoli_piattaforme.id_piattaforma', platformId);
      } else {
        query = supabase.from('articoli').select(`*, categorie ( nome )`);
      }

      if (catInfo.id) query = query.eq('id_categoria', catInfo.id);
      query = query.order('creato_il', { ascending: false });

      const { data, error } = await query;
      if (!error && data) setArticles(data);
      setLoading(false);
    }
    window.scrollTo(0, 0);
    fetchCategoryArticles();
  }, [currentCatKey, catInfo.id, activePlatform]);

  const isRecensioni = currentCatKey === 'recensioni';

  return (
    <main className="max-w-[1200px] mx-auto p-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 flex flex-col">
          <h1 className="text-xl font-black uppercase mb-6 text-white tracking-tight">{catInfo.title}</h1>
          
          <div className="flex flex-col border-t border-gray-800/80">
            {loading ? (
              <p className="text-gray-400 py-10 font-bold">Caricamento in corso...</p>
            ) : articles.length > 0 ? (
              articles.map((item) => {
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
              })
            ) : <p className="text-gray-400 py-10 font-bold">Nessun articolo trovato.</p>}
          </div>
          
          {articles.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
              <button className="w-8 h-8 rounded-full bg-[#ff2020] text-white font-black text-sm flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">2</button>
              <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">›</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col">
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
        </div>
      </div>
    </main>
  );
}