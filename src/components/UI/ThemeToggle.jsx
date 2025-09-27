import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    setIsDark(shouldBeDark)
    
    // Add transition class to html element for smooth transitions
    const htmlElement = document.documentElement
    
    // Set theme without transition on initial load
    if (shouldBeDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
    
    // Enable transitions after initial load
    setTimeout(() => {
      htmlElement.style.transition = 'color 0.3s ease, background-color 0.3s ease'
      setIsLoaded(true)
    }, 100)
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    const htmlElement = document.documentElement
    
    setIsDark(!isDark)
    
    // Add smooth transition class before changing theme
    if (isLoaded) {
      htmlElement.style.transition = 'color 0.3s ease, background-color 0.3s ease'
    }
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
    
    localStorage.setItem('theme', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 overflow-hidden group"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background animation */}
      <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Icon container with smooth transition */}
      <div className="relative">
        {isDark ? (
          <Sun 
            size={18} 
            className="transform transition-all duration-300 rotate-0 scale-100"
          />
        ) : (
          <Moon 
            size={18} 
            className="transform transition-all duration-300 rotate-0 scale-100"
          />
        )}
      </div>
    </button>
  )
}

export default ThemeToggle