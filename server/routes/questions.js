import express from 'express'
import { filterQuestions } from '../utils/questionFilter.js'
import { callPythonGemini } from '../utils/geminiClient.js'
import {
  getQuestionRecordsMap,
  markAttempt,
  markQuestionPassed,
  saveGeminiResult,
  upsertQuestionRecord,
} from '../utils/questionRecords.js'

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

// POST /api/questions/records - Get existing local records for questions
router.post('/records', (req, res) => {
  try {
    const { questionIds } = req.body
    if (!Array.isArray(questionIds)) {
      return res.status(400).json({ error: 'questionIds must be an array' })
    }
    const records = getQuestionRecordsMap(questionIds)
    res.json({ records })
  } catch (error) {
    console.error('Error fetching question records:', error)
    res.status(500).json({ error: 'Failed to fetch question records' })
  }
})

// POST /api/questions/cache - Save gemini generation result to local record
router.post('/cache', (req, res) => {
  try {
    const { question, geminiResult } = req.body
    if (!question?.id) {
      return res.status(400).json({ error: 'question is required' })
    }
    const record = saveGeminiResult(question, geminiResult)
    res.json({ success: true, record })
  } catch (error) {
    console.error('Error caching gemini result:', error)
    res.status(500).json({ error: 'Failed to cache gemini result' })
  }
})

// POST /api/questions/evaluate - Evaluate uploaded answer and persist progress/review state
router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, language, mode } = req.body
    if (!question?.id || !question?.title) {
      return res.status(400).json({ error: 'question(id/title) is required' })
    }

    const feature = `
Task: Evaluate submitted code quality and correctness.
Question: ${question.title}
Difficulty: ${question.difficulty}
Category: ${question.category}
Language: ${language}
Mode: ${mode}
`.trim()

    const judgeQuery = `
Problem: ${question.title}
Submitted code:
${answer || ''}
`.trim()

    const judgeResult = await callPythonGemini({
      query: judgeQuery,
      feature,
      task: 'judge',
    })

    const analysis = judgeResult?.data || {}
    const runnable = Boolean(analysis.runnable)

    const record = runnable
      ? markQuestionPassed(question, answer || '', analysis)
      : markAttempt(question, answer || '', analysis)

    res.json({
      success: true,
      analysis,
      record,
    })
  } catch (error) {
    console.error('Error evaluating answer:', error)
    res.status(500).json({
      error: 'Failed to evaluate answer',
      details: error.message,
    })
  }
})

// Backward compatible endpoint from previous version.
router.post('/complete', (req, res) => {
  try {
    const { questionId } = req.body
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' })
    }
    const record = upsertQuestionRecord({ id: questionId, title: '', difficulty: '', category: '' }, {})
    res.json({ success: true, questionId, record })
  } catch (error) {
    console.error('Error marking question complete:', error)
    res.status(500).json({ error: 'Failed to mark question complete' })
  }
})

export default router

