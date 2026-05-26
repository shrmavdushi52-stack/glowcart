 import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setCart } from '../store/cartSlice'
import api from '../utils/api'

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/products/${id}`)
      setProduct(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setAddingToCart(true)
      const { data } = await api.post('/api/cart', { productId: id, quantity })
      dispatch(setCart(data.cart))
      showMessage('Added to cart successfully!', 'success')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add to cart', 'error')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await api.post('/api/wishlist', { productId: id })
      showMessage('Added to wishlist! ♥', 'success')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add to wishlist', 'error')
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!review.comment.trim()) {
      return showMessage('Please write a review comment', 'error')
    }
    try {
      setSubmittingReview(true)
      await api.post(`/api/products/${id}/reviews`, review)
      showMessage('Review submitted successfully!', 'success')
      setReview({ rating: 5, comment: '' })
      fetchProduct()
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to submit review', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500">Product not found</p>
          <Link to="/" className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-full">
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          <Link to="/wishlist" className="text-sm text-gray-600 hover:text-pink-500">♥ Wishlist</Link>
          <Link to="/cart" className="text-sm text-gray-600 hover:text-pink-500">🛒 Cart</Link>
          {user ? (
            <Link to="/profile" className="text-sm text-gray-600 hover:text-pink-500">
              Hi, {user.name} 👋
            </Link>
          ) : (
            <Link to="/login" className="text-sm bg-pink-500 text-white px-4 py-1.5 rounded-full">
              Login
              </Link>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <p className="text-sm text-gray-400">
          <Link to="/" className="hover:text-pink-500">Home</Link>
          {' '}/{' '}
          <span className="text-gray-600">{product.name}</span>
        </p>
      </div>

      {/* Toast Message */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Top Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row gap-8">

          {/* Images */}
          <div className="md:w-2/5">
            <div className="rounded-2xl overflow-hidden bg-pink-50 mb-3">
              <img
                src={product.images[activeImage] || 'https://placehold.co/400x400?text=No+Image'}
                alt={product.name}
                onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
                className="w-full h-80 object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(i)}
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image' }}
                    className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 ${
                      activeImage === i ? 'border-pink-500' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-3/5 flex flex-col gap-4">

            <div>
              <p className="text-pink-400 font-medium text-sm">{product.brand}</p>
              <h1 className="text-2xl font-bold text-gray-800 mt-1">{product.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`text-lg ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating?.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-pink-600">₹{product.price}</span>
              {product.discountPrice > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.discountPrice}</span>
                  <span className="text-sm bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    {Math.round((product.discountPrice - product.price) / product.discountPrice * 100)}% off
                  </span>
                </>
              )}
            </div>

            <div>
              {product.isOutOfStock ? (
                <span className="text-red-500 text-sm font-medium">❌ Out of Stock</span>
              ) : (
                <span className="text-green-500 text-sm font-medium">✅ In Stock ({product.stock} left)</span>
              )}
            </div>

            {product.skinType?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Suitable for</p>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map(type => (
                    <span key={type} className="text-xs bg-pink-50 text-pink-500 px-3 py-1 rounded-full border border-pink-200 capitalize">
                      {type} skin
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.concern?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Targets</p>
                <div className="flex flex-wrap gap-2">
                  {product.concern.map(c => (
                    <span key={c} className="text-xs bg-purple-50 text-purple-500 px-3 py-1 rounded-full border border-purple-200 capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!product.isOutOfStock && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 font-medium">Quantity:</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2 text-gray-500 hover:bg-pink-50 text-lg"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 text-gray-500 hover:bg-pink-50 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.isOutOfStock || addingToCart}
                className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              <button
                onClick={handleAddToWishlist}
                className="px-4 py-3 border border-pink-300 rounded-xl text-pink-500 hover:bg-pink-50 transition text-xl"
              >
                ♥
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section — Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
            {['description', 'ingredients', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-xl capitalize font-medium transition ${
                  activeTab === tab
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-500 hover:bg-pink-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              {product.koreanStep && (
                <div className="mt-4 bg-pink-50 rounded-xl p-4 border border-pink-100">
                  <p className="text-pink-500 font-medium text-sm">
                    🌸 Korean Skincare Step {product.koreanStep}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    This product is used in Step {product.koreanStep} of the Korean skincare routine.
                  </p>
<Link to="/korean-guide" className="text-sm text-gray-600 hover:text-pink-500 block mt-4">
  🌸 View Korean Skincare Guide & Step Timers
</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Key active ingredients in this product:</p>
              <div className="flex flex-wrap gap-2">
                {product.ingredients?.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm border border-green-100 font-medium"
                  >
                    🌿 {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {user && (
                <div className="bg-pink-50 rounded-2xl p-4 mb-6 border border-pink-100">
                  <h3 className="font-semibold text-gray-700 mb-3">Write a Review</h3>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Rating</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReview({...review, rating: star})}
                          className={`text-2xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={e => setReview({...review, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="mt-2 bg-pink-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              {product.reviews?.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">💬</p>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {product.reviews?.map((rev, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-sm">
                            {rev.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700 text-sm">{rev.name}</span>
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={`text-sm ${star <= rev.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{rev.comment}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail