import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// @route POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price stock isOutOfStock')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const itemsPrice = cart.totalPrice
    const deliveryPrice = itemsPrice > 999 ? 0 : 99
    const totalPrice = itemsPrice + deliveryPrice

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0],
      price: item.price,
      quantity: item.quantity
    }))

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      deliveryPrice,
      totalPrice,
      statusHistory: [{
        status: 'placed',
        message: 'Order placed successfully'
      }]
    })

    // If COD — clear cart immediately
    if (paymentMethod === 'cod') {
      cart.items = []
      cart.totalItems = 0
      cart.totalPrice = 0
      await cart.save()
    }

    res.status(201).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/orders/razorpay
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    }

    const razorpayOrder = await razorpay.orders.create(options)
    res.json({ success: true, order: razorpayOrder })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/orders/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    const order = await Order.findById(orderId)
    order.paymentStatus = 'paid'
    order.razorpayOrderId = razorpay_order_id
    order.razorpayPaymentId = razorpay_payment_id
    order.statusHistory.push({
      status: 'confirmed',
      message: 'Payment received successfully'
    })
    order.orderStatus = 'confirmed'
    await order.save()

    // Clear cart after payment
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      cart.totalItems = 0
      cart.totalPrice = 0
      await cart.save()
    }

    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }
    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}