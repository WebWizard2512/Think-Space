import { useRef, useEffect, useState, useCallback } from 'react'
import Toolbar from './Toolbar'

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState([])

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
      updateActiveFormats()
    }
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
    </div>
  )
}

export default RichTextEditor