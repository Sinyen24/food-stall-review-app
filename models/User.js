const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// Adds virtual 'id' field (string version of _id) to JSON output
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);
