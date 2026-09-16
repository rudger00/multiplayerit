import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers'; 

const SIDEBAR_PLATFORMS = ['PC', 'PS5', 'PS4', 'XBOXSERIESX', 'XONE', 'NSW2', 'ANDROID', 'IOS'];
const SIDEBAR_GENERI = ['Action', 'Adventure', 'Casual', 'Gestionale', 'Gioco di Guida', 'Gioco di Ruolo', 'Gioco di Ruolo Giapponese', 'Manageriale', 'Online', 'Picchiaduro', 'Platform', 'Puzzle', 'Rhythm', 'Simulazione', 'Sparatutto', 'Sportivo', 'Strategico', 'Survival'];

const PLATFORM_FILTERS = {
  'PC': 'PC',
  'PS5': 'PlayStation 5',
  'PS4': 'PlayStation 4',
  'XBOXSERIESX': 'Xbox Series X/S',
  'XONE': 'Xbox One',
  'NSW2': 'Nintendo Switch',
  'ANDROID': 'Android',
  'IOS': 'iOS'
};

const ChevronCircle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>
);

export default function PaginaGiochi() {
  // Impostiamo la data odierna reale del sistema (2026)
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState('uscita'); 
  const [isPiattaformeOpen, setIsPiattaformeOpen] = useState(true);
  const [isGeneriOpen, setIsGeneriOpen] = useState(true);
  
  const [activePlatform, setActivePlatform] = useState('tutte');
  const [activeGenere, setActiveGenere] = useState('tutte');

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGiochi() {
      setLoading(true);
      
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const firstDay = new Date(Date.UTC(y, m, 1)).toISOString().split('T')[0];
      const lastDay = new Date(Date.UTC(y, m + 1, 0)).toISOString().split('T')[0];

      // Proviamo prima a filtrare per il mese selezionato
      let query = supabase
        .from('giochi')
        .select(`
          id,
          titolo,
          url_immagine,
          data_uscita,
          voto_redazione,
          voto_lettori,
          giochi_generi ( generi ( nome ) ),
          gioco_piattaforma ( piattaforme ( nome ) ),
          articoli ( id, id_categoria )
        `)
        .gte('data_uscita', firstDay)
        .lte('data_uscita', lastDay)
        .order('data_uscita', { ascending: true });

      let { data, error } = await query;

      // FALLBACK DI SICUREZZA: Se nel mese specifico non trova nulla, 
      // carica TUTTI i giochi presenti nel DB così la pagina non rimane mai vuota!
      if ((!data || data.length === 0) && viewMode === 'uscita') {
        const { data: fallbackData } = await supabase
          .from('giochi')
          .select(`
            id,
            titolo,
            url_immagine,
            data_uscita,
            voto_redazione,
            voto_lettori,
            giochi_generi ( generi ( nome ) ),
            gioco_piattaforma ( piattaforme ( nome ) ),
            articoli ( id, id_categoria )
          `)
          .order('data_uscita', { ascending: true });
        
        if (fallbackData) data = fallbackData;
      }

      if (data) {
        const mappedGames = data.map(g => {
          const genresArr = g.giochi_generi?.map(item => item.generi?.nome).filter(Boolean) || [];
          const platformsArr = g.gioco_piattaforma?.map(item => item.piattaforme?.nome).filter(Boolean) || [];
          
          let dataFormattata = 'Da definire';
          let weekLabel = 'ALTRI GIOCHI';

          if (g.data_uscita) {
            const dateObj = new Date(g.data_uscita);
            const meseNome = dateObj.toLocaleDateString('it-IT', { month: 'long' });
            dataFormattata = `${dateObj.getDate()} ${meseNome.charAt(0).toUpperCase() + meseNome.slice(1)} ${dateObj.getFullYear()}`;

            const day = dateObj.getDay();
            const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(dateObj.setDate(diff));
            weekLabel = `SETTIMANA DEL ${monday.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
          }

          const recensione = g.articoli?.find(a => a.id_categoria === 2);

          return {
            id: g.id,
            title: g.titolo,
            img: getImg(g.url_immagine),
            genresArr,
            genres: genresArr.join(', ') || 'Nessun genere',
            platformsArr,
            platforms: platformsArr.join(' - ') || 'Non specificate',
            date: dataFormattata,
            redazione: g.voto_redazione ? parseFloat(g.voto_redazione).toFixed(1) : '-',
            lettori: g.voto_lettori ? parseFloat(g.voto_lettori).toFixed(1) : '-', 
            week: weekLabel,
            reviewId: recensione ? recensione.id : null 
          };
        });
        setGames(mappedGames);
      }
      setLoading(false);
    }

    fetchGiochi();
  }, [currentDate, viewMode]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const prevMonthLabel = prevDate.toLocaleDateString('it-IT', { month: 'long' }).toUpperCase();
  const nextMonthLabel = nextDate.toLocaleDateString('it-IT', { month: 'long' }).toUpperCase();

  const meseNome = currentDate.toLocaleDateString('it-IT', { month: 'long' }).toUpperCase();
  const anno = currentDate.getFullYear();
  const titoloPagina = viewMode === 'uscita' ? `GIOCHI IN USCITA A ${meseNome} ${anno}` : `I MIGLIORI GIOCHI DI ${meseNome} ${anno}`;

  let displayedGames = [...games];
  
  if (activePlatform !== 'tutte') {
    const searchString = PLATFORM_FILTERS[activePlatform];
    displayedGames = displayedGames.filter(game => game.platformsArr.includes(searchString));
  }
  if (activeGenere !== 'tutte') {
    displayedGames = displayedGames.filter(game => game.genresArr.includes(activeGenere));
  }
  
  if (viewMode === 'migliori') {
    displayedGames.sort((a, b) => {
      const valA = parseFloat(a.redazione) || 0; 
      const valB = parseFloat(b.redazione) || 0;
      return valB - valA;
    });
  }

  const groupedGames = displayedGames.reduce((acc, game) => {
    const week = viewMode === 'uscita' ? game.week : 'TUTTI I GIOCHI';
    if (!acc[week]) acc[week] = [];
    acc[week].push(game);
    return acc;
  }, {});

  return (
    <main className="max-w-[1200px] mx-auto p-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 flex flex-col">
          <h1 className="text-2xl font-black uppercase mb-8 text-white tracking-tight">
            {titoloPagina}
          </h1>

          <div className="flex flex-col">
            {loading ? (
              <p className="text-gray-400 py-10 font-bold">Caricamento giochi in corso...</p>
            ) : Object.keys(groupedGames).length > 0 ? (
              Object.keys(groupedGames).map((weekGroup, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  {viewMode === 'uscita' && (
                    <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2 mb-2">
                      {weekGroup}
                    </h2>
                  )}

                  <div className="flex flex-col">
                    {groupedGames[weekGroup].map((game) => (
                      <div key={game.id} className="flex items-center justify-between py-5 border-b border-gray-800/80 group">
                        
                        <div className="flex items-center gap-5 pr-4">
                          <Link to={`/gioco/${game.id}`}>
                            <img src={game.img} alt={game.title} className="w-[85px] h-[85px] object-cover rounded-sm shadow-md hover:opacity-80 transition-opacity" />
                          </Link>
                          <div className="flex flex-col justify-center text-left">
                            <Link to={`/gioco/${game.id}`}>
                              <h3 className="text-[22px] font-black leading-tight text-white mb-1 hover:text-[#ff2020] transition-colors">
                                {game.title}
                              </h3>
                            </Link>
                            <p className="text-[12px] font-semibold mb-1 leading-snug">
                              <span className="text-[#ff2020]">{game.genres}</span>
                              <span className="text-gray-500 mx-1">per</span>
                              <span className="text-[#ff2020]">{game.platforms}</span>
                            </p>
                            <p className="text-[11px] font-bold text-gray-500">
                              Data di uscita: <strong className="text-gray-300">{game.date}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-6 shrink-0 pl-4">
                          <div className="flex flex-col items-center">
                            <span className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest mb-1">Redazione</span>
                            {game.reviewId && game.redazione !== '-' ? (
                              <Link 
                                to={`/articolo/${game.reviewId}`} 
                                className="text-[#ff2020] text-[32px] font-black leading-none hover:text-white transition-colors cursor-pointer"
                                title="Leggi la recensione"
                              >
                                {game.redazione}
                              </Link>
                            ) : (
                              <span className="text-[#ff2020] text-[32px] font-black leading-none">{game.redazione}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <span className="text-[#00bfff] text-[10px] font-black uppercase tracking-widest mb-1">Lettori</span>
                            <span className="text-[#00bfff] text-[32px] font-black leading-none">{game.lettori}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 py-10 font-bold">Nessun gioco trovato nel database.</p>
            )}
          </div>

          {viewMode === 'uscita' ? (
            <div className="flex justify-between mt-10 mb-8 border-t border-gray-800 pt-6">
              <button onClick={handlePrevMonth} className="border border-gray-600 hover:border-[#ff2020] hover:text-[#ff2020] text-gray-300 font-black text-[12px] uppercase px-6 py-3 rounded-full tracking-widest transition-colors">
                ‹ {prevMonthLabel}
              </button>
              <button onClick={handleNextMonth} className="border border-gray-600 hover:border-[#ff2020] hover:text-[#ff2020] text-gray-300 font-black text-[12px] uppercase px-6 py-3 rounded-full tracking-widest transition-colors">
                {nextMonthLabel} ›
              </button>
            </div>
          ) : (
            displayedGames.length > 0 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-12 mb-8 border-t border-gray-800 pt-8">
                <button className="w-8 h-8 rounded-full bg-[#ff2020] text-white font-black text-sm flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">2</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 hover:border-[#ff2020] hover:text-[#ff2020] font-black text-sm flex items-center justify-center transition-colors">›</button>
              </div>
            )
          )}
        </div>

        {/* COLONNA LATERALE (Filtri) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-[#1a1a1a] rounded-sm p-5 border border-gray-800">
            <div className="flex flex-col gap-4 font-bold text-[15px] text-left">
              
              <div 
                className={`cursor-pointer transition-colors ${viewMode === 'uscita' ? 'text-[#ff2020]' : 'text-gray-300 hover:text-white'}`}
                onClick={() => { setViewMode('uscita'); setActiveGenere('tutte'); }}
              >
                In uscita
              </div>
              
              <div 
                className={`cursor-pointer transition-colors mb-2 ${viewMode === 'migliori' ? 'text-[#ff2020]' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setViewMode('migliori')}
              >
                I migliori
              </div>
              
              {viewMode === 'migliori' && (
                <div className="flex flex-col border-t border-gray-800 pt-4">
                  <div 
                    className={`flex items-center justify-between cursor-pointer py-1 group rounded-sm ${isGeneriOpen ? 'ring-1 ring-gray-600 px-2 -mx-2 bg-[#222]' : ''}`}
                    onClick={() => setIsGeneriOpen(!isGeneriOpen)}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isGeneriOpen} /></span>
                      Generi
                    </div>
                    <div className="bg-[#ff2020] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none h-5">
                      {activeGenere === 'tutte' ? 'TUTTI' : activeGenere}
                      {activeGenere !== 'tutte' && (
                        <span 
                          className="ml-0.5 cursor-pointer hover:text-black transition-colors text-[10px]" 
                          onClick={(e) => { e.stopPropagation(); setActiveGenere('tutte'); }}
                        >✕</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGeneriOpen ? 'max-h-[700px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <ul className="flex flex-col gap-2 pl-[26px] pb-2 text-[13px] font-semibold text-[#888]">
                      {SIDEBAR_GENERI.map(genere => (
                        <li 
                          key={genere} 
                          onClick={() => setActiveGenere(genere)}
                          className={`cursor-pointer transition-colors ${activeGenere === genere ? 'text-[#ff2020]' : 'hover:text-gray-200'}`}
                        >
                          {genere}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className={`flex flex-col border-gray-800 ${viewMode === 'uscita' ? 'border-t pt-4' : 'pt-2'}`}>
                <div 
                  className={`flex items-center justify-between cursor-pointer py-1 group rounded-sm ${isPiattaformeOpen ? 'ring-1 ring-gray-600 px-2 -mx-2 bg-[#222]' : ''}`}
                  onClick={() => setIsPiattaformeOpen(!isPiattaformeOpen)}
                >
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-gray-400 group-hover:text-white transition-colors"><ChevronCircle isOpen={isPiattaformeOpen} /></span>
                    Piattaforme
                  </div>
                  <div className="bg-[#ff2020] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 leading-none h-5">
                    {activePlatform === 'tutte' ? 'TUTTE' : activePlatform}
                    {activePlatform !== 'tutte' && (
                      <span 
                        className="ml-0.5 cursor-pointer hover:text-black transition-colors text-[10px]" 
                        onClick={(e) => { e.stopPropagation(); setActivePlatform('tutte'); }}
                      >✕</span>
                    )}
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPiattaformeOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <ul className="flex flex-col gap-2 pl-[26px] pb-2 text-[13px] font-semibold text-[#888]">
                    {SIDEBAR_PLATFORMS.map(plat => (
                      <li 
                        key={plat} 
                        onClick={() => setActivePlatform(plat)}
                        className={`cursor-pointer transition-colors uppercase ${activePlatform === plat ? 'text-[#ff2020]' : 'hover:text-gray-200'}`}
                      >
                        {plat}
                      </li>
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