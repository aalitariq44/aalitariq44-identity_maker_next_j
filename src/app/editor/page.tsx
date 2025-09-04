'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/store/useEditorStore'
import { useAuth } from '@/hooks/useAuth'
import { getDesign } from '@/lib/firestore'
import Navbar from '@/components/common/Navbar'
import ExportModal from '@/components/editor/ExportModal'
import CardSizeSelector from '@/components/editor/CardSizeSelector'
import CustomSizeModal from '@/components/editor/CustomSizeModal'
import AdvancedImageUploader from '@/components/editor/AdvancedImageUploader'
import QRBarcodeGenerator from '@/components/editor/QRBarcodeGenerator'
import TemplateLibrary from '@/components/editor/TemplateLibrary'
import AlignmentTools from '@/components/editor/AlignmentTools'
import AutoSaveManager from '@/components/editor/AutoSaveManager'
import SaveDesignModal from '@/components/editor/SaveDesignModal'
import LoadDesignModal from '@/components/editor/LoadDesignModal'
import CardSideSwitcher from '@/components/editor/CardSideSwitcher'
import QuickSideSwitcher from '@/components/editor/QuickSideSwitcher'
import CardPreviewPanel from '@/components/editor/CardPreviewPanel'
import { ShortcutsButton } from '@/components/editor/KeyboardShortcuts'
import { 
  exportCanvasAsImage, 
  exportCanvasAsPDF, 
  saveProjectAsJSON, 
  loadProjectFromJSON 
} from '@/lib/exportUtils'
import { ArrowLeft, Settings, Download, Save, FolderOpen, RotateCcw, Layers, Grid, BookTemplate, Palette } from 'lucide-react'

// Dynamic imports for client-side components
const EnhancedCanvasStage = dynamic(() => import('@/components/editor/EnhancedCanvasStage'), { ssr: false })
const AdvancedToolbar = dynamic(() => import('@/components/editor/AdvancedToolbar'), { ssr: false })
const AdvancedLayersPanel = dynamic(() => import('@/components/editor/AdvancedLayersPanel'), { ssr: false })
const AdvancedPropertiesPanel = dynamic(() => import('@/components/editor/AdvancedPropertiesPanel'), { ssr: false })

