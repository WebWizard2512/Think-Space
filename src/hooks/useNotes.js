import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'
import { encryptionService } from '../services/encryptionService'

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
    (!note.isEncrypted && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // Encrypt note
  const encryptNote = async (id, password) => {
    try {
      const note = notes.find(n => n.id === id)
      if (!note) throw new Error('Note not found')

      // Encrypt the content
      const encryptedContent = await encryptionService.encrypt(note.content, password)

      // Update note with encrypted data
      const updatedNote = storageService.updateNote(id, {
        content: encryptedContent,
        isEncrypted: true,
        encryptedAt: new Date().toISOString()
      })

      if (updatedNote) {
        setNotes(prev => prev.map(n => n.id === id ? updatedNote : n))
        if (currentNote?.id === id) {
          setCurrentNote({ ...updatedNote, content: '🔒 This note is encrypted. Click to decrypt.' })
        }
      }

      return true
    } catch (error) {
      console.error('Encryption failed:', error)
      throw error
    }
  }

  // Decrypt note
  const decryptNote = async (id, password) => {
    try {
      const note = notes.find(n => n.id === id)
      if (!note || !note.isEncrypted) throw new Error('Note not found or not encrypted')

      // Decrypt the content
      const decryptedContent = await encryptionService.decrypt(note.content, password)

      // Update note with decrypted data
      const updatedNote = storageService.updateNote(id, {
        content: decryptedContent,
        isEncrypted: false,
        decryptedAt: new Date().toISOString()
      })

      if (updatedNote) {
        setNotes(prev => prev.map(n => n.id === id ? updatedNote : n))
        if (currentNote?.id === id) {
          setCurrentNote(updatedNote)
        }
      }

      return true
    } catch (error) {
      console.error('Decryption failed:', error)
      return false
    }
  }

  // Auto-save note content
  const autoSave = (noteId, content) => {
  if (!noteId) return

  const note = notes.find(n => n.id === noteId)
  if (note?.isEncrypted) {
    return
  }
  // Only update content, don't auto-generate title from content
  updateNote(noteId, { content })
}

  return (
    {
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
      autoSave,
      encryptNote,
      decryptNote
    }
  )
}