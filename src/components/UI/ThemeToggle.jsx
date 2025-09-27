import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    setIsDark(shouldBeDark)
    
    const htmlElement = document.documentElement
    
    // Set theme without transition on initial load
    if (shouldBeDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
    
    // Enable smooth transitions after initial load
    setTimeout(() => {
      setIsLoaded(true)
    }, 200)
  }, [])

  const toggleTheme = async () => {
    if (isTransitioning) return // Prevent multiple rapid clicks
    
    setIsTransitioning(true)
    const newTheme = isDark ? 'light' : 'dark'
    const htmlElement = document.documentElement
    
    // Add transition class for smooth animation
    if (isLoaded) {
      htmlElement.style.transition = 'color 400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 400ms cubic-bezier(0.4, 0, 0.2, 1)'
    }
    
    // Update state immediately for button animation
    setIsDark(!isDark)
    
    // Add a slight delay for better visual feedback
    setTimeout(() => {
      if (newTheme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
      
      localStorage.setItem('theme', newTheme)
      
      // Reset transition flag
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    }, 50)
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`theme-toggle relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden group ${
        isTransitioning ? 'scale-95' : 'hover:scale-105'
      } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background gradient animation */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-blue-600/10 to-purple-600/10' 
          : 'bg-gradient-to-br from-yellow-400/10 to-orange-500/10'
      } opacity-0 group-hover:opacity-100`}></div>
      
      {/* Icon container with rotation animation */}
      <div className="relative z-10">
        <div className={`transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) ${
          isTransitioning ? 'rotate-180 scale-75' : 'rotate-0 scale-100'
        }`}>
          {isDark ? (
            <Sun 
              size={20} 
              className={`transition-all duration-300 ${
                isTransitioning ? 'text-yellow-500' : ''
              }`}
            />
          ) : (
            <Moon 
              size={20} 
              className={`transition-all duration-300 ${
                isTransitioning ? 'text-blue-400' : ''
              }`}
            />
          )}
        </div>
      </div>

      {/* Ripple effect */}
      {isTransitioning && (
        <div className="absolute inset-0 rounded-xl">
          <div className="absolute inset-0 rounded-xl bg-current opacity-10 animate-ping"></div>
        </div>
      )}

      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
        isDark 
          ? 'shadow-lg shadow-blue-500/20 opacity-0 group-hover:opacity-100' 
          : 'shadow-lg shadow-yellow-500/20 opacity-0 group-hover:opacity-100'
      }`}></div>
    </button>
  )
}

export default ThemeToggle