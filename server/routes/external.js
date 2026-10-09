const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ==========================================
// YOUTUBE
// ==========================================
router.get('/youtube/search', async (req, res) => {
  try {
    const { query, pageToken } = req.query;
    
    // Validazione input: blocca query vuote o anormalmente lunghe
    if (!query || query.length > 100) {
      return res.status(400).json({ error: 'Query mancante o non valida' });
    }
    
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) throw new Error("Chiave YouTube mancante nel file .env del server");

    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=5&type=video&key=${API_KEY}`;
    
    // Gestione della paginazione per mostrare i video successivi
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
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
    
    // Validazione input
    if (!query || query.length > 100) {
      return res.status(400).json({ error: 'Query mancante o non valida' });
    }

    const API_KEY = process.env.UNSPLASH_API_KEY;
    if (!API_KEY) throw new Error("Chiave Unsplash mancante nel file .env del server");

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&client_id=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

router.post('/gemini/chat', async (req, res) => {
  const { messages, userText } = req.body;

  // Validazione rigorosa degli input dal client per prevenire injection e sprechi di token
  if (!userText || typeof userText !== 'string' || userText.length > 500) {
    return res.status(400).json({ error: "Testo non valido o troppo lungo." });
  }
  if (!Array.isArray(messages) || messages.length > 50 || messages.some((message) =>
    !message || typeof message !== 'object' ||
    typeof message.sender !== 'string' || !['user', 'bot', 'assistant'].includes(message.sender) ||
    typeof message.text !== 'string' || message.text.length > 2000
  )) {
    return res.status(400).json({ error: "Storico messaggi non valido." });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("💥 ERRORE: Chiave Gemini mancante nel file .env del server");
    return res.status(500).json({ error: "Chiave API mancante" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: "Sei Navi (Futaba Sakura) del gioco Persona 5. Sei un'hacker geniale, usi slang da nerd. Rispondi in italiano, max 2 frasi concise.",
      generationConfig: { maxOutputTokens: 1024 }
    });

    let promptText = "Storico:\n";
    messages.slice(-4).forEach(m => {
      if (m.id !== 1) promptText += `${m.sender === 'user' ? 'Utente' : 'Navi'}: ${m.text}\n`;
    });
    promptText += `Utente: ${userText}\nNavi:`;

    const result = await model.generateContent(promptText);
    res.json({ reply: result.response.text() });
    
  } catch (error) {
    console.error(`💥 ERRORE API GEMINI (modello: ${GEMINI_MODEL}):`, error.message);
    res.status(500).json({ error: "Errore durante la generazione della risposta." });
  }
});

module.exports = router;