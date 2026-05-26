import express from 'express'
import {
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  getAllOrders,
  updateOrderStatus,
  getAllUsers
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, adminOnly)

router.get('/dashboard', getDashboardStats)
router.get('/products', getAllProducts)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)
router.put('/products/:id/stock', toggleStock)
router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/users', getAllUsers)

export default router