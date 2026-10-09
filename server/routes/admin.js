const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Importiamo la connessione al DB
const { requireAdmin } = require('../middleware/auth'); // <-- Importiamo il buttafuori

// APPLICHIAMO IL BUTTAFUORI A TUTTE LE ROTTE
// Da qui in giù, nessuna rotta funzionerà senza un token di un amministratore
router.use(requireAdmin);

// APPROVAZIONE ARTICOLO
router.post('/articles/approve', async (req, res) => {
  const { id_articolo, id_autore, titolo } = req.body;
  try {
    await pool.query(`UPDATE articoli SET stato = 'PUBLISHED' WHERE id = $1`, [id_articolo]);
    const testoNotifica = `Complimenti! Il tuo articolo "${titolo}" è stato approvato ed è ora online.`;
    await pool.query(`INSERT INTO notifiche (id_utente, testo, link, letta) VALUES ($1, $2, $3, false)`, [id_autore, testoNotifica, `/articolo/${id_articolo}`]);
    res.json({ success: true });
  } catch (error) {
    console.error("💥 ERRORE DATABASE (Approvazione):", error.message);
    res.status(500).json({ error: 'Errore server' });
  }
});

// RIFIUTO ARTICOLO
router.delete('/articles/reject', async (req, res) => {
  const { id_articolo, id_autore, titolo } = req.body;
  try {
    await pool.query(`DELETE FROM articoli WHERE id = $1`, [id_articolo]);
    const testoNotifica = `La tua bozza "${titolo}" non ha superato la revisione ed è stata rimossa.`;
    await pool.query(`INSERT INTO notifiche (id_utente, testo, link, letta) VALUES ($1, $2, '/profilo', false)`, [id_autore, testoNotifica]);
    res.json({ success: true });
  } catch (error) {
    console.error("💥 ERRORE DATABASE (Rifiuto):", error.message);
    res.status(500).json({ error: 'Errore server' });
  }
});

// AMMONIZIONI
router.post('/users/warn', async (req, res) => {
  const { id_utente, current_warns } = req.body;
  try {
    if (current_warns === 1) {
      await pool.query(`UPDATE utenti SET ammonizioni = 2, bannato = true WHERE id = $1`, [id_utente]);
      await pool.query(`INSERT INTO notifiche (id_utente, testo, letta) VALUES ($1, $2, false)`, [id_utente, `⛔ BAN AUTOMATICO: Secondo cartellino giallo.`]);
    } else {
      await pool.query(`UPDATE utenti SET ammonizioni = 1 WHERE id = $1`, [id_utente]);
      await pool.query(`INSERT INTO notifiche (id_utente, testo, letta) VALUES ($1, $2, false)`, [id_utente, `⚠️ ATTENZIONE: Hai ricevuto un'ammonizione.`]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("💥 ERRORE DATABASE (Ammonizione):", error.message);
    res.status(500).json({ error: 'Errore server' });
  }
});

// BAN MANUALE
router.post('/users/toggle-ban', async (req, res) => {
  const { id_utente, is_banned } = req.body;
  try {
    const nuovoStato = !is_banned;
    await pool.query(`UPDATE utenti SET bannato = $1 WHERE id = $2`, [nuovoStato, id_utente]);
    if (nuovoStato) {
      await pool.query(`INSERT INTO notifiche (id_utente, testo, letta) VALUES ($1, $2, false)`, [id_utente, `⛔ SEI STATO BANNATO DEFINITIVAMENTE.`]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("💥 ERRORE DATABASE (Ban):", error.message);
    res.status(500).json({ error: 'Errore server' });
  }
});

// STATO SEGNALAZIONI (Con i log di debug avanzati!)
router.post('/reports/update-status', async (req, res) => {
  console.log("👉 1. Richiesta ricevuta dal frontend!");
  console.log("👉 2. Dati arrivati:", req.body);
  
  const { id_segnalazione, new_status } = req.body;
  
  try {
    console.log("👉 3. Tento la connessione al database...");
    await pool.query(`UPDATE segnalazioni SET stato = $1 WHERE id = $2`, [new_status, id_segnalazione]);
    console.log("👉 4. Database aggiornato con successo!");
    res.json({ success: true });
  } catch (error) {
    console.error("💥 5. ERRORE DATABASE (Segnalazioni):", error.message); 
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;