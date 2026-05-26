import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import api from '../utils/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    skinType: '',
    concern: '',
    search: '',
    sortBy: 'newest'
  })

  const user = useSelector(state => state.auth?.user || null)
  const { totalItems } = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.skinType) params.append('skinType', filters.skinType)
      if (filters.concern) params.append('concern', filters.concern)
      if (filters.search) params.append('search', filters.search)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      const { data } = await api.get(`/api/products?${params}`)
      if (data && data.products) {
        setProducts(data.products)
      } else if (Array.isArray(data)) {
        setProducts(data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
        <input
          type="text"
          placeholder="🔍 Search products, brands, ingredients..."
          value={filters.search}
          onChange={e => setFilters({...filters, search: e.target.value})}
          className="hidden md:block w-64 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-pink-400"
        />
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <Link to="/korean-guide" className="text-sm text-gray-600 hover:text-pink-500">
                🌸 K-Guide
              </Link>
              <Link to="/wishlist" className="text-sm text-gray-600 hover:text-pink-500">
                ♥ Wishlist
              </Link>
              <Link to="/cart" className="relative text-gray-600 hover:text-pink-500 text-lg">
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-sm text-gray-600 hidden md:block hover:text-pink-500">
                Hi, {user.name} 👋
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm bg-purple-500 text-white px-3 py-1.5 rounded-full hover:bg-purple-600">
                  ⚙️ Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-pink-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-pink-500">Login</Link>
              <Link to="/signup" className="text-sm bg-pink-500 text-white px-4 py-1.5 rounded-full hover:bg-pink-600">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* Sidebar Filters */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-20">
            <h2 className="font-semibold text-gray-700 mb-4">🔍 Filters</h2>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="Cleanser">🫧 Cleanser</option>
                <option value="Toner">🌊 Toner</option>
                <option value="Serum">⚗️ Serum</option>
                <option value="Moisturizer">🌸 Moisturizer</option>
                <option value="Sunscreen">☀️ Sunscreen</option>
                <option value="Mask">🎭 Mask</option>
                <option value="Essence">💎 Essence</option>
                <option value="Exfoliator">✨ Exfoliator</option>
                <option value="Eye Cream">👁️ Eye Cream</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase">Skin Type</label>
              <select
                value={filters.skinType}
                onChange={e => setFilters({...filters, skinType: e.target.value})}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">All Skin Types</option>
                <option value="Dry">🏜️ Dry</option>
                <option value="Oily">💧 Oily</option>
                <option value="Combination">🔀 Combination</option>
                <option value="Sensitive">🌹 Sensitive</option>
                <option value="Normal">✅ Normal</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase">Concern</label>
              <select
                value={filters.concern}
                onChange={e => setFilters({...filters, concern: e.target.value})}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">All Concerns</option>
                <option value="Acne">😤 Acne</option>
                <option value="Aging">⏳ Aging</option>
                <option value="Brightening">✨ Brightening</option>
                <option value="Hydration">💧 Hydration</option>
                <option value="Pores">🔬 Pores</option>
                <option value="Dark Spots">🌑 Dark Spots</option>
                <option value="Redness">🔴 Redness</option>
                <option value="Firmness">💪 Firmness</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium uppercase">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={e => setFilters({...filters, sortBy: e.target.value})}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="newest">🆕 Newest</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="rating">⭐ Top Rated</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ category: '', skinType: '', concern: '', search: '', sortBy: 'newest' })}
              className="w-full text-sm text-pink-500 border border-pink-300 rounded-lg py-2 hover:bg-pink-50 transition"
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              🛍️ {products.length} products found
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-2">Try changing your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Link
                  to={`/products/${product._id}`}
                  key={product._id}
                  className="product-card bg-white rounded-2xl overflow-hidden shadow-sm block hover:shadow-md transition"
                >
                  <div className="relative">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
                      className="w-full h-44 object-cover"
                    />
                    {product.isOutOfStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-red-500 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-pink-400 font-medium">{product.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-500">
                        {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.numReviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-pink-600 font-bold text-base">₹{product.price}</span>
                      {product.discountPrice > 0 && (
                        <span className="text-xs text-gray-400 line-through">₹{product.discountPrice}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.skinType && Array.isArray(product.skinType) && product.skinType.slice(0, 2).map(type => (
                        <span key={type} className="text-xs bg-pink-50 text-pink-400 px-2 py-0.5 rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products