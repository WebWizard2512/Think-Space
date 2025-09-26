import { useEffect } from 'react'
import { useNotes } from './hooks/useNotes'
import { useAI } from './hooks/useAI'
import RichTextEditor from './components/Editor/RichTextEditor'
import SearchBar from './components/Notes/SearchBar'
import NotesList from './components/Notes/NotesList'
import ThemeToggle from './components/UI/ThemeToggle'
import AIPanel from './components/AI/AIPanel'

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
    autoSave
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

  const handleContentChange = (content) => {
    if (currentNote) {
      autoSave(currentNote.id, content)
    }
  }

  const handleCreateNote = () => {
    const newNote = createNote()
    setCurrentNote(newNote)
  }

  const handleSelectNote = (note) => {
    setCurrentNote(note)
  }

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId)
  }

  const handleTogglePin = (noteId) => {
    togglePin(noteId)
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
            
            {currentNote && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Auto-saved
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
            loading={loading}
          />
        </aside>

        {/* Editor Area */}
        <section className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {currentNote ? (
            <div className="flex-1 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentNote.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(currentNote.updatedAt).toLocaleString()}
                </p>
              </div>
              
              {/* Split Layout: Editor + AI Panel */}
              <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* Editor Column */}
                <div className="flex-1">
                  <RichTextEditor
                    key={currentNote.id}
                    content={currentNote.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your thoughts..."
                  />
                </div>
                
                {/* AI Panel Column */}
                <div className="w-80 overflow-y-auto">
                  <AIPanel
                    noteContent={currentNote.content}
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
                  Your intelligent note-taking companion. Create your first note or select an existing one to get started.
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
    </div>
  )
}

export default App