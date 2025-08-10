const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const consumablesRoutes = require('./routes/consumables');
const dailyRoutes = require('./routes/daily');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/consumables', consumablesRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Kaskrout API is running!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;