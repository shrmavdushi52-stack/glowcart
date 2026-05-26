import Product from '../models/Product.js'

// @route   GET /api/products
// @desc    Get all products with advanced filtering and pagination
export const getProducts = async (req, res) => {
  try {
    const { 
      category, skinType, concern, 
      minPrice, maxPrice, search,
      sortBy, page = 1, limit = 200
    } = req.query

    let filter = {}

    if (category) filter.category = category
    if (skinType) filter.skinType = { $in: [skinType] }
    if (concern) filter.concern = { $in: [concern] }
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const sortOptions = {
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 }
    }

    const sort = sortOptions[sortBy] || { createdAt: -1 }
    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      success: true,
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/products/:id
// @desc    Get a single product detail by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar')
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   POST /api/products/:id/reviews
// @desc    Create a product review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product' })
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    }

    product.reviews.push(review)
    product.numReviews = product.reviews.length
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length

    await product.save()
    res.status(201).json({ success: true, message: 'Review added' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/products/featured
// @desc    Get top featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================================================================
// ADMIN CONTROLLERS
// =========================================================================

// @route   POST /api/admin/products (or mapped directly to your admin router)
// @desc    Add a new beauty product to inventory
export const addProduct = async (req, res) => {
  try {
    const { 
      name, brand, description, price, category, stock, 
      skinType, concern, ingredients, images, isFeatured 
    } = req.body
    
    const product = new Product({
      name, brand, description, price, category, stock,
      skinType, concern, ingredients, images, isFeatured
    })

    const createdProduct = await product.save()
    res.status(201).json({ success: true, product: createdProduct })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// @route   PUT /api/admin/products/:id
// @desc    Update an existing product info / toggle stock or restock count
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Assign fields dynamically if passed inside request body
    Object.assign(product, req.body)
    
    const updatedProduct = await product.save()
    res.json({ success: true, product: updatedProduct })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// @route   DELETE /api/admin/products/:id
// @desc    Remove a product entirely from the store index
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.deleteOne()
    res.json({ success: true, message: 'Product removed from inventory' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}