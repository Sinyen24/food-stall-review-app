const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  cuisine:     { type: String, required: true },
  location:    { type: String, required: true },
  description: { type: String, default: '' },
  isOpen:      { type: Boolean, default: true },
  avgRating:   { type: Number, default: 0 },   // updated by recalcStallRating() helper
  reviewCount: { type: Number, default: 0 },   // updated by recalcStallRating() helper
  createdAt:   { type: Date, default: Date.now },
});

// Adds virtual 'id' field (string version of _id) to JSON output
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Stall', schema);
