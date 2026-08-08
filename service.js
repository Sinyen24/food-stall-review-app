require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');

const User   = require('./models/User');
const Stall  = require('./models/Stall');
const Review = require('./models/Review');

// ── Express + Socket.IO setup ─────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);       // one HTTP server for both REST + WS
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// ── Connect to MongoDB Atlas ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => { console.error('❌  MongoDB connection error:', err.message); process.exit(1); });

// ── Helper: recalculate stall's avgRating and reviewCount ─────────────────────
async function recalcStallRating(stallId) {
  const reviews = await Review.find({ stallId });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  return Stall.findByIdAndUpdate(
    stallId,
    { avgRating: parseFloat(avg.toFixed(2)), reviewCount: reviews.length },
    { new: true }
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });
  try {
    const user = await new User({ name, email, password }).save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'An account with this email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase(), password });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// STALLS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/stalls
app.get('/api/stalls', async (req, res) => {
  try {
    const stalls = await Stall.find().sort({ name: 1 });
    res.status(200).json(stalls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stalls/:id
app.get('/api/stalls/:id', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id);
    if (!stall) return res.status(404).json({ error: 'Stall not found.' });
    res.status(200).json(stall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stalls  (admin only)
app.post('/api/stalls', async (req, res) => {
  const { name, cuisine, location, description, isOpen } = req.body || {};
  if (!name || !cuisine || !location)
    return res.status(400).json({ error: 'Name, cuisine and location are required.' });
  try {
    const stall = await new Stall({
      name: name.trim(), cuisine, location,
      description: description || '',
      isOpen: isOpen !== undefined ? isOpen : true,
    }).save();
    res.status(201).json(stall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/stalls/:id  (admin only)
app.put('/api/stalls/:id', async (req, res) => {
  const { name, cuisine, location, description, isOpen } = req.body || {};
  if (!name || !cuisine || !location)
    return res.status(400).json({ error: 'Name, cuisine and location are required.' });
  try {
    const stall = await Stall.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), cuisine, location, description: description || '', isOpen },
      { new: true }
    );
    if (!stall) return res.status(404).json({ error: 'Stall not found.' });
    res.status(200).json(stall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stalls/:id  (admin only)
app.delete('/api/stalls/:id', async (req, res) => {
  try {
    const stall = await Stall.findByIdAndDelete(req.params.id);
    if (!stall) return res.status(404).json({ error: 'Stall not found.' });
    await Review.deleteMany({ stallId: req.params.id });   // cascade delete reviews
    res.status(200).json({ id: req.params.id, affected: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/reviews  (optional ?stallId= and/or ?userId= query params)
app.get('/api/reviews', async (req, res) => {
  const { stallId, userId } = req.query;
  const filter = {};
  if (stallId) filter.stallId = stallId;
  if (userId)  filter.userId  = userId;
  try {
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/:id
app.get('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
  const { stallId, userId, author, rating, comment } = req.body || {};
  if (!stallId || !userId || !author || !rating)
    return res.status(400).json({ error: 'stallId, userId, author and rating are required.' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  try {
    const review = await new Review({
      stallId, userId,
      author: author.trim(),
      rating: parseInt(rating),
      comment: comment || '',
    }).save();

    // Recalculate stall rating and broadcast via Socket.IO
    const updatedStall = await recalcStallRating(stallId);
    io.emit('reviewAdded', { stallId: stallId.toString(), review });
    io.emit('stallUpdated', {
      stallId:     stallId.toString(),
      avgRating:   updatedStall.avgRating,
      reviewCount: updatedStall.reviewCount,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id
app.put('/api/reviews/:id', async (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating)
    return res.status(400).json({ error: 'Rating is required.' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: parseInt(rating), comment: comment || '' },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    // Recalculate stall rating and broadcast
    const updatedStall = await recalcStallRating(review.stallId);
    io.emit('stallUpdated', {
      stallId:     review.stallId.toString(),
      avgRating:   updatedStall.avgRating,
      reviewCount: updatedStall.reviewCount,
    });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    // Recalculate stall rating and broadcast via Socket.IO
    const updatedStall = await recalcStallRating(review.stallId);
    io.emit('reviewDeleted', {
      stallId:  review.stallId.toString(),
      reviewId: req.params.id,
    });
    io.emit('stallUpdated', {
      stallId:     review.stallId.toString(),
      avgRating:   updatedStall.avgRating,
      reviewCount: updatedStall.reviewCount,
    });

    res.status(200).json({ id: req.params.id, affected: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO connection log ───────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌  Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌  Client disconnected:', socket.id));
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🍜  FoodStall API + Socket.IO server running on port ${PORT}`);
  console.log(`    REST:      http://localhost:${PORT}/api`);
  console.log(`    Socket.IO: ws://localhost:${PORT}`);
  console.log(`    Emulator:  http://10.0.2.2:${PORT}`);
});
