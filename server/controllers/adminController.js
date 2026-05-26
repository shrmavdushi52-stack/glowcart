import Product from '../models/Product.js'
import Order from '../models/Order.js'
import User from '../models/User.js'

// @route GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments()
    const outOfStockProducts = await Product.countDocuments({ isOutOfStock: true })

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        outOfStockProducts,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/admin/products
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    let filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    }
    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, products, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/admin/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PUT /api/admin/products/:id/stock
export const toggleStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    product.isOutOfStock = !product.isOutOfStock
    await product.save()
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    let filter = {}
    if (status) filter.orderStatus = status

    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.orderStatus = status
    order.statusHistory.push({
      status,
      message: `Order ${status} by admin`
    })

    if (status === 'delivered') {
      order.deliveredAt = new Date()
      order.paymentStatus = 'paid'
    }

    await order.save()
    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}