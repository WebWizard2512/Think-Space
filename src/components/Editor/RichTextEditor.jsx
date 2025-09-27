import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import { groqService } from '../../services/groqAPI'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])
  const [showTooltip, setShowTooltip] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Technical terms for glossary
  const technicalTerms = [
    'algorithm', 'api', 'blockchain', 'machine learning', 'artificial intelligence',
    'database', 'encryption', 'framework', 'protocol', 'authentication',
    'javascript', 'react', 'nodejs', 'python', 'typescript',
    'quantum computing', 'neural network', 'deep learning', 'cybersecurity'
  ]

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
      highlightTerms()
    }
  }, [content])

  // Highlight technical terms
  const highlightTerms = useCallback(() => {
    if (!editorRef.current) return

    const element = editorRef.current
    let html = element.innerHTML

    // Remove existing highlights
    html = html.replace(/<span class="glossary-term"[^>]*>([^<]+)<\/span>/g, '$1')

    // Find and highlight technical terms
    technicalTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi')
      html = html.replace(regex, `<span class="glossary-term" data-term="$1">$1</span>`)
    })

    // Only update if content changed
    if (html !== element.innerHTML) {
      const selection = window.getSelection()
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
      
      element.innerHTML = html
      
      // Restore cursor position
      if (range) {
        try {
          selection.removeAllRanges()
          selection.addRange(range)
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }

      // Add event listeners to new glossary terms
      addGlossaryListeners()
    }
  }, [])

  // Add event listeners to glossary terms
  const addGlossaryListeners = useCallback(() => {
    if (!editorRef.current) return

    const glossaryTerms = editorRef.current.querySelectorAll('.glossary-term')
    glossaryTerms.forEach(term => {
      term.addEventListener('mouseenter', handleTermHover)
      term.addEventListener('mouseleave', handleTermLeave)
    })
  }, [])

  // Handle term hover
  const handleTermHover = async (e) => {
    const term = e.target.dataset.term
    if (!term) return

    const rect = e.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })

    setShowTooltip({ term, definition: 'Loading definition...' })

    try {
      const definition = await groqService.getGlossaryDefinition(term)
      setShowTooltip({ term, definition })
    } catch (error) {
      setShowTooltip({ term, definition: 'Definition not available' })
    }
  }

  const handleTermLeave = () => {
    setTimeout(() => setShowTooltip(null), 200)
  }

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return
    
    const newContent = editorRef.current.innerHTML
    onChange(newContent)
    
    // Debounce term highlighting
    setTimeout(highlightTerms, 500)
    updateActiveFormats()
  }, [onChange, highlightTerms])

  // Rest of your existing methods...
  const updateActiveFormats = useCallback(() => {
    const formats = []
    if (document.queryCommandState('bold')) formats.push('bold')
    if (document.queryCommandState('italic')) formats.push('italic')
    if (document.queryCommandState('underline')) formats.push('underline')
    setActiveFormats(formats)
  }, [])

  const handleCommand = useCallback((command, value = null) => {
    editorRef.current?.focus()
    
    try {
      if (value) {
        document.execCommand(command, false, value)
      } else {
        document.execCommand(command, false, null)
      }
      
      updateActiveFormats()
      handleContentChange()
    } catch (error) {
      console.error('Command execution failed:', error)
    }
  }, [handleContentChange, updateActiveFormats])

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleContentChange()
      return
    }

    if (e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleCommand('bold')
          break
        case 'i':
          e.preventDefault()
          handleCommand('italic')
          break
        case 'u':
          e.preventDefault()
          handleCommand('underline')
          break
      }
    }

    setTimeout(updateActiveFormats, 10)
  }, [handleCommand, updateActiveFormats, handleContentChange])

  const handleSelectionChange = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <Toolbar onCommand={handleCommand} activeFormats={activeFormats} />
      
      <div className="flex-1 p-6">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          className="min-h-full outline-none text-gray-900 dark:text-gray-100 leading-relaxed"
          style={{
            minHeight: '400px',
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: '400' // Fix bold text issue
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: tooltipPosition.x - 150,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
          onMouseEnter={() => setShowTooltip(showTooltip)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
              {showTooltip.term}
            </span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {showTooltip.definition}
          </p>
        </div>
      )}

      <style>{`
        .glossary-term {
          background-color: #fef3c7 !important;
          border-bottom: 2px dotted #f59e0b !important;
          cursor: pointer !important;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: inherit !important;
        }
        
        .dark .glossary-term {
          background-color: #451a03 !important;
          border-bottom-color: #f59e0b !important;
          color: #fbbf24 !important;
        }
        
        .glossary-term:hover {
          background-color: #fed7aa !important;
        }
        
        .dark .glossary-term:hover {
          background-color: #7c2d12 !important;
        }

        /* Fix bold text visibility */
        [contenteditable] strong, [contenteditable] b {
          font-weight: 700 !important;
        }

        [contenteditable] {
          font-weight: 400 !important;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor