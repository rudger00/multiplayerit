import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PaginaLive() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dati del palinsesto (puoi in futuro spostarli su Supabase)
  const palinsesto = [
    {
      giorno: 'Lunedì 14 Settembre',
      eventi: [
        { orario: '14:00', titolo: "Marvel's Wolverine, gameplay e analisi con Pierpaolo e Christian" },
        { orario: '16:00', titolo: 'Chiacchiere videoludiche con Mancosu' },
      ]
    },
    {
      giorno: 'Martedì 15 Settembre',
      eventi: [
        { orario: '10:00', titolo: 'INDIEcazioni Terapeutiche con Willy Lordo e Kobe' },
      ]
    },
    {
      giorno: 'Mercoledì 16 Settembre',
      eventi: [
        { orario: '16:00', titolo: '16-Bit con Serino' },
      ]
    },
    {
      giorno: 'Giovedì 17 Settembre',
      eventi: [
        { orario: '10:00', titolo: 'La Pausa Caffè con Kobe' },
      ]
    },
    {
      giorno: 'Venerdì 18 Settembre',
      eventi: [
        { orario: '10:00', titolo: 'Le notizie della settimana con Mancosu' },
        { orario: '16:00', titolo: 'Il Cortocircuito' },
      ]
    }
  ];

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20">
      
      {/* HEADER LIVE */}
      <div className="max-w-[1200px] mx-auto px-4 pt-8 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest">Multiplayer Live</h2>
            <h1 className="text-2xl md:text-4xl font-black text-white mt-1 tracking-tight">La redazione di Multiplayer.it dal vivo</h1>
          </div>
          <button className="border border-[#ff2020] text-[#ff2020] hover:bg-[#ff2020] hover:text-white px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors hidden md:block">
            Segui
          </button>
        </div>
      </div>

      {/* SEZIONE TWITCH EMBED (Video + Chat) */}
      {/* Nota: il parametro parent=localhost serve per farlo funzionare sul tuo PC. Quando lo metterai online, andrà cambiato col tuo dominio */}
      <div className="w-full bg-black border-y border-gray-800">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row h-[300px] md:h-[500px] lg:h-[600px]">
          {/* Video Player (75%) */}
          <div className="w-full lg:w-[75%] h-full">
            <iframe
              src="https://player.twitch.tv/?channel=multiplayerit&parent=localhost"
              height="100%"
              width="100%"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>
          {/* Chat (25% - Nascosta su mobile per questioni di spazio) */}
          <div className="hidden lg:block w-[25%] h-full border-l border-gray-800 bg-white">
            <iframe
              src="https://www.twitch.tv/embed/multiplayerit/chat?parent=localhost&darkpopout"
              height="100%"
              width="100%"
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Palinsesto e Sidebar) */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        
        {/* COLONNA SINISTRA: Palinsesto (70%) */}
        <div className="lg:w-[70%]">
          
          {/* Pulsanti Social a destra */}
          <div className="flex justify-end gap-1 mb-8">
            <button className="w-8 h-8 bg-[#3b5998] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></button>
            <button className="w-8 h-8 bg-black border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
            <button className="w-8 h-8 bg-[#25D366] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></button>
            <button className="w-8 h-8 bg-[#0088cc] flex items-center justify-center text-white hover:opacity-80"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.26-5.61 3.71-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.36-.49 1-.76 3.91-1.7 6.52-2.82 7.82-3.36 3.72-1.54 4.49-1.81 5-1.82.11 0 .36.03.5.15.12.1.15.24.16.34.02.14 0 .31-.02.43z"/></svg></button>
          </div>

          {/* Rendering del Palinsesto */}
          {palinsesto.map((blocco, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-white font-black text-lg mb-2">{blocco.giorno}</h3>
              <div className="flex flex-col border border-gray-800 rounded-sm overflow-hidden shadow-lg">
                {blocco.eventi.map((evento, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 bg-[#1a1a1a] ${i !== 0 ? 'border-t border-gray-800' : ''}`}>
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-[#ff2020] font-black text-xl w-16 flex-shrink-0">{evento.orario}</span>
                      <span className="text-white text-sm md:text-[15px] font-bold leading-tight">{evento.titolo}</span>
                    </div>
                    <button className="text-[#ff2020] text-[10px] font-black uppercase tracking-widest ml-4 hover:underline">
                      SEGUI
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* COLONNA DESTRA: Sidebar (30%) */}
        <div className="lg:w-[30%] flex flex-col gap-8">
          
          {/* Banner Pubblicitario Finto */}
          <div className="w-full aspect-[3/4] bg-gradient-to-b from-[#3b9cd4] to-[#f5f1e7] flex flex-col items-center justify-center p-6 text-center shadow-xl border border-gray-800">
            <h3 className="text-white font-black text-2xl mb-2">Find<br/>Your Calm</h3>
            <p className="text-white text-xs mb-6">Meditation & Better Sleep</p>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-md">
               <span className="text-[#3b9cd4] text-xl">✿</span>
            </div>
            <button className="bg-[#3b9cd4] text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">Discover More</button>
          </div>

          {/* Le Live Più Popolari */}
          <div>
            <h4 className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">
              Le live più popolari
            </h4>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-20 h-14 bg-gray-800 flex-shrink-0 border border-gray-700 overflow-hidden relative">
                     {/* Immagine segnaposto */}
                     <img src={`https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop&sig=${item}`} alt="Il Cortocircuito" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80" />
                     {item === 3 && (
                        <div className="absolute inset-0 bg-[#e91e63]/40 flex items-center justify-center">
                            <span className="text-white text-xl">Q</span>
                        </div>
                     )}
                  </div>
                  <h5 className="text-white font-bold text-[13px] group-hover:text-[#ff2020] transition-colors">
                    Il Cortocircuito
                  </h5>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}