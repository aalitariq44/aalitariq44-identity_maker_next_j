'use client'

import React, { useState, useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Paintbrush, 
  Eraser, 
  Minus, 
  Circle, 
  Square, 
  Type,
  Undo2,
  Redo2,
  Trash2,
  Palette,
  Settings,
  Plus,
  Move
} from 'lucide-react'

interface DrawingToolsProps {
  className?: string
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ className = '' }) => {
  const [selectedTool, setSelectedTool] = useState<string>('brush')
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushOpacity, setBrushOpacity] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPath, setDrawingPath] = useState<{x: number, y: number}[]>([])

  const { addShape, undo, redo, history } = useEditorStore()

  const drawingTools = [
    { id: 'brush', icon: Paintbrush, label: 'فرشاة', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, label: 'ممحاة', shortcut: 'E' },
    { id: 'line', icon: Minus, label: 'خط', shortcut: 'L' },
    { id: 'circle', icon: Circle, label: 'دائرة', shortcut: 'O' },
    { id: 'rectangle', icon: Square, label: 'مستطيل', shortcut: 'R' },
    { id: 'text', icon: Type, label: 'نص', shortcut: 'T' },
  ]

  const brushSizes = [1, 2, 3, 5, 8, 12, 16, 20, 24, 32]
  const colorPresets = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080'
  ]

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size)
  }

  const handleColorChange = (color: string) => {
    setBrushColor(color)
  }

  const handleOpacityChange = (opacity: number) => {
    setBrushOpacity(opacity)
  }

  const startDrawing = (x: number, y: number) => {
    setIsDrawing(true)
    setDrawingPath([{ x, y }])
  }

  const continueDrawing = (x: number, y: number) => {
    if (!isDrawing) return
    setDrawingPath(prev => [...prev, { x, y }])
  }

  const finishDrawing = () => {
    if (!isDrawing || drawingPath.length < 2) return

    // Convert drawing path to a line shape
    const points: number[] = []
    drawingPath.forEach(point => {
      points.push(point.x, point.y)
    })

    const lineShape = {
      type: 'line' as const,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      rotation: 0,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: brushSize,
      visible: true,
      locked: false,
      zIndex: Date.now(),
      points,
      opacity: brushOpacity,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      globalCompositeOperation: selectedTool === 'eraser' ? 'destination-out' : 'source-over',
    }

    addShape(lineShape)
    setIsDrawing(false)
    setDrawingPath([])
  }

  const clearCanvas = () => {
    // This would need to be implemented in the store
    console.log('Clear canvas')
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'b':
          if (!e.ctrlKey && !e.metaKey) {
            setSelectedTool('brush')
          }
          break
        case 'e':
          if (!e.ctrlKey && !e.metaKey) {
            setSelectedTool('eraser')
          }
          break
        case 'l':
          if (!e.ctrlKey && !e.metaKey) {
            setSelectedTool('line')
          }
          break
        case '[':
          setBrushSize(prev => Math.max(1, prev - 1))
          break
        case ']':
          setBrushSize(prev => Math.min(32, prev + 1))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="space-y-4">
        {/* Drawing Tools */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">أدوات الرسم</h3>
          <div className="grid grid-cols-3 gap-1">
            {drawingTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <tool.icon className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Brush Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">إعدادات الفرشاة</h3>
          
          {/* Brush Size */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الحجم</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="32"
                value={brushSize}
                onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-600 w-8">{brushSize}px</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleBrushSizeChange(size)}
                  className={`w-8 h-8 rounded-lg border-2 transition-colors flex items-center justify-center ${
                    brushSize === size
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={`${size}px`}
                >
                  <div
                    className="rounded-full bg-gray-600"
                    style={{
                      width: Math.min(size, 16),
                      height: Math.min(size, 16)
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">الشفافية</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={brushOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-600 w-8">{Math.round(brushOpacity * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">الألوان</h3>
          
          {/* Color Input */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={brushColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Color Presets */}
          <div className="grid grid-cols-5 gap-1">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded border-2 transition-colors ${
                  brushColor === color
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">الإجراءات</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={undo}
              disabled={history.past.length === 0}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="تراجع"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={history.future.length === 0}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="إعادة"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={clearCanvas}
            className="w-full mt-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            title="مسح الكل"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">مسح الكل</span>
          </button>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">معاينة الفرشاة</h3>
          <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
            <div
              className="rounded-full border border-gray-300"
              style={{
                width: Math.min(brushSize * 2, 32),
                height: Math.min(brushSize * 2, 32),
                backgroundColor: brushColor,
                opacity: brushOpacity
              }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <p className="font-medium mb-1">نصائح:</p>
          <ul className="space-y-1">
            <li>• استخدم [ و ] لتغيير حجم الفرشاة</li>
            <li>• B للفرشاة، E للممحاة</li>
            <li>• امسك Shift لرسم خطوط مستقيمة</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DrawingTools
