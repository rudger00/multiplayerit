import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Ora li importiamo dalla stessa cartella con ./
import Home from './Home';
import Articolo from './Articolo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articolo/:id" element={<Articolo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;