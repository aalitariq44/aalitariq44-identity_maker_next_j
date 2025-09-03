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
  Plus
} from 'lucide-react'
import { createDefaultRect, createDefaultCircle, createDefaultTriangle, createDefaultText, createDefaultPerson, createDefaultQR, createDefaultBarcode } from '@/lib/konvaUtils'

interface AdvancedToolbarProps {
  onExport?: () => void
  onSave?: () => void
  onLoad?: () => void
}

const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({ onExport, onSave, onLoad }) => {
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showShapesPanel, setShowShapesPanel] = useState(false)
  const [showToolsPanel, setShowToolsPanel] = useState(false)

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
    clipboard
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

  const handleZoomIn = () => {
    const newZoom = Math.min(canvasSettings.zoom * 1.2, 5)
    updateCanvasSettings({ zoom: newZoom })
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(canvasSettings.zoom / 1.2, 0.1)
    updateCanvasSettings({ zoom: newZoom })
  }

  const handleToggleGrid = () => {
    updateCanvasSettings({ showGrid: !canvasSettings.showGrid })
  }

  const handleCopy = () => {
    if (selectedShapeId) {
      copyShape(selectedShapeId)
    }
  }

  const handleDelete = () => {
    if (selectedShapeId) {
      deleteShape(selectedShapeId)
    }
  }

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'تحديد', shortcut: 'V' },
    { id: 'hand', icon: Hand, label: 'يد', shortcut: 'H' },
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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v') {
        setSelectedTool('select')
        return
      }
      if (e.key.toLowerCase() === 'h') {
        setSelectedTool('hand')
        return
      }

      // Shape shortcuts
      if (e.key.toLowerCase() === 'r') {
        handleAddShape('rect')
        return
      }
      if (e.key.toLowerCase() === 'o') {
        handleAddShape('circle')
        return
      }

      // Action shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedShapeId) {
        e.preventDefault()
        handleCopy()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && clipboard.length > 0) {
        e.preventDefault()
        pasteShape()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedShapeId) {
        e.preventDefault()
        copyShape(selectedShapeId)
        pasteShape()
        return
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
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة عنصر</span>
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

          {/* View Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="px-2 py-1 text-xs text-gray-600 min-w-[3rem] text-center">
              {Math.round(canvasSettings.zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

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
        </div>

        {/* Right Section - Selection Controls */}
        <div className="flex items-center gap-2">
          {selectedShape && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="نسخ (Ctrl+C)"
              >
                <Copy className="w-4 h-4" />
              </button>

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
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف (Delete)"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />
            </>
          )}

          <div className="text-xs text-gray-500">
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
        </div>
        <div className="flex items-center gap-4">
          <span>اختصارات: V (تحديد) | R (مستطيل) | O (دائرة) | Ctrl+Z (تراجع)</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedToolbar
