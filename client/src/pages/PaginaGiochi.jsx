import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers'; 
import ListaGiochi from '../components/giochi/ListaGiochi';
import SidebarFiltriGiochi from '../components/giochi/SidebarFiltriGiochi';

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

export default function PaginaGiochi() {
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
      
      const firstDay = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const lastDayObj = new Date(y, m + 1, 0);
      const lastDay = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

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
        `);

      if (viewMode === 'uscita') {
        query = query.gte('data_uscita', firstDay).lte('data_uscita', lastDay).order('data_uscita', { ascending: true });
      } else {
        query = query.not('voto_redazione', 'is', null).order('voto_redazione', { ascending: false }).limit(50);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mappedGames = data.map(g => {
          const genresArr = g.giochi_generi?.map(item => item.generi?.nome).filter(Boolean) || [];
          const platformsArr = g.gioco_piattaforma?.map(item => item.piattaforme?.nome).filter(Boolean) || [];
          
          let dataFormattata = 'Da definire';
          let weekLabel = 'TUTTI I GIOCHI';

          if (g.data_uscita) {
            const dateObj = new Date(g.data_uscita);
            const meseNomeSingolo = dateObj.toLocaleDateString('it-IT', { month: 'long' });
            dataFormattata = `${dateObj.getDate()} ${meseNomeSingolo.charAt(0).toUpperCase() + meseNomeSingolo.slice(1)} ${dateObj.getFullYear()}`;

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
      } else {
        setGames([]);
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
  const titoloPagina = viewMode === 'uscita' ? `GIOCHI IN USCITA A ${meseNome} ${anno}` : `I MIGLIORI GIOCHI DI SEMPRE`;

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
            ) : (
              <ListaGiochi 
                groupedGames={groupedGames} 
                viewMode={viewMode} 
                meseNome={meseNome} 
                anno={anno} 
                handlePrevMonth={handlePrevMonth} 
                handleNextMonth={handleNextMonth} 
                prevMonthLabel={prevMonthLabel} 
                nextMonthLabel={nextMonthLabel} 
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <SidebarFiltriGiochi 
            viewMode={viewMode} setViewMode={setViewMode}
            activeGenere={activeGenere} setActiveGenere={setActiveGenere}
            activePlatform={activePlatform} setActivePlatform={setActivePlatform}
            isGeneriOpen={isGeneriOpen} setIsGeneriOpen={setIsGeneriOpen}
            isPiattaformeOpen={isPiattaformeOpen} setIsPiattaformeOpen={setIsPiattaformeOpen}
            SIDEBAR_GENERI={SIDEBAR_GENERI} SIDEBAR_PLATFORMS={SIDEBAR_PLATFORMS}
          />
        </div>

      </div>
    </main>
  );
}