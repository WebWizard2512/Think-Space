// Local Storage service for ThinkSpace
export const storageService = {
  // Get all notes
  getNotes: () => {
    try {
      const notes = localStorage.getItem('thinkspace_notes')
      return notes ? JSON.parse(notes) : []
    } catch (error) {
      console.error('Failed to get notes:', error)
      return []
    }
  },

  // Save notes array
  saveNotes: (notes) => {
    try {
      localStorage.setItem('thinkspace_notes', JSON.stringify(notes))
      return true
    } catch (error) {
      console.error('Failed to save notes:', error)
      return false
    }
  },

  // Add new note
  addNote: (note) => {
    const notes = storageService.getNotes()
    const newNote = {
  id: Date.now().toString(),
  title: note.title || 'Untitled Note',
  content: note.content || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPinned: false,
  isEncrypted: false,
  tags: []
}
    notes.unshift(newNote)
    storageService.saveNotes(notes)
    return newNote
  },

  // Update existing note
  updateNote: (id, updates) => {
    const notes = storageService.getNotes()
    const index = notes.findIndex(note => note.id === id)
    
    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      storageService.saveNotes(notes)
      return notes[index]
    }
    return null
  },

  // Delete note
  deleteNote: (id) => {
    const notes = storageService.getNotes()
    const filteredNotes = notes.filter(note => note.id !== id)
    storageService.saveNotes(filteredNotes)
    return true
  },

  // Toggle pin status
  togglePin: (id) => {
    const notes = storageService.getNotes()
    const note = notes.find(n => n.id === id)
    
    if (note) {
      note.isPinned = !note.isPinned
      note.updatedAt = new Date().toISOString()
      
      // Sort notes: pinned first, then by updatedAt
      notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
      
      storageService.saveNotes(notes)
      return note
    }
    return null
  }
}