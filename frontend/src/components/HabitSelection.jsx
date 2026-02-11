import { useState } from 'react'

const labels = {
  zh: {
    title: '刷题习惯配置',
    strategy: '刷题策略',
    alternate: '难易交替',
    easyToHard: '由易到难',
    quantity: '刷题数目',
    mode: '答题模式',
    solving: '解题',
    optimization: '算法优化',
    language: '编程语言',
    start: '开始刷题',
  },
  en: {
    title: 'Configure Practice Habit',
    strategy: 'Practice Strategy',
    alternate: 'Mix Easy & Hard',
    easyToHard: 'Easy to Hard',
    quantity: 'Questions Count',
    mode: 'Practice Mode',
    solving: 'Problem Solving',
    optimization: 'Algorithm Optimization',
    language: 'Programming Language',
    start: 'Start Practice',
  },
}

export default function HabitSelection({ onStart, lang }) {
  const t = labels[lang]
  const [strategy, setStrategy] = useState('easyToHard')
  const [quantity, setQuantity] = useState(1)
  const [mode, setMode] = useState('solving')
  const [language, setLanguage] = useState('python')

  const handleStart = () => {
    onStart({
      strategy,
      quantity: parseInt(quantity),
      mode,
      language,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t.title}</h1>

        {/* Strategy */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t.strategy}</label>
          <div className="space-y-2">
            {[
              { value: 'easyToHard', label: t.easyToHard },
              { value: 'alternate', label: t.alternate },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value={opt.value}
                  checked={strategy === opt.value}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t.quantity}</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t.mode}</label>
          <div className="space-y-2">
            {[
              { value: 'solving', label: t.solving },
              { value: 'optimization', label: t.optimization },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t.language}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
          </select>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105"
        >
          {t.start}
        </button>
      </div>
    </div>
  )
}
