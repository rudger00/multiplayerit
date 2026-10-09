const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// Le operazioni amministrative server-side richiedono la service-role key.
// La chiave anonima è solo un fallback per permettere l'avvio in ambienti di sviluppo;
// in tal caso le policy RLS possono impedire le operazioni privilegiate.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configurazione Supabase mancante: impostare SUPABASE_URL e una chiave server valida.');
}

module.exports = createClient(supabaseUrl, supabaseKey);
