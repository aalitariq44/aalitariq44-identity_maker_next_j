'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/store/useEditorStore'
import PropertiesPanel from '@/components/editor/PropertiesPanel'
import ExportModal from '@/components/editor/ExportModal'
import CardSizeSelector from '@/components/editor/CardSizeSelector'
import { 
  exportCanvasAsImage, 
  exportCanvasAsPDF, 
  saveProjectAsJSON, 
  loadProjectFromJSON 
} from '@/lib/exportUtils'
import { ArrowLeft, Settings, Download, Save, FolderOpen } from 'lucide-react'
import Link from 'next/link'

const CanvasStage = dynamic(() => import('@/components/editor/SimpleCanvasStage'), { ssr: false })
const Toolbar = dynamic(() => import('@/components/editor/Toolbar'), { ssr: false })

export default function EditorPage() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const {
    canvasSettings,
    setCanvasSize,
    toggleOrientation,
    saveProject,
    loadProject,
  } = useEditorStore()

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!canvasRef.current) return

    setIsExporting(true)
    try {
      const canvasElement = canvasRef.current.querySelector('.canvas-container')
      if (!canvasElement) throw new Error('Canvas not found')

      if (format === 'pdf') {
        await exportCanvasAsPDF(canvasElement as HTMLElement, {
          orientation: canvasSettings.orientation,
          format: 'credit-card',
        })
      } else {
        await exportCanvasAsImage(canvasElement as HTMLElement, {
          format,
          quality: 1,
          scale: 2,
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('فشل في التصدير. حاول مرة أخرى.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  const handleSaveProject = () => {
    try {
      const projectData = saveProject()
      saveProjectAsJSON(JSON.parse(projectData), 'my-identity-card')
    } catch (error) {
      console.error('Save failed:', error)
      alert('فشل في حفظ المشروع. حاول مرة أخرى.')
    }
  }

  const handleLoadProject = async () => {
    try {
      const projectData = await loadProjectFromJSON()
      loadProject(JSON.stringify(projectData))
    } catch (error) {
      console.error('Load failed:', error)
      alert('فشل في تحميل المشروع. تأكد من صحة الملف.')
    }
  }

  const handleCardSizeChange = (size: { width: number; height: number }) => {
    setCanvasSize(size.width, size.height)
    setShowSettingsModal(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>الرجوع للرئيسية</span>
          </Link>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <h1 className="text-xl font-bold text-gray-800">محرر الهويات</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            إعدادات القماش
          </button>

          <button
            onClick={handleLoadProject}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            فتح مشروع
          </button>

          <button
            onClick={handleSaveProject}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            حفظ المشروع
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        onExport={() => setShowExportModal(true)}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div ref={canvasRef} className="flex items-center justify-center">
            <CanvasStage
              width={Math.min(canvasSettings.width, 800)}
              height={Math.min(canvasSettings.height, 600)}
            />
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <CardSizeSelector
          selectedSize={canvasSettings}
          onSizeChange={handleCardSizeChange}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  )
}
