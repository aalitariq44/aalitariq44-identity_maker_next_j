'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/store/useEditorStore'
import ExportModal from '@/components/editor/ExportModal'
import CardSizeSelector from '@/components/editor/CardSizeSelector'
import CustomSizeModal from '@/components/editor/CustomSizeModal'
import AdvancedImageUploader from '@/components/editor/AdvancedImageUploader'
import QRBarcodeGenerator from '@/components/editor/QRBarcodeGenerator'
import TemplateLibrary from '@/components/editor/TemplateLibrary'
import AlignmentTools from '@/components/editor/AlignmentTools'
import AutoSaveManager from '@/components/editor/AutoSaveManager'
import { 
  exportCanvasAsImage, 
  exportCanvasAsPDF, 
  saveProjectAsJSON, 
  loadProjectFromJSON 
} from '@/lib/exportUtils'
import { ArrowLeft, Settings, Download, Save, FolderOpen, RotateCcw, Layers, Grid, BookTemplate, Palette } from 'lucide-react'
import Link from 'next/link'

// Dynamic imports for client-side components
const AdvancedCanvasStage = dynamic(() => import('@/components/editor/AdvancedCanvasStage'), { ssr: false })
const AdvancedToolbar = dynamic(() => import('@/components/editor/AdvancedToolbar'), { ssr: false })
const AdvancedLayersPanel = dynamic(() => import('@/components/editor/AdvancedLayersPanel'), { ssr: false })
const AdvancedPropertiesPanel = dynamic(() => import('@/components/editor/AdvancedPropertiesPanel'), { ssr: false })

export default function EditorPage() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showCustomSizeModal, setShowCustomSizeModal] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showAlignmentTools, setShowAlignmentTools] = useState(false)
  const [showQRBarcodeGenerator, setShowQRBarcodeGenerator] = useState(false)
  const [showRulers, setShowRulers] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const {
    canvasSettings,
    setCanvasSize,
    toggleOrientation,
    saveProject,
    loadProject,
    updateCanvasSettings,
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

  const handleCustomSizeApply = (size: { width: number; height: number; name?: string }) => {
    setCanvasSize(size.width, size.height)
    setShowCustomSizeModal(false)
  }

  const handleToggleOrientation = () => {
    toggleOrientation()
  }

  const handleToggleAlignmentTools = () => {
    setShowAlignmentTools(!showAlignmentTools)
  }

  const handleToggleRulers = () => {
    setShowRulers(!showRulers)
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
          
          <h1 className="text-xl font-bold text-gray-800">محرر الهويات المتقدم</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Save Manager */}
          <AutoSaveManager />

          <div className="w-px h-6 bg-gray-300" />

          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600">
              الاتجاه: {canvasSettings.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
            </span>
            <button
              onClick={handleToggleOrientation}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
              title={`تبديل إلى ${canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}`}
            >
              <RotateCcw className="w-4 h-4" />
              {canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}
            </button>
          </div>
        </div>
      </header>

      {/* Advanced Toolbar */}
      <AdvancedToolbar
        onExport={() => setShowExportModal(true)}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
        onOpenTemplates={() => setShowTemplateLibrary(true)}
        onOpenImageUploader={() => setShowImageUploader(true)}
        onOpenQRBarcodeGenerator={() => setShowQRBarcodeGenerator(true)}
        onOpenCustomSize={() => setShowCustomSizeModal(true)}
        onToggleAlignment={handleToggleAlignmentTools}
        onToggleRulers={handleToggleRulers}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Properties */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              خصائص العنصر
            </h3>
          </div>
          <AdvancedPropertiesPanel className="h-full" />
        </div>

        {/* Left Sidebar - Alignment Tools */}
        {showAlignmentTools && (
          <div className="w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                أدوات المحاذاة
              </h3>
            </div>
            <AlignmentTools />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-100">
          <div ref={canvasRef} className="flex items-center justify-center">
            <AdvancedCanvasStage
              width={Math.min(canvasSettings.width, 800)}
              height={Math.min(canvasSettings.height, 600)}
            />
          </div>
        </div>

        {/* Right Panel - Layers */}
        <div className="w-80 bg-white border-l border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              الطبقات
            </h3>
          </div>
          <AdvancedLayersPanel className="h-full" />
        </div>
      </div>

      {/* Modals */}
      
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

      {/* Custom Size Modal */}
      <CustomSizeModal
        isOpen={showCustomSizeModal}
        onClose={() => setShowCustomSizeModal(false)}
        onApply={handleCustomSizeApply}
        currentSize={{ width: canvasSettings.width, height: canvasSettings.height }}
      />

      {/* Advanced Image Uploader */}
      <AdvancedImageUploader
        isOpen={showImageUploader}
        onClose={() => setShowImageUploader(false)}
      />

      {/* QR & Barcode Generator */}
      <QRBarcodeGenerator
        isOpen={showQRBarcodeGenerator}
        onClose={() => setShowQRBarcodeGenerator(false)}
      />

      {/* Template Library */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
      />

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>الحجم: {canvasSettings.width}×{canvasSettings.height} بكسل</span>
            <span>التكبير: {Math.round(canvasSettings.zoom * 100)}%</span>
            <span className={`flex items-center gap-1 ${canvasSettings.showGrid ? 'text-blue-600' : ''}`}>
              <Grid className="w-4 h-4" />
              {canvasSettings.showGrid ? 'الشبكة مُفعلة' : 'الشبكة مُعطلة'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>جاهز للتصميم</span>
          </div>
        </div>
      </div>
    </div>
  )
}
