# ProgettoWeb

Applicazione web con frontend React/Vite, backend Node.js/Express e Supabase/PostgreSQL.

## Avvio in sviluppo

1. Installa le dipendenze dalla root: `npm install`.
2. Copia `server/.env.example` in `server/.env` e configura le credenziali richieste.
3. Copia `client/.env.example` in `client/.env`. Nel frontend inserisci soltanto configurazioni pubbliche: URL Supabase, chiave anonima Supabase e URL del backend.
4. Avvia entrambi i processi con `npm run dev`.

## Confini architetturali

- `client/`: pagine, componenti, stato dell'interfaccia e chiamate HTTP.
- `server/routes/`: endpoint HTTP e controlli specifici delle richieste.
- `server/middleware/`: autenticazione e autorizzazione.
- `server/config/`: configurazione delle connessioni.
- `client/src/utils/api.js`: composizione centralizzata degli URL del backend.

Le operazioni amministrative passano dal backend e richiedono un token Supabase valido e il ruolo amministratore verificato lato server. Il client Supabase server-side usato per eseguire tali operazioni richiede `SUPABASE_SERVICE_ROLE_KEY`; questa chiave deve restare esclusivamente in `server/.env` e non deve mai essere inserita in `client/.env`. Le letture/scritture dirette dal browser a Supabase devono essere protette con policy RLS adeguate per ogni tabella.

## Sicurezza prima della pubblicazione

- Non distribuire `.env` o credenziali reali. I file `.env.example` sono modelli senza segreti.
- Le variabili `VITE_*` sono incorporate nel bundle pubblico; non inserirvi chiavi private.
- Verifica in Supabase che RLS sia attiva e che le policy autorizzino solo le operazioni previste. Le policy dipendono dallo schema effettivo del database e vanno verificate nel progetto Supabase.
- Se credenziali private sono state condivise in un archivio o repository accessibile ad altri, ruotale dal pannello del relativo provider.
- Configura `CLIENT_URL` e `VITE_API_URL` per l'ambiente di deploy.

## Test

I test automatizzati non sono ancora configurati nei package. Prima di un rilascio, aggiungere test per autorizzazioni amministrative, aggiornamento delle segnalazioni, validazione delle richieste e operazioni concorrenti sul database.
