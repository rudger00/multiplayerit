import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ListaArticoli from '../components/categoria/ListaArticoli';
import SidebarFiltri from '../components/categoria/SidebarFiltri';

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
        query = supabase.from('articoli')
          .select(`*, categorie ( nome ), articoli_piattaforme!inner(id_piattaforma)`)
          .eq('articoli_piattaforme.id_piattaforma', platformId)
          .eq('stato', 'PUBLISHED'); // Filtro stato aggiunto qui
      } else {
        query = supabase.from('articoli')
          .select(`*, categorie ( nome )`)
          .eq('stato', 'PUBLISHED'); // Filtro stato aggiunto qui
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
            ) : (
              <ListaArticoli 
                articles={articles} 
                isRecensioni={isRecensioni} 
                catInfo={catInfo} 
                getCategoryLabel={getCategoryLabel} 
              />
            )}
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
          <SidebarFiltri 
            isRecensioni={isRecensioni}
            isTipologiaOpen={isTipologiaOpen}
            setIsTipologiaOpen={setIsTipologiaOpen}
            currentCatKey={currentCatKey}
            navigate={navigate}
            CATEGORY_MAP={CATEGORY_MAP}
            isPiattaformeOpen={isPiattaformeOpen}
            setIsPiattaformeOpen={setIsPiattaformeOpen}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            SIDEBAR_PLATFORMS={SIDEBAR_PLATFORMS}
          />
        </div>
      </div>
    </main>
  );
}