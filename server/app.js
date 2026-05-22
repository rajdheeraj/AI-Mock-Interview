const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/attempts',   require('./routes/attempts'));
app.use('/api/ai',         require('./routes/ai'));

app.get('/', (req, res) => res.send('MockPrep API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));