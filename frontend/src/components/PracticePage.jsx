import { useState, useEffect, useRef } from 'react'
import { getQuestions, callGemini } from '../utils/api'
import { splitBilingualContent } from '../utils/bilingualHelper'
import CodeEditor from './CodeEditor'

const labels = {
  zh: {
    back: '返回',
    loading: '加载中...',
    error: '错误',
    submit: '提交',
    thinking: '思考中...',
  },
  en: {
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    submit: 'Submit',
    thinking: 'Thinking...',
  },
}

export default function PracticePage({ config, onBack, lang }) {
  const t = labels[lang]
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [geminiResults, setGeminiResults] = useState({})
  const [loadingGemini, setLoadingGemini] = useState({})
  const [geminiErrors, setGeminiErrors] = useState({})

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const qs = await getQuestions(config)
        setQuestions(qs)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    loadQuestions()
  }, [config])

  // Auto-fetch Gemini analysis for the first question when questions load
  useEffect(() => {
    if (questions.length > 0 && !geminiResults[0]) {
      const autoFetchFirstQuestion = async () => {
        setLoadingGemini((prev) => ({
          ...prev,
          0: true,
        }))

        try {
          const result = await callGemini({
            query: questions[0].title,
            mode: config.mode,
            language: config.language,
            answer: '',
            lang,
          })
          setGeminiErrors((prev) => ({
            ...prev,
            0: null,
          }))
          setGeminiResults((prev) => ({
            ...prev,
            0: result,
          }))
        } catch (err) {
          console.error('Error fetching first question:', err)
          setGeminiErrors((prev) => ({
            ...prev,
            0: err?.response?.data?.details || err?.response?.data?.error || err.message,
          }))
        } finally {
          setLoadingGemini((prev) => ({
            ...prev,
            0: false,
          }))
        }
      }
      autoFetchFirstQuestion()
    }
  }, [questions, config, lang])

  const currentQuestion = questions[currentIndex]

  const handleCodeChange = (code) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: code,
    }))
  }

  const handleSubmit = async () => {
    if (!currentQuestion) return

    setLoadingGemini((prev) => ({
      ...prev,
      [currentIndex]: true,
    }))

    try {
      const result = await callGemini({
        query: currentQuestion.title,
        mode: config.mode,
        language: config.language,
        answer: answers[currentIndex] || '',
        lang,
      })
      setGeminiErrors((prev) => ({
        ...prev,
        [currentIndex]: null,
      }))
      setGeminiResults((prev) => ({
        ...prev,
        [currentIndex]: result,
      }))
    } catch (err) {
      setGeminiErrors((prev) => ({
        ...prev,
        [currentIndex]: err?.response?.data?.details || err?.response?.data?.error || err.message,
      }))
    } finally {
      setLoadingGemini((prev) => ({
        ...prev,
        [currentIndex]: false,
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">{t.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{t.error}: {error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        {t.back}
      </button>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-80px)]">
        {/* Left: Problem Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentQuestion.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Difficulty: {currentQuestion.difficulty} | {currentQuestion.category}
            </p>
          </div>

          {/* Display Gemini Results */}
          {geminiResults[currentIndex] && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {splitBilingualContent(geminiResults[currentIndex].data?.title, lang)}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {splitBilingualContent(geminiResults[currentIndex].data?.subtitle, lang)}
                </p>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap leading-relaxed text-sm">
                  {splitBilingualContent(geminiResults[currentIndex].data?.content, lang)}
                </p>
              </div>

              {config.mode === 'solving' && (
                <div>
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">
                    {lang === 'zh' ? '参考解法' : 'Reference Solution'}
                  </h4>
                  <pre className="bg-gray-900 text-white p-3 rounded mt-2 overflow-x-auto text-xs font-mono">
                    <code>{geminiResults[currentIndex].data?.code}</code>
                  </pre>
                </div>
              )}

              {config.mode === 'optimization' && (
                <div>
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">
                    {lang === 'zh' ? '优化方案' : 'Optimized Solution'}
                  </h4>
                  <pre className="bg-gray-900 text-white p-3 rounded mt-2 overflow-x-auto text-xs font-mono">
                    <code>{geminiResults[currentIndex].data?.code}</code>
                  </pre>
                </div>
              )}

              {geminiResults[currentIndex].data?.tags && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {geminiResults[currentIndex].data.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {loadingGemini[currentIndex] && (
            <p className="text-blue-600 font-semibold">{t.thinking}</p>
          )}

          {geminiErrors[currentIndex] && !loadingGemini[currentIndex] && (
            <p className="text-red-600 whitespace-pre-wrap text-sm">
              {geminiErrors[currentIndex]}
            </p>
          )}

          {!geminiResults[currentIndex] && !loadingGemini[currentIndex] && !geminiErrors[currentIndex] && (
            <p className="text-gray-500">Submit answer to see analysis</p>
          )}
        </div>

        {/* Right: Code Editor */}
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <CodeEditor
              code={answers[currentIndex] || ''}
              onChange={handleCodeChange}
              language={config.language}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loadingGemini[currentIndex]}
            className="mt-4 w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingGemini[currentIndex] ? t.thinking : t.submit}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex justify-between items-center px-4">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <p className="text-gray-700 font-semibold">
          {currentIndex + 1} / {questions.length}
        </p>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}
