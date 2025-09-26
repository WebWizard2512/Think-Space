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

  const handleCommand = (command, value = null) => {
    onCommand(command, value)
  }

  return (
    <div className="border-b border-gray-200 dark:border-dark-200 bg-white/50 dark:bg-dark-100/50 backdrop-blur-sm">
      <div className="flex items-center gap-1 p-3">
        {/* Format Buttons */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-dark-200 pr-3 mr-3">
          {formatButtons.map(({ command, icon: Icon, label, shortcut }) => (
            <button
              key={command}
              onClick={() => handleCommand(command)}
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-200 ${
                activeFormats?.includes(command) 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title={`${label} (${shortcut})`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-dark-200 pr-3 mr-3">
          <Type size={16} className="text-gray-500 dark:text-gray-400" />
          <select 
            onChange={(e) => handleCommand('fontSize', e.target.value)}
            className="bg-transparent text-sm focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
            defaultValue="3"
          >
            {fontSizes.map(({ value, label }) => (
              <option key={value} value={value} className="bg-white dark:bg-dark-100">
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
              onClick={() => handleCommand(command)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-600 dark:text-gray-400"
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Status indicator */}
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-dark-200 rounded text-xs">Ctrl+S</kbd> to save
        </div>
      </div>
    </div>
  )
}

export default Toolbar