import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCart } from './store/cartSlice'
import { setWishlist } from './store/wishlistSlice'
import api from './utils/api'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import UserProfile from './pages/UserProfile'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import KoreanGuide from './pages/KoreanGuide'


function App() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      api.get('/api/cart')
        .then(({ data }) => {
          if (data.cart) dispatch(setCart(data.cart))
        })
        .catch(err => console.error('Cart error:', err))
      api.get('/api/wishlist')
        .then(({ data }) => {
          if (data.wishlist) dispatch(setWishlist(data.wishlist))
        })
        .catch(err => console.error('Wishlist error:', err))
    }
  }, [user])

  return (
    <Routes>
      <Route path="/" element={<Products />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/korean-guide" element={<KoreanGuide />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
     
    </Routes>
  )
}

export default App