import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { clearCart } from '../store/cartSlice'
import api from '../utils/api'

const Checkout = () => {
  const { user } = useSelector(state => state.auth)
  const { items, totalPrice, totalItems } = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  const deliveryPrice = totalPrice > 999 ? 0 : 99
  const finalTotal = totalPrice + deliveryPrice

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [user, items])

  const validateAddress = () => {
    const { fullName, phone, address: addr, city, state, pincode } = address
    if (!fullName || !phone || !addr || !city || !state || !pincode) {
      setError('Please fill in all address fields')
      return false
    }
    if (phone.length !== 10) {
      setError('Please enter a valid 10 digit phone number')
      return false
    }
    if (pincode.length !== 6) {
      setError('Please enter a valid 6 digit pincode')
      return false
    }
    setError('')
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return
    try {
      setLoading(true)
      setError('')
      if (paymentMethod === 'cod') {
        const { data } = await api.post('/api/orders', {
          shippingAddress: address,
          paymentMethod: 'cod'
        })
        dispatch(clearCart())
        navigate(`/orders/${data.order._id}`)
        return
      }
      const { data: razorpayData } = await api.post('/api/orders/razorpay', {
        amount: finalTotal
      })
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayData.order.amount,
        currency: 'INR',
        name: 'GlowCart',
        description: 'Beauty Products Purchase',
        order_id: razorpayData.order.id,
        handler: async (response) => {
          try {
            const { data: orderData } = await api.post('/api/orders', {
              shippingAddress: address,
              paymentMethod: 'razorpay'
            })
            await api.post('/api/orders/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.order._id
            })
            dispatch(clearCart())
            navigate(`/orders/${orderData.order._id}`)
          } catch (err) {
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone
        },
        theme: { color: '#ec4899' }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">GlowCart</Link>
        <Link to="/cart" className="text-sm text-gray-600 hover:text-pink-500">Back to Cart</Link>
      </div>

      {/* Steps indicator */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Delivery Address', 'Payment', 'Review Order'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-pink-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > i + 1 ? 'v' : i + 1}
              </div>
              <span className={`text-sm hidden md:block ${
                step === i + 1 ? 'text-pink-500 font-medium' : 'text-gray-400'
              }`}>
                {s}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200 hidden md:block"></div>}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Side */}
          <div className="flex-1">

            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Step 1 - Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Delivery Address</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={e => setAddress({...address, fullName: e.target.value})}
                        placeholder="Your full name"
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={e => setAddress({...address, phone: e.target.value})}
                        placeholder="10 digit number"
                        maxLength={10}
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                    <textarea
                      value={address.address}
                      onChange={e => setAddress({...address, address: e.target.value})}
                      placeholder="House no, Street, Area"
                      rows={2}
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={e => setAddress({...address, city: e.target.value})}
                        placeholder="City"
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">State</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={e => setAddress({...address, state: e.target.value})}
                        placeholder="State"
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Pincode</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={e => setAddress({...address, pincode: e.target.value})}
                        placeholder="6 digit"
                        maxLength={6}
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => { if (validateAddress()) setStep(2) }}
                    className="bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition mt-2"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Select Payment Method</h2>
                <div className="flex flex-col gap-3">

                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'razorpay'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'razorpay' ? 'border-pink-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'razorpay' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Pay Online</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        UPI, GPay, PhonePe, BHIM, Cards, Net Banking
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-lg">GPay</span>
                      <span className="text-xs bg-purple-50 text-purple-500 px-2 py-1 rounded-lg">PhonePe</span>
                      <span className="text-xs bg-orange-50 text-orange-500 px-2 py-1 rounded-lg">UPI</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'cod'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-pink-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-500 px-2 py-1 rounded-lg">COD</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Review Your Order</h2>

                <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                    <button onClick={() => setStep(1)} className="text-xs text-pink-500 hover:underline">
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{address.fullName} - {address.phone}</p>
                  <p className="text-sm text-gray-600">{address.address}, {address.city}</p>
                  <p className="text-sm text-gray-600">{address.state} - {address.pincode}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Payment Method</p>
                    <button onClick={() => setStep(2)} className="text-xs text-pink-500 hover:underline">
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  {items.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img
                        src={item.product?.images?.[0] || 'https://placehold.co/60x60?text=No+Image'}
                        alt={item.product?.name}
                        onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=No+Image' }}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-pink-600">Rs.{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Placing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>

              <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                      {item.product?.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-800">Rs.{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Rs.{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryPrice === 0 ? 'text-green-500' : ''}>
                    {deliveryPrice === 0 ? 'FREE' : `Rs.${deliveryPrice}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-pink-600">Rs.{finalTotal}</span>
                </div>
              </div>

              {deliveryPrice > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Add Rs.{999 - totalPrice} more for FREE delivery
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout