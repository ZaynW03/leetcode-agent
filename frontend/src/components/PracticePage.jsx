import { useState, useEffect, useRef } from 'react'
import {
  getQuestions,
  callGemini,
  getQuestionRecords,
  saveQuestionCache,
  evaluateAnswer,
} from '../utils/api'
import { splitBilingualContent } from '../utils/bilingualHelper'
import CodeEditor from './CodeEditor'
import MonacoViewer from './MonacoViewer'

const labels = {
  zh: {
    back: '\u8fd4\u56de',
    loading: '\u52a0\u8f7d\u4e2d...',
    error: '\u9519\u8bef',
    submit: '\u63d0\u4ea4\u7b54\u6848\u5e76\u5224\u9898',
    thinking: '\u6b63\u5728\u751f\u6210...',
    evaluating: '\u6b63\u5728\u5224\u9898...',
    previous: '\u4e0a\u4e00\u9898',
    next: '\u4e0b\u4e00\u9898',
    pending: '\u8fd9\u9898\u8fd8\u672a\u751f\u6210\u7ed3\u679c',
    reference: '\u89e3\u9898\u4ee3\u7801',
    optimized: '\u4f18\u5316\u65b9\u6848',
    difficulty: '\u96be\u5ea6',
    explanation: '\u9898\u89e3\u89e3\u91ca',
    resetExplanation: '\u91cd\u751f\u9898\u89e3',
    resetCode: '\u91cd\u751f\u4ee3\u7801',
    explanationTop: '\u9898\u89e3\u5728\u4e0a',
    codeTop: '\u4ee3\u7801\u5728\u4e0a',
    showCode: '\u663e\u793a\u4ee3\u7801\u89e3\u6790',
    hideCode: '\u9690\u85cf\u4ee3\u7801\u89e3\u6790',
    prefetching: '\u6b63\u5728\u4e3a\u6240\u6709\u9898\u76ee\u751f\u6210\u5185\u5bb9...',
    evaluation: '\u5224\u9898\u7ed3\u679c',
    runnable: '\u53ef\u8fd0\u884c',
    ideaCorrect: '\u601d\u8def\u6b63\u786e',
    complexityScore: '\u590d\u6742\u5ea6\u7b49\u7ea7',
    summary: '\u603b\u7ed3',
    suggestions: '\u4fee\u6539\u5efa\u8bae',
    issues: '\u95ee\u9898\u70b9',
    fixedCode: '\u5efa\u8bae\u4fee\u6b63\u4ee3\u7801',
    completed: '\u5b8c\u6210',
    firstPassedAt: '\u9996\u6b21\u901a\u8fc7',
    reviewStatus: '\u590d\u4e60\u72b6\u6001',
    needReview: '\u5f85\u590d\u4e60',
    reviewed: '\u5df2\u590d\u4e60',
  },
  en: {
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    submit: 'Submit & Evaluate',
    thinking: 'Generating...',
    evaluating: 'Evaluating...',
    previous: 'Previous',
    next: 'Next',
    pending: 'This question has not been generated yet.',
    reference: 'Solution Code',
    optimized: 'Optimized Solution',
    difficulty: 'Difficulty',
    explanation: 'Explanation',
    resetExplanation: 'Reset Explanation',
    resetCode: 'Reset Code',
    explanationTop: 'Explanation First',
    codeTop: 'Code First',
    showCode: 'Show Code Analysis',
    hideCode: 'Hide Code Analysis',
    prefetching: 'Generating content for all selected questions...',
    evaluation: 'Evaluation',
    runnable: 'Runnable',
    ideaCorrect: 'Idea Correct',
    complexityScore: 'Complexity Score',
    summary: 'Summary',
    suggestions: 'Suggestions',
    issues: 'Issues',
    fixedCode: 'Suggested Fixed Code',
    completed: 'Completed',
    firstPassedAt: 'First Passed At',
    reviewStatus: 'Review Status',
    needReview: 'Need Review',
    reviewed: 'Reviewed',
  },
}

function mergeModuleData(previousResult, newResult, module) {
  const prevData = previousResult?.data || {}
  const nextData = newResult?.data || {}
  const mergedData = { ...prevData }
  const prevLocalized = prevData.localized || {}
  const nextLocalized = nextData.localized || {}

  if (module === 'content') {
    mergedData.title = nextData.title || prevData.title
    mergedData.subtitle = nextData.subtitle || prevData.subtitle
    mergedData.content = nextData.content || prevData.content
    mergedData.tags = nextData.tags || prevData.tags
    mergedData.localized = {
      zh: {
        ...(prevLocalized.zh || {}),
        ...(nextLocalized.zh || {}),
      },
      en: {
        ...(prevLocalized.en || {}),
        ...(nextLocalized.en || {}),
      },
    }
  } else if (module === 'code') {
    mergedData.code = nextData.code || prevData.code
  } else {
    return newResult || previousResult
  }

  return {
    ...(previousResult || {}),
    ...(newResult || {}),
    data: mergedData,
  }
}

