import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if all fields provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create new user
    const user = await User.create({ name, email, password })

    // Send response with token
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if fields provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Send response with token
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skinType: user.skinType,
        skinConcerns: user.skinConcerns
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
}