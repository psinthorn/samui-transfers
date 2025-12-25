import crypto from 'crypto'

/**
 * Encryption utility for sensitive payment gateway credentials
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm'
const ENCODING = 'hex'

// Get encryption key from environment - must be 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  
  // Key should be exactly 64 hex characters (32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a sensitive string
 * @param plaintext The string to encrypt
 * @returns Encrypted string with IV and auth tag (IV:authTag:encryptedData)
 */
export function encryptCredential(plaintext: string): string {
  if (!plaintext) return plaintext
  
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(plaintext, 'utf8', ENCODING)
    encrypted += cipher.final(ENCODING)
    
    const authTag = cipher.getAuthTag()
    
    // Return in format: iv:authTag:encryptedData (all hex encoded)
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

/**
 * Decrypt a sensitive string
 * @param encryptedText The encrypted string (IV:authTag:encryptedData format)
 * @returns Decrypted plaintext
 */
export function decryptCredential(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  
  try {
    const key = getEncryptionKey()
    
    // Parse the encrypted string
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format')
    }
    
    const iv = Buffer.from(parts[0], ENCODING)
    const authTag = Buffer.from(parts[1], ENCODING)
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, ENCODING, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

/**
 * Generate a random encryption key for setup
 * @returns A 64-character hex string (32 bytes) suitable for ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
