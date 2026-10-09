require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importiamo le nostre rotte divise per file
const externalRoutes = require('./routes/external');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3001;

// Middleware Base
app.use(cors());
app.use(express.json());

// Montaggio delle Rotte
// Tutte le richieste che iniziano con /api andranno nei rispettivi file
app.use('/api', externalRoutes);
app.use('/api/admin', adminRoutes);

// Avvio Server
app.listen(port, () => {
  console.log(`✅ Server backend in esecuzione sulla porta ${port}`);
});