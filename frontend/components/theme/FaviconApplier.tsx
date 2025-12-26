'use client'

import { useTheme } from '@/context/ThemeContext'
import { useEffect } from 'react'

/**
 * FaviconApplier Component
 * 
 * This client component applies the favicon from the theme to the page.
 * It watches for changes to the theme's faviconUrl and updates the document favicon accordingly.
 * 
 * Benefits of this approach:
 * - Favicon can be changed dynamically without page reload
 * - Multiple favicons can be supported (apple-touch-icon, etc.)
 * - Falls back to default if theme favicon is not available
 * 
 * Usage:
 * Add this component to your layout:
 * <FaviconApplier />
 */

export function FaviconApplier() {
  const { theme } = useTheme()

  useEffect(() => {
    if (!theme?.faviconUrl) return

    try {
      // Update main favicon link
      const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (faviconLink) {
        faviconLink.href = theme.faviconUrl
      } else {
        // Create new favicon link if it doesn't exist
        const newLink = document.createElement('link')
        newLink.rel = 'icon'
        newLink.href = theme.faviconUrl
        document.head.appendChild(newLink)
      }

      // Update apple touch icon (for iOS)
      let appleTouchLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
      if (appleTouchLink) {
        appleTouchLink.href = theme.faviconUrl
      } else if (theme.faviconUrl) {
        const newAppleLink = document.createElement('link')
        newAppleLink.rel = 'apple-touch-icon'
        newAppleLink.href = theme.faviconUrl
        document.head.appendChild(newAppleLink)
      }

      // Update short icon
      let shortcutLink = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
      if (shortcutLink) {
        shortcutLink.href = theme.faviconUrl
      }
    } catch (error) {
      console.error('Failed to update favicon:', error)
    }
  }, [theme?.faviconUrl])

  return null
}
