'use client'

import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Square, 
  Circle, 
  Type, 
  Triangle, 
  Image,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Trash2,
  RotateCcw,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  User,
  QrCode,
  ScanLine
} from 'lucide-react'
import {
  createDefaultRect,
  createDefaultCircle,
  createDefaultText,
  createDefaultTriangle,
  createDefaultPerson,
  createDefaultQR,
  createDefaultBarcode,
} from '@/lib/konvaUtils'

interface ToolbarProps {
  onExport?: () => void
  onSave?: () => void
  onLoad?: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onExport, onSave, onLoad }) => {
  const {
    addShape,
    selectedShapeId,
    deleteShape,
    duplicateShape,
    copyShape,
    pasteShape,
    undo,
    redo,
    canvasSettings,
    updateCanvasSettings,
    setBackgroundImage,
    removeBackgroundImage,
    clearCanvas,
    history,
    shapes,
    toggleOrientation,
  } = useEditorStore()

  // Helper function to get a good position for new shapes
  const getNextShapePosition = () => {
    const baseX = 100
    const baseY = 100
    const offset = shapes.length * 30 // Offset each new shape by 30px
    
    // Keep shapes within canvas bounds
    const x = baseX + (offset % (canvasSettings.width - 200))
    const y = baseY + (Math.floor(offset / (canvasSettings.width - 200)) * 30) % (canvasSettings.height - 200)
    
    return { x, y }
  }

  const handleAddRect = () => {
    console.log('Adding rectangle...')
    const position = getNextShapePosition()
    const rect = createDefaultRect(position.x, position.y)
    console.log('Rectangle created:', rect)
    addShape(rect)
    console.log('Rectangle added to store')
  }

  const handleAddCircle = () => {
    console.log('Adding circle...')
    const position = getNextShapePosition()
    const circle = createDefaultCircle(position.x, position.y)
    console.log('Circle created:', circle)
    addShape(circle)
    console.log('Circle added to store')
  }

  const handleAddText = () => {
    console.log('Adding text...')
    const position = getNextShapePosition()
    const text = createDefaultText(position.x, position.y)
    console.log('Text created:', text)
    addShape(text)
    console.log('Text added to store')
  }

  const handleAddTriangle = () => {
    console.log('Adding triangle...')
    const position = getNextShapePosition()
    const triangle = createDefaultTriangle(position.x, position.y)
    console.log('Triangle created:', triangle)
    addShape(triangle)
    console.log('Triangle added to store')
  }

  const handleAddPerson = () => {
    console.log('Adding person placeholder...')
    const position = getNextShapePosition()
    const person = createDefaultPerson(position.x, position.y)
    console.log('Person created:', person)
    addShape(person)
    console.log('Person added to store')
  }

  const handleAddQR = () => {
    console.log('Adding QR code...')
    const position = getNextShapePosition()
    const qr = createDefaultQR(position.x, position.y)
    console.log('QR created:', qr)
    addShape(qr)
    console.log('QR added to store')
  }

  const handleAddBarcode = () => {
    console.log('Adding barcode...')
    const position = getNextShapePosition()
    const barcode = createDefaultBarcode(position.x, position.y)
    console.log('Barcode created:', barcode)
    addShape(barcode)
    console.log('Barcode added to store')
  }

  const handleDeleteSelected = () => {
    if (selectedShapeId) {
      deleteShape(selectedShapeId)
    }
  }

  const handleDuplicateSelected = () => {
    if (selectedShapeId) {
      duplicateShape(selectedShapeId)
    }
  }

  const handleCopySelected = () => {
    if (selectedShapeId) {
      copyShape(selectedShapeId)
    }
  }

  const handleToggleGrid = () => {
    updateCanvasSettings({ showGrid: !canvasSettings.showGrid })
  }

  const handleToggleSnapToGrid = () => {
    updateCanvasSettings({ snapToGrid: !canvasSettings.snapToGrid })
  }

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setBackgroundImage(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Shape Tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-4">
            <h2 className="text-lg font-semibold text-gray-800">أدوات التصميم</h2>
          </div>
          
          {/* Shape Tools */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
            <button
              onClick={handleAddRect}
              className="p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="إضافة مستطيل (يمكن تحريكه وتغيير حجمه وتدويره)"
            >
              <Square className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddCircle}
              className="p-2 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
              title="إضافة دائرة (يمكن تحريكها وتغيير حجمها وتدويرها)"
            >
              <Circle className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddText}
              className="p-2 rounded hover:bg-gray-50 transition-colors"
              title="إضافة نص (يمكن تحريكه وتحريره وتدويره)"
            >
              <Type className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddTriangle}
              className="p-2 rounded hover:bg-green-50 hover:text-green-600 transition-colors"
              title="إضافة مثلث (يمكن تحريكه وتغيير حجمه وتدويره)"
            >
              <Triangle className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="إضافة صورة"
              disabled
            >
              <Image className="w-5 h-5 text-gray-400" />
            </button>

            <label className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" title="إضافة صورة خلفية">
              <Image className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Identity Elements */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
            <span className="text-xs text-gray-500 font-medium mr-2">عناصر الهوية</span>
            
            <button
              onClick={handleAddPerson}
              className="p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors"
              title="إضافة صورة شخصية للهوية"
            >
              <User className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddQR}
              className="p-2 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="إضافة رمز QR"
            >
              <QrCode className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddBarcode}
              className="p-2 rounded hover:bg-orange-50 hover:text-orange-600 transition-colors"
              title="إضافة باركود"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          </div>

          {/* Edit Tools */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="تراجع"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="إعادة"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          {/* Object Tools */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
            <button
              onClick={handleCopySelected}
              disabled={!selectedShapeId}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="نسخ"
            >
              <Copy className="w-5 h-5" />
            </button>
            
            <button
              onClick={pasteShape}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="لصق"
            >
              <Clipboard className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDuplicateSelected}
              disabled={!selectedShapeId}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="تكرار"
            >
              <Move className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedShapeId}
              className="p-2 rounded hover:bg-gray-100 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* View Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleGrid}
              className={`p-2 rounded transition-colors ${
                canvasSettings.showGrid 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
              title="إظهار/إخفاء الشبكة"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleToggleSnapToGrid}
              className={`p-2 rounded transition-colors ${
                canvasSettings.snapToGrid 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
              title="محاذاة للشبكة"
            >
              <MousePointer className="w-5 h-5" />
            </button>

            <button
              onClick={toggleOrientation}
              className="p-2 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title={`تبديل إلى ${canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Section - File Operations */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600">
              {canvasSettings.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
            </span>
            <button
              onClick={toggleOrientation}
              className="p-2 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title={`تبديل إلى ${canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={clearCanvas}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            مسح الكل
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