export default function EditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showCustomSizeModal, setShowCustomSizeModal] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showAlignmentTools, setShowAlignmentTools] = useState(false)
  const [showQRBarcodeGenerator, setShowQRBarcodeGenerator] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showRulers, setShowRulers] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null)

  const {
    canvasSettings,
    setCanvasSize,
    toggleOrientation,
    saveProject,
    loadProject,
    updateCanvasSettings,
    currentSide,
    switchToSide,
    syncCurrentSideData,
  } = useEditorStore()

  // تحميل التصميم إذا تم تمرير معرف في URL
  useEffect(() => {
    const designId = searchParams.get('design')
    if (designId && user) {
      loadDesignFromFirebase(designId)
    }
  }, [searchParams, user])

  // إعادة توجيه للمصادقة إذا لم يكن المستخدم مسجل دخول
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [authLoading, user, router])

  // Sync current side data when component unmounts or side changes
  useEffect(() => {
    return () => {
      syncCurrentSideData()
    }
  }, [currentSide, syncCurrentSideData])

  const loadDesignFromFirebase = async (designId: string) => {
    setLoading(true)
    try {
      const result = await getDesign(designId)
      if (result.error) {
        alert('خطأ في تحميل التصميم: ' + result.error)
      } else if (result.design) {
        loadProject(result.design.data)
        setCurrentDesignId(designId)
      }
    } catch (error) {
      console.error('Error loading design:', error)
      alert('حدث خطأ في تحميل التصميم')
    }
    setLoading(false)
  }

  const handleExport = async (format: 'png' | 'jpg' | 'pdf', options?: { sides: 'current' | 'both' }) => {
    if (!canvasRef.current) return

    setIsExporting(true)
    try {
      const canvasElement = canvasRef.current.querySelector('.canvas-container')
      if (!canvasElement) throw new Error('Canvas not found')

      if (options?.sides === 'both') {
        // Export both sides
        const originalSide = currentSide
        
        // Export front side
        if (originalSide !== 'front') {
          switchToSide('front')
          // Wait for the canvas to update
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        if (format === 'pdf') {
          await exportCanvasAsPDF(canvasElement as HTMLElement, {
            orientation: canvasSettings.orientation,
            format: 'credit-card',
            filename: 'identity-card-front'
          })
        } else {
          await exportCanvasAsImage(canvasElement as HTMLElement, {
            format,
            quality: 1,
            scale: 2,
            filename: 'identity-card-front'
          })
        }
        
        // Export back side
        switchToSide('back')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (format === 'pdf') {
          await exportCanvasAsPDF(canvasElement as HTMLElement, {
            orientation: canvasSettings.orientation,
            format: 'credit-card',
            filename: 'identity-card-back'
          })
        } else {
          await exportCanvasAsImage(canvasElement as HTMLElement, {
            format,
            quality: 1,
            scale: 2,
            filename: 'identity-card-back'
          })
        }
        
        // Return to original side
        switchToSide(originalSide)
        
      } else {
        // Export current side only
        const sideName = currentSide === 'front' ? 'front' : 'back'
        
        if (format === 'pdf') {
          await exportCanvasAsPDF(canvasElement as HTMLElement, {
            orientation: canvasSettings.orientation,
            format: 'credit-card',
            filename: `identity-card-${sideName}`
          })
        } else {
          await exportCanvasAsImage(canvasElement as HTMLElement, {
            format,
            quality: 1,
            scale: 2,
            filename: `identity-card-${sideName}`
          })
        }
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
    if (user) {
      setShowLoadModal(true)
    } else {
      // Fallback للتحميل من ملف محلي
      try {
        const projectData = await loadProjectFromJSON()
        loadProject(JSON.stringify(projectData))
      } catch (error) {
        console.error('Load failed:', error)
        alert('فشل في تحميل المشروع. تأكد من صحة الملف.')
      }
    }
  }

  const handleLoadFromFirebase = (designData: string) => {
    try {
      loadProject(designData)
    } catch (error) {
      console.error('Load failed:', error)
      alert('فشل في تحميل التصميم.')
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

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // سيتم إعادة التوجيه بواسطة useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar 
        showSaveButton={true}
        showOpenButton={true}
        onSave={() => setShowSaveModal(true)}
        onOpen={handleLoadProject}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>الرجوع للرئيسية</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <h1 className="text-xl font-bold text-gray-800">محرر الهويات المتقدم</h1>
          {currentDesignId && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              تحرير تصميم محفوظ
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Save Manager */}
          <AutoSaveManager />

          <div className="w-px h-6 bg-gray-300" />

          {/* Quick Side Switcher */}
          <QuickSideSwitcher />

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
          <div className="h-full overflow-y-auto">
            {/* Card Side Switcher */}
            <div className="p-4 border-b border-gray-200">
              <CardSideSwitcher />
            </div>
            
            {/* Properties Panel */}
            <AdvancedPropertiesPanel className="flex-1" />
          </div>
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

        {/* Canvas Area - Full Width */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={canvasRef} className="flex-1">
            <EnhancedCanvasStage />
          </div>
        </div>

        {/* Right Panel - Layers */}
        <div className="w-80 bg-white border-l border-gray-200 shadow-sm">
          <div className="h-full flex flex-col">
            {/* Card Preview Panel */}
            <div className="p-4 border-b border-gray-200">
              <CardPreviewPanel />
            </div>
            
            {/* Layers Panel */}
            <div className="flex-1">
              <AdvancedLayersPanel className="h-full" />
            </div>
          </div>
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

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        existingDesignId={currentDesignId || undefined}
      />

      {/* Load Design Modal */}
      <LoadDesignModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={handleLoadFromFirebase}
      />

      {/* Status Bar - Enhanced */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">{/* حذف باقي محتوى status bar حسب السياق ... */}</div>
      
      {/* Keyboard Shortcuts Helper */}
      <ShortcutsButton />
    </div>
  )
}
