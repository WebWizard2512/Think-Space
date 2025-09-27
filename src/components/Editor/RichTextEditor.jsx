import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import { groqService } from '../../services/groqAPI'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])
  const [showTooltip, setShowTooltip] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [highlightedTerms, setHighlightedTerms] = useState([])
  const [isHighlighting, setIsHighlighting] = useState(false)
  const lastContentRef = useRef('')
  const highlightTimeoutRef = useRef(null)
  const cursorPositionRef = useRef(null)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      const selection = window.getSelection()
      let range = null
      let startOffset = 0
      let startContainer = null
      
      // Save cursor position before updating content
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0)
        startContainer = range.startContainer
        startOffset = range.startOffset
      }
      
      editorRef.current.innerHTML = content || ''
      lastContentRef.current = content || ''
      
      // Restore cursor position
      if (range && startContainer && editorRef.current.contains(startContainer)) {
        try {
          const newRange = document.createRange()
          newRange.setStart(startContainer, startOffset)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        } catch (e) {
          // If restoration fails, place cursor at end
          const newRange = document.createRange()
          newRange.selectNodeContents(editorRef.current)
          newRange.collapse(false)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
    }
  }, [content])

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      cursorPositionRef.current = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      }
    }
  }, [])

  // Restore cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!cursorPositionRef.current || !editorRef.current) return
    
    const selection = window.getSelection()
    const { startContainer, startOffset, endContainer, endOffset } = cursorPositionRef.current
    
    // Check if the saved containers still exist in the DOM
    if (editorRef.current.contains(startContainer) && editorRef.current.contains(endContainer)) {
      try {
        const range = document.createRange()
        range.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0))
        range.setEnd(endContainer, Math.min(endOffset, endContainer.textContent?.length || 0))
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (e) {
        // Fallback: place cursor at end
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [])

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
      
      // Only highlight if not currently highlighting to prevent conflicts
      if (!isHighlighting) {
        highlightTimeoutRef.current = setTimeout(() => {
          highlightTermsInContent(newContent)
        }, 3000) // 3 second delay after typing stops
      }
    }
  }, [onChange, isHighlighting])

  // More reliable term identification
  const identifyKeyTerms = useCallback(async (text) => {
    if (text.length < 100) return [] // Require more content for highlighting
    
    try {
      // First try common technical terms that are likely to be in the text
      const commonTerms = [
        // Programming
        'javascript', 'react', 'nodejs', 'python', 'typescript', 'css', 'html', 'api', 'database',
        // Tech concepts
        'algorithm', 'blockchain', 'machine learning', 'artificial intelligence', 'encryption',
        'authentication', 'framework', 'protocol', 'microservices', 'devops', 'cybersecurity',
        // Business terms
        'strategy', 'analytics', 'optimization', 'scalability', 'performance', 'architecture',
        // Common concepts
        'research', 'analysis', 'methodology', 'implementation', 'configuration', 'deployment'
      ]
      
      const textLower = text.toLowerCase()
      const foundTerms = commonTerms
        .filter(term => textLower.includes(term))
        .slice(0, 4) // Limit to 4 terms for performance
      
      if (foundTerms.length > 0) {
        return foundTerms
      }
      
      // Fallback to AI only if we have substantial content and no common terms
      if (text.length > 200) {
        const response = await groqService.makeRequest([
          {
            role: 'system',
            content: 'Extract 2-3 key technical terms or important concepts from the text. Return only the terms separated by commas, no explanations. Focus on nouns and technical terms.'
          },
          {
            role: 'user',
            content: `Extract key terms from: ${text.substring(0, 400)}`
          }
        ], 30)
        
        return response.split(',')
          .map(term => term.trim().toLowerCase())
          .filter(term => term.length > 2 && term.length < 25 && !term.includes(' '))
          .slice(0, 3)
      }
      
      return []
    } catch (error) {
      console.error('Error identifying terms:', error)
      return []
    }
  }, [])

  // Highlight terms in content with better reliability
  const highlightTermsInContent = useCallback(async (htmlContent) => {
    if (!editorRef.current || isHighlighting) return
    
    const textContent = editorRef.current.textContent || ''
    
    // Only highlight if there's substantial content
    if (textContent.length > 100) {
      setIsHighlighting(true)
      
      try {
        // Save cursor position before highlighting
        saveCursorPosition()
        
        // Get key terms from content
        const keyTerms = await identifyKeyTerms(textContent)
        
        if (keyTerms.length > 0) {
          setHighlightedTerms(keyTerms)
          applyHighlighting(keyTerms)
        }
      } catch (error) {
        console.error('Error highlighting terms:', error)
      } finally {
        setIsHighlighting(false)
      }
    }
  }, [isHighlighting, saveCursorPosition])

  // Apply highlighting to terms with improved cursor preservation
  const applyHighlighting = useCallback((terms) => {
    if (!editorRef.current || isHighlighting) return
    
    let html = editorRef.current.innerHTML
    
    // Remove existing highlights first to avoid double-highlighting
    html = html.replace(/<span class="glossary-term"[^>]*>([^<]+)<\/span>/g, '$1')
    
    // Apply new highlights
    let hasChanges = false
    terms.forEach(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // More precise regex that avoids partial matches
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi')
      const originalHtml = html
      html = html.replace(regex, '<span class="glossary-term" data-term="$1">$1</span>')
      if (html !== originalHtml) {
        hasChanges = true
      }
    })
    
    // Only update if there are actual changes
    if (hasChanges && html !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html
      
      // Restore cursor position after highlighting
      setTimeout(() => {
        restoreCursorPosition()
        addGlossaryListeners()
      }, 10)
    }
  }, [isHighlighting, restoreCursorPosition])

  // Add event listeners to glossary terms
  const addGlossaryListeners = useCallback(() => {
    if (!editorRef.current) return

    const glossaryTerms = editorRef.current.querySelectorAll('.glossary-term')
    glossaryTerms.forEach(term => {
      // Remove existing listeners first
      term.removeEventListener('mouseenter', handleTermHover)
      term.removeEventListener('mouseleave', handleTermLeave)
      
      // Add new listeners
      term.addEventListener('mouseenter', handleTermHover)
      term.addEventListener('mouseleave', handleTermLeave)
    })
  }, [])

  // Handle term hover with caching
  const definitionCache = useRef(new Map())
  
  const handleTermHover = async (e) => {
    const term = e.target.dataset.term?.toLowerCase()
    if (!term) return

    const rect = e.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })

    // Check cache first
    if (definitionCache.current.has(term)) {
      const cachedDefinition = definitionCache.current.get(term)
      setShowTooltip({ term, definition: cachedDefinition })
      return
    }

    setShowTooltip({ term, definition: 'Loading definition...' })

    try {
      const definition = await groqService.getGlossaryDefinition(term)
      definitionCache.current.set(term, definition)
      setShowTooltip({ term, definition })
    } catch (error) {
      const fallbackDefinition = 'Definition not available'
      definitionCache.current.set(term, fallbackDefinition)
      setShowTooltip({ term, definition: fallbackDefinition })
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
      
      // Trigger content change after a brief delay to ensure DOM is updated
      setTimeout(() => {
        handleContentChange()
      }, 10)
    } catch (error) {
      console.error('Command execution failed:', error)
    }
  }, [handleContentChange, updateActiveFormats])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Save cursor position on any key press
    saveCursorPosition()
    
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

    // Update formats after a brief delay
    setTimeout(updateActiveFormats, 10)
  }, [handleCommand, updateActiveFormats, handleContentChange, saveCursorPosition])

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 editor-container">
      <Toolbar onCommand={handleCommand} activeFormats={activeFormats} />
      
      {/* Glossary Status */}
      {highlightedTerms.length > 0 && !isHighlighting && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 animate-fade-in">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ✨ <strong>{highlightedTerms.length} terms</strong> highlighted. Hover over highlighted terms for definitions!
          </p>
        </div>
      )}
      
      {/* Highlighting indicator */}
      {isHighlighting && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Analyzing content for key terms...
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
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 max-w-xs animate-scale-in"
          style={{
            left: Math.max(10, Math.min(window.innerWidth - 320, tooltipPosition.x - 150)),
            top: Math.max(10, tooltipPosition.y - 10),
            transform: 'translateY(-100%)'
          }}
          onMouseEnter={() => setShowTooltip(showTooltip)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-400 capitalize">
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
          transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dark .glossary-term {
          background-color: #451a03 !important;
          border-bottom-color: #f59e0b !important;
          color: #fbbf24 !important;
        }
        
        .glossary-term:hover {
          background-color: #fed7aa !important;
          transform: scale(1.02);
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

        /* Smooth editor transitions */
        [contenteditable] * {
          transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor