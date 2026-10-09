import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function WidgetRedazione() {
  const { user, openModal } = useAuth();
  const [categoria, setCategoria] = useState('Segnala una news');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { 
      openModal(); 
      return; 
    }
    if (!motivo.trim()) return;

    setIsSubmitting(true);
    
    // Recuperiamo l'ID dell'utente loggato
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();

    if (userData) {
      // Payload perfetto per il nostro nuovo database
      const payload = {
        id_segnalatore: userData.id,
        tipo: 'GENERALE', // Usa l'ENUM corretto
        motivo: `[${categoria}] ${motivo}`
        // Non passiamo id_articolo, id_commento ecc. perché è una segnalazione generale!
      };

      const { error } = await supabase.from('segnalazioni').insert([payload]);

      if (!error) {
        alert("Segnalazione inviata alla redazione. Grazie per il contributo!");
        setMotivo('');
      } else {
        alert("C'è stato un problema con l'invio: " + error.message);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#1a1a1a] flex flex-col p-5 border border-gray-800 rounded-sm shadow-md">
      <h3 className="text-[#ff4444] font-black uppercase tracking-widest text-[15px] mb-3">Redazione</h3>
      
      <p className="text-gray-300 text-[13px] font-semibold leading-snug mb-4">
        Qualcosa non ti convince del sito?<br/>
        Vuoi segnalare dei contenuti mancanti?
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <select 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full bg-[#2a2a2a] text-gray-200 text-[13px] font-bold p-2.5 outline-none border border-gray-600 appearance-none cursor-pointer focus:border-[#ff4444] transition-colors"
          >
            <option value="Segnala una news">Segnala una news</option>
            <option value="Segnala un bug/errore">Segnala un bug/errore sito</option>
            <option value="Contenuto mancante">Contenuto mancante (Gioco/Video)</option>
            <option value="Altro">Altro</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
          </div>
        </div>

        <textarea 
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Scrivi il tuo messaggio"
          className="w-full bg-[#2a2a2a] text-gray-200 text-[13px] font-medium p-3 outline-none border border-gray-600 resize-none h-28 focus:border-[#ff4444] transition-colors placeholder-gray-500"
        ></textarea>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#ff4444] hover:bg-red-600 text-white font-black text-[15px] tracking-widest uppercase py-3 mt-1 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'INVIO...' : 'INVIA'}
        </button>
      </form>
    </div>
  );
}