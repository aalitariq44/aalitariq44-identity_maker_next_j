'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Undo2, 
  Redo2, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Image, 
  User, 
  QrCode, 
  ScanLine,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Grid3X3,
  Palette,
  Settings,
  Download,
  Save,
  FolderOpen,
  Layers,
  MousePointer2,
  Hand,
  Plus,
  Ruler,
  Shapes,
  Paintbrush,
  Move,
  Scissors,
  Clipboard,
  AlignCenter,
  BookTemplate,
  Maximize2,
  Zap
} from 'lucide-react'
import { createDefaultRect, createDefaultCircle, createDefaultTriangle, createDefaultText, createDefaultPerson, createDefaultQR, createDefaultBarcode } from '@/lib/konvaUtils'

interface AdvancedToolbarProps {
  onExport?: () => void
  onSave?: () => void
  onLoad?: () => void
  onOpenTemplates?: () => void
  onOpenImageUploader?: () => void
  onOpenQRBarcodeGenerator?: () => void
  onOpenCustomSize?: () => void
  onToggleAlignment?: () => void
  onToggleRulers?: () => void
}

const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({ 
  onExport, 
  onSave, 
  onLoad,
  onOpenTemplates,
  onOpenImageUploader,
  onOpenQRBarcodeGenerator,
  onOpenCustomSize,
  onToggleAlignment,
  onToggleRulers
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showShapesPanel, setShowShapesPanel] = useState(false)
  const [showToolsPanel, setShowToolsPanel] = useState(false)
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)

  const {
    shapes,
    selectedShapeId,
    canvasSettings,
    addShape,
    deleteShape,
    copyShape,
    pasteShape,
    undo,
    redo,
    updateShape,
    updateCanvasSettings,
    selectShape,
    history,
    clipboard,
    setZoom,
    resetView,
    fitToScreen
  } = useEditorStore()

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  // Helper function to get good position for new shapes
  const getNextShapePosition = () => {
    const baseX = 100
    const baseY = 100
    const offset = shapes.length * 30
    
    const x = baseX + (offset % (canvasSettings.width - 200))
    const y = baseY + (Math.floor(offset / (canvasSettings.width - 200)) * 30) % (canvasSettings.height - 200)
    
    return { x, y }
  }

  const handleAddShape = (shapeType: string) => {
    const position = getNextShapePosition()
    let shape

    switch (shapeType) {
      case 'rect':
        shape = createDefaultRect(position.x, position.y)
        break
      case 'circle':
        shape = createDefaultCircle(position.x, position.y)
        break
      case 'triangle':
        shape = createDefaultTriangle(position.x, position.y)
        break
      case 'text':
        shape = createDefaultText(position.x, position.y)
        break
      case 'person':
        shape = createDefaultPerson(position.x, position.y)
        break
      case 'qr':
        shape = createDefaultQR(position.x, position.y)
        break
      case 'barcode':
        shape = createDefaultBarcode(position.x, position.y)
        break
      default:
        return
    }

    addShape(shape)
    setSelectedTool('select')
    setShowShapesPanel(false)
  }

  const handleToggleVisibility = () => {
    if (selectedShape) {
      updateShape(selectedShape.id, { visible: !selectedShape.visible })
    }
  }

  const handleToggleLock = () => {
    if (selectedShape) {
      updateShape(selectedShape.id, { locked: !selectedShape.locked })
    }
  }

  const handleToggleShadow = () => {
    if (selectedShape) {
      const newShadowEnabled = !selectedShape.shadowEnabled
      updateShape(selectedShape.id, { 
        shadowEnabled: newShadowEnabled,
        // Set default shadow values if enabling for the first time
        ...(newShadowEnabled && !selectedShape.shadowColor ? {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 10,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
        } : {})
      })
    }
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(canvasSettings.zoom * 1.2, 5)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(canvasSettings.zoom / 1.2, 0.1)
    setZoom(newZoom)
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  const handleFitToScreen = () => {
    fitToScreen()
  }

  const handleToggleGrid = () => {
    updateCanvasSettings({ showGrid: !canvasSettings.showGrid })
  }

  const handleToggleSnap = () => {
    updateCanvasSettings({ snapToGrid: !canvasSettings.snapToGrid })
  }

  const handleCopy = () => {
    if (selectedShapeId) {
      copyShape(selectedShapeId)
    }
  }

  const handleCut = () => {
    if (selectedShapeId) {
      copyShape(selectedShapeId)
      deleteShape(selectedShapeId)
    }
  }

  const handlePaste = () => {
    pasteShape()
  }

  const handleDuplicate = () => {
    if (selectedShapeId) {
      copyShape(selectedShapeId)
      pasteShape()
    }
  }

  const handleDelete = () => {
    if (selectedShapeId) {
      deleteShape(selectedShapeId)
    }
  }

  const handleSelectAll = () => {
    // Implementation for select all would go here
    console.log('Select all shapes')
  }

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'تحديد', shortcut: 'V' },
    { id: 'hand', icon: Hand, label: 'يد', shortcut: 'H' },
    { id: 'move', icon: Move, label: 'نقل', shortcut: 'M' },
  ]

  const shapes_list = [
    { id: 'rect', icon: Square, label: 'مستطيل', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'دائرة', shortcut: 'O' },
    { id: 'triangle', icon: Triangle, label: 'مثلث', shortcut: 'T' },
    { id: 'text', icon: Type, label: 'نص', shortcut: 'T' },
    { id: 'person', icon: User, label: 'صورة شخصية', shortcut: 'P' },
    { id: 'qr', icon: QrCode, label: 'رمز QR', shortcut: 'Q' },
    { id: 'barcode', icon: ScanLine, label: 'باركود', shortcut: 'B' },
  ]

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400, 500]

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) {
        setSelectedTool('select')
        return
      }
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        setSelectedTool('hand')
        return
      }
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        setSelectedTool('move')
        return
      }

      // Shape shortcuts
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        handleAddShape('rect')
        return
      }
      if (e.key.toLowerCase() === 'o' && !e.ctrlKey && !e.metaKey) {
        handleAddShape('circle')
        return
      }

      // Action shortcuts with modifiers
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'c':
            if (selectedShapeId) {
              e.preventDefault()
              handleCopy()
            }
            break
          case 'x':
            if (selectedShapeId) {
              e.preventDefault()
              handleCut()
            }
            break
          case 'v':
            if (clipboard.length > 0) {
              e.preventDefault()
              handlePaste()
            }
            break
          case 'd':
            if (selectedShapeId) {
              e.preventDefault()
              handleDuplicate()
            }
            break
          case 'a':
            e.preventDefault()
            handleSelectAll()
            break
          case 'z':
            if (e.shiftKey) {
              e.preventDefault()
              redo()
            } else {
              e.preventDefault()
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case '0':
            e.preventDefault()
            handleFitToScreen()
            break
          case '1':
            e.preventDefault()
            handleResetZoom()
            break
          case '=':
          case '+':
            e.preventDefault()
            handleZoomIn()
            break
          case '-':
            e.preventDefault()
            handleZoomOut()
            break
        }
      }

      // Delete key
      if (e.key === 'Delete' && selectedShapeId) {
        handleDelete()
      }

      // Escape key
      if (e.key === 'Escape') {
        selectShape(null)
        setSelectedTool('select')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedShapeId, clipboard.length])

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - File Operations */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
            title="مكتبة القوالب"
          >
            <BookTemplate className="w-4 h-4" />
            <span className="hidden sm:inline">قوالب</span>
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            title="حفظ المشروع (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">حفظ</span>
          </button>

          <button
            onClick={onLoad}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            title="فتح مشروع (Ctrl+O)"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">فتح</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="تصدير"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">تصدير</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* History Controls */}
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="إعادة (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center Section - Tools */}
        <div className="flex items-center gap-2">
          {/* Basic Tools */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Add Shapes */}
          <div className="relative">
            <button
              onClick={() => setShowShapesPanel(!showShapesPanel)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Shapes className="w-4 h-4" />
              <span className="hidden sm:inline">أشكال</span>
            </button>

            {showShapesPanel && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                <div className="grid grid-cols-2 gap-2 min-w-[200px]">
                  {shapes_list.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => handleAddShape(shape.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title={`${shape.label} (${shape.shortcut})`}
                    >
                      <shape.icon className="w-4 h-4" />
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Image */}
          <button
            onClick={onOpenImageUploader}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
            title="إضافة صورة"
          >
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">صورة</span>
          </button>

          {/* Add QR/Barcode */}
          <button
            onClick={onOpenQRBarcodeGenerator}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
            title="إضافة QR أو باركود"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR/كود</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Edit Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!selectedShapeId}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="نسخ (Ctrl+C)"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleCut}
              disabled={!selectedShapeId}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="قص (Ctrl+X)"
            >
              <Scissors className="w-4 h-4" />
            </button>

            <button
              onClick={handlePaste}
              disabled={clipboard.length === 0}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="لصق (Ctrl+V)"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* View Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="تصغير (Ctrl+-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <select
              value={Math.round(canvasSettings.zoom * 100)}
              onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
              className="px-2 py-1 text-xs text-gray-600 bg-transparent border-none focus:outline-none min-w-[4rem] text-center"
            >
              {zoomLevels.map(level => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>

            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="تكبير (Ctrl++)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleFitToScreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="ملائمة الشاشة (Ctrl+0)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Canvas Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleGrid}
              className={`p-2 rounded-lg transition-colors ${
                canvasSettings.showGrid
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="إظهار/إخفاء الشبكة"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleSnap}
              className={`p-2 rounded-lg transition-colors ${
                canvasSettings.snapToGrid
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="التصاق بالشبكة"
            >
              <Paintbrush className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleRulers}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="إظهار/إخفاء المساطر"
            >
              <Ruler className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleAlignment}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="أدوات المحاذاة"
            >
              <AlignCenter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Section - Canvas and Selection Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCustomSize}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="حجم مخصص"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">حجم</span>
          </button>

          {selectedShape && (
            <>
              <div className="w-px h-6 bg-gray-300" />

              <button
                onClick={handleToggleVisibility}
                className={`p-2 rounded-lg transition-colors ${
                  selectedShape.visible
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                }`}
                title={selectedShape.visible ? 'إخفاء' : 'إظهار'}
              >
                {selectedShape.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleLock}
                className={`p-2 rounded-lg transition-colors ${
                  selectedShape.locked
                    ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={selectedShape.locked ? 'إلغاء القفل' : 'قفل'}
              >
                {selectedShape.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleShadow}
                className={`p-2 rounded-lg transition-colors ${
                  selectedShape.shadowEnabled
                    ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50 bg-purple-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={selectedShape.shadowEnabled ? 'إلغاء الظل' : 'إضافة ظل'}
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف (Delete)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="text-xs text-gray-500 mr-4">
            {shapes.length} عنصر
            {selectedShape && ` | محدد: ${selectedShape.type}`}
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="px-4 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>الحجم: {canvasSettings.width}×{canvasSettings.height}</span>
          <span>التكبير: {Math.round(canvasSettings.zoom * 100)}%</span>
          {selectedShape && (
            <span>
              الموضع: {Math.round(selectedShape.position.x)}, {Math.round(selectedShape.position.y)}
            </span>
          )}
          {selectedShape && (
            <span>
              الأبعاد: {Math.round(selectedShape.size.width)}×{Math.round(selectedShape.size.height)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>اختصارات: V (تحديد) | H (يد) | R (مستطيل) | O (دائرة) | Ctrl+Z (تراجع) | Ctrl+C (نسخ) | Ctrl+V (لصق)</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedToolbar
