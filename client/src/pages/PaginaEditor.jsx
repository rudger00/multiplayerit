import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Stile base dell'editor
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function PaginaEditor() {
  const navigate = useNavigate();
  const [titolo, setTitolo] = useState('');
  const [urlImmagine, setUrlImmagine] = useState('');
  const [categoria, setCategoria] = useState('1'); // Default: News (id 1)
  const [giocoId, setGiocoId] = useState('');
  const [voto, setVoto] = useState('');
  const [corpo, setCorpo] = useState(''); // Qui React Quill salverà l'HTML
  
  const [giochiDisponibili, setGiochiDisponibili] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carica i giochi dal DB per la tendina (se la recensione è collegata a un gioco)
  useEffect(() => {
    async function fetchGiochi() {
      const { data } = await supabase.from('giochi').select('id, titolo').order('titolo');
      if (data) setGiochiDisponibili(data);
    }
    fetchGiochi();
  }, []);

  // Configuriamo i pulsanti dell'editor di testo (Grassetto, Titoli, Immagini, ecc.)
  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Inseriamo i dati nel database
    const { data, error } = await supabase
      .from('articoli')
      .insert([
        { 
          titolo: titolo,
          url_immagine: urlImmagine || null,
          id_categoria: parseInt(categoria),
          corpo: corpo, // Salviamo l'HTML generato da Quill
          id_gioco: giocoId ? parseInt(giocoId) : null,
          voto: voto ? parseFloat(voto) : null,
          id_autore: 1, // Mettiamo 1 di default per ora
          creato_il: new Date().toISOString(),
          aggiornato_il: new Date().toISOString()
        }
      ])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert("Errore durante il salvataggio: " + error.message);
    } else {
      alert("Articolo pubblicato con successo!");
      navigate(`/articolo/${data[0].id}`); // Vai a vedere l'articolo pubblicato
    }
  };

  return (
    <main className="max-w-[800px] mx-auto p-4 mt-8 mb-20 bg-[#1a1a1a] border border-gray-800 rounded-sm">
      <h1 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Scrivi un nuovo Articolo</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* TITOLO E IMMAGINE */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 font-bold text-sm uppercase">Titolo Articolo</label>
          <input type="text" required value={titolo} onChange={e => setTitolo(e.target.value)} className="bg-[#111] border border-gray-700 text-white p-3 rounded-sm focus:border-[#ff2020] outline-none" placeholder="Es. Esclusiva: Annunciato GTA 7..." />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-400 font-bold text-sm uppercase">URL Immagine di Copertina</label>
          <input type="url" value={urlImmagine} onChange={e => setUrlImmagine(e.target.value)} className="bg-[#111] border border-gray-700 text-white p-3 rounded-sm focus:border-[#ff2020] outline-none" placeholder="https://..." />
        </div>

        {/* METADATI: CATEGORIA, GIOCO, VOTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 font-bold text-sm uppercase">Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="bg-[#111] border border-gray-700 text-white p-3 rounded-sm focus:border-[#ff2020] outline-none">
              <option value="1">News</option>
              <option value="2">Recensione</option>
              <option value="3">Speciale</option>
              <option value="4">Provato</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 font-bold text-sm uppercase">Gioco Collegato (Opzionale)</label>
            <select value={giocoId} onChange={e => setGiocoId(e.target.value)} className="bg-[#111] border border-gray-700 text-white p-3 rounded-sm focus:border-[#ff2020] outline-none">
              <option value="">Nessun gioco</option>
              {giochiDisponibili.map(g => (
                <option key={g.id} value={g.id}>{g.titolo}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 font-bold text-sm uppercase">Voto (Solo Recensioni)</label>
            <input type="number" step="0.1" min="0" max="10" value={voto} onChange={e => setVoto(e.target.value)} className="bg-[#111] border border-gray-700 text-white p-3 rounded-sm focus:border-[#ff2020] outline-none" placeholder="Es. 8.5" />
          </div>
        </div>

        {/* EDITOR DI TESTO (REACT QUILL) */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 font-bold text-sm uppercase">Testo dell'Articolo</label>
          <div className="bg-white text-black rounded-sm overflow-hidden">
            <ReactQuill 
              theme="snow" 
              value={corpo} 
              onChange={setCorpo} 
              modules={modules}
              className="h-[400px] mb-12"
            />
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="bg-[#ff2020] text-white font-black uppercase tracking-widest p-4 rounded-sm hover:bg-red-700 transition-colors mt-4">
          {isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Articolo'}
        </button>

      </form>
    </main>
  );
}