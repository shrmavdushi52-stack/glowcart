import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/admin/dashboard')
      setStats(data.stats)
      setRecentOrders(data.recentOrders)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Admin Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
          <span className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">
            Admin Panel
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/products" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          <Link to="/admin/orders" className="text-sm text-gray-600 hover:text-pink-500">Orders</Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">← Back to Store</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats?.totalProducts, icon: '🧴', color: 'bg-pink-50 text-pink-600' },
            { label: 'Total Orders', value: stats?.totalOrders, icon: '📦', color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'bg-green-50 text-green-600' },
            { label: 'Out of Stock', value: stats?.outOfStockProducts, icon: '❌', color: 'bg-red-50 text-red-600' },
            { label: 'Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-2xl p-4`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/products"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <span className="text-3xl">🧴</span>
            <div>
              <p className="font-bold text-gray-800">Manage Products</p>
              <p className="text-sm text-gray-500">Add, edit, delete products</p>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="font-bold text-gray-800">Manage Orders</p>
              <p className="text-sm text-gray-500">View and update orders</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <span className="text-3xl">👥</span>
            <div>
              <p className="font-bold text-gray-800">Total Users</p>
              <p className="text-sm text-gray-500">{stats?.totalUsers} registered</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-pink-500 hover:underline">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Order ID</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Customer</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Payment</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-600 font-mono text-xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 text-gray-800">{order.user?.name}</td>
                      <td className="py-3 text-pink-600 font-medium">₹{order.totalPrice}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' :
                          order.orderStatus === 'confirmed' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard