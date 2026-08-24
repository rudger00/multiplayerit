require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurazione Connessione Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Fondamentale per le connessioni cloud
});

// Endpoint di Test
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articoli');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Errore del server' });
  }
});

app.listen(port, () => {
  console.log(`Server backend in esecuzione sulla porta ${port}`);
});