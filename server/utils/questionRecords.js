import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')
const recordsFilePath = join(projectRoot, 'server', 'data', 'question-records.json')

function ensureRecordsFile() {
  const dir = dirname(recordsFilePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  if (!existsSync(recordsFilePath)) {
    writeFileSync(recordsFilePath, JSON.stringify({ records: {} }, null, 2), 'utf-8')
  }
}

function nowIso() {
  return new Date().toISOString()
}

export function loadQuestionRecords() {
  try {
    ensureRecordsFile()
    const raw = readFileSync(recordsFilePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return { records: parsed.records || {} }
  } catch (error) {
    console.error('Error loading question records:', error)
    return { records: {} }
  }
}

export function saveQuestionRecords(data) {
  ensureRecordsFile()
  writeFileSync(recordsFilePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function getQuestionRecord(questionId) {
  const all = loadQuestionRecords()
  return all.records[String(questionId)] || null
}

export function getQuestionRecordsMap(questionIds = []) {
  const all = loadQuestionRecords()
  const map = {}
  questionIds.forEach((id) => {
    const key = String(id)
    if (all.records[key]) map[key] = all.records[key]
  })
  return map
}

export function upsertQuestionRecord(question, patch = {}) {
  const all = loadQuestionRecords()
  const key = String(question.id)
  const current = all.records[key] || {
    questionId: question.id,
    title: question.title,
    difficulty: question.difficulty,
    category: question.category,
    geminiResult: null,
    answer: '',
    answerAnalysis: null,
    completed: false,
    firstPassedAt: null,
    completedAt: null,
    review: {
      reviewedCount: 0,
      lastReviewedAt: null,
      needsReview: false,
    },
    updatedAt: null,
  }

  const merged = {
    ...current,
    ...patch,
    review: {
      ...current.review,
      ...(patch.review || {}),
    },
    updatedAt: nowIso(),
  }

  all.records[key] = merged
  saveQuestionRecords(all)
  return merged
}

export function markQuestionPassed(question, answer, answerAnalysis) {
  const current = getQuestionRecord(question.id) || {}
  const alreadyCompleted = Boolean(current.completed)
  const timestamp = nowIso()

  if (!alreadyCompleted) {
    return upsertQuestionRecord(question, {
      answer,
      answerAnalysis,
      completed: true,
      firstPassedAt: timestamp,
      completedAt: timestamp,
      review: {
        needsReview: true,
      },
    })
  }

  return upsertQuestionRecord(question, {
    answer,
    answerAnalysis,
    completed: true,
    review: {
      reviewedCount: (current.review?.reviewedCount || 0) + 1,
      lastReviewedAt: timestamp,
      needsReview: false,
    },
  })
}

export function markAttempt(question, answer, answerAnalysis) {
  return upsertQuestionRecord(question, {
    answer,
    answerAnalysis,
  })
}

export function saveGeminiResult(question, geminiResult) {
  return upsertQuestionRecord(question, {
    geminiResult,
  })
}

