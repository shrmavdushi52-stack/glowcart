import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// 1. Load environment variables FIRST before importing any routes/controllers
dotenv.config();

// 2. Import Route Files (Make sure each is listed exactly ONCE)
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

import adminRoutes from './routes/adminRoutes.js';

import reminderRoutes from './routes/reminderRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 3. Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());


// 4. Test Route
app.get('/', (req, res) => {
  res.send('GlowCart API is running smoothly!');
});

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/reminders', reminderRoutes);

// 6. Connect to MongoDB & Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });