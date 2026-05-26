import express from 'express'
import {
  getProducts,
  getProductById,
  addReview,
  getFeaturedProducts
} from '../controllers/productController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// IMPORTANT - featured must be before /:id
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProductById)
router.post('/:id/reviews', protect, addReview)

export default router