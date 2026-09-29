import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function WidgetSondaggio() {
  const navigate = useNavigate();
  const [sondaggio, setSondaggio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUltimoSondaggio() {
      // Recupera il sondaggio più recente
      const { data, error } = await supabase
        .from('sondaggi')
        .select('*')
        .order('creato_il', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) setSondaggio(data);
      setLoading(false);
    }
    fetchUltimoSondaggio();
  }, []);

  if (loading) return <div className="bg-[#1a1a1a] p-5 border border-gray-800 text-center text-white">Caricamento sondaggio...</div>;
  if (!sondaggio) return null;

  return (
    <div className="bg-[#1a1a1a] flex flex-col p-5 border border-gray-800 rounded-sm shadow-md mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#ff4444] font-black uppercase tracking-widest text-[15px]">Sondaggio</h3>
      </div>
      
      <h4 className="text-white font-bold text-lg leading-tight mb-2">{sondaggio.titolo}</h4>
      <p className="text-gray-400 text-sm mb-5 line-clamp-2">{sondaggio.descrizione}</p>

      <button 
        onClick={() => navigate(`/sondaggio/${sondaggio.id}`)}
        className="w-full bg-[#ff4444] hover:bg-red-600 text-white font-black text-[15px] tracking-widest uppercase py-3 transition-colors"
      >
        VOTA E GUARDA I RISULTATI
      </button>
    </div>
  );
}