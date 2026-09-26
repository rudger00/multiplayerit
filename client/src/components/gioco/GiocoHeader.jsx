import React from 'react';
import { Link } from 'react-router-dom';
import { getImg } from '../../utils/helpers';

export default function GiocoHeader({
  game, activeTab, isFollowing, toggleFollow, loadingFollow, 
  myVote, setMyVote, showVoteDropdown, setShowVoteDropdown, 
  handleSaveVote, user, openModal, voteRef
}) {
  const coverUrl = getImg(game.url_immagine);
  const platforms = game.gioco_piattaforma?.length > 0 ? game.gioco_piattaforma.map(p => p.piattaforme.nome).join(' - ') : 'ND';
  const releaseDate = game.data_uscita ? new Date(game.data_uscita).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Da definire';

  return (
    <div className="relative w-full h-[350px] md:h-[400px] flex justify-center pt-8">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-40 scale-110" style={{ backgroundImage: `url(${coverUrl})` }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/80 to-[#111111]"></div>
      
      <div className="absolute top-4 left-4 md:left-[10%] text-white text-xs font-bold z-10">
        <Link to="/" className="hover:text-[#ff2020]">Multiplayer.it</Link> <span className="text-gray-500">/</span> <Link to="/giochi" className="hover:text-[#ff2020]">Giochi</Link> <span className="text-gray-500">/</span> {game.titolo}
      </div>

      <div className="relative z-10 w-full max-w-[1000px] px-4 flex flex-col md:flex-row items-end gap-6 pb-10">
        <img src={coverUrl} alt={game.titolo} className="w-[180px] md:w-[220px] rounded-md shadow-2xl border-4 border-[#1a1a1a]" />
        
        <div className="bg-[#1a1a1a]/90 backdrop-blur-sm p-6 flex-grow rounded-sm shadow-xl flex flex-col justify-center border border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={toggleFollow} disabled={loadingFollow}
              className={`border rounded-full font-black uppercase text-xs px-6 py-2 transition-colors ${isFollowing ? 'bg-[#ff2020] border-[#ff2020] text-white hover:bg-red-700' : 'text-[#ff2020] border-[#ff2020] hover:bg-[#ff2020] hover:text-white'}`}
            >
              {isFollowing ? 'NON SEGUIRE' : 'SEGUI'}
            </button>
            <div>
              {activeTab === 'gioco' && <h1 className="text-3xl font-black text-white">{game.titolo}</h1>}
              {activeTab === 'recensioni' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Recensioni</span> di<br/>{game.titolo}</h1>}
              {activeTab === 'notizie' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Notizie</span> di<br/>{game.titolo}</h1>}
              {activeTab === 'video' && <h1 className="text-2xl font-black text-white"><span className="text-[#ff2020]">Video e immagini</span> di<br/>{game.titolo}</h1>}
            </div>
          </div>
          
          {activeTab === 'gioco' && (
            <div className="flex items-center gap-6 mb-4 relative" ref={voteRef}>
              <div className="flex items-center gap-3 relative">
                <div className="w-10 h-10 bg-[#ff2020] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">
                  {game.voto_redazione ? parseFloat(game.voto_redazione).toFixed(1) : '-'}
                </div>
                
                <div 
                  onClick={() => { if(!user) openModal(); else setShowVoteDropdown(!showVoteDropdown); }}
                  className="w-10 h-10 border border-gray-500 rounded-full flex items-center justify-center text-gray-300 font-black text-[10px] uppercase shadow-md cursor-pointer hover:border-white hover:text-white transition-colors"
                >
                  {myVote !== 5.0 ? parseFloat(myVote).toFixed(1) : 'VOTA!'}
                </div>
                
                <div className="w-10 h-10 border border-[#00bfff] rounded-full flex items-center justify-center text-[#00bfff] font-black text-sm shadow-md">
                  {game.voto_lettori && game.voto_lettori > 0 ? parseFloat(game.voto_lettori).toFixed(1) : '-'}
                </div>

                {showVoteDropdown && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#2a2a2a] p-4 rounded-md shadow-2xl border border-gray-700 w-64 z-50 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span className="text-xs text-gray-400">Il tuo voto</span>
                      <span className="text-xl text-[#ff2020]">{parseFloat(myVote).toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="10" step="0.1" value={myVote} onChange={(e) => setMyVote(e.target.value)} className="w-full accent-[#ff2020]" />
                    <button onClick={handleSaveVote} className="w-full bg-[#ff2020] text-white text-xs font-bold uppercase py-2 rounded-sm hover:bg-red-700">Conferma Voto</button>
                  </div>
                )}
              </div>
              <div className="h-10 w-[1px] bg-gray-700"></div>
              <div className="text-xs text-gray-300 font-semibold leading-relaxed text-left">
                <p><span className="text-[#ff2020]">●</span> Uscita: <span className="text-white">{releaseDate}</span></p>
                <p><span className="text-[#ff2020]">●</span> Disponibile per: <span className="text-white">{platforms}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}