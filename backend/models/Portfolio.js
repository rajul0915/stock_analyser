const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  stockName: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  buyDate: { type: Date, required: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
