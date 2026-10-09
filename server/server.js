require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Importiamo le nostre rotte divise per file
const externalRoutes = require('./routes/external');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3001;

// ==========================================
// SICUREZZA E MIDDLEWARE BASE
// ==========================================

// 1. CORS Restrittivo: accetta richieste solo dal frontend (locale o produzione)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// 2. Rate Limiter per le API Esterne (Max 20 richieste al minuto per IP)
const externalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20,
  message: { error: 'Troppe richieste. Riprova più tardi.' }
});

// Applichiamo il limite solo alle rotte "costose" che interrogano le API esterne
app.use('/api/youtube', externalApiLimiter);
app.use('/api/gemini', externalApiLimiter);
app.use('/api/unsplash', externalApiLimiter);


// ==========================================
// MONTAGGIO DELLE ROTTE
// ==========================================
app.use('/api', externalRoutes);
app.use('/api/admin', adminRoutes);

// Risposte uniformi per endpoint inesistenti ed errori non gestiti.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint API non trovato' });
});
app.use((err, req, res, next) => {
  console.error('Errore non gestito:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.status === 413 ? 'Richiesta troppo grande' : 'Errore interno del server' });
});

// Avvio Server
app.listen(port, () => {
  console.log(`✅ Server backend in esecuzione sulla porta ${port}`);
});