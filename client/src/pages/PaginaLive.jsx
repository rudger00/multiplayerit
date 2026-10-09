import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImg } from '../utils/helpers';

export default function PaginaLive() {
  const { user, openModal } = useAuth();
  
  const [palinsesto, setPalinsesto] = useState({});
  const [popolari, setPopolari] = useState([]);
  const [openDays, setOpenDays] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegolamentoOpen, setIsRegolamentoOpen] = useState(false);

  // Stati per i Follow (Segui)
  const [followedEvents, setFollowedEvents] = useState([]);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);

  // Stati Admin
  const [isEditing, setIsEditing] = useState(false);
  const [newGiorno, setNewGiorno] = useState('');
  const [newOrario, setNewOrario] = useState('');
  const [newTitolo, setNewTitolo] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
    checkAdmin();
  }, []);

  useEffect(() => {
    fetchUserFollows();
  }, [user]);

  async function checkAdmin() {
    if (!user) return;
    const { data } = await supabase.from('utenti').select('id_ruolo').eq('id_auth', user.id).maybeSingle();
    if (data && (data.id_ruolo === 1 || data.id_ruolo === 2)) setIsAdmin(true);
  }

  async function fetchUserFollows() {
    if (!user) {
      setFollowedEvents([]);
      setIsFollowingChannel(false);
      return;
    }
    const { data: uData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (uData) {
      // Fetch eventi seguiti
      const { data: evtData } = await supabase.from('segui_eventi_live').select('id_palinsesto').eq('id_utente', uData.id);
      if (evtData) setFollowedEvents(evtData.map(e => e.id_palinsesto));
      
      // Fetch canale seguito
      const { data: chData } = await supabase.from('segui_canali').select('id').eq('id_utente', uData.id).eq('canale', 'Multiplayer.it Twitch').maybeSingle();
      if (chData) setIsFollowingChannel(true);
    }
  }

  async function fetchData() {
    const { data: palData } = await supabase.from('palinsesto').select('*').order('ordine', { ascending: true }).order('orario', { ascending: true });
    if (palData) {
      const grouped = palData.reduce((acc, curr) => {
        if (!acc[curr.giorno]) acc[curr.giorno] = [];
        acc[curr.giorno].push(curr);
        return acc;
      }, {});
      setPalinsesto(grouped);
      const firstDay = Object.keys(grouped)[0];
      if (firstDay) setOpenDays({ [firstDay]: true });
    }

    const { data: popData } = await supabase.from('articoli').select('id, titolo, url_immagine').ilike('titolo', '%Live%').order('creato_il', { ascending: false }).limit(4);
    if (popData && popData.length > 0) {
      setPopolari(popData);
    } else {
      const { data: fallbackData } = await supabase.from('articoli').select('id, titolo, url_immagine').eq('id_categoria', 10).order('creato_il', { ascending: false }).limit(4);
      if (fallbackData) setPopolari(fallbackData);
    }
  }

  const toggleDay = (giorno) => setOpenDays(prev => ({ ...prev, [giorno]: !prev[giorno] }));

  // LOGICA SEGUI CANALE
  const toggleFollowChannel = async () => {
    if (!user) return openModal();
    const { data: uData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (!uData) return;

    if (isFollowingChannel) {
      await supabase.from('segui_canali').delete().eq('id_utente', uData.id).eq('canale', 'Multiplayer.it Twitch');
      setIsFollowingChannel(false);
    } else {
      await supabase.from('segui_canali').insert([{ id_utente: uData.id, canale: 'Multiplayer.it Twitch' }]);
      setIsFollowingChannel(true);
    }
  };

  // LOGICA SEGUI EVENTO
  const toggleFollowEvent = async (idPalinsesto) => {
    if (!user) return openModal();
    const { data: uData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    if (!uData) return;

    if (followedEvents.includes(idPalinsesto)) {
      await supabase.from('segui_eventi_live').delete().eq('id_utente', uData.id).eq('id_palinsesto', idPalinsesto);
      setFollowedEvents(prev => prev.filter(id => id !== idPalinsesto));
    } else {
      await supabase.from('segui_eventi_live').insert([{ id_utente: uData.id, id_palinsesto: idPalinsesto }]);
      setFollowedEvents(prev => [...prev, idPalinsesto]);
    }
  };

  // Funzioni Admin
  const handleAddLive = async (e) => {
    e.preventDefault();
    if (!newGiorno || !newOrario || !newTitolo) return;
    let ordine = 99;
    const { data: exist } = await supabase.from('palinsesto').select('ordine').eq('giorno', newGiorno).limit(1);
    if (exist && exist.length > 0) ordine = exist[0].ordine;
    await supabase.from('palinsesto').insert([{ giorno: newGiorno, orario: newOrario, titolo: newTitolo, ordine }]);
    setNewOrario(''); setNewTitolo('');
    fetchData(); 
  };

  const handleDeleteLive = async (id) => {
    if(window.confirm('Sicuro di voler togliere questa live dalla programmazione?')) {
      await supabase.from('palinsesto').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20">
      
      <div className="max-w-[1200px] mx-auto px-4 pt-8 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest">Multiplayer Live</h2>
            <h1 className="text-2xl md:text-4xl font-black text-white mt-1 tracking-tight">La redazione di Multiplayer.it dal vivo</h1>
          </div>
          <button 
            onClick={toggleFollowChannel}
            className={`border px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors hidden md:block ${isFollowingChannel ? 'bg-[#00bfff] text-white border-[#00bfff] shadow-[0_0_10px_rgba(0,191,255,0.4)]' : 'border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white'}`}
          >
            {isFollowingChannel ? '✓ SEGUITO' : 'Segui il canale'}
          </button>
        </div>
      </div>

      <div className="w-full bg-black border-y border-gray-800 mb-8">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row h-[300px] md:h-[500px] lg:h-[600px]">
          <div className="w-full lg:w-[75%] h-full">
            <iframe src="https://player.twitch.tv/?channel=multiplayerit&parent=localhost" height="100%" width="100%" allowFullScreen frameBorder="0"></iframe>
          </div>
          <div className="hidden lg:block w-[25%] h-full border-l border-gray-800 bg-white">
            <iframe src="https://www.twitch.tv/embed/multiplayerit/chat?parent=localhost&darkpopout" height="100%" width="100%" frameBorder="0"></iframe>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-10">
        
        <div className="lg:w-[70%] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                {isAdmin && (
                  <button onClick={() => setIsEditing(!isEditing)} className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-sm hover:bg-gray-700 border border-gray-600 shadow-md transition-colors">
                    {isEditing ? 'Chiudi Gestione Palinsesto' : '⚙️ Gestisci Programmazione Live'}
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 bg-[#3b5998] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></button>
                <button className="w-8 h-8 bg-black border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                <button className="w-8 h-8 bg-[#25D366] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></button>
              </div>
            </div>

            {isEditing && (
              <form onSubmit={handleAddLive} className="bg-[#1a1a1a] p-4 rounded-sm border-l-4 border-[#ff2020] mb-8 flex flex-col md:flex-row gap-4 items-end shadow-lg">
                <div className="flex flex-col w-full">
                  <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Giorno (es. Mercoledì 23 Settembre)</label>
                  <input type="text" value={newGiorno} onChange={e => setNewGiorno(e.target.value)} required className="p-2 bg-[#222] text-white outline-none border border-gray-700 text-sm focus:border-[#ff2020] transition-colors" />
                </div>
                <div className="flex flex-col w-full md:w-32">
                  <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Orario</label>
                  <input type="text" value={newOrario} onChange={e => setNewOrario(e.target.value)} required placeholder="14:30" className="p-2 bg-[#222] text-white outline-none border border-gray-700 text-sm focus:border-[#ff2020] transition-colors" />
                </div>
                <div className="flex flex-col w-full">
                  <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Titolo Evento</label>
                  <input type="text" value={newTitolo} onChange={e => setNewTitolo(e.target.value)} required className="p-2 bg-[#222] text-white outline-none border border-gray-700 text-sm focus:border-[#ff2020] transition-colors" />
                </div>
                <button type="submit" className="bg-[#ff2020] text-white font-bold px-6 py-2 text-sm uppercase tracking-widest whitespace-nowrap hover:bg-red-700 transition-colors">Aggiungi</button>
              </form>
            )}

            {Object.keys(palinsesto).length > 0 ? (
              Object.keys(palinsesto).map((giorno, idx) => {
                const isOpen = openDays[giorno];
                return (
                  <div key={idx} className="mb-4">
                    <div onClick={() => toggleDay(giorno)} className="flex justify-between items-center cursor-pointer border-b border-gray-800 pb-2 mb-2 group">
                      <h3 className="text-white font-black text-[17px] group-hover:text-[#ff2020] transition-colors">{giorno}</h3>
                      <span className="text-[#ff2020] font-black text-xl leading-none w-6 text-center">{isOpen ? '−' : '+'}</span>
                    </div>

                    {isOpen && (
                      <div className="flex flex-col rounded-sm overflow-hidden">
                        {palinsesto[giorno].map((evento) => {
                          const isFollowed = followedEvents.includes(evento.id);
                          return (
                            <div key={evento.id} className="flex items-center justify-between p-4 bg-transparent border-b border-gray-800/50 hover:bg-[#161616] transition-colors">
                              <div className="flex items-start md:items-center gap-4 w-full flex-col md:flex-row">
                                <span className="text-[#ff2020] font-black text-[19px] w-16 flex-shrink-0">{evento.orario}</span>
                                <span className="text-white text-[15px] font-bold leading-tight">{evento.titolo}</span>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-4 md:mt-0">
                                {isEditing && (
                                  <button onClick={() => handleDeleteLive(evento.id)} className="text-gray-400 hover:bg-red-500 hover:text-white text-[10px] uppercase tracking-widest font-bold border border-gray-600 px-3 py-1 rounded transition-colors">
                                    Togli
                                  </button>
                                )}
                                <button 
                                  onClick={() => toggleFollowEvent(evento.id)}
                                  className={`text-[10px] font-black uppercase tracking-widest ml-4 transition-colors ${isFollowed ? 'text-[#00bfff] hover:text-red-500' : 'text-[#ff2020] hover:underline'}`}
                                >
                                  {isFollowed ? '✓ SEGUITO' : 'SEGUI'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : <p className="text-gray-500 font-bold">Nessuna live programmata per questa settimana.</p>}
          </div>

          <div className="mt-8">
            <div onClick={() => setIsRegolamentoOpen(!isRegolamentoOpen)} className="bg-[#ff4444] text-white font-bold p-4 text-sm text-center cursor-pointer hover:bg-red-600 transition-colors shadow-lg flex justify-between items-center px-6">
              <span className="uppercase tracking-widest">Regolamento della Chat</span>
              <span className="text-2xl leading-none">{isRegolamentoOpen ? '−' : '+'}</span>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRegolamentoOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-[#1a1a1a] border border-t-0 border-gray-800 p-6 text-gray-300 text-[14px] leading-relaxed">
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>Rispetto reciproco:</strong> Non sono tollerati insulti, minacce, o comportamenti tossici verso la redazione o gli altri utenti.</li>
                  <li><strong>No Spam:</strong> Evita di ripetere lo stesso messaggio e non postare link esterni non autorizzati.</li>
                  <li><strong>Niente Spoiler:</strong> Rispetta chi non ha ancora giocato, evita di rivelare dettagli di trama nei commenti.</li>
                  <li><strong>Moderazione:</strong> I moderatori della live hanno l'ultima parola. Chi viola le regole verrà silenziato o bannato dal canale Twitch.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* COLONNA DESTRA: Sidebar Articoli */}
        <div className="lg:w-[30%] flex flex-col gap-8">
          <div>
            <h4 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Le live più popolari</h4>
            <div className="flex flex-col gap-4">
              {popolari.map((articolo) => (
                <Link key={articolo.id} to={`/articolo/${articolo.id}`} className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-24 h-16 bg-gray-800 flex-shrink-0 border border-gray-700 overflow-hidden relative">
                     <img src={getImg(articolo.url_immagine)} alt={articolo.titolo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90" />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/20">
                         <div className="w-0 h-0 border-t-4 border-b-4 border-l-[6px] border-transparent border-l-white ml-0.5"></div>
                       </div>
                     </div>
                  </div>
                  <h5 className="text-white font-bold text-[13px] group-hover:text-[#ff2020] transition-colors leading-snug line-clamp-3">
                    {articolo.titolo}
                  </h5>
                </Link>
              ))}
              {popolari.length === 0 && <p className="text-gray-500 text-xs italic">Nessun articolo contrassegnato come "Live" trovato.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}