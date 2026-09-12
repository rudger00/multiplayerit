import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa i nuovi componenti
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/LoginModal';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import PaginaRicerca from './pages/PaginaRicerca';
import PaginaArticolo from './pages/PaginaArticolo';
import PaginaPiattaforma from './pages/PaginaPiattaforma';
import PaginaCategoria from './pages/PaginaCategoria';
import PaginaGiochi from './pages/PaginaGiochi';
import PaginaEditor from './pages/PaginaEditor';

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
            <Route path="/articoli/:categoria" element={<PaginaCategoria />} />
            <Route path="/giochi" element={<PaginaGiochi />} />
            <Route path="/editor" element={<PaginaEditor />} />
            <Route path="/:slug" element={<PaginaPiattaforma />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}