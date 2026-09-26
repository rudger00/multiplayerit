import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImg } from '../utils/helpers';

export default function PaginaScrivi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [categorie, setCategorie] = useState([]);
  const [giochi, setGiochi] = useState([]);
  const [authorName, setAuthorName] = useState('Redazione');
  
  const [viewMode, setViewMode] = useState('editor');
  
  const [titolo, setTitolo] = useState('');
  const [sommario, setSommario] = useState('');
  const [urlImmagine, setUrlImmagine] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [idGioco, setIdGioco] = useState('');
  const [contenuto, setContenuto] = useState('');
  
  const [votoRedazione, setVotoRedazione] = useState('');
  const [testoConclusioni, setTestoConclusioni] = useState('');
  const [pro, setPro] = useState('');
  const [contro, setContro] = useState('');
  const [versioneTestata, setVersioneTestata] = useState('');

  const isRecensione = parseInt(idCategoria) === 2;

  const [showGameModal, setShowGameModal] = useState(false);
  const [ngSubmitting, setNgSubmitting] = useState(false);
  const [ngTitolo, setNgTitolo] = useState('');
  const [ngDescrizione, setNgDescrizione] = useState('');
  const [ngUrlImmagine, setNgUrlImmagine] = useState('');
  const [ngDataUscita, setNgDataUscita] = useState('');
  const [ngSviluppatore, setNgSviluppatore] = useState('');
  const [ngPublisher, setNgPublisher] = useState('');
  const [ngGiocatori, setNgGiocatori] = useState('');
  const [ngLingua, setNgLingua] = useState('');
  const [ngPegi, setNgPegi] = useState('');
  const [ngSupporto, setNgSupporto] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ 'align': [] }], 
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  useEffect(() => {
    async function checkAuthAndFetchData() {
      setLoading(true);
      if (!user) { navigate('/'); return; }
      
      const { data: userData } = await supabase.from('utenti').select('id_ruolo, username').eq('id_auth', user.id).maybeSingle();
      if (!userData || (userData.id_ruolo !== 1 && userData.id_ruolo !== 2)) { navigate('/'); return; }

      setAuthorName(userData.username || 'Redazione');

      const { data: catData, error: catError } = await supabase.from('categorie').select('*').order('id');
      if (catError) console.error("Errore fetch categorie:", catError);
      if (catData) setCategorie(catData);

      const { data: giochiData, error: giochiError } = await supabase.from('giochi').select('id, titolo').order('titolo');
      if (giochiError) console.error("Errore fetch giochi:", giochiError);
      if (giochiData) setGiochi(giochiData);

      setLoading(false);
    }
    checkAuthAndFetchData();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    if (!titolo || !idCategoria || !contenuto) {
      alert("I campi Titolo, Categoria e Contenuto sono obbligatori!");
      setIsSubmitting(false);
      return;
    }

    // Qui controlliamo il ruolo dell'utente che sta scrivendo l'articolo
    const { data: userData } = await supabase.from('utenti').select('id, id_ruolo').eq('id_auth', user.id).single();
    const currentIsoDate = new Date().toISOString();

    // LOGICA DI APPROVAZIONE: Admin (1) pubblica diretto in PUBLISHED. Redattore (2) va in DRAFT.
    const statoArticolo = userData.id_ruolo === 1 ? 'PUBLISHED' : 'DRAFT';

    const newArticle = {
      titolo: titolo,
      sommario: sommario, 
      corpo: contenuto, 
      url_immagine: urlImmagine,
      url_video: urlVideo,
      id_categoria: parseInt(idCategoria),
      id_gioco: idGioco ? parseInt(idGioco) : null,
      id_autore: userData.id, 
      stato: statoArticolo, // Salvataggio dello stato
      creato_il: currentIsoDate,
      aggiornato_il: currentIsoDate 
    };

    if (isRecensione) {
      newArticle.voto = votoRedazione ? parseFloat(votoRedazione) : null; 
      newArticle.testo_conclusioni = testoConclusioni;
      newArticle.pro = pro;       
      newArticle.contro = contro; 
      newArticle.versione_testata = versioneTestata;
    }

    const { error } = await supabase.from('articoli').insert([newArticle]).select();

    if (error) {
      console.error("Errore salvataggio:", error);
      alert("Errore salvataggio: " + error.message);
    } else {
      if (statoArticolo === 'PUBLISHED') {
        setSuccessMsg("Articolo pubblicato online con successo!");
      } else {
        setSuccessMsg("Articolo inviato in revisione (DRAFT)! Sarà visibile non appena un Amministratore lo approverà.");
      }
      
      setTitolo(''); setSommario(''); setUrlImmagine(''); setIdCategoria(''); setIdGioco(''); setUrlVideo('');
      setContenuto(''); setVotoRedazione(''); setPro(''); setContro(''); setTestoConclusioni(''); setVersioneTestata('');
      setViewMode('editor');
      window.scrollTo(0, 0);
    }
    setIsSubmitting(false);
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!ngTitolo) {
      alert("Il titolo del gioco è obbligatorio!");
      return;
    }
    setNgSubmitting(true);

    const nuovoGioco = {
      titolo: ngTitolo,
      descrizione: ngDescrizione || null,
      url_immagine: ngUrlImmagine || null,
      data_uscita: ngDataUscita ? new Date(ngDataUscita).toISOString() : null,
      sviluppatore: ngSviluppatore || null,
      publisher: ngPublisher || null,
      giocatori: ngGiocatori || null,
      lingua: ngLingua || null,
      pegi: ngPegi || null,
      supporto: ngSupporto || null,
      voto_lettori: 0,
      numero_voti: 0
    };

    const { data, error } = await supabase.from('giochi').insert([nuovoGioco]).select().single();

    if (error) {
      console.error("Errore salvataggio gioco:", error);
      alert("Errore durante la creazione del gioco: " + error.message);
    } else if (data) {
      setGiochi(prev => [...prev, { id: data.id, titolo: data.titolo }].sort((a, b) => a.titolo.localeCompare(b.titolo)));
      setIdGioco(data.id); 
      setShowGameModal(false);
      
      setNgTitolo(''); setNgDescrizione(''); setNgUrlImmagine(''); setNgDataUscita('');
      setNgSviluppatore(''); setNgPublisher(''); setNgGiocatori(''); setNgLingua('');
      setNgPegi(''); setNgSupporto('');
    }
    setNgSubmitting(false);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const prosList = pro ? pro.split('\n').filter(p => p.trim() !== '') : ["Nessun pro inserito"];
  const consList = contro ? contro.split('\n').filter(p => p.trim() !== '') : ["Nessun contro inserito"];
  const embedUrl = getYouTubeEmbedUrl(urlVideo);
  
  const catSelezionata = categorie.find(c => c.id === parseInt(idCategoria))?.nome || 'CATEGORIA';

  if (loading) return <div className="text-white text-center py-20 font-bold">Verifica permessi e caricamento dati in corso...</div>;

  return (
    <div className="bg-[#111111] min-h-screen pb-20 font-sans relative">
      
      {showGameModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161616] border-t-4 border-[#ff2020] rounded-sm shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setShowGameModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl font-black">&times;</button>
            <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-6">Aggiungi Nuovo Gioco al Database</h2>
            
            <form onSubmit={handleCreateGame} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Titolo Gioco *</label>
                  <input type="text" required value={ngTitolo} onChange={(e) => setNgTitolo(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors font-bold" placeholder="Es. The Witcher 4" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">URL Immagine (Copertina)</label>
                  <input type="text" value={ngUrlImmagine} onChange={(e) => setNgUrlImmagine(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="https://..." />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-400 font-bold text-xs uppercase mb-2">Descrizione</label>
                <textarea value={ngDescrizione} onChange={(e) => setNgDescrizione(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm resize-none h-20" placeholder="Breve sinossi del gioco..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Data Uscita</label>
                  <input type="date" value={ngDataUscita} onChange={(e) => setNgDataUscita(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm [color-scheme:dark]" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Sviluppatore</label>
                  <input type="text" value={ngSviluppatore} onChange={(e) => setNgSviluppatore(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. Naughty Dog" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Publisher</label>
                  <input type="text" value={ngPublisher} onChange={(e) => setNgPublisher(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. Sony IE" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Giocatori</label>
                  <input type="text" value={ngGiocatori} onChange={(e) => setNgGiocatori(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. 1 / Multi" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Lingua</label>
                  <input type="text" value={ngLingua} onChange={(e) => setNgLingua(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. Ita (Testi)" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">PEGI</label>
                  <input type="text" value={ngPegi} onChange={(e) => setNgPegi(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. 18+" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Supporto</label>
                  <input type="text" value={ngSupporto} onChange={(e) => setNgSupporto(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm outline-none focus:border-[#ff2020] border border-transparent transition-colors text-sm" placeholder="Es. Fisico / Digitale" />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-2">
                <button type="button" onClick={() => setShowGameModal(false)} className="px-6 py-2.5 border border-gray-600 text-gray-300 font-black uppercase text-xs tracking-widest hover:border-white hover:text-white transition-colors rounded-sm">Annulla</button>
                <button type="submit" disabled={ngSubmitting} className="px-8 py-2.5 bg-[#ff2020] text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors rounded-sm disabled:opacity-50">
                  {ngSubmitting ? 'Salvataggio...' : 'Salva e Seleziona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#0f0f0f] border-b border-[#ff2020] pt-8 shadow-2xl sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="mb-4">
            <h1 className="text-white text-3xl font-black uppercase tracking-tight">Redazione <span className="text-[#ff2020]">CMS</span></h1>
            <p className="text-gray-400 text-sm font-semibold mt-1">Gestione contenuti e pubblicazione articoli</p>
          </div>
          
          <div className="flex gap-2 mb-[-1px]">
            <button 
              onClick={() => setViewMode('editor')} 
              className={`px-6 py-3 font-black uppercase text-sm tracking-widest transition-colors border-t-2 border-l-2 border-r-2 rounded-t-sm ${viewMode === 'editor' ? 'bg-[#111111] border-[#ff2020] text-[#ff2020]' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-white'}`}
            >
              ✏️ Editor
            </button>
            <button 
              onClick={() => setViewMode('preview')} 
              className={`px-6 py-3 font-black uppercase text-sm tracking-widest transition-colors border-t-2 border-l-2 border-r-2 rounded-t-sm ${viewMode === 'preview' ? 'bg-[#111111] border-[#ff2020] text-[#ff2020]' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-white'}`}
            >
              👁️ Anteprima
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 mt-8">
        {successMsg && <div className="bg-green-600 text-white p-4 rounded-sm font-bold mb-8 shadow-lg">✓ {successMsg}</div>}

        <div className={viewMode === 'editor' ? 'block' : 'hidden'}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            <div className="bg-[#1a1a1a] p-6 rounded-sm border border-gray-800 shadow-xl flex flex-col gap-6">
              <h2 className="text-[#ff2020] font-black text-[14px] uppercase tracking-widest border-b border-gray-800 pb-2">Informazioni Base</h2>
              
              <div className="flex flex-col">
                <label className="text-gray-400 font-bold text-xs uppercase mb-2">Titolo Articolo *</label>
                <input type="text" required value={titolo} onChange={(e) => setTitolo(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none font-bold text-lg transition-colors" placeholder="Es. L'attesa è finita..." />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-400 font-bold text-xs uppercase mb-2">Sommario (Sottotitolo)</label>
                <textarea value={sommario} onChange={(e) => setSommario(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none font-medium resize-none h-20 transition-colors" placeholder="Un breve riassunto dell'articolo..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">URL Immagine Copertina</label>
                  <input type="text" value={urlImmagine} onChange={(e) => setUrlImmagine(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm transition-colors" placeholder="https://..." />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">URL Video Trailer (Opzionale)</label>
                  <input type="text" value={urlVideo} onChange={(e) => setUrlVideo(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm transition-colors" placeholder="Link YouTube..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 font-bold text-xs uppercase mb-2">Categoria *</label>
                  <select required value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm transition-colors font-bold cursor-pointer">
                    <option value="" disabled>-- Seleziona --</option>
                    {categorie.length > 0 ? categorie.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>) : <option disabled>Nessuna categoria trovata</option>}
                  </select>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-400 font-bold text-xs uppercase">Gioco Associato</label>
                    <button type="button" onClick={() => setShowGameModal(true)} className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Nuovo Gioco
                    </button>
                  </div>
                  <select value={idGioco} onChange={(e) => setIdGioco(e.target.value)} className="bg-[#2a2a2a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm transition-colors font-bold cursor-pointer">
                    <option value="">-- Nessun gioco specifico --</option>
                    {giochi.length > 0 ? giochi.map(g => <option key={g.id} value={g.id}>{g.titolo}</option>) : <option disabled>Nessun gioco trovato</option>}
                  </select>
                </div>
              </div>
            </div>

            {isRecensione && (
              <div className="bg-[#2e1111] p-6 rounded-sm border border-[#ff2020] shadow-xl flex flex-col gap-6 animate-fadeIn">
                <h2 className="text-[#ff2020] font-black text-[14px] uppercase tracking-widest border-b border-[#ff2020]/30 pb-2">Dati Recensione</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-gray-300 font-bold text-xs uppercase mb-2">Voto Redazione (0-10)</label>
                    <input type="number" step="0.1" min="0" max="10" value={votoRedazione} onChange={(e) => setVotoRedazione(e.target.value)} className="bg-[#1a0a0a] text-[#ff2020] font-black text-2xl p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none transition-colors text-center" placeholder="es. 8.5" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-300 font-bold text-xs uppercase mb-2">Versione Testata</label>
                    <input type="text" value={versioneTestata} onChange={(e) => setVersioneTestata(e.target.value)} className="bg-[#1a0a0a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm transition-colors" placeholder="es. PlayStation 5" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-300 font-bold text-xs uppercase mb-2">Testo Conclusioni (Fianco al voto)</label>
                  <textarea value={testoConclusioni} onChange={(e) => setTestoConclusioni(e.target.value)} className="bg-[#1a0a0a] text-white p-3 rounded-sm border border-transparent focus:border-[#ff2020] outline-none text-sm resize-none h-16 transition-colors" placeholder="Un riassunto finale del giudizio..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[#28a745] font-black text-xs uppercase mb-2">PRO (uno per riga)</label>
                    <textarea value={pro} onChange={(e) => setPro(e.target.value)} className="bg-[#1a0a0a] text-white p-3 rounded-sm border border-transparent focus:border-[#28a745] outline-none text-sm resize-none h-24 transition-colors" placeholder="- Ottima grafica&#10;- Gameplay fluido"></textarea>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[#dc3545] font-black text-xs uppercase mb-2">CONTRO (uno per riga)</label>
                    <textarea value={contro} onChange={(e) => setContro(e.target.value)} className="bg-[#1a0a0a] text-white p-3 rounded-sm border border-transparent focus:border-[#dc3545] outline-none text-sm resize-none h-24 transition-colors" placeholder="- Storia breve&#10;- Calo di frame"></textarea>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-2 rounded-sm shadow-xl" style={{ minHeight: '500px' }}>
              <ReactQuill 
                theme="snow" 
                value={contenuto} 
                onChange={setContenuto} 
                modules={modules}
                style={{ height: '450px', color: '#000' }}
                placeholder="Scrivi l'articolo qui (Per le foto: clicca l'icona Immagine e incolla l'URL)..."
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => navigate('/')} className="px-6 py-3 border border-gray-600 text-gray-300 font-black uppercase text-xs tracking-widest hover:border-white hover:text-white transition-colors rounded-sm">
                Annulla
              </button>
              <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#ff2020] text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors rounded-sm shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Salvataggio in corso...' : 'Invia Articolo'}
              </button>
            </div>
          </form>
        </div>

        <div className={viewMode === 'preview' ? 'block' : 'hidden'}>
          <div className="bg-[#111111] border border-gray-800 p-8 shadow-2xl rounded-sm">
            
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight break-words">
                {titolo || 'Titolo dell\'articolo'}
              </h1>
              
              <div className="mt-2 w-10 h-10 bg-[#1a1a1a] border border-gray-700 rounded-full flex items-center justify-center text-[#ff2020] text-[14px] font-black flex-shrink-0 shadow-lg" title="0 Commenti">
                0
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mt-6 leading-snug break-words">
              {sommario || 'Sommario dell\'articolo...'}
            </p>
            
            <div className="text-[11px] font-black uppercase tracking-widest mt-6 pb-6 border-b border-gray-800">
              <span className="text-[#ff2020]">{catSelezionata}</span>
              <span className="text-gray-400 normal-case font-semibold"> di {authorName} — {new Date().toLocaleDateString('it-IT')}</span>
            </div>
            
            <div className="w-full aspect-video bg-[#1a1a1a] my-8 border border-gray-800 flex items-center justify-center overflow-hidden">
              {urlImmagine ? (
                <img src={getImg(urlImmagine)} alt="Copertina" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 font-bold uppercase tracking-widest">Nessuna Immagine</span>
              )}
            </div>

            {embedUrl && (
              <div className="w-full aspect-video bg-black relative mb-8 shadow-xl rounded-sm overflow-hidden border-2 border-gray-800">
                <iframe className="w-full h-full" src={embedUrl} title="Trailer" frameBorder="0" allowFullScreen></iframe>
              </div>
            )}

            <div className="prose prose-invert max-w-none text-gray-300 text-[17px] leading-relaxed custom-quill-content break-words [&_img]:block [&_img]:mx-auto [&_img]:my-8 [&_img]:max-w-full [&_img]:rounded-md [&_img]:shadow-xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:my-8" 
                 dangerouslySetInnerHTML={{ __html: contenuto || '<p class="text-gray-600 italic">Il testo dell\'articolo apparirà qui...</p>' }} />

            {isRecensione && (
              <div className="mt-16 w-full font-sans bg-[#7a1212] shadow-2xl mb-12 flex flex-col">
                
                <div className="pt-8 pb-6 flex flex-col items-center">
                  <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-widest drop-shadow-md">Conclusioni</h3>
                  {versioneTestata && (
                    <div className="mt-4 text-center flex flex-col items-center">
                      <span className="text-gray-300 text-[10px] font-black tracking-widest uppercase mb-1">Versione Testata</span>
                      <span className="text-white font-bold text-sm bg-black/20 px-4 py-1 rounded-full">{versioneTestata}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#1a1a1a] w-full py-8 px-4 flex flex-row justify-center items-center gap-6 md:gap-24 border-y-2 border-black/30">
                  <div className="flex flex-col items-center">
                    <span className="text-[#ff2020] text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Multiplayer.it</span>
                    <span className="text-[#ff2020] text-5xl md:text-6xl font-black leading-none drop-shadow-sm">{votoRedazione ? parseFloat(votoRedazione).toFixed(1) : '-'}</span>
                  </div>
                  <div className="flex flex-col items-center relative min-w-[120px]">
                    <span className="text-gray-400 text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Il Tuo Voto</span>
                    <span className="text-white text-3xl md:text-4xl font-black leading-none mb-3">-</span>
                    <input type="range" disabled className="w-full accent-[#ff2020] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-not-allowed opacity-50" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[#00bfff] text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">Lettori (0)</span>
                    <span className="text-[#00bfff] text-5xl md:text-6xl font-black leading-none drop-shadow-sm">-</span>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex flex-col">
                  <p className="text-white text-[15px] font-medium leading-relaxed mb-10 text-justify">
                    {testoConclusioni || "Inserisci il testo delle conclusioni nell'editor per vederlo qui..."}
                  </p>

                  <div className="flex flex-col gap-6 w-full">
                    <div className="bg-[#1a1a1a] p-6 md:p-8 border-t-[3px] border-[#28a745]">
                      <h4 className="text-[#28a745] font-black text-xl mb-5 uppercase tracking-wide">PRO</h4>
                      <ul className="space-y-4">
                        {prosList.map((p, idx) => (
                          <li key={idx} className="flex items-start text-white text-[15px] font-medium leading-snug break-words">
                            <span className="text-[#28a745] text-[12px] mr-4 leading-none mt-1">●</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-6 md:p-8 border-t-[3px] border-[#ff2020]">
                      <h4 className="text-[#ff2020] font-black text-xl mb-5 uppercase tracking-wide">CONTRO</h4>
                      <ul className="space-y-4">
                        {consList.map((c, idx) => (
                          <li key={idx} className="flex items-start text-white text-[15px] font-medium leading-snug break-words">
                            <span className="text-[#ff2020] text-[12px] mr-4 leading-none mt-1">●</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}