const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const supabase = require('../config/db'); // Assicurati che il percorso al tuo db.js sia corretto
=======
const supabase = require('../config/supabase'); 
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
const { requireAdmin } = require('../middleware/auth');

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
<<<<<<< HEAD
    // 1. Leggiamo lo stato attuale direttamente dal DB (non ci fidiamo del client)
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    const { data: user, error: fetchError } = await supabase
      .from('utenti')
      .select('bannato')
      .eq('id', id_utente)
      .single();

    if (fetchError || !user) throw new Error("Utente non trovato");

<<<<<<< HEAD
    // 2. Invertiamo lo stato e salviamo
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
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
<<<<<<< HEAD
    // 1. Recuperiamo le ammonizioni attuali dal DB
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    const { data: user, error: fetchError } = await supabase
      .from('utenti')
      .select('ammonizioni')
      .eq('id', id_utente)
      .single();

    if (fetchError || !user) throw new Error("Utente non trovato");

<<<<<<< HEAD
    // 2. Calcoliamo noi le nuove ammonizioni (il client non può imbrogliare)
    const newWarns = user.ammonizioni + 1;
    let isBanned = false;

    // Se arriva a 3 ammonizioni, lo banniamo in automatico!
=======
    const newWarns = user.ammonizioni + 1;
    let isBanned = false;

>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    if (newWarns >= 3) {
      isBanned = true;
    }

<<<<<<< HEAD
    // 3. Aggiorniamo il DB
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    const { error: updateError } = await supabase
      .from('utenti')
      .update({ ammonizioni: newWarns, bannato: isBanned })
      .eq('id', id_utente);

    if (updateError) throw updateError;

<<<<<<< HEAD
    // 4. Creiamo la notifica
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
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

<<<<<<< HEAD
  // Whitelist rigorosa per lo status
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
  const allowedStatuses = ['PUBLISHED', 'DRAFT', 'REJECTED'];
  if (!id_articolo || !allowedStatuses.includes(new_status)) {
    return res.status(400).json({ error: 'Dati mancanti o stato non valido' });
  }

  try {
<<<<<<< HEAD
    // 1. Recuperiamo titolo e autore dal DB (NON dal client!)
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    const { data: article, error: fetchError } = await supabase
      .from('articoli')
      .select('titolo, id_autore')
      .eq('id', id_articolo)
      .single();

    if (fetchError || !article) throw new Error("Articolo non trovato");

<<<<<<< HEAD
    // 2. Aggiorniamo lo stato dell'articolo
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
    const { error: updateError } = await supabase
      .from('articoli')
      .update({ stato: new_status })
      .eq('id', id_articolo);

    if (updateError) throw updateError;

<<<<<<< HEAD
    // 3. Notifichiamo l'autore in base alla decisione
=======
>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
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

<<<<<<< HEAD
=======
// ==========================================
// 3. GESTIONE SEGNALAZIONI
// ==========================================
router.post('/reports/update-status', async (req, res) => {
  const { id_segnalazione, new_status } = req.body;
  const allowedStatuses = ['RISOLTA', 'RIFIUTATA'];

  if (!id_segnalazione || !allowedStatuses.includes(new_status)) {
    return res.status(400).json({ error: 'Dati mancanti o stato non valido' });
  }

  try {
    const { data, error } = await supabase
      .from('segnalazioni')
      .update({ stato: new_status })
      .eq('id', id_segnalazione)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Segnalazione non trovata' });

    return res.json({ success: true, status: new_status });
  } catch (error) {
    console.error('Errore aggiornamento segnalazione:', error.message);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

>>>>>>> 51807423c251ce13a536e1b09fa0da8a60534b67
module.exports = router;