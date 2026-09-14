import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#a0a0a0" viewBox="0 0 16 16">
    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
  </svg>
);

export default function PaginaProfilo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Bacheca');
  const [userComments, setUserComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "UtenteSconosciuto";

  // Carica i commenti reali fatti dall'utente dal database
  useEffect(() => {
    async function fetchUserComments() {
      if (!user) return;
      setLoadingComments(true);

      // 1. Trova l'id utente nella tabella pubblica
      const { data: userData } = await supabase
        .from('utenti')
        .select('id')
        .eq('id_auth', user.id)
        .single();

      if (userData) {
        // 2. Prendi i commenti associati a questo utente, includendo il titolo dell'articolo
        const { data: commentsData, error } = await supabase
          .from('commenti')
          .select(`
            id,
            testo,
            data,
            id_articolo,
            articoli ( titolo )
          `)
          .eq('id_utente', userData.id)
          .order('data', { ascending: false });

        if (!error && commentsData) {
          setUserComments(commentsData);
        }
      }
      setLoadingComments(false);
    }

    fetchUserComments();
  }, [user]);

  const menuItems = [
    { nome: 'Bacheca', count: userComments.length },
    { nome: 'Notifiche', count: 1 },
    { nome: 'Messaggi', count: 0 },
    { nome: 'Articoli salvati', count: 0 },
    { nome: 'Seguiti', count: 2 },
    { nome: 'Giochi votati', count: 0 },
    { nome: 'Blacklist', count: 0 },
    { nome: 'Ban e Ammonizioni', count: 1 },
    { nome: 'Commenti', count: userComments.length },
  ];

  const formattaData = (dataIso) => {
    if (!dataIso) return '';
    const data = new Date(dataIso);
    return data.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const CommentoItem = ({ commento }) => (
    <div className="border-b border-gray-800 py-6 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-[52px] h-[52px] rounded-full border-[2px] border-[#ff4444] p-[2px] bg-[#111]">
              <img src={`https://ui-avatars.com/api/?name=${username}&background=2a2a2a&color=fff`} alt={username} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute -top-1 -right-1 bg-[#ff4444] text-white text-[10px] font-black italic w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
              m
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-[15px]">{username}</span>
            {commento.articoli?.titolo && (
              <span className="text-gray-500 text-xs font-semibold mt-0.5">
                nell'articolo: <span className="text-gray-300">{commento.articoli.titolo}</span>
              </span>
            )}
          </div>
        </div>
        <span className="text-gray-400 text-[13px] font-semibold">{formattaData(commento.data)}</span>
      </div>
      
      <p className="text-gray-200 text-[15px] font-medium mb-6 leading-relaxed ml-[68px] whitespace-pre-wrap">
        {commento.testo}
      </p>
      
      {/* Bottone VAI AL COMMENTO con redirezione mirata */}
      <div className="flex justify-end">
        <button 
          onClick={() => navigate(`/articolo/${commento.id_articolo}#commento-${commento.id}`)}
          className="bg-[#ff4444] hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-sm transition-colors shadow-md cursor-pointer"
        >
          Vai al commento
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#111111] min-h-screen font-sans flex justify-center pb-10">
      <div className="w-full max-w-[1200px] flex flex-col shadow-2xl mt-8">
        
        {/* TOP SECTION: Avatar e Copertina */}
        <div className="flex flex-col md:flex-row h-auto md:h-[350px]">
          <div className="w-full md:w-[35%] bg-[#0f0f0f] flex flex-col items-center justify-center py-10 md:py-0 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="relative mb-4">
              <div className="w-[120px] h-[120px] rounded-full border-[4px] border-dashed border-gray-600 bg-transparent flex items-center justify-center p-2">
                <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                  <UserIcon />
                </div>
              </div>
              <div className="absolute top-0 right-0 bg-[#00bfff] text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#0f0f0f]">
                6
              </div>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">{username}</h1>
          </div>

          <div className="w-full md:w-[65%] bg-[#c2c2c2] relative overflow-hidden flex items-center justify-center h-[200px] md:h-full">
            <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-30 pointer-events-none p-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={i} className="text-white text-7xl font-black italic mr-8 mb-8">m</span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row min-h-[500px]">
          
          {/* LATO SINISTRO */}
          <div className="w-full md:w-[70%] bg-[#1a1a1a] p-6 md:p-10 border-r border-gray-800">
            
            {(activeTab === 'Bacheca' || activeTab === 'Commenti') && (
              <>
                <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-8">
                  {activeTab === 'Bacheca' ? 'Bacheca' : 'I tuoi Commenti'}
                </h2>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-6">
                  <span className="text-white font-black text-xs uppercase tracking-widest">
                    <span className="text-[#ff2020]">{userComments.length}</span> Commenti
                  </span>
                  <button className="text-[#ff2020] font-black text-xs uppercase tracking-widest hover:underline">
                    Regolamento
                  </button>
                </div>

                {loadingComments ? (
                  <p className="text-gray-400 text-center py-10 font-bold">Caricamento commenti...</p>
                ) : userComments.length > 0 ? (
                  <div className="flex flex-col">
                    {userComments.map(commento => (
                      <CommentoItem key={commento.id} commento={commento} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10 font-bold">Non hai ancora scritto alcun commento.</p>
                )}
              </>
            )}

            {activeTab !== 'Bacheca' && activeTab !== 'Commenti' && (
              <div className="text-gray-400 font-bold text-center mt-20">
                Contenuto per la sezione {activeTab} in costruzione...
              </div>
            )}
          </div>

          {/* LATO DESTRO: Sidebar */}
          <div className="w-full md:w-[30%] bg-[#222222] p-6">
            <button className="w-full border-2 border-gray-600 hover:border-[#ff4444] text-[#ff4444] font-bold text-[13px] py-3 rounded-sm transition-colors mb-8 shadow-md">
              Abbonati a Multiplayer.it Plus
            </button>

            <ul className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button 
                    onClick={() => setActiveTab(item.nome)}
                    className="w-full flex items-center justify-between px-2 py-2 hover:bg-white/5 transition-colors group cursor-pointer outline-none"
                  >
                    <span className={`text-[13px] font-semibold transition-colors ${activeTab === item.nome ? 'text-[#ff4444]' : 'text-[#ff4444] opacity-90 group-hover:text-[#ff4444]'}`}>
                      {item.nome}
                    </span>
                    <span className="bg-[#e6c200] text-black text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm">
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}