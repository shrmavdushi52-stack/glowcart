import Wishlist from '../models/Wishlist.js'

// @route GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name images price brand rating numReviews isOutOfStock discountPrice skinType')

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] })
    }

    res.json({ success: true, wishlist })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body

    let wishlist = await Wishlist.findOne({ user: req.user._id })
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] })
    }

    const alreadyExists = wishlist.products.includes(productId)
    if (alreadyExists) {
      return res.status(400).json({ message: 'Product already in wishlist' })
    }

    wishlist.products.push(productId)
    await wishlist.save()

    res.json({ success: true, message: 'Added to wishlist', wishlist })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    const wishlist = await Wishlist.findOne({ user: req.user._id })
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' })
    }

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== productId
    )

    await wishlist.save()

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products', 'name images price brand rating numReviews isOutOfStock discountPrice skinType')

    res.json({ success: true, message: 'Removed from wishlist', wishlist: updatedWishlist })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/wishlist/check/:productId
export const checkWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
    if (!wishlist) {
      return res.json({ success: true, isWishlisted: false })
    }

    const isWishlisted = wishlist.products.includes(req.params.productId)
    res.json({ success: true, isWishlisted })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}