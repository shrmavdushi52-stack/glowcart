import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setCart, clearCart } from '../store/cartSlice'
import api from '../utils/api'

const Cart = () => {
  const { user } = useSelector(state => state.auth)
  const { items, totalPrice, totalItems } = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/api/cart')
      console.log('Cart data:', data)
      dispatch(setCart(data.cart))
    } catch (error) {
      console.error('Error fetching cart:', error)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user])

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setUpdating(productId)
      const { data } = await api.put(`/api/cart/${productId}`, { quantity })
      dispatch(setCart(data.cart))
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (productId) => {
    try {
      setUpdating(productId)
      const { data } = await api.delete(`/api/cart/${productId}`)
      dispatch(setCart(data.cart))
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleClearCart = async () => {
    try {
      await api.delete('/api/cart')
      dispatch(clearCart())
    } catch (error) {
      console.error('Error clearing cart:', error)
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

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          <Link to="/wishlist" className="text-sm text-gray-600 hover:text-pink-500">♥ Wishlist</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-pink-500">
            {user?.name}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🛒 My Cart
            {totalItems > 0 && (
              <span className="ml-2 text-sm bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-normal">
                {totalItems} items
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-400 hover:text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add some products to get started</p>
            <Link
              to="/"
              className="bg-pink-500 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-600 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Cart Items */}
            <div className="flex-1 flex flex-col gap-4">
              {items.map(item => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center"
                >
                  <Link to={`/products/${item.product?._id}`}>
                    <img
                      src={item.product?.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                      alt={item.product?.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image' }}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  </Link>

                  <div className="flex-1">
                    <p className="text-xs text-pink-400 font-medium">{item.product?.brand}</p>
                    <Link to={`/products/${item.product?._id}`}>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5 hover:text-pink-500">
                        {item.product?.name}
                      </p>
                    </Link>
                    <p className="text-pink-600 font-bold mt-1">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.product?._id}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-pink-50 disabled:opacity-40 transition"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-gray-800">
                      {updating === item.product?._id ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)}
                      disabled={updating === item.product?._id}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-pink-50 disabled:opacity-40 transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-16">
                    <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                    <button
                      onClick={() => handleRemove(item.product?._id)}
                      disabled={updating === item.product?._id}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-500">
                      {totalPrice > 999 ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-base">
                    <span>Total</span>
                    <span className="text-pink-600">
                      ₹{totalPrice > 999 ? totalPrice : totalPrice + 99}
                    </span>
                  </div>
                </div>

                {totalPrice < 999 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Add ₹{999 - totalPrice} more for FREE delivery
                  </p>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition mt-4"
                >
                  Proceed to Checkout →
                </button>

                <Link
                  to="/"
                  className="block text-center text-sm text-pink-500 hover:underline mt-3"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart