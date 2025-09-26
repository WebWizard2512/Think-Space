import { useEffect, useState } from 'react'
import { useNotes } from './hooks/useNotes'
import { useAI } from './hooks/useAI'
import RichTextEditor from './components/Editor/RichTextEditor'
import SearchBar from './components/Notes/SearchBar'
import NotesList from './components/Notes/NotesList'
import ThemeToggle from './components/UI/ThemeToggle'
import AIPanel from './components/AI/AIPanel'
import EncryptionModal from './components/Encryption/EncryptionModal'

function App() {
  const {
    notes,
    currentNote,
    searchQuery,
    loading,
    setCurrentNote,
    setSearchQuery,
    createNote,
    deleteNote,
    togglePin,
    autoSave,
    encryptNote,
    decryptNote
  } = useNotes()

  // AI Hook
  const { 
    loading: aiLoading, 
    results: aiResults, 
    generateSummary, 
    generateTags, 
    checkGrammar, 
    clearResults 
  } = useAI()

  // Encryption Modal State
  const [encryptionModal, setEncryptionModal] = useState({
    isOpen: false,
    note: null
  })

  const handleContentChange = (content) => {
    if (currentNote && !currentNote.isEncrypted) {
      autoSave(currentNote.id, content)
    }
  }

  const handleCreateNote = () => {
    const newNote = createNote()
    setCurrentNote(newNote)
  }

  const handleSelectNote = (note) => {
    if (note.isEncrypted) {
      // Show encrypted placeholder content
      setCurrentNote({
        ...note,
        content: '🔒 This note is encrypted. Use the decrypt button to view the content.'
      })
    } else {
      setCurrentNote(note)
    }
  }

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId)
  }

  const handleTogglePin = (noteId) => {
    togglePin(noteId)
  }

  const handleToggleEncryption = (note) => {
    setEncryptionModal({
      isOpen: true,
      note: note
    })
  }

  const handleCloseEncryptionModal = () => {
    setEncryptionModal({
      isOpen: false,
      note: null
    })
  }

  const handleEncryptNote = async (noteId, password) => {
    try {
      await encryptNote(noteId, password)
      // Update current note display
      if (currentNote?.id === noteId) {
        setCurrentNote(prev => ({
          ...prev,
          isEncrypted: true,
          content: '🔒 This note is encrypted. Use the decrypt button to view the content.'
        }))
      }
    } catch (error) {
      throw error
    }
  }

  const handleDecryptNote = async (noteId, password) => {
    try {
      const success = await decryptNote(noteId, password)
      return success
    } catch (error) {
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ThinkSpace
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
            
            {currentNote && !currentNote.isEncrypted && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Auto-saved
              </span>
            )}

            {currentNote?.isEncrypted && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                🔒 Encrypted
              </span>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateNote={handleCreateNote}
          />
          
          <NotesList
            notes={notes}
            currentNote={currentNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleEncryption={handleToggleEncryption}
            loading={loading}
          />
        </aside>

        {/* Editor Area */}
        <section className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {currentNote ? (
            <div className="flex-1 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentNote.title}
                  </h2>
                  {currentNote.isEncrypted && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                      🔒 Encrypted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(currentNote.updatedAt).toLocaleString()}
                </p>
              </div>
              
              {/* Split Layout: Editor + AI Panel */}
              <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* Editor Column */}
                <div className="flex-1">
                  {currentNote.isEncrypted ? (
                    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          This note is encrypted
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Click the unlock button to decrypt and view the content
                        </p>
                        <button
                          onClick={() => handleToggleEncryption(currentNote)}
                          className="btn-primary"
                        >
                          🔓 Decrypt Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <RichTextEditor
                      key={currentNote.id}
                      content={currentNote.content}
                      onChange={handleContentChange}
                      placeholder="Start writing your thoughts..."
                    />
                  )}
                </div>
                
                {/* AI Panel Column */}
                <div className="w-80 overflow-y-auto">
                  <AIPanel
                    noteContent={currentNote.isEncrypted ? '' : currentNote.content}
                    aiResults={aiResults}
                    aiLoading={aiLoading}
                    onGenerateSummary={generateSummary}
                    onGenerateTags={generateTags}
                    onCheckGrammar={checkGrammar}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">✨</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to ThinkSpace
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Your intelligent note-taking companion with AI features and encryption. Create your first note to get started.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="btn-primary"
                >
                  Create Your First Note
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Encryption Modal */}
      <EncryptionModal
        isOpen={encryptionModal.isOpen}
        note={encryptionModal.note}
        onClose={handleCloseEncryptionModal}
        onEncrypt={handleEncryptNote}
        onDecrypt={handleDecryptNote}
      />
    </div>
  )
}

export default App