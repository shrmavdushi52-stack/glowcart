import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

// Calculate totals helper
const calculateTotals = (items) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  return { totalItems, totalPrice }
}

// @route GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price brand isOutOfStock stock')

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    res.json({ success: true, cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.isOutOfStock || product.stock < quantity) {
      return res.status(400).json({ message: 'Product is out of stock' })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    )

    if (existingItem) {
      existingItem.quantity += quantity
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock
      }
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      })
    }

    const { totalItems, totalPrice } = calculateTotals(cart.items)
    cart.totalItems = totalItems
    cart.totalPrice = totalPrice

    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name images price brand isOutOfStock stock')

    res.json({ success: true, cart: updatedCart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    const { productId } = req.params

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    )

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    item.quantity = quantity

    const { totalItems, totalPrice } = calculateTotals(cart.items)
    cart.totalItems = totalItems
    cart.totalPrice = totalPrice

    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name images price brand isOutOfStock stock')

    res.json({ success: true, cart: updatedCart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    )

    const { totalItems, totalPrice } = calculateTotals(cart.items)
    cart.totalItems = totalItems
    cart.totalPrice = totalPrice

    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name images price brand isOutOfStock stock')

    res.json({ success: true, cart: updatedCart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = []
    cart.totalItems = 0
    cart.totalPrice = 0

    await cart.save()
    res.json({ success: true, message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}