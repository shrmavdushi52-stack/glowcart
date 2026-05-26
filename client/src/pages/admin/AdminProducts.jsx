import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

const AdminProducts = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [formData, setFormData] = useState({
    name: '', brand: '', description: '', price: '',
    discountPrice: '', category: '', skinType: '',
    concern: '', ingredients: '', stock: '',
    images: '', isFeatured: false
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchProducts()
  }, [user, search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/admin/products?search=${search}&limit=50`)
      setProducts(data.products)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      skinType: product.skinType?.join(', '),
      concern: product.concern?.join(', '),
      ingredients: product.ingredients?.join(', '),
      stock: product.stock,
      images: product.images?.join(', '),
      isFeatured: product.isFeatured
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        stock: Number(formData.stock),
        skinType: formData.skinType.split(',').map(s => s.trim()).filter(Boolean),
        concern: formData.concern.split(',').map(s => s.trim()).filter(Boolean),
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean)
      }
      if (editProduct) {
        await api.put(`/api/admin/products/${editProduct._id}`, payload)
        showMessage('Product updated successfully!')
      } else {
        await api.post('/api/admin/products', payload)
        showMessage('Product created successfully!')
      }
      setShowForm(false)
      setEditProduct(null)
      fetchProducts()
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save product', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/api/admin/products/${id}`)
      showMessage('Product deleted!')
      fetchProducts()
    } catch (error) {
      showMessage('Failed to delete product', 'error')
    }
  }

  const handleToggleStock = async (id) => {
    try {
      await api.put(`/api/admin/products/${id}/stock`)
      showMessage('Stock status updated!')
      fetchProducts()
    } catch (error) {
      showMessage('Failed to update stock', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', brand: '', description: '', price: '',
      discountPrice: '', category: '', skinType: '',
      concern: '', ingredients: '', stock: '',
      images: '', isFeatured: false
    })
    setEditProduct(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
          <span className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex gap-4">
          <Link to="/admin" className="text-sm text-gray-600 hover:text-pink-500">Dashboard</Link>
          <Link to="/admin/orders" className="text-sm text-gray-600 hover:text-pink-500">Orders</Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">← Store</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🧴 Manage Products</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition"
          >
            + Add Product
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
          />
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'name', label: 'Product Name', placeholder: 'e.g. Vitamin C Serum' },
                { key: 'brand', label: 'Brand', placeholder: 'e.g. Minimalist' },
                { key: 'price', label: 'Price (₹)', placeholder: '999', type: 'number' },
                { key: 'discountPrice', label: 'Original Price (₹)', placeholder: '1299', type: 'number' },
                { key: 'stock', label: 'Stock', placeholder: '50', type: 'number' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Serum' },
                { key: 'skinType', label: 'Skin Type (comma separated)', placeholder: 'Dry, Oily' },
                { key: 'concern', label: 'Concern (comma separated)', placeholder: 'Acne, Aging' },
                { key: 'ingredients', label: 'Ingredients (comma separated)', placeholder: 'Niacinamide, Zinc' },
                { key: 'images', label: 'Image URLs (comma separated)', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.key} className={field.key === 'images' ? 'col-span-2 md:col-span-3' : ''}>
                  <label className="text-xs font-medium text-gray-500 uppercase">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key]}
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
              ))}

              <div className="col-span-2 md:col-span-3">
                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-4 h-4 accent-pink-500"
                />
                <label htmlFor="featured" className="text-sm text-gray-600">Featured Product</label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-pink-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition"
              >
                {editProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                onClick={resetForm}
                className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://placehold.co/40x40?text=No+Image'}
                            alt={product.name}
                            onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=No+Image' }}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 text-pink-600 font-medium">₹{product.price}</td>
                      <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStock(product._id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.isOutOfStock
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {product.isOutOfStock ? 'Out of Stock' : 'In Stock'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts