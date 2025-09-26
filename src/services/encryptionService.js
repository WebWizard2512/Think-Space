// Simple encryption service using Web Crypto API
export const encryptionService = {
  // Generate a key from password
  async generateKey(password, salt) {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  },

  // Encrypt text content
  async encrypt(plaintext, password) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)
      
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      // Generate key from password
      const key = await this.generateKey(password, salt)
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      )

      // Combine salt, iv, and encrypted data
      const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      result.set(salt, 0)
      result.set(iv, salt.length)
      result.set(new Uint8Array(encrypted), salt.length + iv.length)

      // Return as base64 string for storage
      return btoa(String.fromCharCode(...result))
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt content')
    }
  },

  // Decrypt text content
  async decrypt(encryptedData, password) {
    try {
      // Convert from base64
      const data = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      // Extract salt, iv, and encrypted content
      const salt = data.slice(0, 16)
      const iv = data.slice(16, 28)
      const encrypted = data.slice(28)
      
      // Generate key from password
      const key = await this.generateKey(password, salt)
      
      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      )

      // Convert back to string
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt content - incorrect password or corrupted data')
    }
  },

  // Verify if a password is correct without fully decrypting
  async verifyPassword(encryptedData, password) {
    try {
      await this.decrypt(encryptedData, password)
      return true
    } catch (error) {
      return false
    }
  }
}