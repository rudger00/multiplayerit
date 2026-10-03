import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg } from '../utils/helpers';

// Icona per la sidebar
const ChevronCircle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
  </svg>
);

const PIATTAFORME_LIST = ['Tutte', 'Pc', 'Playstation 5', 'Playstation 4', 'Xbox One', 'Xbox Series X/S', 'Nintendo Switch', 'Ios', 'Android'];
const PLATFORM_ID_MAP = {
  'Pc': 1, 'Playstation 5': 2, 'Playstation 4': 3, 'Xbox Series X/S': 4, 'Xbox One': 5, 'Nintendo Switch': 6, 'Ios': 7, 'Android': 8
};

export default function PaginaRicerca() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATI PER LA UI
  const [activeTab, setActiveTab] = useState('tutti');
  const [isTipologiaOpen, setIsTipologiaOpen] = useState(true);
  const [isPiattaformeOpen, setIsPiattaformeOpen] = useState(true);
  const [activePlatform, setActivePlatform] = useState('Tutte'); // Stato per la piattaforma rossa

  // Formattazione data in stile "4 Aprile 2017"
  const formattaData = (dataIso) => {
    if (!dataIso) return 'N/D';
    const dateObj = new Date(dataIso);
    const mese = dateObj.toLocaleDateString('it-IT', { month: 'long' });
    const meseCapitalizzato = mese.charAt(0).toUpperCase() + mese.slice(1);
    return `${dateObj.getDate()} ${meseCapitalizzato} ${dateObj.getFullYear()}`;
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      // 1. Cerchiamo contemporaneamente negli articoli e nei giochi includendo le tabelle delle piattaforme
      const [artRes, gioRes] = await Promise.all([
        supabase.from('articoli').select(`*, categorie(nome), articoli_piattaforme(id_piattaforma)`).eq('stato', 'PUBLISHED').ilike('titolo', `%${query}%`).order('creato_il', { ascending: false }),
        supabase.from('giochi').select(`*, giochi_piattaforme(id_piattaforma)`).ilike('titolo', `%${query}%`)
      ]);

      // Fallback sicuro se giochi_piattaforme non esiste nel tuo DB
      let giochiData = gioRes.data;
      if (gioRes.error) {
         const fallbackGio = await supabase.from('giochi').select('*').ilike('titolo', `%${query}%`);
         giochiData = fallbackGio.data || [];
      }

      // 2. Cerchiamo su YouTube tramite API
      let ytVideos = [];
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY; 
      if (apiKey && query) {
        try {
          const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query + ' recensione trailer gameplay')}&type=video&key=${apiKey}`);
          const ytData = await ytResponse.json();
          if (ytData.items) {
            ytVideos = ytData.items.map(v => ({
              id: v.id.videoId,
              type: 'youtube',
              titolo: v.snippet.title,
              url_immagine: v.snippet.thumbnails?.high?.url,
              creato_il: v.snippet.publishedAt,
              canale: v.snippet.channelTitle
            }));
          }
        } catch (err) {
          console.error("Errore YouTube API:", err);
        }
      }

      // 3. Uniamo e formattiamo i dati
      const articoliFormattati = (artRes.data || []).map(a => ({ ...a, type: 'articolo' }));
      const giochiFormattati = (giochiData || []).map(g => ({ ...g, type: 'gioco' }));
      
      setResults([...giochiFormattati, ...articoliFormattati, ...ytVideos]);
      setLoading(false);
    };

    if (query) fetchResults();
  }, [query]);

  // LOGICA DEI FILTRI (Tipologia + Piattaforma Rossa)
  const filteredResults = results.filter(item => {
    // A. Filtro Tipologia (Tab)
    if (activeTab === 'giochi' && item.type !== 'gioco') return false;
    if (activeTab === 'articoli' && item.type !== 'articolo') return false;
    if (activeTab === 'video' && item.type !== 'youtube') return false;

    // B. Filtro Piattaforma
    if (activePlatform !== 'Tutte') {
      const platId = PLATFORM_ID_MAP[activePlatform];
      
      if (item.type === 'articolo') {
        const haPiattaforma = item.articoli_piattaforme?.some(p => p.id_piattaforma === platId);
        if (!haPiattaforma) return false;
      } else if (item.type === 'gioco') {
        const haPiattaforma = item.giochi_piattaforme?.some(p => p.id_piattaforma === platId);
        if (!item.giochi_piattaforme || !haPiattaforma) return false;
      } else if (item.type === 'youtube') {
        return false; // Nascondiamo i video se filtriamo per piattaforma specifica
      }
    }
    
    return true;
  });

  return (
    <main className="max-w-[1200px] mx-auto p-4 mt-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNA SINISTRA: RISULTATI */}
        <div className="lg:col-span-8 flex flex-col">
          <h1 className="text-2xl font-black uppercase mb-6 text-gray-100 tracking-tight">RISULTATI PER "{query}"</h1>
          
          {/* BARRA DEI TAB SUPERIORE */}
          <div className="flex bg-[#1a1a1a] mb-8 rounded-sm overflow-hidden border border-gray-800 shadow-md">
            {['tutti', 'giochi', 'articoli', 'video'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-colors border-r border-gray-800 last:border-r-0 ${
                  activeTab === tab 
                    ? 'bg-[#ff2020] text-white' 
                    : 'bg-[#111] text-[#ff2020] hover:bg-[#1a1a1a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {loading ? (
            <p className="text-gray-400 font-bold">Ricerca in corso...</p>
          ) : filteredResults.length === 0 ? (
            <p className="text-gray-400 font-bold bg-[#1a1a1a] p-6 border border-gray-800">Nessun risultato trovato in questa sezione o per questa piattaforma.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {filteredResults.map(item => {
                
                if (item.type === 'gioco') {
                  return (
                    <Link to={`/gioco/${item.id}`} key={`g-${item.id}`} className="flex flex-col md:flex-row gap-4 border-b border-gray-800/60 pb-6 mb-6 group">
                      <div className="w-[180px] h-[100px] shrink-0 overflow-hidden relative border border-gray-800">
                        <img src={getImg(item.url_immagine)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.titolo} />
                      </div>
                      <div className="flex flex-col justify-start">
                        <h3 className="text-xl font-black uppercase text-gray-100 group-hover:text-gray-300 transition-colors leading-tight mb-1">{item.titolo}</h3>
                        <span className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest mb-2">GIOCO</span>
                        <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                          Data di uscita: <span className="text-gray-200">{formattaData(item.data_uscita)}</span>
                        </p>
                      </div>
                    </Link>
                  );
                } 
                
                if (item.type === 'articolo') {
                  return (
                    <Link to={`/articolo/${item.id}`} key={`a-${item.id}`} className="flex flex-col md:flex-row gap-4 border-b border-gray-800/60 pb-6 mb-6 group">
                      <div className="w-[180px] h-[100px] shrink-0 overflow-hidden relative border border-gray-800">
                        <img src={getImg(item.url_immagine)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.titolo} />
                      </div>
                      <div className="flex flex-col justify-start">
                        <h3 className="text-xl font-black uppercase text-gray-100 group-hover:text-gray-300 transition-colors leading-tight mb-1">{item.titolo}</h3>
                        <span className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest mb-2">
                          {item.categorie?.nome || 'ARTICOLO'}
                        </span>
                        <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                          Pubblicato il: <span className="text-gray-200">{formattaData(item.creato_il)}</span>
                        </p>
                      </div>
                    </Link>
                  );
                }

                if (item.type === 'youtube') {
                  return (
                    <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noreferrer" key={`yt-${item.id}`} className="flex flex-col md:flex-row gap-4 border-b border-gray-800/60 pb-6 mb-6 group">
                      <div className="w-[180px] h-[100px] shrink-0 overflow-hidden relative border border-gray-800">
                        <img src={item.url_immagine} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="thumbnail" />
                        <div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">▶ YOUTUBE</div>
                      </div>
                      <div className="flex flex-col justify-start">
                        {/* Usiamo dangerouslySetInnerHTML per pulire i caratteri strani di YouTube come &#39; */}
                        <h3 className="text-xl font-black uppercase text-gray-100 group-hover:text-gray-300 transition-colors leading-tight mb-1" dangerouslySetInnerHTML={{ __html: item.titolo }}></h3>
                        <span className="text-[#00bfff] text-[11px] font-black uppercase tracking-widest mb-2">{item.canale}</span>
                        <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                          Pubblicato il: <span className="text-gray-200">{formattaData(item.creato_il)}</span>
                        </p>
                      </div>
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* COLONNA DESTRA: SIDEBAR FILTRI */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-[#1a1a1a] border border-gray-800 p-5 rounded-sm">
            
            {/* WIDGET TIPOLOGIA */}
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-2 text-white font-bold text-[14px] cursor-pointer mb-3" onClick={() => setIsTipologiaOpen(!isTipologiaOpen)}>
                <span className="text-gray-400"><ChevronCircle isOpen={isTipologiaOpen} /></span> Tipologia
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isTipologiaOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="flex flex-col gap-2.5 pl-[26px] text-[13px] font-semibold">
                  <li onClick={() => setActiveTab('tutti')} className={`cursor-pointer transition-colors ${activeTab === 'tutti' ? 'text-[#ff2020]' : 'text-gray-400 hover:text-white'}`}>Tutti</li>
                  <li onClick={() => setActiveTab('articoli')} className={`cursor-pointer transition-colors ${activeTab === 'articoli' ? 'text-[#ff2020]' : 'text-gray-400 hover:text-white'}`}>Notizie e Articoli</li>
                  <li onClick={() => setActiveTab('giochi')} className={`cursor-pointer transition-colors ${activeTab === 'giochi' ? 'text-[#ff2020]' : 'text-gray-400 hover:text-white'}`}>Giochi</li>
                  <li onClick={() => setActiveTab('video')} className={`cursor-pointer transition-colors ${activeTab === 'video' ? 'text-[#ff2020]' : 'text-gray-400 hover:text-white'}`}>Video</li>
                </ul>
              </div>
            </div>

            {/* WIDGET PIATTAFORME */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-white font-bold text-[14px] cursor-pointer mb-3" onClick={() => setIsPiattaformeOpen(!isPiattaformeOpen)}>
                <span className="text-gray-400"><ChevronCircle isOpen={isPiattaformeOpen} /></span> Piattaforme
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPiattaformeOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="flex flex-col gap-2.5 pl-[26px] text-[13px] font-semibold">
                  {PIATTAFORME_LIST.map(plat => (
                    <li 
                      key={plat} 
                      onClick={() => setActivePlatform(plat)} 
                      className={`cursor-pointer transition-colors ${activePlatform === plat ? 'text-[#ff2020]' : 'text-gray-400 hover:text-white'}`}
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
    </main>
  );
}