import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react'

const Toolbar = ({ onCommand, activeFormats }) => {
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

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm">
      <div className="flex items-center gap-1 p-3">
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
            className="bg-white dark:bg-gray-800 text-sm focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
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
    </div>
  )
}

export default Toolbar