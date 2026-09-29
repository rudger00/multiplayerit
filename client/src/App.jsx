import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaLive from './pages/PaginaLive';
// Importa i nuovi componenti
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import PaginaGioco from './pages/PaginaGioco';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PaginaRicerca from './pages/PaginaRicerca';
import PaginaArticolo from './pages/PaginaArticolo';
import PaginaPiattaforma from './pages/PaginaPiattaforma';
import PaginaCategoria from './pages/PaginaCategoria';
import PaginaGiochi from './pages/PaginaGiochi';
import PaginaAdmin from './pages/PaginaAdmin';
import PaginaProfilo from './pages/PaginaProfilo';
import PaginaVideo from './pages/PaginaVideo';
import PaginaUtente from './pages/PaginaUtente';
import PaginaScrivi from './pages/PaginaScrivi';
import PaginaSondaggio from './pages/PaginaSondaggio';
import PaginaSondaggi from './pages/PaginaSondaggi';
import PaginaImpostazioni from './pages/PaginaImpostazioni';
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#141414] text-white font-sans select-none pb-12 relative">
          <Navbar />
          <LoginModal /> {/* Il popup globale inserito qui */}
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ricerca" element={<PaginaRicerca />} />
            <Route path="/articolo/:id" element={<PaginaArticolo />} />
            <Route path="/scrivi" element={<PaginaScrivi />} />
            <Route path="/articoli/:categoria" element={<PaginaCategoria />} />
            <Route path="/giochi" element={<PaginaGiochi />} />
           <Route path="/admin" element={<PaginaAdmin />} />
            <Route path="/:slug" element={<PaginaPiattaforma />} />
            <Route path="/gioco/:id" element={<PaginaGioco />} />
            <Route path="/live" element={<PaginaLive />} />
            <Route path="/profilo" element={<PaginaProfilo />} />
            <Route path="/video" element={<PaginaVideo />} />
            <Route path="/utente/:username" element={<PaginaUtente />} />
            <Route path="/sondaggio/:id" element={<PaginaSondaggio />} />
            <Route path="/sondaggi" element={<PaginaSondaggi />} />
            <Route path="/impostazioni" element={<PaginaImpostazioni />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}