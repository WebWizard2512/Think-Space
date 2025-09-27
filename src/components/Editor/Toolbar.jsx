import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, MoreHorizontal, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const Toolbar = ({ onCommand, activeFormats }) => {
  const [showMore, setShowMore] = useState(false)
  const [showFontSize, setShowFontSize] = useState(false)

  const formatButtons = [
    { command: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
  ]

  const alignButtons = [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ]

  const fontSizes = [
    { value: '1', label: 'Small' },
    { value: '3', label: 'Normal' },
    { value: '5', label: 'Large' },
    { value: '7', label: 'Extra Large' },
  ]

  const handleFontSizeSelect = (value) => {
    onCommand('fontSize', value)
    setShowFontSize(false)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm transition-colors duration-200">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center gap-1 p-3">
        {/* Format Buttons */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
          {formatButtons.map(({ command, icon: Icon, label, shortcut }) => (
            <button
              key={command}
              onClick={() => onCommand(command)}
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeFormats?.includes(command) 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title={`${label} (${shortcut})`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
          <Type size={16} className="text-gray-500 dark:text-gray-400" />
          <select 
            onChange={(e) => onCommand('fontSize', e.target.value)}
            className="bg-white dark:bg-gray-800 text-sm focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 transition-colors duration-200"
            defaultValue="3"
          >
            {fontSizes.map(({ value, label }) => (
              <option key={value} value={value} className="bg-white dark:bg-gray-800">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          {alignButtons.map(({ command, icon: Icon, label }) => (
            <button
              key={command}
              onClick={() => onCommand(command)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Status indicator */}
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> to save
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden">
        {/* Primary Row - Most Used Actions */}
        <div className="flex items-center justify-between p-2 gap-1">
          {/* Essential Format Buttons */}
          <div className="flex items-center gap-1">
            {formatButtons.map(({ command, icon: Icon, label }) => (
              <button
                key={command}
                onClick={() => onCommand(command)}
                className={`p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  activeFormats?.includes(command) 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                title={label}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          {/* Font Size Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFontSize(!showFontSize)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Type size={16} />
              <ChevronDown size={14} className={`transition-transform ${showFontSize ? 'rotate-180' : ''}`} />
            </button>
            
            {showFontSize && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-32">
                {fontSizes.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleFontSizeSelect(value)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Options */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title="More options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Secondary Row - Additional Options (Collapsible) */}
        {showMore && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {alignButtons.map(({ command, icon: Icon, label }) => (
                  <button
                    key={command}
                    onClick={() => onCommand(command)}
                    className="p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    title={label}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl+S</kbd> to save
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showFontSize || showMore) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowFontSize(false)
            setShowMore(false)
          }}
        />
      )}
    </div>
  )
}

export default Toolbar