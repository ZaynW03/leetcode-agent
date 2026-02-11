import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

// Get filtered questions from server
export async function getQuestions(config) {
  const response = await axios.post(`${API_BASE}/questions`, config)
  return response.data
}

export async function getQuestionRecords(questionIds) {
  const response = await axios.post(`${API_BASE}/questions/records`, { questionIds })
  return response.data.records || {}
}

export async function saveQuestionCache(question, geminiResult) {
  const response = await axios.post(`${API_BASE}/questions/cache`, { question, geminiResult })
  return response.data
}

export async function evaluateAnswer({ question, answer, language, mode }) {
  const response = await axios.post(`${API_BASE}/questions/evaluate`, {
    question,
    answer,
    language,
    mode,
  })
  return response.data
}

// Call Gemini API with question and config
export async function callGemini(params) {
  const response = await axios.post(`${API_BASE}/gemini`, params)
  return response.data
}
