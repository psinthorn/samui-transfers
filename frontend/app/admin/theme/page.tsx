'use client'

import { useTheme } from '@/context/ThemeContext'
import { useState } from 'react'

export default function ThemeManagementPage() {
  const { theme, loading, updateTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [colorValue, setColorValue] = useState('')

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-slate-300 rounded" />
          <div className="h-6 w-96 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">No active theme found</p>
        </div>
      </div>
    )
  }

  const handleColorUpdate = async (colorKey: string, colorValue: string) => {
    try {
      setSaving(true)
      const newColors = { ...theme.colors }
      
      // Update the primary color value
      if (colorKey === 'primary-500') {
        newColors.primary[500] = colorValue
      } else if (colorKey === 'secondary-500') {
        newColors.secondary[500] = colorValue
      } else if (colorKey === 'accent-400') {
        newColors.accent[400] = colorValue
      }

      await updateTheme({ colors: newColors })
      setSelectedColor('')
      setColorValue('')
    } catch (error) {
      console.error('Failed to update color:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Theme Configuration</h1>
          <p className="text-slate-600">Manage your website's design system and colors</p>
        </div>

        {/* Color Palette Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Color Palette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary Colors */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Primary</h3>
              <div className="space-y-2">
                <div
                  className="w-full h-12 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-slate-400"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                  onClick={() => {
                    setSelectedColor('primary-500')
                    setColorValue(theme.colors.primary[500])
                  }}
                />
                <p className="text-xs text-slate-600">{theme.colors.primary[500]}</p>
              </div>
            </div>

            {/* Secondary Colors */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Secondary</h3>
              <div className="space-y-2">
                <div
                  className="w-full h-12 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-slate-400"
                  style={{ backgroundColor: theme.colors.secondary[500] }}
                  onClick={() => {
                    setSelectedColor('secondary-500')
                    setColorValue(theme.colors.secondary[500])
                  }}
                />
                <p className="text-xs text-slate-600">{theme.colors.secondary[500]}</p>
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Accent</h3>
              <div className="space-y-2">
                <div
                  className="w-full h-12 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-slate-400"
                  style={{ backgroundColor: theme.colors.accent[400] }}
                  onClick={() => {
                    setSelectedColor('accent-400')
                    setColorValue(theme.colors.accent[400])
                  }}
                />
                <p className="text-xs text-slate-600">{theme.colors.accent[400]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        {selectedColor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Edit Color: {selectedColor}</h3>
            <div className="flex gap-4">
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="w-24 h-24 rounded cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4"
                  placeholder="#000000"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleColorUpdate(selectedColor, colorValue)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Color'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedColor('')
                      setColorValue('')
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Theme Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Name</p>
              <p className="font-semibold text-slate-900">{theme.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="font-semibold text-slate-900">{theme.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Created</p>
              <p className="font-semibold text-slate-900">{new Date(theme.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Last Updated</p>
              <p className="font-semibold text-slate-900">{new Date(theme.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
