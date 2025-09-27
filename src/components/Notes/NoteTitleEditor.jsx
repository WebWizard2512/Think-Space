import { useState, useRef, useEffect } from 'react'

const NoteTitleEditor = ({ title, onTitleChange, isEncrypted }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSubmit = () => {
    const newTitle = editTitle.trim() || 'Untitled Note'
    onTitleChange(newTitle)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setEditTitle(title)
      setIsEditing(false)
    }
  }

  if (isEncrypted) {
    return (
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900 dark:text-white min-w-0 flex-1"
          maxLength={50}
        />
      ) : (
        <h2 
          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => setIsEditing(true)}
          title="Click to edit title"
        >
          {title}
        </h2>
      )}
    </div>
  )
}

export default NoteTitleEditor