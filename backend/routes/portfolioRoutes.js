const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');

// Add a stock to portfolio
router.post('/', async (req, res) => {
  try {
    const { stockName, symbol, quantity, buyPrice, buyDate, notes } = req.body;
    const stock = new Portfolio({ stockName, symbol, quantity, buyPrice, buyDate, notes });
    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all portfolio stocks
router.get('/', async (req, res) => {
    console.log('Received GET request for portfolio stocks');
  try {
    const stocks = await Portfolio.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
