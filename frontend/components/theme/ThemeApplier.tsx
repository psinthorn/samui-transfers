'use client'

import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export function ThemeApplier() {
  const { theme } = useTheme()

  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    // Apply color CSS variables
    if (theme.colors) {
      // Primary colors
      if (theme.colors.primary) {
        Object.entries(theme.colors.primary).forEach(([key, value]) => {
          root.style.setProperty(`--color-primary-${key}`, value as string)
        })
      }

      // Secondary colors
      if (theme.colors.secondary) {
        Object.entries(theme.colors.secondary).forEach(([key, value]) => {
          root.style.setProperty(`--color-secondary-${key}`, value as string)
        })
      }

      // Accent colors
      if (theme.colors.accent) {
        Object.entries(theme.colors.accent).forEach(([key, value]) => {
          root.style.setProperty(`--color-accent-${key}`, value as string)
        })
      }

      // Success colors
      if (theme.colors.success) {
        Object.entries(theme.colors.success).forEach(([key, value]) => {
          root.style.setProperty(`--color-success-${key}`, value as string)
        })
      }

      // Danger colors
      if (theme.colors.danger) {
        Object.entries(theme.colors.danger).forEach(([key, value]) => {
          root.style.setProperty(`--color-danger-${key}`, value as string)
        })
      }

      // Warning colors
      if (theme.colors.warning) {
        Object.entries(theme.colors.warning).forEach(([key, value]) => {
          root.style.setProperty(`--color-warning-${key}`, value as string)
        })
      }

      // Neutral colors
      if (theme.colors.neutral) {
        Object.entries(theme.colors.neutral).forEach(([key, value]) => {
          root.style.setProperty(`--color-neutral-${key}`, value as string)
        })
      }
    }

    // Apply typography CSS variables
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-display', theme.typography.fontFamily.display)
        root.style.setProperty('--font-body', theme.typography.fontFamily.body)
        root.style.setProperty('--font-mono', theme.typography.fontFamily.mono)
      }

      if (theme.typography.fontSizes) {
        Object.entries(theme.typography.fontSizes).forEach(([key, value]) => {
          root.style.setProperty(`--text-${key}`, value as string)
        })
      }
    }

    // Apply spacing CSS variables
    if (theme.spacing?.scales) {
      Object.entries(theme.spacing.scales).forEach(([key, value]) => {
        root.style.setProperty(`--space-${key}`, value as string)
      })
    }

    // Apply border radius CSS variables
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value as string)
      })
    }

    // Apply shadow CSS variables
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value as string)
      })
    }
  }, [theme])

  return null
}
