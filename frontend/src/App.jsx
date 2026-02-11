import { useState } from 'react'
import HabitSelection from './components/HabitSelection'
import PracticePage from './components/PracticePage'

export default function App() {
  const [mode, setMode] = useState('selection') // 'selection' or 'practice'
  const [config, setConfig] = useState(null)
  const [language, setLanguage] = useState('zh') // 'zh' or 'en'

  const handleStartPractice = (conf) => {
    setConfig(conf)
    setMode('practice')
  }

  const handleBack = () => {
    setMode('selection')
    setConfig(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          {language === 'zh' ? 'English' : '中文'}
        </button>
      </div>

      {mode === 'selection' && (
        <HabitSelection onStart={handleStartPractice} lang={language} />
      )}

      {mode === 'practice' && config && (
        <PracticePage config={config} onBack={handleBack} lang={language} />
      )}
    </div>
  )
}
