// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
/**
 * Imports the user-related route handlers.
 * @module routes/userRoutes
 */

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  console.log('Received /ping request');
  res.send('pong');
});


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/portfolio', portfolioRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((err) => console.error('❌ MongoDB connection error:', err));
