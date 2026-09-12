import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg, formatDate } from '../utils/helpers';

export default function PaginaRicerca() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('articoli').select(`*, categorie ( nome )`).ilike('titolo', `%${query}%`).order('creato_il', { ascending: false });
      if (!error && data) setResults(data);
      setLoading(false);
    };
    if (query) fetchResults();
  }, [query]);

  return (
    <main className="max-w-[1200px] mx-auto p-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col">
          <h1 className="text-2xl font-black uppercase mb-6 text-gray-100">RISULTATI PER "{query}"</h1>
          <div className="flex flex-col gap-6">
            {loading ? <p className="text-gray-400">Ricerca in corso...</p> : results.length > 0 ? (
              results.map(item => (
                <div key={item.id} className="flex gap-4 bg-[#1a1a1a] p-3 rounded-sm border border-gray-800/50">
                  <img src={getImg(item.url_immagine)} className="w-[200px] h-[115px] object-cover rounded-sm" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[17px] font-black uppercase text-gray-100 mb-2">{item.titolo}</h3>
                    <p className="text-red-500 text-[11px] font-black uppercase mb-2 tracking-widest">{item.categorie?.nome || 'ARTICOLO'}</p>
                    <p className="text-[12px] font-bold text-gray-500">Creato il: {formatDate(item.creato_il)}</p>
                  </div>
                </div>
              ))
            ) : <p className="text-gray-400 font-bold">Nessun risultato trovato.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}