import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.skinType = req.body.skinType || user.skinType
    user.skinConcerns = req.body.skinConcerns || user.skinConcerns

    const updatedUser = await user.save()

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skinType: updatedUser.skinType,
        skinConcerns: updatedUser.skinConcerns
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PUT /api/users/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}