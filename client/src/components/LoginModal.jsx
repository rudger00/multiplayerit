import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function LoginModal() {
  const { isModalOpen, closeModal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal();
      } else {
        // REGISTRAZIONE 
        // Il Trigger SQL che abbiamo creato si occuperà di salvare automaticamente l'utente nella tabella "utenti"
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { username } // Passiamo l'username nei metadata così il trigger lo legge
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Fatto!
        closeModal();
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-[380px] relative shadow-2xl border-t-2 border-[#ff2020]">
        
        <button onClick={closeModal} className="absolute top-0 right-0 bg-[#ff2020] hover:bg-red-700 text-white w-8 h-8 flex items-center justify-center font-bold transition-colors">✕</button>

        <div className="pt-6 pb-5 text-center">
          <h2 className="text-[#ff2020] font-black uppercase tracking-widest text-[14px]">
            {isLogin ? 'Multiplayer Login' : 'Multiplayer Registrazione'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 flex flex-col gap-3">
          
          {errorMsg && <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-2 rounded-sm mb-2">{errorMsg}</div>}

          {!isLogin && (
            <input 
              type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-600 text-white p-2.5 focus:outline-none focus:border-[#ff2020] transition-colors text-sm"
            />
          )}
          
          <input 
            type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-gray-600 text-white p-2.5 focus:outline-none focus:border-[#ff2020] transition-colors text-sm"
          />
          
          <input 
            type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-gray-600 text-white p-2.5 focus:outline-none focus:border-[#ff2020] transition-colors text-sm mb-2"
          />

          <button disabled={loading} type="submit" className="w-full bg-[#ff4d4d] hover:bg-[#e60000] text-white font-black tracking-widest uppercase py-2.5 transition-colors text-sm mt-1 mb-2 disabled:opacity-50">
            {loading ? 'Attendere...' : isLogin ? 'Login' : 'Registrati'}
          </button>

          <div className="flex items-center justify-between text-[12px] font-bold mt-2">
            {isLogin ? (
              <>
                <span className="text-[#a03030] hover:text-[#ff4d4d] cursor-pointer transition-colors">Password dimenticata?</span>
                <span onClick={() => { setIsLogin(false); setErrorMsg(''); }} className="text-[#ff4d4d] hover:text-white cursor-pointer transition-colors">Registrati</span>
              </>
            ) : (
              <>
                <span className="text-gray-500">Hai già un account?</span>
                <span onClick={() => { setIsLogin(true); setErrorMsg(''); }} className="text-[#ff4d4d] hover:text-white cursor-pointer transition-colors">Accedi</span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}