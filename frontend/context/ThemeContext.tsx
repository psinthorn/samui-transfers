'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface ThemeConfig {
  id?: string
  name: string
  isActive?: boolean
  description?: string
  
  // Branding & Identity
  websiteName?: string
  logoUrl?: string
  faviconUrl?: string
  footerText?: string
  companyEmail?: string
  companyPhone?: string
  
  // Developer/Company Credits
  developerCompanyName?: string
  developerCompanyWebsite?: string
  developerCompanyEmail?: string
  
  // Design System
  colors: Record<string, any>
  typography: Record<string, any>
  spacing: Record<string, any>
  borderRadius: Record<string, any>
  shadows: Record<string, any>
  components: Record<string, any>
}

interface ThemeContextType {
  theme: ThemeConfig | null
  loading: boolean
  updateTheme: (theme: Partial<ThemeConfig>) => Promise<void>
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTheme = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/theme', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTheme(data)
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTheme = async (updates: Partial<ThemeConfig>) => {
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const data = await response.json()
        setTheme(data)
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (undefined === context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
