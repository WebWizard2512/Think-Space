import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import { groqService } from '../../services/groqAPI'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])
  const [showTooltip, setShowTooltip] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const lastContentRef = useRef('')

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
      lastContentRef.current = content || ''
    }
  }, [content])

  // Handle content changes (debounced)
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return
    
    const newContent = editorRef.current.innerHTML
    if (newContent !== lastContentRef.current) {
      lastContentRef.current = newContent
      onChange(newContent)
      updateActiveFormats()
      
      // Debounced highlighting to prevent cursor reset
      const timeoutId = setTimeout(() => {
        highlightTermsCarefully()
      }, 1500) // Longer delay to avoid interrupting typing
      
      return () => clearTimeout(timeoutId)
    }
  }, [onChange])

  // Careful term highlighting that preserves cursor
  const highlightTermsCarefully = useCallback(async () => {
    if (!editorRef.current) return
    
    const element = editorRef.current
    const selection = window.getSelection()
    let range = null
    let startContainer = null
    let startOffset = 0
    
    // Save cursor position
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
      startContainer = range.startContainer
      startOffset = range.startOffset
    }
    
    const textContent = element.textContent || ''
    
    // Only highlight if there's substantial content
    if (textContent.length > 20) {
      try {
        // Use AI to identify key terms from the content
        const keyTerms = await identifyKeyTerms(textContent)
        
        if (keyTerms.length > 0) {
          let html = element.innerHTML
          
          // Remove existing highlights
          html = html.replace(/<span class="glossary-term"[^>]*>([^<]+)<\/span>/g, '$1')
          
          // Add new highlights
          keyTerms.forEach(term => {
            const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi')
            html = html.replace(regex, `<span class="glossary-term" data-term="$1">$1</span>`)
          })
          
          // Only update if content changed
          if (html !== element.innerHTML) {
            element.innerHTML = html
            
            // Restore cursor position
            if (range && startContainer) {
              try {
                const newRange = document.createRange()
                newRange.setStart(startContainer, startOffset)
                newRange.collapse(true)
                selection.removeAllRanges()
                selection.addRange(newRange)
              } catch (e) {
                // If cursor restoration fails, place at end
                const newRange = document.createRange()
                newRange.selectNodeContents(element)
                newRange.collapse(false)
                selection.removeAllRanges()
                selection.addRange(newRange)
              }
            }
            
            // Add event listeners to new glossary terms
            addGlossaryListeners()
          }
        }
      } catch (error) {
        console.error('Error highlighting terms:', error)
      }
    }
  }, [])

  // AI-powered key term identification
  const identifyKeyTerms = useCallback(async (text) => {
    if (text.length < 50) return []
    
    try {
      const response = await groqService.makeRequest([
        {
          role: 'system',
          content: 'You are a term extractor. Identify 5-10 key technical terms, concepts, or important words from the text that would benefit from definitions. Return only the terms separated by commas, no explanations.'
        },
        {
          role: 'user',
          content: `Extract key terms from: ${text.substring(0, 500)}`
        }
      ], 50)
      
      return response.split(',')
        .map(term => term.trim())
        .filter(term => term.length > 2 && term.length < 25)
        .slice(0, 8)
    } catch (error) {
      console.error('Error identifying terms:', error)
      return []
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
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          className="min-h-full outline-none text-gray-900 dark:text-gray-100 leading-relaxed resize-none"
          style={{
            minHeight: '300px',
            maxHeight: 'none',
            fontSize: '16px',
            lineHeight: '1.7',
            fontWeight: '300' // Lighter font weight for normal text
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 max-w-xs"
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
          cursor: help !important;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: inherit !important;
          transition: background-color 0.2s ease;
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

        /* Better bold text distinction */
        [contenteditable] strong, [contenteditable] b {
          font-weight: 700 !important;
        }

        [contenteditable] {
          font-weight: 300 !important;
        }

        /* Placeholder styling */
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        .dark [contenteditable]:empty:before {
          color: #6b7280;
        }

        /* Better text handling for large content */
        [contenteditable] {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor