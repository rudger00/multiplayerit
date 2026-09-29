import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function WidgetUltimeRecensioni() {
  const [recensioni, setRecensioni] = useState([]);

  useEffect(() => {
    async function fetchRecensioni() {
      // Prende gli articoli che hanno un voto (recensioni)
      const { data } = await supabase.from('articoli').select('id, titolo, voto').not('voto', 'is', null).eq('stato', 'PUBLISHED').order('creato_il', { ascending: false }).limit(5);
      if (data) setRecensioni(data);
    }
    fetchRecensioni();
  }, []);

  if (recensioni.length === 0) return null;

  return (
    <div className="bg-[#141414] flex flex-col mb-6">
      <div className="p-3 border-b border-gray-800">
        <span className="text-red-500 font-black text-[11px] uppercase tracking-wider">LE ULTIME RECENSIONI</span>
      </div>
      <div className="flex flex-col px-3">
        {recensioni.map((rec) => (
          <Link key={rec.id} to={`/articolo/${rec.id}`} className="flex justify-between items-center border-b border-gray-800 py-4 last:border-0 group">
            <span className="text-white font-bold text-[11px] uppercase tracking-widest group-hover:text-red-500 transition-colors pr-4">{rec.titolo}</span>
            <span className="text-red-500 font-black text-2xl">{rec.voto.toFixed(1)}</span>
          </Link>
        ))}
      </div>
      <div className="p-3 border-t border-gray-800 text-right">
        <Link to="/categoria/recensioni" className="text-red-500 font-bold text-[9px] uppercase tracking-widest hover:text-white transition-colors">LEGGI TUTTE LE RECENSIONI</Link>
      </div>
    </div>
  );
}