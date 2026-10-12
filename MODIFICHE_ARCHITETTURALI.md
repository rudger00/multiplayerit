# Modifiche architetturali applicate

Interventi mirati effettuati senza riscrivere le pagine o cambiare la struttura funzionale generale:

- Centralizzata la composizione degli URL del backend in `client/src/utils/api.js` e aggiornata la pagina amministrativa e la sezione commenti per usare questa configurazione.
- Corrette le chiamate di approvazione/rifiuto degli articoli per usare l'endpoint esistente `POST /api/admin/articles/status` con stati validi (`PUBLISHED` e `REJECTED`).
- Aggiunto `POST /api/admin/reports/update-status`, già chiamato dalla pagina amministrativa, con validazione degli stati ammessi.
- Corretto un errore strutturale: le rotte amministrative importavano `config/db.js`, che esporta un pool PostgreSQL e non un client Supabase. Ora usano `config/supabase.js`; le query PostgreSQL per la verifica del ruolo restano nel pool.
- Aggiunta la variabile server-only `SUPABASE_SERVICE_ROLE_KEY` al modello d'ambiente. È necessaria per operazioni amministrative che devono superare le policy RLS; non deve mai essere esposta al browser.
- Rimossi i log di debug che stampavano la funzione `requireAdmin`.
- Rafforzata la validazione degli elementi dello storico inviato all'endpoint Gemini e impostato un limite di 100 KB per il body JSON.
- Aggiunte risposte uniformi per endpoint API inesistenti ed errori non gestiti.
- Aggiornati `.gitignore`, `README.md` e i file `.env.example` senza credenziali reali.
- L'archivio di consegna esclude `.git`, dipendenze installate e file `.env` locali, che possono contenere segreti.

## Verifiche ancora necessarie nell'ambiente reale

- Configurare `SUPABASE_SERVICE_ROLE_KEY` solo in `server/.env` e ruotare eventuali chiavi private già condivise.
- Verificare/attivare le policy RLS per tutte le tabelle accessibili direttamente dal client. Le policy dipendono dallo schema e dai requisiti del progetto Supabase, quindi non sono state inventate o modificate nell'archivio locale.
- Eseguire `npm install` e `npm run dev` nel proprio ambiente; non erano presenti `node_modules`, quindi non è stato possibile eseguire una build completa del frontend in questo ambiente.
- Aggiungere test automatici: non era presente una suite di test configurata.
