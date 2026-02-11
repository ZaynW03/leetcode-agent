import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
}

export default function MonacoViewer({ code, language = 'javascript', height = 240 }) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: code || '',
      language: languageMap[language] || 'javascript',
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 13,
      tabSize: 2,
      roundedSelection: false,
      renderLineHighlight: 'line',
      folding: true,
      wordWrap: 'on',
    })

    return () => {
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const model = editor.getModel()
    const nextLang = languageMap[language] || 'javascript'

    if (model && model.getValue() !== (code || '')) {
      model.setValue(code || '')
    }
    if (model) {
      monaco.editor.setModelLanguage(model, nextLang)
    }
  }, [code, language])

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-[4px] border border-white/20"
      style={{ height }}
    />
  )
}
