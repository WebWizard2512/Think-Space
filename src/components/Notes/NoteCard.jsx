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
      className={`note-card group p-4 rounded-xl border cursor-pointer transition-all duration-300 ease-out ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md transform scale-[1.02]'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:transform hover:scale-[1.01]'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {note.isEncrypted && (
            <Lock 
              size={14} 
              className="text-yellow-600 dark:text-yellow-400 animate-pulse flex-shrink-0" 
            />
          )}
          <h3 className={`font-medium text-sm line-clamp-1 transition-colors duration-300 ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
            }`}>
            {note.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleToggleEncryption}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${note.isEncrypted
                ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              }`}
            title={note.isEncrypted ? 'Decrypt note' : 'Encrypt note'}
          >
            {note.isEncrypted ? <Lock size={14} /> : <Unlock size={14} />}
          </button>

          <button
            onClick={handlePin}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${note.isPinned
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin 
              size={14} 
              className={note.isPinned ? 'transform rotate-12' : ''} 
            />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <p className={`text-xs line-clamp-3 mb-3 transition-colors duration-300 leading-relaxed ${note.isEncrypted
          ? 'text-yellow-600 dark:text-yellow-400 italic'
          : 'text-gray-600 dark:text-gray-400'
        }`}>
        {getPreview(note.content) || 'No content'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-1 transition-colors duration-300">
          <Clock size={12} className="opacity-60" />
          <span>{formatDate(note.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {note.isEncrypted && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Lock size={10} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                Encrypted
              </span>
            </div>
          )}
          {note.isPinned && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Pin size={10} className="text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                Pinned
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

export default NoteCard