const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  stallId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Stall', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  author:    { type: String, required: true, trim: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Adds virtual 'id' field (string version of _id) to JSON output
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Review', schema);
