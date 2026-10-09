const { createClient } = require('@supabase/supabase-js');
const pool = require('../config/db');
require('dotenv').config();

// Inizializziamo il "telefono diretto" con Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Accesso negato: Token mancante' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Chiediamo a Supabase di verificare il token per noi! (Metodo a prova di bomba)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("💥 Token respinto da Supabase:", error?.message);
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }

    // 2. Il token è autentico. Controlliamo se questo utente è Amministratore nel DB
    const { rows } = await pool.query('SELECT id, id_ruolo FROM utenti WHERE id_auth = $1', [user.id]);
    
    if (rows.length === 0 || rows[0].id_ruolo !== 1) {
      console.error("💥 ERRORE: L'utente non è un amministratore!");
      return res.status(403).json({ error: 'Accesso negato: Privilegi di amministratore richiesti' });
    }

    // 3. Tutto perfetto, diamo il via libera!
    next();
  } catch (error) {
    console.error("💥 ERRORE INTERNO AUTENTICAZIONE:", error.message);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
};

module.exports = { requireAdmin };