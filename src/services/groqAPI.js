const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

class GroqService {
  async makeRequest(messages, maxTokens = 150) {
    console.log('Making Groq API request with:', { messages, maxTokens, apiKeyLength: GROQ_API_KEY?.length })
    
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma-7b-it', // Updated to current model
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorBody = await response.text()
        console.log('Error response body:', errorBody)
        throw new Error(`Groq API error: ${response.status} - ${errorBody}`)
      }

      const data = await response.json()
      console.log('Groq API success:', data)
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Groq API Error:', error)
      throw error
    }
  }

  async summarizeNote(content) {
    // Strip HTML tags for better processing
    const textContent = content.replace(/<[^>]*>/g, ' ').trim()
    
    if (!textContent || textContent.length < 20) {
      return 'Note is too short to summarize'
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise 1-2 line summaries of notes. Keep it brief and capture the main idea.'
      },
      {
        role: 'user',
        content: `Summarize this note in 1-2 lines: ${textContent}`
      }
    ]

    return await this.makeRequest(messages, 100)
  }

  async generateTags(content) {
    const textContent = content.replace(/<[^>]*>/g, ' ').trim()
    
    if (!textContent || textContent.length < 20) {
      return []
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates 3-5 relevant tags for notes. Return only the tags separated by commas, no explanations.'
      },
      {
        role: 'user',
        content: `Generate 3-5 relevant tags for this note: ${textContent}`
      }
    ]

    try {
      const response = await this.makeRequest(messages, 50)
      return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).slice(0, 5)
    } catch (error) {
      console.error('Error generating tags:', error)
      return []
    }
  }

  async checkGrammar(text) {
    const textContent = text.replace(/<[^>]*>/g, ' ').trim()
    
    if (!textContent || textContent.length < 10) {
      return []
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a grammar checker. Find grammar errors and suggest corrections. Return each error as "ERROR: [original text] -> SUGGESTION: [corrected text]" on separate lines. If no errors, return "No grammar errors found."'
      },
      {
        role: 'user',
        content: `Check grammar in this text: ${textContent.substring(0, 500)}` // Limit length
      }
    ]

    try {
      const response = await this.makeRequest(messages, 200)
      
      if (response.includes('No grammar errors found')) {
        return []
      }

      // Parse the response to extract errors
      const errors = response.split('\n').filter(line => line.includes('ERROR:')).map(line => {
        const parts = line.split(' -> SUGGESTION: ')
        if (parts.length === 2) {
          return {
            error: parts[0].replace('ERROR: ', ''),
            suggestion: parts[1]
          }
        }
        return null
      }).filter(Boolean)

      return errors.slice(0, 3) // Limit to 3 errors
    } catch (error) {
      console.error('Error checking grammar:', error)
      return []
    }
  }

  async getGlossaryDefinition(term) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides brief, clear definitions of terms. Keep definitions to 1-2 sentences.'
      },
      {
        role: 'user',
        content: `Define this term briefly: ${term}`
      }
    ]

    try {
      return await this.makeRequest(messages, 100)
    } catch (error) {
      console.error('Error getting definition:', error)
      return 'Definition not available'
    }
  }
}

export const groqService = new GroqService()