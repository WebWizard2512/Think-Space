import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const GrammarCheck = ({ grammarErrors, loading, onCheck, noteContent }) => {
  const handleCheck = () => {
    if (!noteContent || noteContent.trim().length < 10) {
      alert('Please write some content before checking grammar!')
      return
    }
    onCheck(noteContent)
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">
            Grammar Check
          </h3>
        </div>
        
        <button
          onClick={handleCheck}
          disabled={loading}
          className="text-xs bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Checking...
            </>
          ) : (
            'Check Grammar'
          )}
        </button>
      </div>

      {grammarErrors.length > 0 ? (
        <div className="space-y-2">
          {grammarErrors.map((error, index) => (
            <div key={index} className="bg-orange-100 dark:bg-orange-800/30 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-orange-800 dark:text-orange-200 font-medium mb-1">
                    "{error.error}"
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    Suggestion: "{error.suggestion}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : grammarErrors.length === 0 && !loading ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle size={14} />
          <p className="text-sm">No grammar errors found! 🎉</p>
        </div>
      ) : (
        <p className="text-sm text-orange-600 dark:text-orange-400 italic">
          Click "Check Grammar" to analyze your text for grammar issues.
        </p>
      )}
    </div>
  )
}

export default GrammarCheck