import { Tag, Loader2, Plus } from 'lucide-react'

const AITags = ({ tags, loading, onGenerate, noteContent, onAddTag }) => {
  const handleGenerate = () => {
    if (!noteContent || noteContent.trim().length < 20) {
      alert('Please write more content before generating tags!')
      return
    }
    onGenerate(noteContent)
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
            AI Tags
          </h3>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Tags'
          )}
        </button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs"
            >
              <span>{tag}</span>
              <button
                onClick={() => onAddTag && onAddTag(tag)}
                className="hover:bg-green-200 dark:hover:bg-green-700/50 p-0.5 rounded-full transition-colors"
                title="Add to note"
              >
                <Plus size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-green-600 dark:text-green-400 italic">
          Click "Generate Tags" to get AI-suggested tags for your note.
        </p>
      )}
    </div>
  )
}

export default AITags