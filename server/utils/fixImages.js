import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Product from '../models/Product.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

const validImages = [
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
  'https://images.unsplash.com/photo-1601612620962-ebde00aeeed3?w=500',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=500',
  'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500',
  'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500',
]

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const products = await Product.find({})
    console.log(`Found ${products.length} products`)

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      // assign a valid image based on index
      const imageUrl = validImages[i % validImages.length]
      product.images = [imageUrl]
      await product.save()
    }

    console.log('✅ All product images updated!')
    process.exit()
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

fixImages()