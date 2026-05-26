
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Product from '../models/Product.js'

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

// Pre-defined values matching your Frontend Sidebar filter capitalization exactly!
const categories = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Mask', 'Essence', 'Exfoliator', 'Eye Cream'];
const skinTypes = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];
const concerns = ['Acne', 'Aging', 'Brightening', 'Hydration', 'Pores', 'Dark Spots', 'Redness', 'Firmness'];
const brands = ['COSRX', 'CeraVe', 'Anua', 'The Ordinary', 'La Roche-Posay', 'Innisfree', 'Paula\'s Choice', 'Klairs', 'Some By Mi'];

// Aesthetic, high-quality skincare product images from Unsplash
const skincareImages = [
  'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=500',
  'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500',
  'https://images.unsplash.com/photo-1601612620962-ebde00aeeed3?w=500'
];

// Loop generator to scale up to 200 items smoothly
const generate200Products = () => {
  const generatedList = [];

  for (let i = 1; i <= 200; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const basePrice = Math.floor(Math.random() * (2200 - 499) + 499); // Prices from ₹499 to ₹2200

    // Unique random selections for arrays
    const productSkinTypes = [...new Set([
      skinTypes[Math.floor(Math.random() * skinTypes.length)],
      skinTypes[Math.floor(Math.random() * skinTypes.length)]
    ])];

    const productConcerns = [...new Set([
      concerns[Math.floor(Math.random() * concerns.length)],
      concerns[Math.floor(Math.random() * concerns.length)]
    ])];

    generatedList.push({
      name: `${brand} Advanced ${category} v${i}`,
      brand: brand,
      description: `A powerful, dermatologically tested formula made to deeply treat your skin, boost radiance, and resolve targeted issues effortlessly.`,
      price: basePrice,
      discountPrice: Math.random() > 0.75 ? Math.floor(basePrice * 0.85) : 0,
      images: [skincareImages[Math.floor(Math.random() * skincareImages.length)]],
      category: category,
      skinType: productSkinTypes,
      concern: productConcerns,
      ingredients: ['Water', 'Glycerin', 'Niacinamide', 'Hyaluronic Acid', 'Centella Asiatica'],
      stock: Math.floor(Math.random() * 80) + 15,
      isOutOfStock: false,
      rating: parseFloat((Math.random() * (5.0 - 3.9) + 3.9).toFixed(1)),
      numReviews: Math.floor(Math.random() * 240),
      isFeatured: Math.random() > 0.85,
      koreanStep: Math.floor(Math.random() * 10) + 1,
      reviews: []
    });
  }

  return generatedList;
};

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // Fallback locally if MONGO_URI string parsing fails inside your .env configuration
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glowcart';
    await mongoose.connect(connString);
    console.log('Connected!');

    await Product.deleteMany();
    console.log('Old products cleared');

    console.log('Generating 200 items...');
    const massiveProductsArray = generate200Products();

    await Product.insertMany(massiveProductsArray);
    console.log('✅ 200 Products seeded successfully into MongoDB!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
}

seedDB();