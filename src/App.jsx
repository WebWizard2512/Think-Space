import { useEffect, useState } from 'react'
import { useNotes } from './hooks/useNotes'
import { useAI } from './hooks/useAI'
import RichTextEditor from './components/Editor/RichTextEditor'
import SearchBar from './components/Notes/SearchBar'
import NotesList from './components/Notes/NotesList'
import ThemeToggle from './components/UI/ThemeToggle'
import AIPanel from './components/AI/AIPanel'
import EncryptionModal from './components/Encryption/EncryptionModal'
import NoteTitleEditor from './components/Notes/NoteTitleEditor'
import { Menu, X } from 'lucide-react'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  
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
    decryptNote,
    updateNote
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

  // Handle app loading and theme initialization
  useEffect(() => {
    // Remove no-transition class and mark app as loaded after initial render
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('no-transition')
      setIsAppLoaded(true)
    }, 100)

    // Add no-transition class initially to prevent flash
    document.documentElement.classList.add('no-transition')

    return () => clearTimeout(timer)
  }, [])

  // Clear AI results when switching notes
  useEffect(() => {
    clearResults()
  }, [currentNote?.id, clearResults])

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

  const handleTitleChange = (newTitle) => {
    if (currentNote && !currentNote.isEncrypted) {
      updateNote(currentNote.id, { title: newTitle })
    }
  }

  const handleCreateNote = () => {
    const newNote = createNote()
    setCurrentNote(newNote)
    setIsMobileMenuOpen(false)
  }

  const handleSelectNote = (note) => {
    if (note.isEncrypted) {
      setCurrentNote({
        ...note,
        content: '🔒 This note is encrypted. Use the decrypt button to view the content.'
      })
    } else {
      setCurrentNote(note)
    }
    setIsMobileMenuOpen(false)
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

  // Show loading screen while app is initializing
  if (!isAppLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">T</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading ThinkSpace...
          </h2>
          <div className="loading-spinner mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isAppLoaded ? 'app-loaded' : 'app-loading'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus-ring"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
              ThinkSpace
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>

            {currentNote && !currentNote.isEncrypted && (
              <span className="hidden sm:block text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full transition-colors duration-300 animate-fade-in">
                Auto-saved
              </span>
            )}

            {currentNote?.isEncrypted && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full transition-colors duration-300 animate-fade-in">
                🔒 Encrypted
              </span>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden modal-backdrop animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-80
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-all duration-300 ease-in-out
          flex flex-col max-h-[calc(100vh-73px)] lg:max-h-none
        `}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateNote={handleCreateNote}
          />
          
          <div className="flex-1 overflow-y-auto">
            <NotesList
              notes={notes}
              currentNote={currentNote}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePin}
              onToggleEncryption={handleToggleEncryption}
              loading={loading}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {currentNote ? (
            <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-0 animate-fade-in">
              {/* Note Header */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <NoteTitleEditor
                    title={currentNote.title}
                    onTitleChange={handleTitleChange}
                    isEncrypted={currentNote.isEncrypted}
                  />
                  {currentNote.isEncrypted && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full transition-colors duration-300 animate-scale-in">
                      🔒 Encrypted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Last updated: {new Date(currentNote.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Editor and AI Panel Layout */}
              <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">
                {/* Editor */}
                <div className="flex-1 min-h-0">
                  {currentNote.isEncrypted ? (
                    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 animate-scale-in">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                          This note is encrypted
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                          Click the unlock button to decrypt and view the content
                        </p>
                        <button
                          onClick={() => handleToggleEncryption(currentNote)}
                          className="btn-primary btn-hover"
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

                {/* AI Panel */}
                <div className="w-full xl:w-80 xl:flex-shrink-0 max-h-96 xl:max-h-none overflow-y-auto">
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
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <span className="text-white text-3xl">✨</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Welcome to ThinkSpace
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                  Your intelligent note-taking companion with AI features and encryption. Create your first note to get started.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="btn-primary btn-hover animate-scale-in"
                >
                  Create Your First Note
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

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