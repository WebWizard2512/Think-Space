import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'
import GlossaryHighlighter from './GlossaryHighlighter'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])

  // Initialize editor content
  useEffect(() => {
    // Only update the innerHTML if the content from props is different
    // to prevent cursor jumping.
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  // Handle content changes
  const handleContentChange = useCallback(() => {
    const contentToUse = editorRef.current ? editorRef.current.innerHTML : ''
    onChange(contentToUse)
    updateActiveFormats()
  }, [onChange])

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
    // Save shortcut
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleContentChange()
      return
    }

    // Format shortcuts
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
        default:
          break
      }
    }

    // A small delay is needed to let the browser update the selection
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
    }
  }, [handleSelectionChange])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <Toolbar onCommand={handleCommand} activeFormats={activeFormats} />
      
      <div className="flex-1 p-6">
        {/* The contentEditable div is the single source of content management */}
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
            lineHeight: '1.6'
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* GlossaryHighlighter is now a separate component that only renders the content.
        It does not call onContentChange, which prevents the circular reference. */}
      <GlossaryHighlighter content={content} />

      {/* Corrected style tag: removed 'jsx' attribute */}
      <style>{`
        .glossary-term {
          background-color: #fef3c7 !important;
          border-bottom: 2px dotted #f59e0b !important;
          cursor: pointer !important;
          padding: 1px 2px;
          border-radius: 2px;
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
      `}</style>
    </div>
  )
}

export default RichTextEditor