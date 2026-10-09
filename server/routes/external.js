const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ==========================================
// YOUTUBE
// ==========================================
router.get('/youtube/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Manca la query' });
    
    // Leggiamo la chiave in modo sicuro dal file .env
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) throw new Error("Chiave YouTube mancante nel file .env del server");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=5&type=video&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Gestione di eventuali errori restituiti da YouTube (es. limite API superato)
    if (data.error) {
       console.error("💥 YouTube ha rifiutato la richiesta:", data.error.message);
       return res.status(500).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("💥 Errore di connessione YouTube:", error.message);
    res.status(500).json({ error: 'Errore interno del server (YouTube API)' });
  }
});

// ==========================================
// UNSPLASH
// ==========================================
router.get('/unsplash/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Manca la query' });

    // Leggiamo la chiave in modo sicuro dal file .env
    const API_KEY = process.env.UNSPLASH_API_KEY;
    if (!API_KEY) throw new Error("Chiave Unsplash mancante nel file .env del server");

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&client_id=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Gestione errori Unsplash
    if (data.errors) {
       console.error("💥 Unsplash ha rifiutato la richiesta:", data.errors);
       return res.status(500).json({ error: "Errore durante la ricerca immagini su Unsplash" });
    }

    res.json(data);
  } catch (error) {
    console.error("💥 Errore di connessione Unsplash:", error.message);
    res.status(500).json({ error: 'Errore interno del server (Unsplash API)' });
  }
});

// ==========================================
// GEMINI (Chatbot Navi / Futaba)
// ==========================================
// Modello configurabile da .env (GEMINI_MODEL), altrimenti usa il default.
// I modelli 1.5 / 2.0 sono stati ritirati e i 2.5 stanno per esserlo:
// se questo nome dà 404, prova "gemini-3.5-flash".
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

router.post('/gemini/chat', async (req, res) => {
  const { messages, userText } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    console.error("💥 ERRORE: Chiave Gemini mancante nel file .env del server");
    return res.status(500).json({ error: "Chiave API mancante" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: "Sei Navi (Futaba Sakura) del gioco Persona 5. Sei un'hacker geniale, usi slang da nerd. Rispondi in italiano, max 2 frasi concise.",
      // 1024 invece di 300: i modelli recenti usano parte dei token per il "ragionamento" interno
      generationConfig: { maxOutputTokens: 1024 }
    });

    let promptText = "Storico:\n";
    if (messages && Array.isArray(messages)) {
      messages.slice(-4).forEach(m => {
        if (m.id !== 1) promptText += `${m.sender === 'user' ? 'Utente' : 'Navi'}: ${m.text}\n`;
      });
    }
    promptText += `Utente: ${userText}\nNavi:`;

    const result = await model.generateContent(promptText);
    res.json({ reply: result.response.text() });
    
  } catch (error) {
    console.error(`💥 ERRORE API GEMINI (modello: ${GEMINI_MODEL}):`, error.message);
    res.status(500).json({ error: "Errore durante la generazione della risposta." });
  }
});

module.exports = router;