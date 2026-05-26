import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/api'

const steps = [
  {
    step: 1,
    name: 'Oil Cleanser',
    duration: 60,
    icon: '🫧',
    color: 'bg-yellow-50 border-yellow-200',
    tagColor: 'bg-yellow-100 text-yellow-600',
    description: 'Start with an oil-based cleanser to dissolve sunscreen, makeup, and excess sebum. Apply on dry skin and massage gently.',
    tips: [
      'Use on completely dry skin',
      'Massage in circular motions for 60 seconds',
      'Emulsify with water before rinsing',
      'Best for removing waterproof products'
    ],
    category: 'cleanser'
  },
  {
    step: 2,
    name: 'Water Cleanser',
    duration: 60,
    icon: '💧',
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-600',
    description: 'Follow with a gentle water-based cleanser to remove any remaining impurities. This is the second step of double cleansing.',
    tips: [
      'Use lukewarm water — never hot',
      'Lather gently for 30-60 seconds',
      'Rinse thoroughly',
      'Pat dry — never rub'
    ],
    category: 'cleanser'
  },
  {
    step: 3,
    name: 'Exfoliator',
    duration: 45,
    icon: '✨',
    color: 'bg-orange-50 border-orange-200',
    tagColor: 'bg-orange-100 text-orange-600',
    description: 'Use 2-3 times a week only. Exfoliating removes dead skin cells and helps other products absorb better.',
    tips: [
      'Use only 2-3 times per week',
      'Choose AHA for dry skin, BHA for oily',
      'Skip if skin feels irritated',
      'Always follow with SPF next morning'
    ],
    category: 'exfoliator'
  },
  {
    step: 4,
    name: 'Toner',
    duration: 30,
    icon: '🌊',
    color: 'bg-cyan-50 border-cyan-200',
    tagColor: 'bg-cyan-100 text-cyan-600',
    description: 'Toners balance skin pH, remove last traces of cleanser, and prep skin to absorb the next layers better.',
    tips: [
      'Apply while skin is slightly damp',
      'Pat gently with hands — avoid cotton',
      'Layer 2-3 times for extra hydration',
      'Wait 30 seconds before next step'
    ],
    category: 'toner'
  },
  {
    step: 5,
    name: 'Essence',
    duration: 40,
    icon: '💎',
    color: 'bg-purple-50 border-purple-200',
    tagColor: 'bg-purple-100 text-purple-600',
    description: 'The heart of Korean skincare. Essences are lightweight and packed with active ingredients for deep hydration and skin repair.',
    tips: [
      'Warm between palms before applying',
      'Press gently into skin — no rubbing',
      'The most hydrating step',
      'COSRX Snail Mucin is a bestseller'
    ],
    category: 'essence'
  },
  {
    step: 6,
    name: 'Serum / Ampoule',
    duration: 60,
    icon: '⚗️',
    color: 'bg-pink-50 border-pink-200',
    tagColor: 'bg-pink-100 text-pink-600',
    description: 'Target specific skin concerns with concentrated serums. Use Vitamin C for brightening, Retinol for aging, Niacinamide for pores.',
    tips: [
      'Use targeted serum for your concern',
      'Apply 2-3 drops and press in',
      'Let absorb for 60 seconds',
      'Do not mix Vitamin C with Retinol'
    ],
    category: 'serum'
  },
  {
    step: 7,
    name: 'Sheet Mask',
    duration: 900,
    icon: '🎭',
    color: 'bg-green-50 border-green-200',
    tagColor: 'bg-green-100 text-green-600',
    description: 'Use 1-2 times per week for an intense hydration boost. Sheet masks are soaked in essence and deliver concentrated ingredients.',
    tips: [
      'Use 1-2 times per week only',
      'Leave on for exactly 15 minutes',
      'Do not leave on longer — it reverses',
      'Pat remaining essence into skin'
    ],
    category: 'mask'
  },
  {
    step: 8,
    name: 'Eye Cream',
    duration: 30,
    icon: '👁️',
    color: 'bg-indigo-50 border-indigo-200',
    tagColor: 'bg-indigo-100 text-indigo-600',
    description: 'The eye area is delicate and needs special care. Eye creams target dark circles, puffiness, and fine lines.',
    tips: [
      'Use ring finger — least pressure',
      'Tap gently around orbital bone',
      'Never drag or pull skin',
      'Apply before moisturizer'
    ],
    category: 'eyecream'
  },
  {
    step: 9,
    name: 'Moisturiser',
    duration: 30,
    icon: '🌸',
    color: 'bg-rose-50 border-rose-200',
    tagColor: 'bg-rose-100 text-rose-600',
    description: 'Lock in all previous layers with a moisturizer. It creates a protective barrier and prevents water loss from skin.',
    tips: [
      'Apply while skin is still slightly damp',
      'Press rather than rub for absorption',
      'Use lighter gel for oily skin',
      'Use rich cream for dry skin'
    ],
    category: 'moisturizer'
  },
  {
    step: 10,
    name: 'Sunscreen',
    duration: 30,
    icon: '☀️',
    color: 'bg-amber-50 border-amber-200',
    tagColor: 'bg-amber-100 text-amber-600',
    description: 'The most important step — MORNING ONLY. Sunscreen protects against UV damage, aging, and dark spots. Never skip!',
    tips: [
      'Morning routine ONLY',
      'Apply generously — 2 finger rule',
      'Reapply every 2 hours outdoors',
      'SPF 30 minimum, SPF 50 recommended'
    ],
    category: 'sunscreen'
  }
]

