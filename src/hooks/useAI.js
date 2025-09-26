import { useState, useCallback } from 'react'
import { groqService } from '../services/groqAPI'

export const useAI = () => {
  const [loading, setLoading] = useState({
    summary: false,
    tags: false,
    grammar: false,
    glossary: false
  })

  const [results, setResults] = useState({
    summary: '',
    tags: [],
    grammarErrors: [],
    glossaryTerm: null
  })

  const generateSummary = async (content) => {
    setLoading(prev => ({ ...prev, summary: true }))
    try {
      const summary = await groqService.summarizeNote(content)
      setResults(prev => ({ ...prev, summary }))
      return summary
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setResults(prev => ({ ...prev, summary: 'Failed to generate summary' }))
    } finally {
      setLoading(prev => ({ ...prev, summary: false }))
    }
  }

  const generateTags = async (content) => {
    setLoading(prev => ({ ...prev, tags: true }))
    try {
      const tags = await groqService.generateTags(content)
      setResults(prev => ({ ...prev, tags }))
      return tags
    } catch (error) {
      console.error('Failed to generate tags:', error)
      setResults(prev => ({ ...prev, tags: [] }))
    } finally {
      setLoading(prev => ({ ...prev, tags: false }))
    }
  }

  const checkGrammar = async (content) => {
    setLoading(prev => ({ ...prev, grammar: true }))
    try {
      const grammarErrors = await groqService.checkGrammar(content)
      setResults(prev => ({ ...prev, grammarErrors }))
      return grammarErrors
    } catch (error) {
      console.error('Failed to check grammar:', error)
      setResults(prev => ({ ...prev, grammarErrors: [] }))
    } finally {
      setLoading(prev => ({ ...prev, grammar: false }))
    }
  }

  const getGlossaryDefinition = async (term) => {
    setLoading(prev => ({ ...prev, glossary: true }))
    try {
      const definition = await groqService.getGlossaryDefinition(term)
      setResults(prev => ({ ...prev, glossaryTerm: { term, definition } }))
      return definition
    } catch (error) {
      console.error('Failed to get definition:', error)
      setResults(prev => ({ ...prev, glossaryTerm: { term, definition: 'Definition not available' } }))
    } finally {
      setLoading(prev => ({ ...prev, glossary: false }))
    }
  }

  const clearResults = useCallback(() => {
    setResults({
      summary: '',
      tags: [],
      grammarErrors: [],
      glossaryTerm: null
    })
  }, [])

  return {
    loading,
    results,
    generateSummary,
    generateTags,
    checkGrammar,
    getGlossaryDefinition,
    clearResults
  }
}