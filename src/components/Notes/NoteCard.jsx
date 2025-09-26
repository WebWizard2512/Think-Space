import { Pin, Trash2, Clock, Lock, Unlock } from 'lucide-react'

const NoteCard = ({ note, isActive, onClick, onDelete, onTogglePin, onToggleEncryption }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPreview = (content) => {
    if (note.isEncrypted) {
      return '🔒 This note is encrypted'
    }
    
    // Strip HTML tags and get first few words
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id)
    }
  }

  const handlePin = (e) => {
    e.stopPropagation()
    onTogglePin(note.id)
  }

  const handleToggleEncryption = (e) => {
    e.stopPropagation()
    onToggleEncryption(note)
  }

  return (
    <div
      onClick={() => onClick(note)}
      className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
          : 'bg-white dark:bg-dark-100 border-gray-200 dark:border-dark-200 hover:border-gray-300 dark:hover:border-dark-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {note.isEncrypted && (
            <Lock size={14} className="text-yellow-600 dark:text-yellow-400" />
          )}
          <h3 className={`font-medium text-sm line-clamp-1 ${
            isActive ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {note.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleEncryption}
            className={`p-1 rounded-md transition-colors ${
              note.isEncrypted 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
            }`}
            title={note.isEncrypted ? 'Decrypt note' : 'Encrypt note'}
          >
            {note.isEncrypted ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          
          <button
            onClick={handlePin}
            className={`p-1 rounded-md transition-colors ${
              note.isPinned 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={14} />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <p className={`text-xs line-clamp-3 mb-3 ${
        note.isEncrypted 
          ? 'text-yellow-600 dark:text-yellow-400 italic' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        {getPreview(note.content) || 'No content'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {note.isEncrypted && (
            <Lock size={12} className="text-yellow-500" />
          )}
          {note.isPinned && (
            <Pin size={12} className="text-primary-500" />
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteCard