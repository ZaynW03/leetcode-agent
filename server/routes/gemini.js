import express from 'express'
import { callPythonGemini } from '../utils/geminiClient.js'

const router = express.Router()

// POST /api/gemini - Generate explanation/code content
router.post('/', async (req, res) => {
  try {
    const { query, mode, language, answer, module } = req.body

    const feature = `
Language: ${language}
Mode: ${mode}
Add both Chinese (zh) and English (en) versions in your response.
Writing style: clear, direct, step-by-step, avoid fluff.
Module refresh target: ${module || 'full'}
User's answer (if any): ${answer || 'Not provided'}
`.trim()

    const result = await callPythonGemini({
      query,
      feature,
      module,
      task: 'generate',
    })

    res.json(result)
  } catch (error) {
    console.error('Error calling Gemini:', error)
    res.status(500).json({
      error: 'Failed to call Gemini API',
      details: error.message,
    })
  }
})

export default router

