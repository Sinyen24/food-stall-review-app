/**
 * generateDatabase.js — Seed MongoDB Atlas with demo data
 *
 * Run once after setting up MongoDB Atlas:
 *   node generateDatabase.js
 *
 * Requires MONGODB_URI in .env (copy .env.example → .env and fill in your Atlas URI).
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User     = require('./models/User');
const Stall    = require('./models/Stall');
const Review   = require('./models/Review');

async function seed() {
  // ── Connect ─────────────────────────────────────────────────────────────────
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected');

  // ── Clear existing data ──────────────────────────────────────────────────────
  await Review.deleteMany({});
  await Stall.deleteMany({});
  await User.deleteMany({});
  console.log('🗑️   Cleared existing data');

  // ── Seed: users ──────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@foodstall.com', password: 'Admin123',  role: 'admin' },
    { name: 'Demo User',  email: 'user@foodstall.com',  password: 'Password1', role: 'user'  },
  ]);
  const adminUser = users.find(u => u.role === 'admin');
  const demoUser  = users.find(u => u.role === 'user');
  console.log('👤  Users seeded:', users.length);

  // ── Seed: stalls ──────────────────────────────────────────────────────────────
  const stallData = [
    { name: 'Ah Chong Wonton Noodle',    cuisine: 'Chinese',  location: 'Petaling Jaya Food Court',     description: 'Famous for springy handmade wonton noodles simmered in rich pork broth.',        isOpen: true  },
    { name: 'Mak Cik Salmah Nasi Lemak', cuisine: 'Malay',    location: 'Kampung Baru',                  description: 'Traditional nasi lemak with coconut rice, crispy anchovies, and fiery sambal.',  isOpen: true  },
    { name: "Muthu's Banana Leaf",       cuisine: 'Indian',   location: 'Chow Kit Market',               description: 'Aromatic rice served on banana leaf with curries and crispy papadom.',           isOpen: true  },
    { name: "Uncle Bob's Burger",        cuisine: 'Western',  location: 'SS2 Night Market',              description: 'Juicy smash burgers with homemade sauces and fresh toppings.',                   isOpen: true  },
    { name: 'Ichiban Ramen',             cuisine: 'Japanese', location: 'Sunway Pyramid Food Court',     description: 'Tonkotsu ramen with rich creamy broth and melt-in-your-mouth chashu.',           isOpen: true  },
    { name: 'Seoul Garden BBQ',          cuisine: 'Korean',   location: 'Wangsa Maju',                   description: 'Self-grill Korean BBQ with premium marinated meats and banchan sides.',          isOpen: false },
    { name: 'Pad Thai Express',          cuisine: 'Thai',     location: 'Old Klang Road Hawker Centre',  description: 'Authentic pad thai with tamarind, dried shrimp, and roasted peanuts.',           isOpen: true  },
    { name: 'Sweet Dreams Dessert',      cuisine: 'Dessert',  location: 'Sri Petaling',                  description: 'Cendol, ABC, and a range of local desserts to cool you down.',                   isOpen: true  },
    { name: 'Pak Long Seafood',          cuisine: 'Seafood',  location: 'Jalan Alor',                    description: 'Butter crab, kam heong lala, and steamed fish fresh from the tank.',             isOpen: true  },
    { name: 'Warung Pelbagai',           cuisine: 'Mixed',    location: 'Taman Megah',                   description: 'A hawker-style stall offering everything from char kuey teow to economy rice.',  isOpen: false },
  ];
  const stalls = await Stall.insertMany(stallData);
  const stallMap = {};
  stalls.forEach(s => { stallMap[s.name] = s._id; });
  console.log('🍜  Stalls seeded:', stalls.length);

  // ── Seed: reviews ─────────────────────────────────────────────────────────────
  const reviewData = [
    {
      stallId: stallMap['Ah Chong Wonton Noodle'],
      userId:  demoUser._id,
      author:  'Demo User',
      rating:  5,
      comment: 'Best wonton noodle in PJ! The broth is so rich and the noodles are perfectly springy.',
      createdAt: new Date('2025-01-15T09:00:00.000Z'),
    },
    {
      stallId: stallMap['Mak Cik Salmah Nasi Lemak'],
      userId:  demoUser._id,
      author:  'Demo User',
      rating:  4,
      comment: "Sambal is very shiok! A bit oily but that's part of the charm. Will come back!",
      createdAt: new Date('2025-02-20T10:30:00.000Z'),
    },
    {
      stallId: stallMap["Muthu's Banana Leaf"],
      userId:  demoUser._id,
      author:  'Demo User',
      rating:  5,
      comment: 'Generous portions and incredibly fragrant curries. The papadom is always crispy!',
      createdAt: new Date('2025-03-10T12:00:00.000Z'),
    },
    {
      stallId: stallMap['Ichiban Ramen'],
      userId:  demoUser._id,
      author:  'Demo User',
      rating:  4,
      comment: 'Ramen broth is thick and flavourful. Queue was long but worth it.',
      createdAt: new Date('2025-04-01T18:00:00.000Z'),
    },
    {
      stallId: stallMap['Pad Thai Express'],
      userId:  demoUser._id,
      author:  'Demo User',
      rating:  3,
      comment: 'Decent pad thai but a bit sweet for my taste. Service was fast though.',
      createdAt: new Date('2025-04-15T19:30:00.000Z'),
    },
  ];
  await Review.insertMany(reviewData);
  console.log('💬  Reviews seeded:', reviewData.length);

  // ── Recalculate avgRating + reviewCount for all stalls ────────────────────────
  for (const stall of stalls) {
    const reviews = await Review.find({ stallId: stall._id });
    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await Stall.findByIdAndUpdate(stall._id, {
      avgRating:   parseFloat(avg.toFixed(2)),
      reviewCount: reviews.length,
    });
  }
  console.log('⭐  Stall ratings recalculated');

  // ── Done ─────────────────────────────────────────────────────────────────────
  await mongoose.disconnect();
  console.log('\n✅  Database seeded successfully!');
  console.log('    Admin : admin@foodstall.com  /  Admin123');
  console.log('    User  : user@foodstall.com   /  Password1');
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
