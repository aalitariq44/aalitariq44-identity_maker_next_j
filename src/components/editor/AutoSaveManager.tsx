'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Save, Clock, CloudOff, Check, AlertCircle, Download } from 'lucide-react'

interface AutoSaveManagerProps {
  enabled?: boolean
  interval?: number // in milliseconds
}

const AutoSaveManager: React.FC<AutoSaveManagerProps> = ({ 
  enabled = true, 
  interval = 30000 // 30 seconds default
}) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enabled)

  const { 
    shapes, 
    canvasSettings, 
    saveProject,
    history 
  } = useEditorStore()

  // Generate a unique project key for this session
  const projectKey = React.useMemo(() => {
    return `autoSave_${Date.now()}`
  }, [])

  // Save to localStorage
  const saveToLocal = useCallback(async () => {
    if (!autoSaveEnabled || shapes.length === 0) return

    try {
      setSaveStatus('saving')
      
      const projectData = {
        shapes,
        canvasSettings,
        version: '1.0',
        lastModified: new Date().toISOString(),
        autoSaved: true
      }

      // Save to localStorage
      localStorage.setItem(projectKey, JSON.stringify(projectData))
      
      // Also save to a general autosave slot
      localStorage.setItem('identity_maker_autosave', JSON.stringify(projectData))
      
      setLastSaved(new Date())
      setSaveStatus('saved')
      setHasUnsavedChanges(false)

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (error) {
      console.error('Auto-save failed:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [shapes, canvasSettings, projectKey, autoSaveEnabled])

  // Manual save
  const handleManualSave = useCallback(async () => {
    try {
      setSaveStatus('saving')
      
      const projectData = saveProject()
      const blob = new Blob([projectData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `هوية_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setLastSaved(new Date())
      setSaveStatus('saved')
      setHasUnsavedChanges(false)
      
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (error) {
      console.error('Manual save failed:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [saveProject])

  // Load from autosave
  const loadFromAutoSave = useCallback(() => {
    try {
      const autoSaveData = localStorage.getItem('identity_maker_autosave')
      if (autoSaveData) {
        const data = JSON.parse(autoSaveData)
        if (data.autoSaved) {
          return data
        }
      }
    } catch (error) {
      console.error('Failed to load autosave:', error)
    }
    return null
  }, [])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = shapes.length > 0 || 
                      canvasSettings.backgroundColor !== '#ffffff' ||
                      lastSaved === null
    setHasUnsavedChanges(hasChanges)
  }, [shapes, canvasSettings, lastSaved])

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) return

    const autoSaveTimer = setInterval(saveToLocal, interval)
    return () => clearInterval(autoSaveTimer)
  }, [saveToLocal, interval, autoSaveEnabled, hasUnsavedChanges])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        saveToLocal()
        e.preventDefault()
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, saveToLocal])

  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    return date.toLocaleDateString('ar')
  }

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleManualSave])

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'saved':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return hasUnsavedChanges ? <Clock className="w-4 h-4 text-orange-500" /> : <CloudOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'جاري الحفظ...'
      case 'saved':
        return 'تم الحفظ'
      case 'error':
        return 'خطأ في الحفظ'
      default:
        if (hasUnsavedChanges) {
          return lastSaved ? `آخر حفظ: ${getRelativeTime(lastSaved)}` : 'تغييرات غير محفوظة'
        }
        return 'جميع التغييرات محفوظة'
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Auto-save toggle */}
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
        </label>
        <span className="text-sm text-gray-600">حفظ تلقائي</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        {getStatusIcon()}
        <span className="text-sm text-gray-600">{getStatusText()}</span>
      </div>

      {/* Manual save button */}
      <button
        onClick={handleManualSave}
        disabled={saveStatus === 'saving'}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="حفظ يدوي (Ctrl+S)"
      >
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">حفظ</span>
      </button>

      {/* Save history indicator */}
      {lastSaved && (
        <div className="text-xs text-gray-500">
          آخر حفظ: {getRelativeTime(lastSaved)}
        </div>
      )}
    </div>
  )
}

export default AutoSaveManager
