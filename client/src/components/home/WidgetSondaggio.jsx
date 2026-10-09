import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { getImg } from '../../utils/helpers';

export default function WidgetSondaggio() {
  const navigate = useNavigate();
  const [sondaggio, setSondaggio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUltimoSondaggio() {
      const { data, error } = await supabase.from('sondaggi').select('*').order('creato_il', { ascending: false }).limit(1).maybeSingle();
      if (!error && data) setSondaggio(data);
      setLoading(false);
    }
    fetchUltimoSondaggio();
  }, []);

  if (loading || !sondaggio) return null;

  return (
    <div className="bg-[#141414] border border-gray-800 flex flex-col mb-6">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <span className="text-red-500 font-black text-[11px] uppercase tracking-wider">SONDAGGI</span>
        <span className="text-red-500">☑</span>
      </div>
      <div className="p-3 flex flex-col">
        {sondaggio.url_immagine && (
           <img src={getImg(sondaggio.url_immagine)} alt={sondaggio.titolo} className="w-full h-32 object-cover mb-3" />
        )}
        <h4 className="font-bold text-[13px] text-white mb-4 leading-snug uppercase">{sondaggio.titolo}</h4>
        <button onClick={() => navigate(`/sondaggio/${sondaggio.id}`)} className="w-full bg-[#ff2020] hover:bg-red-700 text-white font-black py-2.5 uppercase tracking-widest transition-colors text-[13px]">
          Vota
        </button>
      </div>
    </div>
  );
}