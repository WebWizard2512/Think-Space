import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import AISummary from './AISummary'
import AITags from './AITags'
import GrammarCheck from './GrammarCheck'

const AIPanel = ({ noteContent, aiResults, aiLoading, onGenerateSummary, onGenerateTags, onCheckGrammar }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!noteContent || noteContent.trim().length < 20) {
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <Sparkles size={16} />
          <p className="text-sm">Write some content to unlock AI features!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            AI Assistant
          </h2>
        </div>
        
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <AISummary
            summary={aiResults.summary}
            loading={aiLoading.summary}
            onGenerate={onGenerateSummary}
            noteContent={noteContent}
          />

          <AITags
            tags={aiResults.tags}
            loading={aiLoading.tags}
            onGenerate={onGenerateTags}
            noteContent={noteContent}
          />

          <GrammarCheck
            grammarErrors={aiResults.grammarErrors}
            loading={aiLoading.grammar}
            onCheck={onCheckGrammar}
            noteContent={noteContent}
          />
        </div>
      )}
    </div>
  )
}

export default AIPanel