function formatDate(iso, lang) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return iso
  }
}

function localizedField(data, field, lang) {
  const value = data?.localized?.[lang]?.[field]
  if (value && String(value).trim()) return String(value)
  return splitBilingualContent(data?.[field], lang)
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
  const [answerAnalyses, setAnswerAnalyses] = useState({})
  const [recordsById, setRecordsById] = useState({})
  const [indicesToGenerate, setIndicesToGenerate] = useState([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showCodeAnalysis, setShowCodeAnalysis] = useState(false)
  const [leftCodeOnTop, setLeftCodeOnTop] = useState(false)
  const [leftPanePercent, setLeftPanePercent] = useState(52)
  const [isResizing, setIsResizing] = useState(false)
  const layoutRef = useRef(null)

  useEffect(() => {
    const loadQuestionsAndRecords = async () => {
      try {
        const qs = await getQuestions(config)
        const ids = qs.map((q) => q.id)
        const records = ids.length > 0 ? await getQuestionRecords(ids) : {}

        const nextAnswers = {}
        const nextGeminiResults = {}
        const nextAnalyses = {}
        const missing = []

        qs.forEach((q, idx) => {
          const record = records[String(q.id)]
          if (record?.answer) nextAnswers[idx] = record.answer
          if (record?.geminiResult) nextGeminiResults[idx] = record.geminiResult
          if (record?.answerAnalysis) nextAnalyses[idx] = record.answerAnalysis
          if (!record?.geminiResult) missing.push(idx)
        })

        setQuestions(qs)
        setCurrentIndex(0)
        setAnswers(nextAnswers)
        setGeminiResults(nextGeminiResults)
        setAnswerAnalyses(nextAnalyses)
        setRecordsById(records)
        setLoadingGemini({})
        setGeminiErrors({})
        setIndicesToGenerate(missing)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadQuestionsAndRecords()
  }, [config])

  useEffect(() => {
    if (indicesToGenerate.length === 0) return

    let cancelled = false
    const generateMissing = async () => {
      for (const idx of indicesToGenerate) {
        if (cancelled) return
        const q = questions[idx]
        if (!q) continue

        setLoadingGemini((prev) => ({ ...prev, [idx]: true }))
        try {
          const result = await callGemini({
            query: q.title,
            mode: config.mode,
            language: config.language,
            answer: '',
            lang,
          })

          if (!cancelled) {
            setGeminiResults((prev) => ({ ...prev, [idx]: result }))
            setGeminiErrors((prev) => ({ ...prev, [idx]: null }))
            await saveQuestionCache(q, result)
          }
        } catch (err) {
          if (!cancelled) {
            setGeminiErrors((prev) => ({
              ...prev,
              [idx]: err?.response?.data?.details || err?.response?.data?.error || err.message,
            }))
          }
        } finally {
          if (!cancelled) setLoadingGemini((prev) => ({ ...prev, [idx]: false }))
        }
      }

      if (!cancelled) setIndicesToGenerate([])
    }

    generateMissing()
    return () => {
      cancelled = true
    }
  }, [indicesToGenerate, questions, config.mode, config.language, lang])

  const currentQuestion = questions[currentIndex]
  const currentRecord = currentQuestion ? recordsById[String(currentQuestion.id)] : null
  const currentAnalysis = answerAnalyses[currentIndex]

  useEffect(() => {
    setShowCodeAnalysis(false)
  }, [currentIndex])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event) => {
      const root = layoutRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      if (rect.width <= 0) return

      const raw = ((event.clientX - rect.left) / rect.width) * 100
      const clamped = Math.max(32, Math.min(68, raw))
      setLeftPanePercent(clamped)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const renderExplanationSection = () => (
    <div className="module-outline rounded-[6px] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-semibold text-neutral-100">{t.explanation}</h4>
        <button
          onClick={() => handleResetModule('content')}
          disabled={loadingGemini[currentIndex]}
          title={t.resetExplanation}
          aria-label={t.resetExplanation}
          className="ghost-btn inline-flex h-8 w-8 items-center justify-center rounded-full text-sm disabled:opacity-50"
        >
          {'\u21ba'}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
        {localizedField(geminiResults[currentIndex].data, 'content', lang)}
      </p>
    </div>
  )

  const renderCodeSection = () => (
    <div className="module-outline rounded-[6px] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-semibold text-neutral-100">
          {config.mode === 'optimization' ? t.optimized : t.reference}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeAnalysis((v) => !v)}
            className="ghost-btn rounded-[4px] px-2 py-1 text-xs"
          >
            {showCodeAnalysis ? t.hideCode : t.showCode}
          </button>
          <button
            onClick={() => handleResetModule('code')}
            disabled={loadingGemini[currentIndex]}
            title={t.resetCode}
            aria-label={t.resetCode}
            className="ghost-btn inline-flex h-8 w-8 items-center justify-center rounded-full text-sm disabled:opacity-50"
          >
            {'\u21ba'}
          </button>
        </div>
      </div>
      {showCodeAnalysis && (
        <MonacoViewer
          code={geminiResults[currentIndex].data?.code || ''}
          language={config.language}
          height={260}
        />
      )}
    </div>
  )

  const handleCodeChange = (code) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: code }))
  }

  const handleSubmit = async () => {
    if (!currentQuestion) return
    setIsEvaluating(true)

    try {
      const response = await evaluateAnswer({
        question: currentQuestion,
        answer: answers[currentIndex] || '',
        language: config.language,
        mode: config.mode,
      })

      setAnswerAnalyses((prev) => ({ ...prev, [currentIndex]: response.analysis }))
      setRecordsById((prev) => ({
        ...prev,
        [String(currentQuestion.id)]: response.record,
      }))
    } catch (err) {
      setGeminiErrors((prev) => ({
        ...prev,
        [currentIndex]: err?.response?.data?.details || err?.response?.data?.error || err.message,
      }))
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleResetModule = async (module) => {
    if (!currentQuestion) return

    setLoadingGemini((prev) => ({ ...prev, [currentIndex]: true }))
    try {
      const result = await callGemini({
        query: currentQuestion.title,
        mode: config.mode,
        language: config.language,
        answer: answers[currentIndex] || '',
        lang,
        module,
      })

      const merged = mergeModuleData(geminiResults[currentIndex], result, module)
      setGeminiResults((prev) => ({ ...prev, [currentIndex]: merged }))
      setGeminiErrors((prev) => ({ ...prev, [currentIndex]: null }))
      await saveQuestionCache(currentQuestion, merged)
    } catch (err) {
      setGeminiErrors((prev) => ({
        ...prev,
        [currentIndex]: err?.response?.data?.details || err?.response?.data?.error || err.message,
      }))
    } finally {
      setLoadingGemini((prev) => ({ ...prev, [currentIndex]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="mono text-lg text-neutral-200">{t.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-[6px] p-6 text-center sm:p-8">
          <p className="mb-4 text-red-300">{t.error}: {error}</p>
          <button onClick={onBack} className="neon-btn rounded-[4px] px-4 py-2">
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="mono text-lg text-neutral-200">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onBack} className="ghost-btn rounded-[4px] px-4 py-2 text-sm">
          {t.back}
        </button>
        <div className="hud-header min-w-[260px] px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="hud-kicker mono text-[11px] uppercase tracking-[0.24em]">
              {currentQuestion.isReview ? 'Review Session' : 'Learning Session'}
            </p>
            <div className="status-strip" aria-hidden="true">
              <span className="status-dot online" />
              <span className="status-dot sync" />
              <span className="status-dot guard" />
            </div>
          </div>
          <span className="hud-scanline" />
        </div>
      </div>

      {indicesToGenerate.length > 0 && (
        <p className="mono mb-3 text-xs text-neutral-400">{t.prefetching}</p>
      )}

      <div
        ref={layoutRef}
        className="practice-layout h-[calc(100vh-170px)] gap-4"
        style={{ '--left-pane': `${leftPanePercent}%` }}
      >
        <div className="practice-left glass-panel-strong tech-cut reflect-sheen fade-rise overflow-y-auto rounded-[6px] p-5 sm:p-6">
          <div className="mb-4 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-2xl font-bold text-neutral-50">{currentQuestion.title}</h2>
              <div className="flex flex-wrap gap-2">
                {(
                  geminiResults[currentIndex]?.data?.tags?.length
                    ? geminiResults[currentIndex].data.tags
                    : [currentQuestion.category]
                ).map((tag, idx) => (
                  <button key={`${tag}-${idx}`} className="ghost-btn rounded-[4px] px-2 py-1 text-xs">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-300">
              {t.difficulty}: {currentQuestion.difficulty}
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              {t.completed}: {currentRecord?.completed ? 'Yes' : 'No'} | {t.firstPassedAt}: {formatDate(currentRecord?.firstPassedAt, lang)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {t.reviewStatus}: {currentRecord ? (currentRecord?.review?.needsReview ? t.needReview : t.reviewed) : '-'}
            </p>
          </div>

          {geminiResults[currentIndex] && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-neutral-100">
                  {localizedField(geminiResults[currentIndex].data, 'title', lang)}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {localizedField(geminiResults[currentIndex].data, 'subtitle', lang)}
                </p>
              </div>

              <div className="min-h-0 overflow-y-auto pr-1">
                {leftCodeOnTop ? renderCodeSection() : renderExplanationSection()}
              </div>
              <div className="swap-handle-wrap group relative flex items-center justify-center py-1">
                <button
                  onClick={() => setLeftCodeOnTop((v) => !v)}
                  title={leftCodeOnTop ? t.explanationTop : t.codeTop}
                  className="ghost-btn inline-flex h-8 w-8 items-center justify-center rounded-full text-xs opacity-0 transition group-hover:opacity-100"
                >
                  <span className="mono tracking-wide">{'\u2191'}{'\u2193'}</span>
                </button>
              </div>
              <div className="min-h-0 overflow-y-auto pr-1">
                {leftCodeOnTop ? renderExplanationSection() : renderCodeSection()}
              </div>
            </div>
          )}

          {currentAnalysis && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <h4 className="mb-2 font-semibold text-neutral-100">{t.evaluation}</h4>
              <p className="text-sm text-neutral-300">{t.runnable}: {String(Boolean(currentAnalysis.runnable))}</p>
              <p className="text-sm text-neutral-300">{t.ideaCorrect}: {String(Boolean(currentAnalysis.ideaCorrect))}</p>
              <p className="text-sm text-neutral-300">{t.complexityScore}: {currentAnalysis.complexityScore ?? '-'}</p>

              {currentAnalysis.summary && (
                <div className="mt-2">
                  <p className="text-xs text-neutral-400">{t.summary}</p>
                  <p className="whitespace-pre-wrap text-sm text-neutral-200">
                    {splitBilingualContent(currentAnalysis.summary, lang)}
                  </p>
                </div>
              )}

              {Array.isArray(currentAnalysis.issues) && currentAnalysis.issues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-neutral-400">{t.issues}</p>
                  <ul className="space-y-1 text-sm text-neutral-200">
                    {currentAnalysis.issues.map((item, idx) => (
                      <li key={idx}>- {splitBilingualContent(item, lang)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(currentAnalysis.suggestions) && currentAnalysis.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-neutral-400">{t.suggestions}</p>
                  <ul className="space-y-1 text-sm text-neutral-200">
                    {currentAnalysis.suggestions.map((item, idx) => (
                      <li key={idx}>- {splitBilingualContent(item, lang)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentAnalysis.fixedCode && (
                <div className="mt-2">
                  <p className="text-xs text-neutral-400">{t.fixedCode}</p>
                  {showCodeAnalysis && (
                    <MonacoViewer
                      code={currentAnalysis.fixedCode}
                      language={config.language}
                      height={220}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {(loadingGemini[currentIndex] || isEvaluating) && (
            <p className="mono mt-3 text-neutral-200">
              {loadingGemini[currentIndex] ? t.thinking : t.evaluating}
            </p>
          )}

          {geminiErrors[currentIndex] && !loadingGemini[currentIndex] && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-red-300">{geminiErrors[currentIndex]}</p>
          )}

          {!geminiResults[currentIndex] && !loadingGemini[currentIndex] && !geminiErrors[currentIndex] && (
            <p className="text-sm text-neutral-400">{t.pending}</p>
          )}
        </div>

        <div
          className="pane-divider"
          onMouseDown={() => setIsResizing(true)}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
        />

        <div className="practice-right glass-panel-strong tech-cut reflect-sheen flex flex-col rounded-[6px] p-5 sm:p-6">
          <div className="min-h-0 flex-1">
            <CodeEditor
              code={answers[currentIndex] || ''}
              onChange={handleCodeChange}
              language={config.language}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isEvaluating}
            className="neon-btn mt-4 w-full rounded-[4px] py-3 font-semibold disabled:opacity-50"
          >
            {isEvaluating ? t.evaluating : t.submit}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="ghost-btn rounded-[4px] px-4 py-2 text-sm disabled:opacity-40"
        >
          {t.previous}
        </button>
        <p className="mono text-sm text-neutral-200">
          {currentIndex + 1} / {questions.length}
        </p>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
          className="ghost-btn rounded-[4px] px-4 py-2 text-sm disabled:opacity-40"
        >
          {t.next}
        </button>
      </div>
    </div>
  )
}
