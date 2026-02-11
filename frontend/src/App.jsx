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
    <div className="min-h-screen">
      <button
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        className="language-fab neon-btn rounded-[4px] text-sm font-semibold"
      >
        {language === 'zh' ? 'English' : '\u4e2d\u6587'}
      </button>

      {mode === 'selection' && (
        <HabitSelection onStart={handleStartPractice} lang={language} />
      )}

      {mode === 'practice' && config && (
        <PracticePage config={config} onBack={handleBack} lang={language} />
      )}
    </div>
  )
}
