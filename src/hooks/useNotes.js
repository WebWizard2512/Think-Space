import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'

export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    setLoading(true)
    const savedNotes = storageService.getNotes()
    setNotes(savedNotes)
    setLoading(false)
  }

  // Filter notes based on search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create new note
  const createNote = () => {
    const newNote = storageService.addNote({
      title: 'New Note',
      content: ''
    })
    setNotes(prev => [newNote, ...prev])
    setCurrentNote(newNote)
    return newNote
  }

  // Update note
  const updateNote = (id, updates) => {
    const updatedNote = storageService.updateNote(id, updates)
    if (updatedNote) {
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ))
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote)
      }
    }
    return updatedNote
  }

  // Delete note
  const deleteNote = (id) => {
    storageService.deleteNote(id)
    setNotes(prev => prev.filter(note => note.id !== id))
    if (currentNote?.id === id) {
      setCurrentNote(null)
    }
  }

  // Toggle pin
  const togglePin = (id) => {
    const updatedNote = storageService.togglePin(id)
    if (updatedNote) {
      loadNotes() // Reload to get proper sorting
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote)
      }
    }
  }

  // Auto-save note content
  const autoSave = (noteId, content) => {
    if (!noteId) return
    
    // Extract title from first line of content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    const title = textContent.split('\n')[0].trim() || 'Untitled Note'
    
    updateNote(noteId, { 
      content, 
      title: title.substring(0, 50) // Limit title length
    })
  }

  return {
    notes: filteredNotes,
    currentNote,
    searchQuery,
    loading,
    setCurrentNote,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    autoSave
  }
}