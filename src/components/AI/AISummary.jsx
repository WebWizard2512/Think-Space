import { Brain, Loader2 } from 'lucide-react'

const AISummary = ({ summary, loading, onGenerate, noteContent }) => {
  const handleGenerate = () => {
    if (!noteContent || noteContent.trim().length < 20) {
      alert('Please write more content before generating a summary!')
      return
    }
    onGenerate(noteContent)
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            AI Summary
          </h3>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Summary'
          )}
        </button>
      </div>

      {summary ? (
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
          {summary}
        </p>
      ) : (
        <p className="text-sm text-blue-600 dark:text-blue-400 italic">
          Click "Generate Summary" to get an AI-powered summary of your note.
        </p>
      )}
    </div>
  )
}

export default AISummary