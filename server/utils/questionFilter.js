import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

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
  const { strategy, quantity, language } = config

  let filtered = [...allQuestions]

  // Sort by difficulty based on strategy
  if (strategy === 'easyToHard') {
    const order = { Easy: 1, Medium: 2, Hard: 3 }
    filtered.sort((a, b) => (order[a.difficulty] || 0) - (order[b.difficulty] || 0))
  } else if (strategy === 'alternate') {
    // Alternate between easy and hard
    const easy = filtered.filter((q) => q.difficulty === 'Easy')
    const medium = filtered.filter((q) => q.difficulty === 'Medium')
    const hard = filtered.filter((q) => q.difficulty === 'Hard')

    filtered = []
    for (let i = 0; i < Math.max(easy.length, hard.length); i++) {
      if (i < easy.length) filtered.push(easy[i])
      if (i < hard.length) filtered.push(hard[i])
    }
  }

  // Limit quantity
  return filtered.slice(0, Math.min(quantity || 1, 10))
}
