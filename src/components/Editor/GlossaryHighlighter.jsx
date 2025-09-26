import { useEffect, useState, useRef } from 'react'
import { groqService } from '../../services/groqAPI'

// The component is now a pure function
const GlossaryHighlighter = ({ content }) => {
  const [showTooltip, setShowTooltip] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const highlightContainerRef = useRef(null)

  // Technical terms that commonly need definitions
  const technicalTerms = [
    'algorithm', 'api', 'blockchain', 'machine learning', 'artificial intelligence',
    'database', 'encryption', 'framework', 'protocol', 'authentication',
    'middleware', 'microservices', 'devops', 'containerization', 'virtualization',
    'scalability', 'latency', 'throughput', 'bandwidth', 'cache',
    'javascript', 'react', 'nodejs', 'python', 'typescript',
    'quantum computing', 'neural network', 'deep learning', 'cybersecurity',
    'cloud computing', 'serverless', 'kubernetes', 'docker'
  ]

  // Find technical terms and create highlighted HTML
  useEffect(() => {
    if (!content) {
      setHighlightedHtml('')
      return
    }

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const textContent = tempDiv.textContent || tempDiv.innerText || ''

    const foundTerms = [...new Set(
      technicalTerms.filter(term =>
        new RegExp(`\\b(${term})\\b`, 'gi').test(textContent)
      )
    )]

    let updatedHtml = content
    if (foundTerms.length > 0) {
      foundTerms.forEach(term => {
        const regex = new RegExp(`\\b(${term})\\b`, 'gi')
        updatedHtml = updatedHtml.replace(regex,
          `<span class="glossary-term" data-term="${term}">${term}</span>`
        )
      })
    }
    setHighlightedHtml(updatedHtml)
  }, [content])

  const handleTermHover = async (e) => {
    const term = e.target.dataset.term
    if (!term) return

    const rect = e.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })

    setIsLoading(true)
    setShowTooltip({ term, definition: 'Loading definition...' })

    try {
      const definition = await groqService.getGlossaryDefinition(term)
      setShowTooltip({ term, definition })
    } catch (error) {
      setShowTooltip({ term, definition: 'Definition not available' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermLeave = () => {
    setTimeout(() => setShowTooltip(null), 200)
  }

  useEffect(() => {
    if (!highlightContainerRef.current) return

    const glossaryTerms = highlightContainerRef.current.querySelectorAll('.glossary-term')
    glossaryTerms.forEach(term => {
      term.addEventListener('mouseenter', handleTermHover)
      term.addEventListener('mouseleave', handleTermLeave)
    })

    return () => {
      glossaryTerms.forEach(term => {
        term.removeEventListener('mouseenter', handleTermHover)
        term.removeEventListener('mouseleave', handleTermLeave)
      })
    }
  }, [highlightedHtml])

  return (
    <>
      <div 
        ref={highlightContainerRef} 
        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
        style={{ display: 'none' }} // Hide the component from view
      />

      {showTooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: tooltipPosition.x - 150,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
          onMouseEnter={() => setShowTooltip(showTooltip)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
              {showTooltip.term}
            </span>
            {isLoading && (
              <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {showTooltip.definition}
          </p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
        </div>
      )}

      {highlightedHtml.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ✨ Technical terms highlighted. Hover for definitions!
          </p>
        </div>
      )}
    </>
  )
}

export default GlossaryHighlighter