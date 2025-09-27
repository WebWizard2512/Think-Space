import { Search, Plus } from 'lucide-react'

const SearchBar = ({ searchQuery, setSearchQuery, onCreateNote }) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      {/* Create Note Button */}
      <button
        onClick={onCreateNote}
        className="w-full mb-4 flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
      >
        <Plus size={18} />
        New Note
      </button>

      {/* Search Input */}
      <div className="relative">
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
        />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
        />
      </div>
    </div>
  )
}

export default SearchBar