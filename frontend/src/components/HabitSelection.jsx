import { useMemo, useState } from 'react'

const labels = {
  zh: {
    strategy: '\u5237\u9898\u7b56\u7565',
    alternate: '\u96be\u6613\u4ea4\u66ff',
    easyToHard: '\u7531\u6613\u5230\u96be',
    quantity: '\u9898\u76ee\u6570\u91cf',
    mode: '\u7b54\u9898\u6a21\u5f0f',
    studyMode: '\u5b66\u4e60\u6a21\u5f0f',
    learnOnly: '\u4ec5\u5b66\u4e60',
    learnAndReview: '\u5b66\u4e60 + \u590d\u4e60',
    solving: '\u89e3\u9898',
    optimization: '\u7b97\u6cd5\u4f18\u5316',
    language: '\u7f16\u7a0b\u8bed\u8a00',
    start: '\u5f00\u59cb',
    summary:
      '\u6309\u4f60\u7684\u8282\u594f\u914d\u7f6e\u7b56\u7565\u3001\u6a21\u5f0f\u548c\u8bed\u8a00\u3002\u7cfb\u7edf\u4f1a\u81ea\u52a8\u7f13\u5b58\u5386\u53f2\u4e0e\u590d\u4e60\u72b6\u6001\u3002',
  },
  en: {
    strategy: 'Practice Strategy',
    alternate: 'Mix Easy & Hard',
    easyToHard: 'Easy to Hard',
    quantity: 'Questions Count',
    mode: 'Practice Mode',
    studyMode: 'Study Mode',
    learnOnly: 'Learning',
    learnAndReview: 'Learning + Review',
    solving: 'Problem Solving',
    optimization: 'Algorithm Optimization',
    language: 'Programming Language',
    start: 'Start',
    summary:
      'Configure strategy, mode and language for your rhythm. History and review state are persisted automatically.',
  },
}

const engineerQuotes = [
  {
    author: 'Steve Jobs',
    company: 'Apple',
    quote: 'Great engineering turns complexity into simplicity, not simplicity into complexity.',
  },
  {
    author: 'Sam Altman',
    company: 'OpenAI',
    quote: 'A good system does not just run; it keeps evolving with new requirements.',
  },
  {
    author: 'Jensen Huang',
    company: 'NVIDIA',
    quote: 'In a fast-changing world, the ability to refactor continuously matters more than one-time perfection.',
  },
  {
    author: 'Satya Nadella',
    company: 'Microsoft',
    quote: 'Every line of code should make the next line easier to write.',
  },
]

export default function HabitSelection({ onStart, lang }) {
  const t = labels[lang]
  const [strategy, setStrategy] = useState('easyToHard')
  const [quantity, setQuantity] = useState(1)
  const [mode, setMode] = useState('solving')
  const [studyMode, setStudyMode] = useState('learn')
  const [language, setLanguage] = useState('python')

  const marqueeItems = useMemo(() => [...engineerQuotes, ...engineerQuotes], [])

  const handleStart = () => {
    onStart({
      strategy,
      quantity: parseInt(quantity, 10),
      mode,
      studyMode,
      language,
    })
  }

  return (
    <div className="h-screen p-3 sm:p-4">
      <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[1.05fr_1fr]">
        <section className="glass-panel tech-cut reflect-sheen fade-rise flex min-h-0 flex-col justify-between rounded-none p-5 sm:p-6">
          <div className="hud-header mb-4 px-4 py-4 sm:px-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="hud-kicker mono text-xs uppercase tracking-[0.26em]">LeetCode Console</p>
              <div className="status-strip" aria-hidden="true">
                <span className="status-dot online" />
                <span className="status-dot sync" />
                <span className="status-dot guard" />
              </div>
            </div>
            <h1 className="hud-title text-3xl font-bold sm:text-4xl">leetcode agent</h1>
            <p className="mt-2 text-sm text-neutral-300">{t.summary}</p>
            <p className="mt-2 text-xs text-neutral-500">Copyright (c) Zayn</p>
            <span className="hud-scanline" />
          </div>

          <div className="quote-scroller field-shell min-h-[240px] rounded-[6px] p-3 sm:p-4">
            <p className="mono mb-2 text-xs uppercase tracking-[0.22em] text-neutral-500">
              Engineer Mindset
            </p>
            <div className="quote-marquee-wrap">
              <div className="quote-marquee-track">
                {marqueeItems.map((item, idx) => (
                  <article key={`${item.author}-${idx}`} className="quote-marquee-item">
                    <p className="text-sm leading-7 text-neutral-100">{item.quote}</p>
                    <p className="mt-2 text-xs text-neutral-400">
                      {item.author} - {item.company}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel tech-cut reflect-sheen min-h-0 rounded-none border-l border-white/10 p-6 pt-8 sm:p-8 lg:pt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-100">personal setting</h2>
            <span className="mono text-xs uppercase tracking-[0.2em] text-neutral-500">ready</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">{t.strategy}</label>
              <div className="space-y-2">
                {[
                  { value: 'easyToHard', label: t.easyToHard },
                  { value: 'alternate', label: t.alternate },
                ].map((opt) => (
                  <label key={opt.value} className="field-shell flex cursor-pointer items-center rounded-[4px] px-3 py-2">
                    <input
                      type="radio"
                      name="strategy"
                      value={opt.value}
                      checked={strategy === opt.value}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="h-4 w-4 accent-neutral-200"
                    />
                    <span className="ml-2 text-sm text-neutral-100">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">{t.mode}</label>
              <div className="space-y-2">
                {[
                  { value: 'solving', label: t.solving },
                  { value: 'optimization', label: t.optimization },
                ].map((opt) => (
                  <label key={opt.value} className="field-shell flex cursor-pointer items-center rounded-[4px] px-3 py-2">
                    <input
                      type="radio"
                      name="mode"
                      value={opt.value}
                      checked={mode === opt.value}
                      onChange={(e) => setMode(e.target.value)}
                      className="h-4 w-4 accent-neutral-200"
                    />
                    <span className="ml-2 text-sm text-neutral-100">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-300">{t.quantity}</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="field-shell w-full rounded-[4px] px-3 py-2"
                >
                  {[1, 2, 3].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-300">{t.language}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="field-shell w-full rounded-[4px] px-3 py-2"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">{t.studyMode}</label>
              <div className="space-y-2">
                {[
                  { value: 'learn', label: t.learnOnly },
                  { value: 'learnReview', label: t.learnAndReview },
                ].map((opt) => (
                  <label key={opt.value} className="field-shell flex cursor-pointer items-center rounded-[4px] px-3 py-2">
                    <input
                      type="radio"
                      name="studyMode"
                      value={opt.value}
                      checked={studyMode === opt.value}
                      onChange={(e) => setStudyMode(e.target.value)}
                      className="h-4 w-4 accent-neutral-200"
                    />
                    <span className="ml-2 text-sm text-neutral-100">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleStart}
              className="neon-btn h-14 w-full rounded-[4px] px-5 text-base font-bold"
            >
              {t.start}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
