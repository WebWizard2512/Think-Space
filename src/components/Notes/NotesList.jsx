import NoteCard from './NoteCard'

// Add onToggleEncryption to the destructured props list
const NotesList = ({ notes, currentNote, onSelectNote, onDeleteNote, onTogglePin, onToggleEncryption, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading notes...</p>
        </div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No notes found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Create your first note to get started!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isActive={currentNote?.id === note.id}
          onClick={onSelectNote}
          onDelete={onDeleteNote}
          onTogglePin={onTogglePin}
          onToggleEncryption={onToggleEncryption}
        />
      ))}
    </div>
  )
}

export default NotesList