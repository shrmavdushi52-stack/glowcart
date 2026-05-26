import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

const AdminOrders = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchOrders()
  }, [user, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/admin/orders?status=${statusFilter}&limit=50`)
      setOrders(data.orders)
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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status })
      showMessage('Order status updated!')
      fetchOrders()
    } catch (error) {
      showMessage('Failed to update status', 'error')
    }
  }

  const statusColors = {
    placed: 'bg-yellow-100 text-yellow-600',
    confirmed: 'bg-purple-100 text-purple-600',
    shipped: 'bg-blue-100 text-blue-600',
    outfordelivery: 'bg-orange-100 text-orange-600',
    delivered: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600'
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
          <Link to="/admin/products" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">← Store</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📦 Manage Orders</h1>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
          >
            <option value="">All Orders</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="outfordelivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg">No orders found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-mono text-sm font-bold text-gray-700">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.paymentMethod === 'cod' ? 'COD' : order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">👤 {order.user?.name} • {order.user?.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📍 {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    <p className="text-sm text-gray-500">
                      🕐 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                    <p className="text-pink-600 font-bold mt-1">₹{order.totalPrice}</p>
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image || 'https://placehold.co/50x50?text=No+Image'}
                        alt={item.name}
                        onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=No+Image' }}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500 font-medium">Update Status</p>
                    <select
                      value={order.orderStatus}
                      onChange={e => handleStatusUpdate(order._id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="outfordelivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders