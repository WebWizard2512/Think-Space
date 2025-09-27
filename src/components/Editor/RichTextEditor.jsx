import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import { groqService } from '../../services/groqAPI'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])
  const [showTooltip, setShowTooltip] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [highlightedTerms, setHighlightedTerms] = useState([])
  const lastContentRef = useRef('')
  const highlightTimeoutRef = useRef(null)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
      lastContentRef.current = content || ''
    }
  }, [content])

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return
    
    const newContent = editorRef.current.innerHTML
    if (newContent !== lastContentRef.current) {
      lastContentRef.current = newContent
      onChange(newContent)
      updateActiveFormats()
      
      // Clear existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      
      // Debounced highlighting
      highlightTimeoutRef.current = setTimeout(() => {
        highlightTermsInContent(newContent)
      }, 2000) // 2 second delay after typing stops
    }
  }, [onChange])

  // Highlight terms in content
  const highlightTermsInContent = useCallback(async (htmlContent) => {
    if (!editorRef.current) return
    
    const textContent = editorRef.current.textContent || ''
    
    // Only highlight if there's substantial content
    if (textContent.length > 50) {
      try {
        // Get key terms from content
        const keyTerms = await identifyKeyTerms(textContent)
        
        if (keyTerms.length > 0) {
          setHighlightedTerms(keyTerms)
          applyHighlighting(keyTerms)
        }
      } catch (error) {
        console.error('Error highlighting terms:', error)
      }
    }
  }, [])

  // Apply highlighting to terms
  const applyHighlighting = useCallback((terms) => {
    if (!editorRef.current) return
    
    // Save cursor position
    const selection = window.getSelection()
    let range = null
    let startOffset = 0
    let startContainer = null
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
      startContainer = range.startContainer
      startOffset = range.startOffset
    }
    
    let html = editorRef.current.innerHTML
    
    // Remove existing highlights first
    html = html.replace(/<span class="glossary-term"[^>]*>([^<]+)<\/span>/g, '$1')
    
    // Add new highlights
    terms.forEach(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi')
      html = html.replace(regex, '<span class="glossary-term" data-term="$1">$1</span>')
    })
    
    // Update content if changed
    if (html !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html
      
      // Restore cursor position
      if (range && startContainer) {
        try {
          const newRange = document.createRange()
          newRange.setStart(startContainer, startOffset)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        } catch (e) {
          // If restoration fails, place at end
          const newRange = document.createRange()
          newRange.selectNodeContents(editorRef.current)
          newRange.collapse(false)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
      
      // Add event listeners to glossary terms
      addGlossaryListeners()
    }
  }, [])

  // Identify key terms using AI
  const identifyKeyTerms = useCallback(async (text) => {
    if (text.length < 50) return []
    
    try {
      // Use a simpler approach first - common technical terms
      const commonTerms = [
        'algorithm', 'api', 'blockchain', 'machine learning', 'artificial intelligence',
        'database', 'encryption', 'framework', 'protocol', 'authentication',
        'javascript', 'react', 'nodejs', 'python', 'typescript', 'css', 'html',
        'docker', 'kubernetes', 'microservices', 'devops', 'cybersecurity'
      ]
      
      const foundTerms = commonTerms.filter(term => 
        text.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 6)
      
      if (foundTerms.length > 0) {
        return foundTerms
      }
      
      // Fallback to AI if no common terms found
      const response = await groqService.makeRequest([
        {
          role: 'system',
          content: 'Extract 3-5 key technical terms or concepts from the text. Return only the terms separated by commas.'
        },
        {
          role: 'user',
          content: `Extract key terms from: ${text.substring(0, 300)}`
        }
      ], 50)
      
      return response.split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 2 && term.length < 20)
        .slice(0, 5)
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

  // Update active format states
  const updateActiveFormats = useCallback(() => {
    const formats = []
    if (document.queryCommandState('bold')) formats.push('bold')
    if (document.queryCommandState('italic')) formats.push('italic')
    if (document.queryCommandState('underline')) formats.push('underline')
    setActiveFormats(formats)
  }, [])

  // Handle toolbar commands
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

  // Handle keyboard shortcuts
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

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [handleSelectionChange])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <Toolbar onCommand={handleCommand} activeFormats={activeFormats} />
      
      {/* Glossary Status */}
      {highlightedTerms.length > 0 && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ✨ <strong>{highlightedTerms.length} terms</strong> highlighted. Hover over highlighted terms for definitions!
          </p>
        </div>
      )}
      
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
            fontWeight: '400'
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 max-w-xs"
          style={{
            left: Math.max(10, tooltipPosition.x - 150),
            top: Math.max(10, tooltipPosition.y - 10),
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
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
        </div>
      )}

      <style>{`
        .glossary-term {
          background-color: #fef3c7 !important;
          border-bottom: 2px dotted #f59e0b !important;
          cursor: help !important;
          padding: 1px 2px;
          border-radius: 2px;
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

        /* Placeholder styling */
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        .dark [contenteditable]:empty:before {
          color: #6b7280;
        }

        /* Better text handling */
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