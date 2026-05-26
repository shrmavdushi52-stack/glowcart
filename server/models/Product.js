import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true }
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: String, required: true },
  skinType: [{ type: String }],
  concern: [{ type: String }],
  ingredients: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  isOutOfStock: { type: Boolean, default: false },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  koreanStep: { type: Number, default: null }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
export default Product