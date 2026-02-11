import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

// Get filtered questions from server
export async function getQuestions(config) {
  const response = await axios.post(`${API_BASE}/questions`, config)
  return response.data
}

// Call Gemini API with question and config
export async function callGemini(params) {
  const response = await axios.post(`${API_BASE}/gemini`, params)
  return response.data
}
