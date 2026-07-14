require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const issueRoutes = require('./routes/issueRoutes');
const photoValidationRoutes = require('./routes/photoValidation');
app.use('/api', issueRoutes);
app.use('/api', photoValidationRoutes);

app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
