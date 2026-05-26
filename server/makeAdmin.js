import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Show all users first
    const users = await User.find({}).select('name email role')
    console.log('All users:')
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.role}`))

    // Make first user admin
    if (users.length > 0) {
      const updated = await User.findByIdAndUpdate(
        users[0]._id,
        { role: 'admin' },
        { new: true }
      )
      console.log(`\n✅ Admin set: ${updated.name} | ${updated.email} | ${updated.role}`)
    }

    process.exit()
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

makeAdmin()