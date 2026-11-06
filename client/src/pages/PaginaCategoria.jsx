import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ListaArticoli from '../components/categoria/ListaArticoli';
import SidebarFiltri from '../components/categoria/SidebarFiltri';

const CATEGORY_MAP = {
  anteprime: { id: 5, title: 'ANTEPRIME', label: 'ANTEPRIMA' },
  interviste: { id: 6, title: 'INTERVISTE', label: 'INTERVISTA' },
  news: { id: 1, title: 'TUTTE LE NEWS', label: 'NEWS' },
  notizie: { id: 1, title: 'TUTTE LE NOTIZIE', label: 'NEWS' },
  provati: { id: 4, title: 'PROVATI', label: 'PROVATO' },
  recensioni: { id: 2, title: 'RECENSIONI VIDEOGIOCHI', label: 'RECENSIONE' },
  rubriche: { id: 7, title: 'RUBRICHE', label: 'RUBRICA' },
  soluzioni: { id: 8, title: 'SOLUZIONI', label: 'SOLUZIONE' },
  speciali: { id: 3, title: 'SPECIALI', label: 'SPECIALE' },
  trucchi: { id: 9, title: 'TRUCCHI', label: 'TRUCCO' },
  video: { id: 10, title: 'VIDEO', label: 'VIDEO' },
  tutte: { id: null, title: 'ARTICOLI VIDEOGIOCHI', label: 'ARTICOLO' },
};

const SIDEBAR_PLATFORMS = ['ANDROID', 'IPAD', 'IPHONE', 'NSW', 'PC', 'PS4', 'PS5', 'WII', 'WIIU', 'XBOXSERIESX', 'XONE'];
const PLATFORM_ID_MAP = {
  PC: 1, PS5: 2, PS4: 3, XBOXSERIESX: 4, XONE: 5, NSW: 6,
  IOS: 7, IPHONE: 7, IPAD: 7, ANDROID: 8,
};

function getCategoryLabel(item, categoryInfo) {
  const joinedCategory = Array.isArray(item.categorie)
    ? item.categorie[0]?.nome
    : item.categorie?.nome;
  if (joinedCategory) return joinedCategory.toUpperCase();

  const matchingCategory = Object.values(CATEGORY_MAP).find(
    (category) => category.id !== null && category.id === item.id_categoria
  );
  return (matchingCategory?.label || categoryInfo.label).toUpperCase();
}

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
    let isCurrentRequest = true;

    async function fetchCategoryArticles() {
      setLoading(true);
      try {
        let query = supabase
          .from('articoli')
          .select(activePlatform !== 'tutte' && PLATFORM_ID_MAP[activePlatform]
            ? '*, categorie(nome), articoli_piattaforme!inner(id_piattaforma)'
            : '*, categorie(nome)')
          .eq('stato', 'PUBLISHED');

        if (activePlatform !== 'tutte' && PLATFORM_ID_MAP[activePlatform]) {
          query = query.eq('articoli_piattaforme.id_piattaforma', PLATFORM_ID_MAP[activePlatform]);
        }
        if (catInfo.id !== null) query = query.eq('id_categoria', catInfo.id);

        const { data, error } = await query.order('creato_il', { ascending: false });
        if (error) throw error;
        if (isCurrentRequest) setArticles(data || []);
      } catch (error) {
        console.error('Errore nel caricamento degli articoli della categoria:', error);
        if (isCurrentRequest) setArticles([]);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    }

    window.scrollTo(0, 0);
    fetchCategoryArticles();
    return () => { isCurrentRequest = false; };
  }, [currentCatKey, catInfo.id, activePlatform]);

  const isRecensioni = currentCatKey === 'recensioni';

  return (
    <main className="max-w-[1200px] mx-auto p-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 flex flex-col">
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
          {articles.length > 0 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
              <button type="button" aria-current="page" className="w-8 h-8 rounded-full bg-[#ff2020] text-white font-black text-sm flex items-center justify-center">1</button>
              <button type="button" disabled className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 font-black text-sm flex items-center justify-center opacity-50 cursor-not-allowed">2</button>
              <button type="button" disabled aria-label="Pagina successiva" className="w-8 h-8 rounded-full border border-gray-600 text-gray-300 font-black text-sm flex items-center justify-center opacity-50 cursor-not-allowed">›</button>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 flex flex-col">
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
        </aside>
      </div>
    </main>
  );
}
