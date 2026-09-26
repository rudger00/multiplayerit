import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PaginaAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articoli');
  
  const [pendingArticles, setPendingArticles] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    checkAdminAndFetchData();
  }, [user]);

  async function checkAdminAndFetchData() {
    if (!user) { navigate('/'); return; }
    
    // Verifica che l'utente sia un Amministratore (id_ruolo = 1)
    const { data: adminData } = await supabase.from('utenti').select('id_ruolo').eq('id_auth', user.id).maybeSingle();
    if (!adminData || adminData.id_ruolo !== 1) {
      alert("Accesso negato. Solo gli Amministratori possono visualizzare questa pagina.");
      navigate('/'); 
      return;
    }

    fetchPendingArticles();
    fetchUsers();
    setLoading(false);
  }

  // --- LOGICA ARTICOLI E NOTIFICHE ---
  async function fetchPendingArticles() {
    const { data } = await supabase
      .from('articoli')
      .select('id, titolo, creato_il, id_autore, categorie(nome), utenti!id_autore(username)')
      .eq('stato', 'DRAFT') 
      .order('creato_il', { ascending: true });
    if (data) setPendingArticles(data);
  }

  // Modificato per ricevere l'intero oggetto "art" e non solo l'ID
  const handleApprove = async (art) => {
    if(window.confirm(`Pubblicare l'articolo "${art.titolo}" online?`)) {
      
      // 1. Aggiorniamo lo stato a PUBLISHED
      await supabase.from('articoli').update({ stato: 'PUBLISHED' }).eq('id', art.id);
      
      // 2. Invia la notifica di successo all'autore
      await supabase.from('notifiche').insert([{
        id_utente: art.id_autore,
        testo: `Complimenti! Il tuo articolo "${art.titolo}" è stato approvato ed è ora online.`,
        link: `/articolo/${art.id}`, // Cliccando va dritto all'articolo
        letta: false
      }]);

      fetchPendingArticles();
    }
  };

  const handleReject = async (art) => {
    if(window.confirm(`Sei sicuro di voler rifiutare ed eliminare la bozza "${art.titolo}"?`)) {
      
      // 1. Eliminiamo l'articolo
      await supabase.from('articoli').delete().eq('id', art.id);
      
      // 2. Invia la notifica di rifiuto all'autore
      await supabase.from('notifiche').insert([{
        id_utente: art.id_autore,
        testo: `La tua bozza "${art.titolo}" non ha superato la revisione ed è stata rimossa.`,
        link: `/profilo`, // Non essendoci più l'articolo, rimandiamo al profilo
        letta: false
      }]);

      fetchPendingArticles();
    }
  };

  // --- LOGICA UTENTI ---
  async function fetchUsers() {
    const { data } = await supabase.from('utenti').select('id, username, id_ruolo, ammonizioni, bannato').order('id', { ascending: true });
    if (data) setUsersList(data);
  }

  const handleWarnUser = async (idUtente, currentWarns) => {
    if(window.confirm("Vuoi aggiungere un'ammonizione (cartellino giallo) a questo utente?")) {
      await supabase.from('utenti').update({ ammonizioni: currentWarns + 1 }).eq('id', idUtente);
      
      // Manda notifica all'utente ammonito
      await supabase.from('notifiche').insert([{
        id_utente: idUtente,
        testo: `⚠️ ATTENZIONE: Hai ricevuto un'ammonizione dallo staff per violazione del regolamento.`,
        letta: false
      }]);

      fetchUsers();
    }
  };

  const handleToggleBan = async (idUtente, isBanned) => {
    const msg = isBanned ? "Vuoi SBANNARE questo utente?" : "Vuoi BANNARE DEFINITIVAMENTE questo utente?";
    if(window.confirm(msg)) {
      await supabase.from('utenti').update({ bannato: !isBanned }).eq('id', idUtente);
      fetchUsers();
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Verifica credenziali Amministratore...</div>;

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20">
      
      {/* HEADER ADMIN */}
      <div className="bg-[#0f0f0f] border-b border-[#ff2020] pt-8 pb-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-[#ff2020] font-black text-[12px] uppercase tracking-widest mb-1">Pannello di Controllo</h2>
          <h1 className="text-white text-4xl font-black uppercase tracking-tight">Zona <span className="text-[#ff2020]">Amministrazione</span></h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* MENU LATERALE */}
        <div className="w-full md:w-[25%] bg-[#1a1a1a] border border-gray-800 p-4 h-fit rounded-sm shadow-xl">
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('articoli')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'articoli' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Articoli da Accettare {pendingArticles.length > 0 && <span className="ml-2 bg-white text-[#ff2020] px-2 py-0.5 rounded-full text-[10px]">{pendingArticles.length}</span>}
            </button>
            <button onClick={() => setActiveTab('utenti')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'utenti' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Gestione Utenti
            </button>
            <button onClick={() => setActiveTab('segnalazioni')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'segnalazioni' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Segnalazioni
            </button>
          </div>
        </div>

        {/* CONTENUTO PRINCIPALE */}
        <div className="w-full md:w-[75%] bg-[#1a1a1a] border border-gray-800 p-6 rounded-sm shadow-xl min-h-[500px]">
          
          {/* TAB: ARTICOLI DA ACCETTARE */}
          {activeTab === 'articoli' && (
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6 border-b border-gray-800 pb-4">Bozze in attesa di revisione</h2>
              {pendingArticles.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {pendingArticles.map(art => (
                    <div key={art.id} className="bg-[#222] p-5 border-l-4 border-[#e6c200] flex flex-col lg:flex-row justify-between lg:items-center gap-4 shadow-md rounded-sm">
                      <div className="flex flex-col">
                        <span className="text-[#e6c200] text-[10px] font-black uppercase tracking-widest mb-1">{art.categorie?.nome}</span>
                        <h3 className="text-white font-bold text-xl leading-tight">{art.titolo}</h3>
                        <p className="text-gray-400 text-xs mt-2 font-semibold">
                          Scritto da <strong className="text-gray-200">{art.utenti?.username || 'Sconosciuto'}</strong> il {new Date(art.creato_il).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => window.open(`/articolo/${art.id}`, '_blank')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors">Vedi</button>
                        <button onClick={() => handleReject(art)} className="px-4 py-2 border border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors">Rifiuta</button>
                        <button onClick={() => handleApprove(art)} className="px-4 py-2 bg-[#28a745] hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-md transition-colors">Approva</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 font-bold text-center py-10">Tutto pulito! Non ci sono articoli in attesa di approvazione.</p>
              )}
            </div>
          )}

          {/* TAB: GESTIONE UTENTI */}
          {activeTab === 'utenti' && (
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6 border-b border-gray-800 pb-4">Gestione Community</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-[#222] text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Utente</th>
                      <th className="px-4 py-3">Ruolo</th>
                      <th className="px-4 py-3 text-center">Ammonizioni (Gialli)</th>
                      <th className="px-4 py-3 text-center">Stato</th>
                      <th className="px-4 py-3 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-white">{u.username}</td>
                        <td className="px-4 py-4">
                          {u.id_ruolo === 1 && <span className="text-[#ff2020] font-black">Admin</span>}
                          {u.id_ruolo === 2 && <span className="text-[#00bfff] font-black">Redattore</span>}
                          {u.id_ruolo === 3 && <span className="text-gray-400 font-bold">Utente</span>}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-black ${u.ammonizioni > 0 ? 'text-[#e6c200]' : 'text-gray-600'}`}>{u.ammonizioni}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {u.bannato ? <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs font-bold">BANNATO</span> : <span className="text-green-500 font-bold">Attivo</span>}
                        </td>
                        <td className="px-4 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleWarnUser(u.id, u.ammonizioni)} disabled={u.bannato || u.id_ruolo === 1} className="px-3 py-1.5 bg-[#e6c200] text-black text-[10px] font-black uppercase rounded-sm hover:bg-yellow-500 disabled:opacity-30 transition-colors">Ammonisci</button>
                          <button onClick={() => handleToggleBan(u.id, u.bannato)} disabled={u.id_ruolo === 1} className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-sm transition-colors disabled:opacity-30 ${u.bannato ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-[#ff2020] text-white hover:bg-red-700'}`}>
                            {u.bannato ? 'Sbanna' : 'Banna'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SEGNALAZIONI */}
          {activeTab === 'segnalazioni' && (
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6 border-b border-gray-800 pb-4">Segnalazioni Utenti</h2>
              <div className="bg-[#222] p-8 border border-gray-700 rounded-sm text-center flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h3 className="text-white font-bold text-xl mb-2">Sistema in costruzione</h3>
                <p className="text-gray-400 text-sm">In futuro, qui appariranno i commenti o gli utenti segnalati dalla community per spam, insulti o spoiler.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}