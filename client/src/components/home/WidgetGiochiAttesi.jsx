import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { getImg } from '../../utils/helpers';

export default function WidgetGiochiAttesi() {
  const [gioco, setGioco] = useState(null);

  useEffect(() => {
    async function fetchGiochiAttesi() {
      const today = new Date().toISOString();
      const { data } = await supabase.from('giochi').select('id, titolo, url_immagine, data_uscita').gt('data_uscita', today).order('data_uscita', { ascending: true }).limit(1).maybeSingle();
      if (data) setGioco(data);
    }
    fetchGiochiAttesi();
  }, []);

  if (!gioco) return null;

  const dataUscitaFormattata = new Date(gioco.data_uscita).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#141414] flex flex-col mb-6">
      <div className="p-3">
        <span className="text-red-500 font-black text-[11px] uppercase tracking-wider">I GIOCHI PIÙ ATTESI</span>
      </div>
      <Link to={`/gioco/${gioco.id}`} className="relative block h-48 w-full group overflow-hidden cursor-pointer">
        {gioco.url_immagine && (
          <img src={getImg(gioco.url_immagine)} alt={gioco.titolo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start">
          <span className="bg-black text-[#e6c200] text-[10px] font-black uppercase px-2 py-1 tracking-widest mb-1">
            {dataUscitaFormattata}
          </span>
          <h3 className="bg-black text-white text-lg font-black uppercase leading-tight px-2 py-1 inline-block">
            {gioco.titolo}
          </h3>
        </div>
      </Link>
    </div>
  );
}