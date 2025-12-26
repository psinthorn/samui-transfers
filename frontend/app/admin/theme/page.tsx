'use client'

import { useTheme } from '@/context/ThemeContext'
import { useState } from 'react'

export default function ThemeManagementPage() {
  const { theme, loading, updateTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [colorValue, setColorValue] = useState('')
  
  // Branding state
  const [websiteName, setWebsiteName] = useState(theme?.websiteName || '')
  const [headerLogoUrl, setHeaderLogoUrl] = useState(theme?.headerLogoUrl || '')
  const [footerLogoUrl, setFooterLogoUrl] = useState(theme?.footerLogoUrl || '')
  const [faviconUrl, setFaviconUrl] = useState(theme?.faviconUrl || '')
  const [headerLogoMethod, setHeaderLogoMethod] = useState<'url' | 'upload'>('url')
  const [footerLogoMethod, setFooterLogoMethod] = useState<'url' | 'upload'>('url')
  const [faviconMethod, setFaviconMethod] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [companyEmail, setCompanyEmail] = useState(theme?.companyEmail || '')
  const [companyPhone, setCompanyPhone] = useState(theme?.companyPhone || '')
  const [footerText, setFooterText] = useState(theme?.footerText || '')
  
  // Developer Company state
  const [developerCompanyName, setDeveloperCompanyName] = useState(theme?.developerCompanyName || '')
  const [developerCompanyWebsite, setDeveloperCompanyWebsite] = useState(theme?.developerCompanyWebsite || '')
  const [developerCompanyEmail, setDeveloperCompanyEmail] = useState(theme?.developerCompanyEmail || '')

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

  const handleBrandingUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateTheme({
        websiteName,
        headerLogoUrl,
        footerLogoUrl,
        faviconUrl,
        companyEmail,
        companyPhone,
        footerText,
        developerCompanyName,
        developerCompanyWebsite,
        developerCompanyEmail,
      })
      alert('Branding updated successfully!')
    } catch (error) {
      console.error('Failed to update branding:', error)
      alert('Failed to update branding')
    } finally {
      setSaving(false)
    }
  }

  // Handle file upload for favicon
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Upload failed: ${data.error}`)
        return
      }

      setFaviconUrl(data.url)
      alert('Favicon uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload favicon')
    } finally {
      setUploading(false)
    }
  }

  // Handle file upload for header logo
  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Upload failed: ${data.error}`)
        return
      }

      setHeaderLogoUrl(data.url)
      alert('Header logo uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload header logo')
    } finally {
      setUploading(false)
    }
  }

  // Handle file upload for footer logo
  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Upload failed: ${data.error}`)
        return
      }

      setFooterLogoUrl(data.url)
      alert('Footer logo uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload footer logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Theme Configuration</h1>
          <p className="text-slate-600">Manage your website's design system, colors, and branding</p>
        </div>

        {/* Branding Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Branding & Identity</h2>
          
          <form onSubmit={handleBrandingUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="e.g., Samui Transfers"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Header Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Header Logo
                </label>

                {/* Method Selection Tabs */}
                <div className="flex gap-2 mb-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setHeaderLogoMethod('url')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      headerLogoMethod === 'url'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Link to URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeaderLogoMethod('upload')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      headerLogoMethod === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* URL Input Method */}
                {headerLogoMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={headerLogoUrl}
                      onChange={(e) => setHeaderLogoUrl(e.target.value)}
                      placeholder="e.g., /uploads/logo.png or https://example.com/logo.png"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter a URL path or external image URL
                    </p>
                  </div>
                )}

                {/* File Upload Method */}
                {headerLogoMethod === 'upload' && (
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleHeaderLogoUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      {uploading ? 'Uploading...' : 'Max size: 5MB (JPEG, PNG, WebP, GIF)'}
                    </p>
                  </div>
                )}

                {/* Header Logo Preview */}
                {headerLogoUrl && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                    <img
                      src={headerLogoUrl}
                      alt="Header logo preview"
                      className="h-20 w-auto object-contain rounded"
                      onError={() => console.error('Failed to load header logo image')}
                    />
                    <p className="text-xs text-slate-500 mt-2">{headerLogoUrl}</p>
                  </div>
                )}
              </div>

              {/* Footer Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Footer Logo
                </label>

                {/* Method Selection Tabs */}
                <div className="flex gap-2 mb-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFooterLogoMethod('url')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      footerLogoMethod === 'url'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Link to URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setFooterLogoMethod('upload')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      footerLogoMethod === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* URL Input Method */}
                {footerLogoMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={footerLogoUrl}
                      onChange={(e) => setFooterLogoUrl(e.target.value)}
                      placeholder="e.g., /uploads/footer-logo.png or https://example.com/logo.png"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Enter a URL path or external image URL
                    </p>
                  </div>
                )}

                {/* File Upload Method */}
                {footerLogoMethod === 'upload' && (
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFooterLogoUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      {uploading ? 'Uploading...' : 'Max size: 5MB (JPEG, PNG, WebP, GIF)'}
                    </p>
                  </div>
                )}

                {/* Footer Logo Preview */}
                {footerLogoUrl && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                    <img
                      src={footerLogoUrl}
                      alt="Footer logo preview"
                      className="h-20 w-auto object-contain rounded"
                      onError={() => console.error('Failed to load footer logo image')}
                    />
                    <p className="text-xs text-slate-500 mt-2">{footerLogoUrl}</p>
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Favicon (Browser Tab Icon)
                </label>

                {/* Method Selection Tabs */}
                <div className="flex gap-2 mb-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFaviconMethod('url')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      faviconMethod === 'url'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Link to URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaviconMethod('upload')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                      faviconMethod === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* URL Input Method */}
                {faviconMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="e.g., /uploads/favicon.png or https://example.com/favicon.ico"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Recommended: PNG (32x32px) or ICO format
                    </p>
                  </div>
                )}

                {/* File Upload Method */}
                {faviconMethod === 'upload' && (
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                        onChange={handleFaviconUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      {uploading ? 'Uploading...' : 'Max size: 5MB (PNG, ICO)'}
                    </p>
                  </div>
                )}

                {/* Favicon Preview */}
                {faviconUrl && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                    <div className="flex items-center gap-4">
                      <img
                        src={faviconUrl}
                        alt="Favicon preview"
                        className="h-8 w-8 object-contain rounded"
                        onError={() => console.error('Failed to load favicon image')}
                      />
                      <p className="text-xs text-slate-500">Size shown: 32x32px</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{faviconUrl}</p>
                  </div>
                )}
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="info@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Company Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+66 (0) 91-087-9999"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Footer Text
              </label>
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2025 Your Company. All rights reserved."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Developer Company Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Developer/Company Credits</h2>
          
          <form onSubmit={handleBrandingUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Developer Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Developer Company Name
                </label>
                <input
                  type="text"
                  value={developerCompanyName}
                  onChange={(e) => setDeveloperCompanyName(e.target.value)}
                  placeholder="e.g., Sinthorndev Technologies"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Developer Company Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Developer Company Website
                </label>
                <input
                  type="url"
                  value={developerCompanyWebsite}
                  onChange={(e) => setDeveloperCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Developer Company Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Developer Company Email
                </label>
                <input
                  type="email"
                  value={developerCompanyEmail}
                  onChange={(e) => setDeveloperCompanyEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Developer Credits'}
              </button>
            </div>
          </form>
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
            {theme.createdAt && (
              <div>
                <p className="text-sm text-slate-600">Created</p>
                <p className="font-semibold text-slate-900">{new Date(theme.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            {theme.updatedAt && (
              <div>
                <p className="text-sm text-slate-600">Last Updated</p>
                <p className="font-semibold text-slate-900">{new Date(theme.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
