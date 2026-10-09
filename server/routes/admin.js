const express = require('express');
const router = express.Router();
const supabase = require('../config/db'); // Assicurati che il percorso al tuo db.js sia corretto
const requireAdmin = require('../middleware/auth'); // Il buttafuori JWT

// Tutte le rotte in questo file devono passare dal buttafuori
router.use(requireAdmin);

// ==========================================
// 1. GESTIONE UTENTI (BAN E AMMONIZIONI)
// ==========================================

// Toggle Ban (Attiva/Disattiva Ban)
router.post('/users/toggle-ban', async (req, res) => {
  const { id_utente } = req.body;

  if (!id_utente) return res.status(400).json({ error: 'Manca ID utente' });

  try {
    // 1. Leggiamo lo stato attuale direttamente dal DB (non ci fidiamo del client)
    const { data: user, error: fetchError } = await supabase
      .from('utenti')
      .select('bannato')
      .eq('id', id_utente)
      .single();

    if (fetchError || !user) throw new Error("Utente non trovato");

    // 2. Invertiamo lo stato e salviamo
    const newBanStatus = !user.bannato;
    const { error: updateError } = await supabase
      .from('utenti')
      .update({ bannato: newBanStatus })
      .eq('id', id_utente);

    if (updateError) throw updateError;

    res.json({ success: true, bannato: newBanStatus });
  } catch (error) {
    console.error("Errore toggle-ban:", error.message);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Ammonisci Utente (Incrementa i warning)
router.post('/users/warn', async (req, res) => {
  const { id_utente } = req.body;

  if (!id_utente) return res.status(400).json({ error: 'Manca ID utente' });

  try {
    // 1. Recuperiamo le ammonizioni attuali dal DB
    const { data: user, error: fetchError } = await supabase
      .from('utenti')
      .select('ammonizioni')
      .eq('id', id_utente)
      .single();

    if (fetchError || !user) throw new Error("Utente non trovato");

    // 2. Calcoliamo noi le nuove ammonizioni (il client non può imbrogliare)
    const newWarns = user.ammonizioni + 1;
    let isBanned = false;

    // Se arriva a 3 ammonizioni, lo banniamo in automatico!
    if (newWarns >= 3) {
      isBanned = true;
    }

    // 3. Aggiorniamo il DB
    const { error: updateError } = await supabase
      .from('utenti')
      .update({ ammonizioni: newWarns, bannato: isBanned })
      .eq('id', id_utente);

    if (updateError) throw updateError;

    // 4. Creiamo la notifica
    await supabase.from('notifiche').insert([{
      id_utente: id_utente,
      messaggio: isBanned 
        ? `Sei stato bannato per aver raggiunto 3 ammonizioni.` 
        : `Sei stato ammonito da un amministratore. Ammonizioni attuali: ${newWarns}/3.`,
      tipo: 'warning'
    }]);

    res.json({ success: true, ammonizioni: newWarns, bannato: isBanned });
  } catch (error) {
    console.error("Errore warn user:", error.message);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// ==========================================
// 2. GESTIONE ARTICOLI (APPROVAZIONE)
// ==========================================

// Cambia stato articolo (Pubblica / Rifiuta)
router.post('/articles/status', async (req, res) => {
  const { id_articolo, new_status } = req.body;

  // Whitelist rigorosa per lo status
  const allowedStatuses = ['PUBLISHED', 'DRAFT', 'REJECTED'];
  if (!id_articolo || !allowedStatuses.includes(new_status)) {
    return res.status(400).json({ error: 'Dati mancanti o stato non valido' });
  }

  try {
    // 1. Recuperiamo titolo e autore dal DB (NON dal client!)
    const { data: article, error: fetchError } = await supabase
      .from('articoli')
      .select('titolo, id_autore')
      .eq('id', id_articolo)
      .single();

    if (fetchError || !article) throw new Error("Articolo non trovato");

    // 2. Aggiorniamo lo stato dell'articolo
    const { error: updateError } = await supabase
      .from('articoli')
      .update({ stato: new_status })
      .eq('id', id_articolo);

    if (updateError) throw updateError;

    // 3. Notifichiamo l'autore in base alla decisione
    let messaggioNotifica = '';
    if (new_status === 'PUBLISHED') {
      messaggioNotifica = `Il tuo articolo "${article.titolo}" è stato approvato e pubblicato!`;
    } else if (new_status === 'REJECTED') {
      messaggioNotifica = `Il tuo articolo "${article.titolo}" non ha superato la revisione ed è stato rifiutato.`;
    }

    if (messaggioNotifica) {
      await supabase.from('notifiche').insert([{
        id_utente: article.id_autore,
        messaggio: messaggioNotifica,
        tipo: new_status === 'PUBLISHED' ? 'success' : 'error',
        link: new_status === 'PUBLISHED' ? `/articolo/${id_articolo}` : null
      }]);
    }

    res.json({ success: true, status: new_status });
  } catch (error) {
    console.error("Errore status articolo:", error.message);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;