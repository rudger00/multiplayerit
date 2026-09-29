import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PaginaSondaggi() {
  const { user, openModal } = useAuth();
  const navigate = useNavigate();
  const [sondaggi, setSondaggi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stati per la gestione del voto in pagina
  const [opzioniSelezionate, setOpzioniSelezionate] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // 1. Recupera tutti i sondaggi
      const { data: sondaggiData } = await supabase
        .from('sondaggi')
        .select(`*, utenti!id_autore(username)`)
        .order('creato_il', { ascending: false });

      if (sondaggiData) {
        // 2. Recupera tutte le opzioni per questi sondaggi
        const sondaggiIds = sondaggiData.map(s => s.id);
        const { data: opzioniData } = await supabase
          .from('sondaggi_opzioni')
          .select('*')
          .in('id_sondaggio', sondaggiIds);

        // 3. Verifica i voti dell'utente loggato
        let votiUtente = [];
        if (user) {
          const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
          if (userData) {
             const { data: vData } = await supabase
               .from('sondaggi_voti')
               .select('id_sondaggio, id_opzione')
               .eq('id_utente', userData.id);
             if (vData) votiUtente = vData;
          }
        }

        // Assembla i dati
        const sondaggiCompleti = sondaggiData.map(s => {
          const opzioni = opzioniData?.filter(o => o.id_sondaggio === s.id) || [];
          const totaleVoti = opzioni.reduce((acc, curr) => acc + curr.voti, 0);
          
          // Se l'utente ha votato, troviamo l'opzione vincente (quella con più voti)
          const votoFatto = votiUtente.find(v => v.id_sondaggio === s.id);
          let opzioneVincente = null;
          let percentualeVincente = 0;
          
          if (votoFatto && opzioni.length > 0) {
            opzioneVincente = [...opzioni].sort((a, b) => b.voti - a.voti)[0];
            percentualeVincente = totaleVoti > 0 ? Math.round((opzioneVincente.voti / totaleVoti) * 100) : 0;
          }

          return {
            ...s,
            opzioni,
            totaleVoti,
            haVotato: !!votoFatto,
            opzioneVincente,
            percentualeVincente
          };
        });

        setSondaggi(sondaggiCompleti);
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const handleSelezionaOpzione = (sondaggioId, opzioneId) => {
    setOpzioniSelezionate(prev => ({ ...prev, [sondaggioId]: opzioneId }));
  };

  const handleVota = async (sondaggioId) => {
    if (!user) { openModal(); return; }
    const opzioneScelta = opzioniSelezionate[sondaggioId];
    if (!opzioneScelta) return;

    setIsSubmitting(true);
    const { data: userData } = await supabase.from('utenti').select('id, bannato').eq('id_auth', user.id).maybeSingle();
    
    if (userData?.bannato) {
      alert("Il tuo account è bannato.");
      setIsSubmitting(false);
      return;
    }

    if (userData) {
      const { error } = await supabase.from('sondaggi_voti').insert([{
        id_sondaggio: sondaggioId, id_utente: userData.id, id_opzione: opzioneScelta
      }]);

      if (!error) {
        // Aggiorniamo la UI localmente simulando il ricaricamento dei dati
        setSondaggi(prevSondaggi => prevSondaggi.map(s => {
          if (s.id !== sondaggioId) return s;
          
          const nuoveOpzioni = s.opzioni.map(o => o.id === opzioneScelta ? { ...o, voti: o.voti + 1 } : o);
          const nuovoTotale = s.totaleVoti + 1;
          const nuovaVincente = [...nuoveOpzioni].sort((a, b) => b.voti - a.voti)[0];
          
          return {
            ...s,
            opzioni: nuoveOpzioni,
            totaleVoti: nuovoTotale,
            haVotato: true,
            opzioneVincente: nuovaVincente,
            percentualeVincente: Math.round((nuovaVincente.voti / nuovoTotale) * 100)
          };
        }));
      }
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Caricamento sondaggi...</div>;

  return (
    <div className="bg-[#111111] min-h-screen pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 pt-10">
        
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-10">Tutti i Sondaggi</h1>

        <div className="flex flex-col gap-6">
          {sondaggi.map(sondaggio => (
            <div key={sondaggio.id} className="bg-[#1a1a1a] p-6 md:p-8 border border-gray-800 rounded-sm shadow-xl flex flex-col relative">
              
              {/* Badge commenti simulato per design */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-[#ff4444] rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg cursor-pointer" onClick={() => navigate(`/sondaggio/${sondaggio.id}`)}>
                {sondaggio.id % 10 + 2} {/* Numero finto per ora */}
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 w-11/12">
                <a href={`/sondaggio/${sondaggio.id}`} className="hover:text-[#ff4444] transition-colors">{sondaggio.titolo}</a>
              </h2>
              <p className="text-gray-300 text-sm mb-6">{sondaggio.descrizione}</p>

              {!sondaggio.haVotato ? (
                // SONDAGGIO DA VOTARE (Radio buttons)
                <>
                  <div className="flex flex-col gap-3 mb-6">
                    {sondaggio.opzioni.map(opz => (
                      <label key={opz.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name={`sondaggio_${sondaggio.id}`} 
                          value={opz.id}
                          onChange={() => handleSelezionaOpzione(sondaggio.id, opz.id)}
                          className="w-4 h-4 accent-[#ff4444] bg-transparent cursor-pointer" 
                        />
                        <span className="text-white font-bold group-hover:text-[#ff4444] transition-colors text-[15px]">{opz.testo}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 border-t border-gray-800 pt-6">
                    <span className="text-gray-500 text-xs font-semibold">13 ore, 3 minuti per votare - voti totali: {sondaggio.totaleVoti}</span>
                    <button 
                      onClick={() => handleVota(sondaggio.id)} 
                      disabled={isSubmitting || !opzioniSelezionate[sondaggio.id]}
                      className="bg-[#ff4444] text-white font-black uppercase tracking-widest px-8 py-2 text-sm hover:bg-red-600 transition-colors disabled:opacity-50 rounded-sm"
                    >
                      VOTA
                    </button>
                  </div>
                </>
              ) : (
                // SONDAGGIO VOTATO (Barra gialla risultati)
                <>
                  <div className="flex flex-col mb-6 mt-2">
                    <span className="text-white font-black text-[15px] mb-2">{sondaggio.opzioneVincente?.testo}</span>
                    <div className="w-full bg-[#333] h-8 flex relative overflow-hidden rounded-sm">
                      <div className="bg-[#e6c200] h-full flex items-center px-3" style={{ width: `${sondaggio.percentualeVincente}%` }}>
                         <span className="text-black font-black text-sm absolute left-3">{sondaggio.percentualeVincente}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                     <button onClick={() => navigate(`/sondaggio/${sondaggio.id}`)} className="bg-[#ff4444] text-white font-black uppercase tracking-widest px-6 py-2.5 text-xs hover:bg-red-600 transition-colors rounded-sm shadow-md">
                       GUARDA TUTTI I RISULTATI
                     </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {sondaggi.length === 0 && <p className="text-gray-400 text-center py-10">Nessun sondaggio disponibile.</p>}
        </div>
      </div>
    </div>
  );
}