import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getImg, getTag, PLATFORMS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>;
const LiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1.5" viewBox="0 0 16 16"><path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/></svg>;
const PinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1); 
  
  const { user, openModal, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const isPlatformPage = PLATFORMS[currentPath] !== undefined;
  const navPlatformLabel = isPlatformPage ? PLATFORMS[currentPath].name : "PIATTAFORME";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [lockedDropdown, setLockedDropdown] = useState(null);

  const [navNews, setNavNews] = useState([]);
  const [navRecensioni, setNavRecensioni] = useState([]);
  
  const [notifiche, setNotifiche] = useState([]);
  const [userDataId, setUserDataId] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [avatarUrl, setAvatarUrl] = useState(''); // <-- STATO AVATAR AGGIUNTO

  useEffect(() => {
    async function fetchDropdownData() {
      const { data: newsData } = await supabase.from('articoli').select('id, titolo, url_immagine, creato_il').eq('stato', 'PUBLISHED').order('creato_il', { ascending: false }).limit(5);
      if (newsData) setNavNews(newsData);
      
      const { data: recData } = await supabase.from('articoli').select('id, titolo, url_immagine, corpo, creato_il').eq('stato', 'PUBLISHED').eq('id_categoria', 2).order('creato_il', { ascending: false }).limit(5);
      if (recData && recData.length > 0) setNavRecensioni(recData);
      else if (newsData) setNavRecensioni(newsData); 
    }
    fetchDropdownData();
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setAvatarUrl('');
        return;
      }
      const { data: userData } = await supabase.from('utenti').select('id, id_ruolo').eq('id_auth', user.id).maybeSingle();
      if (userData) {
        setUserDataId(userData.id);
        setUserRole(userData.id_ruolo);
        
        // RECUPERIAMO L'AVATAR DAL DB
        const { data: profileData } = await supabase.from('profili').select('avatar_url').eq('id_utente', userData.id).maybeSingle();
        if (profileData && profileData.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }

        const { data: notifData } = await supabase
          .from('notifiche')
          .select('*')
          .eq('id_utente', userData.id)
          .eq('letta', false)
          .order('creato_il', { ascending: false });
        if (notifData) setNotifiche(notifData);
      }
    }
    fetchUserData();
  }, [user, isProfileOpen]);

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    if (!userDataId) return;
    await supabase.from('notifiche').update({ letta: true }).eq('id_utente', userDataId);
    setNotifiche([]);
  };

  const handleNotificationClick = async (n) => {
    if (userDataId) await supabase.from('notifiche').update({ letta: true }).eq('id', n.id);
    closeAll();
    if (n.link) navigate(n.link);
  };

  useEffect(() => {
    const fetchLiveResults = async () => {
      if (searchQuery.trim().length > 2) {
        const { data } = await supabase.from('articoli').select(`*, categorie ( nome )`).eq('stato', 'PUBLISHED').ilike('titolo', `%${searchQuery}%`).limit(4);
        if (data) setLiveSearchResults(data);
      } else { setLiveSearchResults([]); }
    };
    const delayDebounceFn = setTimeout(() => fetchLiveResults(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (query) => {
    if (query.trim() !== "") { closeAll(); navigate(`/ricerca/?q=${encodeURIComponent(query)}`); }
  };

  const handleMouseEnter = (name) => setHoveredDropdown(name);
  const handleMouseLeave = () => setHoveredDropdown(null);
  const handleToggleLock = (name) => setLockedDropdown(lockedDropdown === name ? null : name);

  const closeAll = () => { setHoveredDropdown(null); setLockedDropdown(null); setIsSearchOpen(false); setIsProfileOpen(false); };
  
  const isOpen = (name) => hoveredDropdown === name || lockedDropdown === name;
  
  const usernameVisualizzato = user?.user_metadata?.username || user?.email?.split('@')[0] || "Utente";

  const isReporter = userRole === 1 || userRole === 2;
  const isAdmin = userRole === 1;

  return (
    <nav className="sticky top-0 w-full flex items-center justify-between bg-[#1a1a1a] h-14 border-b border-gray-800 z-[100] shadow-sm">
      <div className="flex items-center h-full">
        <Link to="/" className="flex items-center h-full px-4 shrink-0" onClick={closeAll}>
          <span className="text-[22px] font-bold italic tracking-tighter cursor-pointer text-white lowercase">multiplayer<span className="text-[#ff2020]">.it</span></span>
        </Link>
        {!isSearchOpen && (<Link to="/live" onClick={closeAll} className="hidden lg:flex h-full items-center justify-center bg-[#ff2020] text-white px-3 hover:bg-red-700 transition-colors cursor-pointer text-xs font-black tracking-widest"><LiveIcon /> LIVE</Link>)}
      </div>

      {isSearchOpen ? (
        <div className="flex-1 h-full bg-[#ff2020] flex items-center relative transition-all duration-300">
          <input type="text" placeholder="CERCA NEL SITO..." className="w-full h-full bg-transparent text-white placeholder-white/80 outline-none px-4 font-black uppercase text-sm tracking-wider" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)} autoFocus />
          <button className="px-4 h-full hover:bg-red-700 transition-colors flex items-center justify-center" onClick={() => handleSearchSubmit(searchQuery)}><SearchIcon /></button>
          <button className="px-4 h-full hover:bg-red-700 transition-colors flex items-center justify-center" onClick={closeAll}><CloseIcon /></button>
          
          {liveSearchResults.length > 0 && (
            <div className="absolute top-14 left-0 w-full bg-[#1a1a1a] border-t border-gray-800 shadow-2xl flex flex-col z-50">
              {liveSearchResults.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => handleSearchSubmit(item.titolo)}>
                  <img src={getImg(item.url_immagine)} alt={item.titolo} className="w-14 h-14 object-cover rounded-sm border border-gray-800" />
                  <div className="flex flex-col"><h4 className="text-base font-black uppercase text-gray-200">{item.titolo}</h4><p className="text-xs font-bold text-gray-400 mt-1">Categoria: <span className="text-[#ff2020] uppercase">{item.categorie?.nome || 'VARIE'}</span></p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ul className="hidden lg:flex items-center h-full space-x-1 text-[11px] font-bold tracking-widest text-white ml-auto">
          
          {isAdmin && (
            <li className="relative h-full flex items-center">
              <Link to="/admin" onClick={closeAll} className="px-3 text-[#ff2020] hover:text-white transition-colors uppercase h-full flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#ff2020]">
                ⚙️ ADMIN
              </Link>
            </li>
          )}

          {isReporter && (
            <li className="relative h-full flex items-center">
              <Link to="/scrivi" onClick={closeAll} className="px-3 text-[#fffff] hover:text-white transition-colors uppercase h-full flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#ff2020]">
                <span></span> SCRIVI
              </Link>
            </li>
          )}

          <li className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('piattaforme')} onMouseLeave={handleMouseLeave}>
            <button onClick={() => handleToggleLock('piattaforme')} className={`h-full px-3 flex items-center gap-1.5 transition-colors uppercase ${isOpen('piattaforme') ? 'bg-white/10' : 'hover:text-gray-300'}`}><span className="font-black text-sm text-[#ff2020] leading-none mb-0.5">☰</span> {navPlatformLabel}</button>
            {isOpen('piattaforme') && (
              <div className="absolute top-14 left-0 w-[440px] bg-[#161616] border border-gray-800 shadow-2xl p-5 grid grid-cols-2 gap-x-6 gap-y-4 z-50 text-white select-none">
                <div className="flex flex-col gap-4"><Link to="/" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl">🎮</span><span className="font-black text-sm tracking-wide">TUTTE</span></Link><Link to="/ps5" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl font-black">PS</span><span className="font-black text-sm tracking-wide">PLAYSTATION 5</span></Link><Link to="/xbox-one" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl font-black">⨂</span><span className="font-black text-sm tracking-wide">XBOX ONE</span></Link><Link to="/nintendo-switch" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl">🕹️</span><span className="font-black text-sm tracking-wide">NINTENDO SWITCH</span></Link><Link to="/android" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl">🤖</span><span className="font-black text-sm tracking-wide">ANDROID</span></Link></div>
                <div className="flex flex-col gap-4"><Link to="/pc" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="border border-white/60 rounded px-1 text-[11px] font-black group-hover:border-[#ff2020]">PC</span><span className="font-black text-sm tracking-wide">PC</span></Link><Link to="/ps4" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl font-black">PS</span><span className="font-black text-sm tracking-wide">PLAYSTATION 4</span></Link><Link to="/xbox-series-x-s" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl font-black">⨂</span><span className="font-black text-sm tracking-wide">XBOX SERIES X/S</span></Link><Link to="/ios" onClick={closeAll} className="flex items-center gap-3.5 hover:text-[#ff2020] cursor-pointer transition-colors group"><span className="text-xl font-serif"></span><span className="font-black text-sm tracking-wide">IOS</span></Link></div>
              </div>
            )}
          </li>
          <li className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('recensioni')} onMouseLeave={handleMouseLeave}>
            <button onClick={() => handleToggleLock('recensioni')} className={`h-full px-3 flex items-center gap-1.5 transition-colors uppercase ${isOpen('recensioni') ? 'bg-white/10' : 'hover:text-gray-300'}`}><span className="font-black text-sm text-[#ff2020] leading-none mb-0.5">☰</span> RECENSIONI</button>
            {isOpen('recensioni') && (
              <div className="absolute top-14 left-0 w-[420px] bg-[#161616] border border-gray-800 shadow-2xl flex flex-col z-50">
                <Link to="/articoli/recensioni" onClick={closeAll} className="p-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/5 border-b border-gray-800/80 transition-colors">VAI A TUTTE LE RECENSIONI</Link>
                {navRecensioni.map((rec) => (
                  <Link to={`/articolo/${rec.id}`} onClick={closeAll} key={rec.id} className="flex items-center justify-between p-3 border-b border-gray-800/60 hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3.5 pr-2"><img src={getImg(rec.url_immagine)} alt={rec.titolo} className="w-13 h-13 object-cover rounded-sm shrink-0 border border-gray-800" /><div className="flex flex-col"><h4 className="text-[13px] font-bold leading-snug text-gray-100 line-clamp-2">{rec.titolo}</h4><span className="text-[11px] text-[#ff2020] font-black uppercase mt-0.5 tracking-wider">{getTag(rec.titolo)}</span></div></div>
                    <span className="text-2xl font-black text-[#ff2020] pl-2 shrink-0">{rec.voto ? parseFloat(rec.voto).toFixed(1) : '-'}</span>
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('news')} onMouseLeave={handleMouseLeave}>
            <button onClick={() => handleToggleLock('news')} className={`h-full px-3 flex items-center gap-1.5 transition-colors uppercase ${isOpen('news') ? 'bg-white/10' : 'hover:text-gray-300'}`}><span className="font-black text-sm text-[#ff2020] leading-none mb-0.5">☰</span> NEWS</button>
            {isOpen('news') && (
              <div className="absolute top-14 left-0 w-[430px] bg-[#161616] border border-gray-800 shadow-2xl flex flex-col z-50">
                <Link to="/articoli/news" onClick={closeAll} className="p-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/5 border-b border-gray-800/80 transition-colors">VAI A TUTTE LE NEWS</Link>
                {navNews.map((news) => (
                  <Link to={`/articolo/${news.id}`} onClick={closeAll} key={news.id} className="flex items-center gap-3.5 p-3 border-b border-gray-800/60 hover:bg-white/5 cursor-pointer transition-colors">
                    <img src={getImg(news.url_immagine)} alt={news.titolo} className="w-13 h-13 object-cover rounded-sm shrink-0 border border-gray-800" />
                    <h4 className="text-[13px] font-bold leading-snug text-gray-100 line-clamp-2">{news.titolo}</h4>
                  </Link>
                ))}
              </div>
            )}
          </li>
          
          <li className="relative h-full flex items-center">
            <Link to="/video" onClick={closeAll} className="px-3 hover:text-gray-300 transition-colors uppercase h-full flex items-center">
              VIDEO
            </Link>
          </li>
          
          <li className="relative h-full flex items-center">
            <Link to="/giochi" onClick={closeAll} className="px-3 hover:text-gray-300 transition-colors uppercase h-full flex items-center">
              GIOCHI
            </Link>
          </li>
        </ul>
      )}

      {!isSearchOpen && (
        <div className="flex items-center text-gray-300 ml-4 border-l border-gray-700 h-full relative">
          <button className="hover:text-white transition-colors flex items-center justify-center cursor-pointer h-full px-4" onClick={() => setIsSearchOpen(true)}><SearchIcon /></button>
          
          <div className="relative h-full border-l border-gray-700">
            <button onClick={() => user ? setIsProfileOpen(!isProfileOpen) : openModal()} className={`h-full px-4 flex items-center justify-center cursor-pointer transition-colors relative ${isProfileOpen ? 'bg-[#ff2020] text-white' : 'hover:text-white'}`}>
              
              {/* QUI MOSTRA L'AVATAR NELLA NAVBAR SE ESISTE (TIPO GIRAFFA), ALTRIMENTI L'ICONA UTENTE */}
              {user && avatarUrl ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-500 bg-[#222]">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <UserIcon />
              )}
              
              {notifiche.length > 0 && (
                <span className={`absolute top-2 right-2 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black ${isProfileOpen ? 'bg-white text-[#ff2020]' : 'bg-[#ff2020] text-white'}`}>
                  {notifiche.length}
                </span>
              )}
            </button>

            {user && isProfileOpen && (
              <div className="absolute top-14 right-0 w-[340px] bg-[#1a1a1a] shadow-2xl flex flex-col z-50 text-white font-sans border border-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <span onClick={() => { closeAll(); navigate('/impostazioni'); }} className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Impostazioni</span>
                  <span onClick={() => { logout(); closeAll(); }} className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Logout</span>
                </div>

                <div onClick={() => { closeAll(); navigate('/profilo'); }} className="p-5 flex items-center justify-between relative cursor-pointer hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="relative group-hover:scale-105 transition-transform">
                      {/* QUI MOSTRA L'AVATAR NEL MENU A TENDINA (GRANDE) */}
                      <div className="w-[60px] h-[60px] rounded-full border-[3px] border-gray-600 bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                           <img src={avatarUrl} alt="Avatar Menu" className="w-full h-full object-cover" />
                        ) : (
                           <img src={`https://ui-avatars.com/api/?name=${usernameVisualizzato}&background=2a2a2a&color=fff`} className="w-full h-full object-cover" alt="Default Avatar" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-2 bg-[#00bfff] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">6</div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold leading-none mb-1">{usernameVisualizzato}</span>
                      <span className="text-gray-400 text-[12px] font-bold mb-1">Livello 6</span>
                      <span className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest">Profilo Personale</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-700 transition-colors"><PinIcon /></div>
                </div>

                <div className="bg-[#d4b94a] text-black py-2.5 px-4 text-center text-[13px] mx-4 rounded-sm cursor-pointer hover:brightness-110 transition-all font-semibold flex items-center justify-center gap-2">
                  <span className="bg-[#ff2020] text-white italic font-bold px-1 rounded-sm text-[10px] leading-tight">m.it</span> Naviga <strong className="underline decoration-black underline-offset-2">senza pubblicità!</strong>
                </div>

                <div className="flex items-center justify-between p-4 mt-2 border-b border-gray-800">
                  <span className="text-white text-[12px] font-bold leading-tight w-24">Modalità di<br/>visualizzazione</span>
                  <div className="flex items-center gap-4 text-[12px] text-gray-400 font-bold">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-white"><div className="w-4 h-4 rounded-full bg-white"></div> Light</div>
                    <div className="flex items-center gap-1.5 cursor-pointer text-white"><div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[#ff2020]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> Auto</div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-white"><div className="w-4 h-4 rounded-full bg-[#111] border border-gray-600"></div> Dark</div>
                  </div>
                </div>

                <div className="flex flex-col p-4 max-h-[220px] overflow-y-auto gap-4">
                  {notifiche.length > 0 ? notifiche.map(notifica => (
                    <div key={notifica.id} onClick={() => handleNotificationClick(notifica)} className="flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <span className="text-[14px] text-[#ff2020] mr-1 mt-0.5 leading-none">●</span>
                      <span className="text-[#ff2020] text-[13px] font-bold leading-tight line-clamp-3">{notifica.testo}</span>
                    </div>
                  )) : (<div className="text-gray-500 text-xs font-bold text-center py-4">Nessuna nuova notifica.</div>)}
                </div>

                <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-[#161616]">
                  <span onClick={() => { closeAll(); navigate('/profilo', { state: { tab: 'Notifiche' } }); }} className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Vedi Tutte</span>
                  <span onClick={markAllAsRead} className="text-[#ff2020] text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Segna tutte come lette
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}