const KoreanGuide = () => {
  const { user } = useSelector(state => state.auth)
  const [activeStep, setActiveStep] = useState(0)
  const [products, setProducts] = useState({})
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(steps[0].duration)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const [routineType, setRoutineType] = useState('morning')
  const intervalRef = useRef(null)

  const currentStep = steps[activeStep]
  const circumference = 2 * Math.PI * 54

  useEffect(() => {
    fetchStepProducts(currentStep.category)
    setTimeLeft(currentStep.duration)
    setTimerActive(false)
    clearInterval(intervalRef.current)
  }, [activeStep])

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setTimerActive(false)
            playChime()
            if (!completedSteps.includes(activeStep)) {
              setCompletedSteps(prev => [...prev, activeStep])
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerActive])

  const fetchStepProducts = async (category) => {
    if (products[category]) return
    try {
      const { data } = await api.get(`/api/products?category=${category}&limit=4`)
      setProducts(prev => ({ ...prev, [category]: data.products }))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const playChime = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)
    } catch (e) {}
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`
  }

  const progressPct = timeLeft / currentStep.duration
  const strokeDashoffset = circumference * (1 - progressPct)
  const strokeColor = progressPct > 0.5 ? '#ec4899' : progressPct > 0.2 ? '#f59e0b' : '#ef4444'

  const handleStartPause = () => {
    if (!sessionStarted) setSessionStarted(true)
    setTimerActive(prev => !prev)
  }

  const handleSkip = () => {
    clearInterval(intervalRef.current)
    setTimerActive(false)
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    clearInterval(intervalRef.current)
    setTimerActive(false)
    setTimeLeft(currentStep.duration)
  }

  const visibleSteps = routineType === 'morning'
    ? steps
    : steps.filter(s => s.step !== 10)

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-pink-500">✨ GlowCart</Link>
        <div className="flex gap-3 items-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-pink-500">Products</Link>
          {user && (
            <Link to="/routine" className="text-sm text-gray-600 hover:text-pink-500">My Routine</Link>
          )}
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

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🌸 Korean Skincare Guide</h1>
          <p className="text-gray-500">The famous 10-step K-beauty routine for glowing skin</p>

          {/* Routine type toggle */}
          <div className="flex gap-2 justify-center mt-4">
            {['morning', 'night'].map(type => (
              <button
                key={type}
                onClick={() => setRoutineType(type)}
                className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition ${
                  routineType === type
                    ? 'bg-pink-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-pink-300'
                }`}
              >
                {type === 'morning' ? '☀️' : '🌙'} {type} Routine
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">{completedSteps.length} of {visibleSteps.length} steps done</p>
            <p className="text-sm text-pink-500 font-medium">
              {Math.round(completedSteps.length / visibleSteps.length * 100)}% complete
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${completedSteps.length / visibleSteps.length * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Steps list */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Steps</h2>
              <div className="flex flex-col gap-1">
                {visibleSteps.map((s, i) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(steps.indexOf(s))}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      activeStep === steps.indexOf(s)
                        ? 'bg-pink-500 text-white'
                        : completedSteps.includes(steps.indexOf(s))
                        ? 'bg-green-50 text-green-600'
                        : 'hover:bg-pink-50 text-gray-600'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      activeStep === steps.indexOf(s) ? 'bg-white text-pink-500' :
                      completedSteps.includes(steps.indexOf(s)) ? 'bg-green-500 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {completedSteps.includes(steps.indexOf(s)) ? '✓' : s.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className={`text-xs ${activeStep === steps.indexOf(s) ? 'text-pink-100' : 'text-gray-400'}`}>
                        {s.duration >= 60 ? `${Math.floor(s.duration/60)} min` : `${s.duration}s`}
                      </p>
                    </div>
                    <span className="text-base">{s.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Step detail */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Step card */}
            <div className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${currentStep.color}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentStep.tagColor}`}>
                      Step {currentStep.step}
                    </span>
                    {currentStep.step === 10 && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                        Morning Only
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentStep.icon} {currentStep.name}
                  </h2>
                </div>
                <span className="text-4xl">{currentStep.icon}</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">{currentStep.description}</p>

              {/* Tips */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 Pro Tips</p>
                <ul className="flex flex-col gap-1">
                  {currentStep.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timer */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-gray-600">Step Timer</p>

                {/* Ring */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute top-0 left-0 -rotate-90" width="128" height="128">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                    <circle
                      cx="64" cy="64" r="54"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <div className="text-center z-10">
                    <p className="text-2xl font-bold text-gray-800">{formatTime(timeLeft)}</p>
                    <p className="text-xs text-gray-400">
                      {timerActive ? 'running' : timeLeft === 0 ? 'done! ✅' : 'tap start'}
                    </p>
                  </div>
                </div>

                {/* Timer buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleStartPause}
                    className="bg-pink-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition"
                  >
                    {timerActive ? '⏸ Pause' : timeLeft === 0 ? '✅ Done' : '▶ Start'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    🔄 Reset
                  </button>
                  {activeStep < steps.length - 1 && (
                    <button
                      onClick={handleSkip}
                      className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
                    >
                      ⏭ Skip
                    </button>
                  )}
                </div>

                {/* Next step button */}
                {timeLeft === 0 && activeStep < steps.length - 1 && (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="w-full bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition"
                  >
                    Next: {steps[activeStep + 1].name} →
                  </button>
                )}
              </div>
            </div>

            {/* Product recommendations */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                🛍️ Recommended Products for {currentStep.name}
              </h3>
              {products[currentStep.category] ? (
                products[currentStep.category].length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {products[currentStep.category].map(product => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition"
                      >
                        <img
                          src={product.images?.[0] || 'https://placehold.co/200x200?text=No+Image'}
                          alt={product.name}
                          onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image' }}
                          className="w-full h-28 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs text-pink-400 font-medium">{product.brand}</p>
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 mt-0.5">{product.name}</p>
                          <p className="text-xs text-pink-600 font-bold mt-1">₹{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No products found for this step</p>
                )
              ) : (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KoreanGuide