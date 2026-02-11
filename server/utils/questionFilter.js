import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getQuestionRecord } from './questionRecords.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

// Load LeetCode questions from JSON
function loadQuestions() {
  try {
    const filePath = join(projectRoot, 'leetcode_hot100_full.json')
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error loading questions:', err)
    return []
  }
}

// Filter questions based on config
export function filterQuestions(config) {
  const allQuestions = loadQuestions()
  const { strategy, quantity, studyMode = 'learn' } = config

  let filtered = [...allQuestions]

  // Sort by difficulty based on strategy
  if (strategy === 'easyToHard') {
    const order = { Easy: 1, Medium: 2, Hard: 3 }
    filtered.sort((a, b) => (order[a.difficulty] || 0) - (order[b.difficulty] || 0))
  } else if (strategy === 'alternate') {
    // Alternate between easy and hard
    const easy = filtered.filter((q) => q.difficulty === 'Easy')
    const hard = filtered.filter((q) => q.difficulty === 'Hard')

    filtered = []
    for (let i = 0; i < Math.max(easy.length, hard.length); i++) {
      if (i < easy.length) filtered.push(easy[i])
      if (i < hard.length) filtered.push(hard[i])
    }
  }

  const maxCount = Math.min(quantity || 1, 10)
  const unseen = filtered.filter((q) => !getQuestionRecord(q.id)?.completed)

  if (studyMode === 'learn') {
    if (unseen.length >= maxCount) {
      return unseen.slice(0, maxCount).map((q) => ({ ...q, isReview: false }))
    }

    const seenByOldest = filtered
      .filter((q) => getQuestionRecord(q.id)?.completed)
      .sort((a, b) => {
        const aTime = new Date(getQuestionRecord(a.id)?.completedAt || 0).getTime()
        const bTime = new Date(getQuestionRecord(b.id)?.completedAt || 0).getTime()
        return aTime - bTime
      })
      .map((q) => ({ ...q, isReview: true }))

    return [
      ...unseen.map((q) => ({ ...q, isReview: false })),
      ...seenByOldest,
    ].slice(0, maxCount)
  }

  // learn+review: finish new questions first, then add completed-but-unreviewed questions.
  const reviewCandidates = filtered
    .filter((q) => {
      const record = getQuestionRecord(q.id)
      return record?.completed && record?.review?.needsReview
    })
    .sort((a, b) => {
      const aTime = new Date(getQuestionRecord(a.id)?.completedAt || 0).getTime()
      const bTime = new Date(getQuestionRecord(b.id)?.completedAt || 0).getTime()
      return aTime - bTime
    })
    .map((q) => ({ ...q, isReview: true }))

  return [
    ...unseen.map((q) => ({ ...q, isReview: false })),
    ...reviewCandidates,
  ].slice(0, maxCount)
}
