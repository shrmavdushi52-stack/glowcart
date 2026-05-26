import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginSuccess, logout } from '../store/authSlice'
import axios from 'axios'

const UserProfile = () => {
  const { user, token } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    skinType: user?.skinType || '',
    skinConcerns: user?.skinConcerns || [],
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const skinConcernOptions = [
    'acne', 'aging', 'brightening',
    'hydration', 'pores', 'darkspots',
    'redness', 'firmness'
  ]

  const toggleConcern = (concern) => {
    const current = formData.skinConcerns
    if (current.includes(concern)) {
      setFormData({...formData, skinConcerns: current.filter(c => c !== concern)})
    } else {
      setFormData({...formData, skinConcerns: [...current, concern]})
    }
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await axios.put(
        '/api/users/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      dispatch(loginSuccess({ user: data.user, token }))
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match')
    }
    if (passwordData.newPassword.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    try {
      setLoading(true)
      setError('')
      await axios.put(
        '/api/users/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your profile</p>
          <Link to="/login" className="bg-pink-500 text-white px-6 py-2 rounded-full">
            Login
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
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-400 px-4 py-1.5 rounded-full hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-3xl font-bold text-pink-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="flex gap-2 mt-2">
              {user.skinType && (
                <span className="text-xs bg-pink-50 text-pink-500 px-3 py-1 rounded-full border border-pink-200">
                  {user.skinType} skin
                </span>
              )}
              <span className="text-xs bg-purple-50 text-purple-500 px-3 py-1 rounded-full border border-purple-200">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Success / Error messages */}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm border border-green-200">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm border border-red-200">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm">
          {['profile', 'skin', 'password', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm rounded-xl capitalize transition font-medium ${
                activeTab === tab
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-500 hover:bg-pink-50'
              }`}
            >
              {tab === 'skin' ? 'Skin Profile' : tab}
            </button>
          ))}
        </div>

        {/* TAB: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Personal Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                  />
                ) : (
                  <p className="mt-1 text-gray-800 font-medium">{user.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                  />
                ) : (
                  <p className="mt-1 text-gray-800 font-medium">{user.email}</p>
                )}
              </div>

              {editing && (
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-pink-500 text-white py-2 rounded-xl font-medium hover:bg-pink-600 transition disabled:opacity-50 mt-2"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB: Skin Profile */}
        {activeTab === 'skin' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Your Skin Profile</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tell us about your skin so we can recommend the best products for you.
            </p>

            {/* Skin Type */}
            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                Skin Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['dry', 'oily', 'combination', 'sensitive', 'normal'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, skinType: type})}
                    className={`px-4 py-2 rounded-full text-sm capitalize border transition ${
                      formData.skinType === type
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-200 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Concerns */}
            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                Skin Concerns (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {skinConcernOptions.map(concern => (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={`px-4 py-2 rounded-full text-sm capitalize border transition ${
                      formData.skinConcerns.includes(concern)
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-pink-500 text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Skin Profile'}
            </button>
          </div>
        )}

        {/* TAB: Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Change Password</h2>
            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Repeat new password"
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="bg-pink-500 text-white py-2 rounded-xl font-medium hover:bg-pink-600 transition disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">My Orders</h2>
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm mt-2">Start shopping to see your orders here</p>
              <Link
                to="/"
                className="inline-block mt-4 bg-pink-500 text-white px-6 py-2 rounded-full text-sm hover:bg-pink-600 transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default UserProfile