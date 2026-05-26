import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'User routes working' })
})

export default router