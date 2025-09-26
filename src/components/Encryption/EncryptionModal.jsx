import { useState } from 'react'
import { Lock, Unlock, X, Eye, EyeOff } from 'lucide-react'

const EncryptionModal = ({ isOpen, onClose, onEncrypt, onDecrypt, note }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isEncrypting = !note?.isEncrypted
  const isDecrypting = note?.isEncrypted

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isEncrypting) {
        // Encrypting the note
        if (password.length < 4) {
          setError('Password must be at least 4 characters long')
          return
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }

        await onEncrypt(note.id, password)
      } else {
        // Decrypting the note
        if (!password) {
          setError('Please enter the password')
          return
        }

        const success = await onDecrypt(note.id, password)
        if (!success) {
          setError('Incorrect password')
          return
        }
      }

      // Close modal and reset form
      onClose()
      resetForm()
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isEncrypting ? (
              <Lock size={24} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Unlock size={24} className="text-green-600 dark:text-green-400" />
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEncrypting ? 'Encrypt Note' : 'Decrypt Note'}
            </h2>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {isEncrypting 
            ? 'Protect this note with a password. You will need this password to view the note content.'
            : 'Enter the password to decrypt and view this note.'
          }
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only when encrypting) */}
          {isEncrypting && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Warning for encryption */}
          {isEncrypting && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Important:</strong> If you forget this password, you won't be able to recover the note content.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                isEncrypting
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEncrypting ? 'Encrypting...' : 'Decrypting...'}
                </span>
              ) : (
                isEncrypting ? 'Encrypt Note' : 'Decrypt Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EncryptionModal