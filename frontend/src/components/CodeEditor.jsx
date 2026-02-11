import React, { useState } from 'react'

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
}

const indentSettings = {
  python: 4,
  javascript: 2,
  java: 2,
  cpp: 2,
  go: 2,
}

export default function CodeEditor({ code, onChange, language }) {
  const [lineNumbers, setLineNumbers] = useState(true)

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const indent = ' '.repeat(indentSettings[language] || 2)
      const newCode = code.substring(0, start) + indent + code.substring(end)
      onChange(newCode)
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length
      }, 0)
    }
  }

  const lines = code.split('\n').length
  const lineNumbersStr = Array.from({ length: lines }, (_, i) => i + 1).join('\n')

  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-gray-900 text-white h-full">
      {/* Line Numbers */}
      {lineNumbers && (
        <div className="bg-gray-800 p-3 text-right text-gray-500 text-sm font-mono select-none w-12 overflow-hidden">
          {lineNumbersStr}
        </div>
      )}
      
      {/* Code Editor */}
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 p-3 font-mono text-sm bg-gray-900 text-white resize-none focus:outline-none border-l border-gray-700"
        style={{
          fontFamily: 'Courier New, monospace',
          lineHeight: '1.5',
          tabSize: indentSettings[language] || 2,
        }}
        spellCheck="false"
      />
    </div>
  )
}
