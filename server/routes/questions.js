import express from 'express'
import { filterQuestions } from '../utils/questionFilter.js'

const router = express.Router()

// POST /api/questions - Get filtered questions
router.post('/', (req, res) => {
  try {
    const config = req.body
    const questions = filterQuestions(config)
    res.json(questions)
  } catch (error) {
    console.error('Error filtering questions:', error)
    res.status(500).json({ error: 'Failed to filter questions' })
  }
})

export default router
