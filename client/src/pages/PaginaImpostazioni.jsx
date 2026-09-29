import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PaginaImpostazioni() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- STATI FORM ---
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // <-- NUOVO STATO AVATAR
  
  const [gamertags, setGamertags] = useState({
    steam: '', psn: '', xbox: '', nintendo: '', epic: '', ubisoft: '', gog: '', stadia: ''
  });

  const [socials, setSocials] = useState({
    facebook: '', x: '', instagram: '', tiktok: '', twitch: '', youtube: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [stats, setStats] = useState({
    bacheca: 0, notifiche: 0, salvati: 0, seguiti: 0, votati: 0, ban: 0, commenti: 0
  });

  useEffect(() => {
    async function fetchUserData() {
      if (!user) { navigate('/'); return; }
      
      const { data: userData } = await supabase.from('utenti').select('id, username, email, bannato').eq('id_auth', user.id).maybeSingle();
      
      if (userData) {
        setUsername(userData.username || '');
        setEmail(userData.email || user.email);

        const { data: profileData } = await supabase.from('profili').select('*').eq('id_utente', userData.id).maybeSingle();
        if (profileData) {
          setNome(profileData.nome || ''); 
          setCognome(profileData.cognome || '');
          setAvatarUrl(profileData.avatar_url || ''); // <-- CARICHIAMO L'URL SALVATO
          
          setGamertags({
            steam: profileData.gamertag_steam || '', psn: profileData.gamertag_psn || '', xbox: profileData.gamertag_xbox || '',
            nintendo: profileData.gamertag_nintendo || '', epic: profileData.gamertag_epic || '', ubisoft: profileData.gamertag_ubisoft || '',
            gog: profileData.gamertag_gog || '', stadia: profileData.gamertag_stadia || ''
          });
          setSocials({
            facebook: profileData.social_facebook || '', x: profileData.social_x || '', instagram: profileData.social_instagram || '',
            tiktok: profileData.social_tiktok || '', twitch: profileData.social_twitch || '', youtube: profileData.social_youtube || ''
          });
        }

        const [
          { count: countBacheca }, { count: countNotifiche }, { count: countSalvati },
          { count: countSeguitiGiochi }, { count: countSeguitiEventi }, { count: countSeguitiCanali },
          { count: countVotati }, { count: countCommenti }
        ] = await Promise.all([
          supabase.from('messaggi_bacheca').select('*', { count: 'exact', head: true }).eq('id_profilo', userData.id),
          supabase.from('notifiche').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id).eq('letta', false),
          supabase.from('articoli_salvati').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id),
          supabase.from('segui_giochi').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id),
          supabase.from('segui_eventi_live').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id),
          supabase.from('segui_canali').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id),
          supabase.from('voti_giochi').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id),
          supabase.from('commenti').select('*', { count: 'exact', head: true }).eq('id_utente', userData.id)
        ]);

        setStats({
          bacheca: countBacheca || 0, notifiche: countNotifiche || 0, salvati: countSalvati || 0,
          seguiti: (countSeguitiGiochi || 0) + (countSeguitiEventi || 0) + (countSeguitiCanali || 0),
          votati: countVotati || 0, ban: userData.bannato ? 1 : 0, commenti: countCommenti || 0
        });
      }
      setLoading(false);
    }
    fetchUserData();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    const { data: userData } = await supabase.from('utenti').select('id').eq('id_auth', user.id).maybeSingle();
    
    if (userData) {
      await supabase.from('utenti').update({ username }).eq('id', userData.id);
      
      const profileUpdates = {
        id_utente: userData.id, nome, cognome, avatar_url: avatarUrl, // <-- SALVIAMO L'AVATAR
        gamertag_steam: gamertags.steam, gamertag_psn: gamertags.psn, gamertag_xbox: gamertags.xbox, gamertag_nintendo: gamertags.nintendo,
        gamertag_epic: gamertags.epic, gamertag_ubisoft: gamertags.ubisoft, gamertag_gog: gamertags.gog, gamertag_stadia: gamertags.stadia,
        social_facebook: socials.facebook, social_x: socials.x, social_instagram: socials.instagram, social_tiktok: socials.tiktok,
        social_twitch: socials.twitch, social_youtube: socials.youtube
      };

      const { error } = await supabase.from('profili').upsert(profileUpdates, { onConflict: 'id_utente' });
      if (!error) { setSuccessMsg('Profilo aggiornato con successo!'); window.scrollTo(0, 0); } 
      else { alert("Errore nel salvataggio: " + error.message); }
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert("Le password non coincidono!"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Errore cambio password: " + error.message);
    else { alert("Password cambiata! Verrai reindirizzato al login."); await supabase.auth.signOut(); navigate('/'); }
  };

  if (loading) return <div className="text-white text-center py-20">Caricamento impostazioni...</div>;

  const menuItems = [
    { label: 'Bacheca', val: stats.bacheca }, { label: 'Notifiche', val: stats.notifiche }, { label: 'Messaggi', val: 0 },
    { label: 'Articoli salvati', val: stats.salvati }, { label: 'Seguiti', val: stats.seguiti }, { label: 'Giochi votati', val: stats.votati },
    { label: 'Blacklist', val: 0 }, { label: 'Ban e Ammonizioni', val: stats.ban }, { label: 'Commenti', val: stats.commenti }
  ];

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20">
      
      <div className="bg-[#1a1a1a] h-48 border-b-4 border-[#ff2020] relative flex items-center px-10">
        <h1 className="text-white text-3xl font-black uppercase tracking-widest">Impostazioni Account</h1>
        <button onClick={() => navigate('/profilo')} className="absolute top-4 right-4 text-gray-500 hover:text-white font-black uppercase text-sm border border-gray-700 px-4 py-1 rounded-sm">Torna al Profilo</button>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-[75%] flex flex-col gap-12">
          {successMsg && <div className="bg-green-600 text-white p-4 rounded-sm font-bold shadow-lg">✓ {successMsg}</div>}

          <section className="bg-[#161616] p-8 border border-gray-800 rounded-sm">
            <h3 className="text-[#ff4444] font-black uppercase tracking-widest mb-6">Dati Personali</h3>
            <div className="flex flex-col mb-6">
              <label className="text-white font-bold text-sm mb-2">Nome utente</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-[#2a2a2a] text-gray-300 p-3 outline-none border border-transparent focus:border-gray-500 rounded-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <label className="text-white font-bold text-sm mb-2">Nome</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" placeholder="Nome" />
              </div>
              <div className="flex flex-col">
                <label className="text-white font-bold text-sm mb-2">Cognome</label>
                <input type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" placeholder="Cognome" />
              </div>
            </div>
            <div className="flex flex-col relative">
              <label className="text-white font-bold text-sm mb-2">Email</label>
              <input type="email" value={email} disabled className="bg-[#2a2a2a] text-gray-400 p-3 pr-40 outline-none rounded-sm cursor-not-allowed" />
            </div>
          </section>

          <section className="bg-[#161616] p-8 border border-gray-800 rounded-sm">
            <h3 className="text-[#ff4444] font-black uppercase tracking-widest mb-6">Gamertag</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(gamertags).map(key => (
                <div key={key} className="flex flex-col">
                  <label className="text-white font-bold text-sm mb-2 capitalize">{key === 'psn' ? 'PlayStation Network' : key.replace('_', ' ')}</label>
                  <input type="text" value={gamertags[key]} onChange={(e) => setGamertags({...gamertags, [key]: e.target.value})} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" placeholder={`nickname ${key}`} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#161616] p-8 border border-gray-800 rounded-sm">
            <h3 className="text-[#ff4444] font-black uppercase tracking-widest mb-6">Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {Object.keys(socials).map(key => (
                <div key={key} className="flex flex-col">
                  <label className="text-white font-bold text-sm mb-2 capitalize">{key}</label>
                  <input type="text" value={socials[key]} onChange={(e) => setSocials({...socials, [key]: e.target.value})} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" placeholder={`url profilo ${key}`} />
                </div>
              ))}
            </div>
          </section>

          {/* LA NUOVA SEZIONE AVATAR */}
          <section className="bg-[#161616] p-8 border border-gray-800 rounded-sm">
            <h3 className="text-[#ff4444] font-black uppercase tracking-widest mb-6">Il tuo Avatar</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="w-24 h-24 bg-[#2a2a2a] rounded-full border-[3px] border-gray-600 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="Anteprima Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-5xl">👽</span>
                 )}
               </div>
               <div className="flex-1 w-full">
                 <label className="text-white font-bold text-sm mb-2 block">URL dell'Immagine</label>
                 <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="bg-[#2a2a2a] text-white p-3 w-full outline-none rounded-sm" placeholder="https://esempio.com/foto.jpg" />
                 <p className="text-gray-500 text-xs mt-2">Incolla qui l'URL di un'immagine online per usarla come foto profilo.</p>
               </div>
            </div>
          </section>

          <div className="flex justify-end border-b border-gray-800 pb-12">
             <button onClick={handleSaveProfile} disabled={saving} className="bg-[#ff4444] hover:bg-red-600 text-white font-black uppercase tracking-widest px-10 py-4 shadow-lg transition-colors rounded-sm">
               {saving ? 'Salvataggio...' : 'Salva Tutte Le Modifiche'}
             </button>
          </div>

          <section className="bg-[#161616] p-8 border border-gray-800 rounded-sm">
            <h3 className="text-[#ff4444] font-black uppercase tracking-widest mb-2">Cambia Password</h3>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 w-full max-w-lg mt-4">
              <div className="flex flex-col">
                <label className="text-white font-bold text-sm mb-2">Nuova password:</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-white font-bold text-sm mb-2">Conferma nuova password:</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-[#2a2a2a] text-white p-3 outline-none rounded-sm" />
              </div>
              <button type="submit" className="bg-[#ff4444] hover:bg-red-600 text-white font-black uppercase tracking-widest py-3 mt-4 self-end px-6 rounded-sm">Cambia Password</button>
            </form>
          </section>
        </div>

        <div className="lg:w-[25%] flex flex-col gap-4">
          <button className="w-full border border-[#ff4444] text-[#ff4444] font-black uppercase tracking-widest py-3 hover:bg-[#ff4444] hover:text-white transition-colors">
            Abbonati a Multiplayer.it Plus
          </button>
          
          <div className="bg-[#161616] p-4 border border-gray-800 flex flex-col gap-4">
             {menuItems.map((stat, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm">
                 <span onClick={() => navigate('/profilo', { state: { tab: stat.label } })} className="text-[#ff4444] cursor-pointer hover:underline">{stat.label}</span>
                 <span className="bg-[#e6c200] text-black font-black text-xs px-2 py-0.5 rounded-sm">{stat.val}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}