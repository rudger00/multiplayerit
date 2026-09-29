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
  const [reportsList, setReportsList] = useState([]);

  useEffect(() => {
    checkAdminAndFetchData();
  }, [user]);

  async function checkAdminAndFetchData() {
    if (!user) { navigate('/'); return; }
    const { data: adminData } = await supabase.from('utenti').select('id_ruolo').eq('id_auth', user.id).maybeSingle();
    if (!adminData || adminData.id_ruolo !== 1) {
      alert("Accesso negato. Solo gli Amministratori possono visualizzare questa pagina.");
      navigate('/'); 
      return;
    }
    fetchPendingArticles();
    fetchUsers();
    fetchReports();
    setLoading(false);
  }

  async function fetchPendingArticles() {
    const { data } = await supabase.from('articoli').select('id, titolo, creato_il, id_autore, categorie(nome), utenti!id_autore(username)').eq('stato', 'DRAFT').order('creato_il', { ascending: true });
    if (data) setPendingArticles(data);
  }

  const handleApprove = async (art) => {
    if(window.confirm(`Pubblicare l'articolo "${art.titolo}" online?`)) {
      await supabase.from('articoli').update({ stato: 'PUBLISHED' }).eq('id', art.id);
      await supabase.from('notifiche').insert([{ id_utente: art.id_autore, testo: `Complimenti! Il tuo articolo "${art.titolo}" è stato approvato ed è ora online.`, link: `/articolo/${art.id}`, letta: false }]);
      fetchPendingArticles();
    }
  };

  const handleReject = async (art) => {
    if(window.confirm(`Sei sicuro di voler rifiutare ed eliminare la bozza "${art.titolo}"?`)) {
      await supabase.from('articoli').delete().eq('id', art.id);
      await supabase.from('notifiche').insert([{ id_utente: art.id_autore, testo: `La tua bozza "${art.titolo}" non ha superato la revisione ed è stata rimossa.`, link: `/profilo`, letta: false }]);
      fetchPendingArticles();
    }
  };

  async function fetchUsers() {
    const { data } = await supabase.from('utenti').select('id, username, id_ruolo, ammonizioni, bannato').order('id', { ascending: true });
    if (data) setUsersList(data);
  }

  // LOGICA CARTELLINO GESTITA DALLA DASHBOARD (2 STRIKES)
  const handleWarnUser = async (idUtente, currentWarns) => {
    if(!window.confirm("Vuoi aggiungere un'ammonizione a questo utente? (Al 2° cartellino verrà bannato)")) return;

    if (currentWarns === 1) {
      await supabase.from('utenti').update({ ammonizioni: 2, bannato: true }).eq('id', idUtente);
      await supabase.from('notifiche').insert([{
        id_utente: idUtente,
        testo: `⛔ BAN AUTOMATICO: Hai ricevuto il tuo secondo cartellino giallo. Non puoi più commentare o votare.`,
        letta: false
      }]);
    } else {
      await supabase.from('utenti').update({ ammonizioni: 1 }).eq('id', idUtente);
      await supabase.from('notifiche').insert([{
        id_utente: idUtente,
        testo: `⚠️ ATTENZIONE: Hai ricevuto un'ammonizione dallo staff per violazione del regolamento.`,
        letta: false
      }]);
    }
    fetchUsers();
  };

  const handleToggleBan = async (idUtente, isBanned) => {
    const msg = isBanned ? "Vuoi SBANNARE questo utente?" : "Vuoi BANNARE DEFINITIVAMENTE questo utente?";
    if(window.confirm(msg)) {
      await supabase.from('utenti').update({ bannato: !isBanned }).eq('id', idUtente);
      if (!isBanned) {
         await supabase.from('notifiche').insert([{
           id_utente: idUtente,
           testo: `⛔ SEI STATO BANNATO DEFINITIVAMENTE dallo staff. Non puoi più commentare o votare.`,
           letta: false
         }]);
      }
      fetchUsers();
    }
  };

  async function fetchReports() {
    const { data, error } = await supabase.from('segnalazioni').select('*').order('creato_il', { ascending: false });
    if (error) return;

    const filteredData = data.filter(rep => rep.stato !== 'RISOLTA' && rep.stato !== 'RIFIUTATA');
    if (filteredData && filteredData.length > 0) {
      const userIds = [...new Set(filteredData.map(r => r.id_segnalatore))];
      const { data: usersData } = await supabase.from('utenti').select('id, username').in('id', userIds);
      
      const commentIds = [...new Set(filteredData.filter(r => r.tipo === 'COMMENTO').map(r => r.id_commento_segnalato).filter(Boolean))];
      let commentsData = [];
      if(commentIds.length > 0) {
         const { data: cData } = await supabase.from('commenti').select('id, id_articolo').in('id', commentIds);
         if (cData) commentsData = cData;
      }

      const enrichedData = filteredData.map(rep => {
        const author = usersData?.find(u => u.id === rep.id_segnalatore);
        const relatedComment = commentsData?.find(c => c.id === rep.id_commento_segnalato);
        return {
          ...rep,
          segnalatore_username: author ? author.username : 'Utente Sconosciuto',
          commento_id_articolo: relatedComment ? relatedComment.id_articolo : null
        };
      });
      setReportsList(enrichedData);
    } else {
      setReportsList([]);
    }
  }

  const handleUpdateReportStatus = async (id, newStatus) => {
    const action = newStatus === 'RISOLTA' ? 'risolta' : 'rifiutata (ignorata)';
    if(window.confirm(`Vuoi segnare questa segnalazione come ${action}?`)) {
      await supabase.from('segnalazioni').update({ stato: newStatus }).eq('id', id);
      fetchReports();
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-bold">Verifica credenziali Amministratore...</div>;

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20">
      
      <div className="bg-[#0f0f0f] border-b border-[#ff2020] pt-8 pb-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-[#ff2020] font-black text-[12px] uppercase tracking-widest mb-1">Pannello di Controllo</h2>
          <h1 className="text-white text-4xl font-black uppercase tracking-tight">Zona <span className="text-[#ff2020]">Amministrazione</span></h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-[25%] bg-[#1a1a1a] border border-gray-800 p-4 h-fit rounded-sm shadow-xl">
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('articoli')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm flex justify-between items-center ${activeTab === 'articoli' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Articoli in Bozza {pendingArticles.length > 0 && <span className="bg-white text-[#ff2020] px-2 py-0.5 rounded-full text-[10px]">{pendingArticles.length}</span>}
            </button>
            <button onClick={() => setActiveTab('utenti')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'utenti' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Gestione Utenti
            </button>
            <button onClick={() => setActiveTab('segnalazioni')} className={`text-left px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors rounded-sm flex justify-between items-center ${activeTab === 'segnalazioni' ? 'bg-[#ff2020] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              Segnalazioni {reportsList.length > 0 && <span className="bg-white text-[#ff2020] px-2 py-0.5 rounded-full text-[10px]">{reportsList.length}</span>}
            </button>
          </div>
        </div>

        <div className="w-full md:w-[75%] bg-[#1a1a1a] border border-gray-800 p-6 rounded-sm shadow-xl min-h-[500px]">
          
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

          {activeTab === 'utenti' && (
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6 border-b border-gray-800 pb-4">Gestione Community</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-[#222] text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Utente</th>
                      <th className="px-4 py-3">Ruolo</th>
                      <th className="px-4 py-3 text-center">Ammonizioni</th>
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

          {activeTab === 'segnalazioni' && (
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6 border-b border-gray-800 pb-4">Centro Segnalazioni</h2>
              {reportsList.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {reportsList.map(rep => (
                    <div key={rep.id} className="bg-[#222] p-5 border-l-4 border-[#ff2020] flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-md rounded-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#ff2020] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{rep.tipo}</span>
                          <span className="text-gray-400 text-xs font-bold">{new Date(rep.creato_il).toLocaleString('it-IT')}</span>
                        </div>
                        <p className="text-white font-medium text-[15px] leading-relaxed break-words">{rep.motivo}</p>
                        <p className="text-gray-400 text-xs mt-3 font-semibold">
                          Inviata dall'utente: <strong className="text-gray-200">{rep.segnalatore_username}</strong>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 flex-shrink-0 md:justify-end mt-4 md:mt-0">
                        {rep.tipo === 'ARTICOLO' && rep.id_articolo_segnalato && <button onClick={() => window.open(`/articolo/${rep.id_articolo_segnalato}`, '_blank')} className="px-4 py-2 bg-[#00bfff] hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors shadow-md">Apri Articolo</button>}
                        {rep.tipo === 'COMMENTO' && rep.id_commento_segnalato && rep.commento_id_articolo && <button onClick={() => window.open(`/articolo/${rep.commento_id_articolo}#commento-${rep.id_commento_segnalato}`, '_blank')} className="px-4 py-2 bg-[#e6c200] hover:bg-yellow-600 text-black text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors shadow-md">Vedi Commento</button>}
                        {rep.tipo === 'UTENTE' && <button onClick={() => setActiveTab('utenti')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors">Vai a Utenti</button>}
                        <button onClick={() => handleUpdateReportStatus(rep.id, 'RIFIUTATA')} className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors">Ignora</button>
                        <button onClick={() => handleUpdateReportStatus(rep.id, 'RISOLTA')} className="px-4 py-2 bg-[#28a745] hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-md transition-colors">Risolvi</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#222] p-8 border border-gray-700 rounded-sm text-center flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h3 className="text-white font-bold text-xl mb-2">Nessuna segnalazione!</h3>
                  <p className="text-gray-400 text-sm">Non ci sono ticket aperti o segnalazioni in attesa dalla community.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}