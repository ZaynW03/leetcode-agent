import React, { useState } from 'react'

const indentSettings = {
  python: 4,
  javascript: 2,
  java: 2,
  cpp: 2,
  go: 2,
}

export default function CodeEditor({ code, onChange, language }) {
  const [lineNumbers] = useState(true)

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
    <div className="flex h-full overflow-hidden rounded-[4px] border border-white/25 bg-black/95 text-neutral-100">
      {lineNumbers && (
        <div className="mono w-12 overflow-hidden border-r border-white/15 bg-neutral-950 p-3 text-right text-xs text-neutral-500 select-none">
          {lineNumbersStr}
        </div>
      )}

      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mono flex-1 resize-none border-l border-white/10 bg-black p-3 text-sm text-neutral-100 focus:outline-none"
        style={{
          lineHeight: '1.55',
          tabSize: indentSettings[language] || 2,
        }}
        spellCheck="false"
      />
    </div>
  )
}
