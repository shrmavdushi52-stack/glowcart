import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setWishlist } from '../store/wishlistSlice'
import { setCart } from '../store/cartSlice'
import api from '../utils/api'

const Wishlist = () => {
  const { user } = useSelector(state => state.auth)
  const { items } = useSelector(state => state.wishlist)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [addingToCart, setAddingToCart] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/wishlist')
      console.log('Wishlist data:', data)
      dispatch(setWishlist(data.wishlist))
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchWishlist()
  }, [user])

  const handleRemove = async (productId) => {
    try {
      setRemoving(productId)
      const { data } = await api.delete(`/api/wishlist/${productId}`)
      dispatch(setWishlist(data.wishlist))
      showMessage('Removed from wishlist')
    } catch (error) {
      showMessage('Failed to remove', 'error')
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCart(productId)
      const { data } = await api.post('/api/cart', { productId, quantity: 1 })
      dispatch(setCart(data.cart))
      showMessage('Added to cart!', 'success')
    } catch (error) {
      showMessage('Failed to add to cart', 'error')
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          <Link to="/cart" className="text-sm text-gray-600 hover:text-pink-500">🛒 Cart</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-pink-500">
            {user?.name}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            ♥ My Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-sm bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-normal">
                {items.length} items
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-6xl mb-4">♥</p>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save your favourite products here</p>
            <Link
              to="/"
              className="bg-pink-500 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-600 transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="relative">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
                      className="w-full h-44 object-cover"
                    />
                  </Link>

                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={removing === product._id}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                  >
                    {removing === product._id ? '...' : '♥'}
                  </button>

                  {product.isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-red-500 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs text-pink-400 font-medium">{product.brand}</p>
                  <Link to={`/products/${product._id}`}>
                    <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 hover:text-pink-500">
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs text-gray-500">
                      {product.rating?.toFixed(1)} ({product.numReviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-pink-600 font-bold">₹{product.price}</span>
                    {product.discountPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{product.discountPrice}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.skinType?.slice(0, 2).map(type => (
                      <span key={type} className="text-xs bg-pink-50 text-pink-400 px-2 py-0.5 rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.isOutOfStock || addingToCart === product._id}
                    className="w-full mt-3 bg-pink-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition disabled:opacity-50"
                  >
                    {addingToCart === product._id ? 'Adding...' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist