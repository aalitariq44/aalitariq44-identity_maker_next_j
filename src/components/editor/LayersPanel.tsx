'use client'

import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import ShapePreview from './ShapePreview'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Square,
  Circle,
  Type,
  Triangle,
  Image as ImageIcon,
  User,
  QrCode,
  ScanLine
} from 'lucide-react'
import type { Shape } from '@/types/shapes'

interface LayersPanelProps {
  className?: string
}

const LayersPanel: React.FC<LayersPanelProps> = ({ className = "" }) => {
  const {
    shapes,
    selectedShapeId,
    selectShape,
    deleteShape,
    updateShape,
    reorderLayers,
  } = useEditorStore()

  // Sort shapes by z-index (highest first for display)
  const sortedShapes = [...shapes].sort((a, b) => b.zIndex - a.zIndex)

  const getShapeIcon = (shape: Shape) => {
    const iconClass = "w-4 h-4"
    
    switch (shape.type) {
      case 'rect':
        return <Square className={iconClass} />
      case 'circle':
        return <Circle className={iconClass} />
      case 'text':
        return <Type className={iconClass} />
      case 'triangle':
        return <Triangle className={iconClass} />
      case 'image':
        return <ImageIcon className={iconClass} />
      case 'person':
        return <User className={iconClass} />
      case 'qr':
        return <QrCode className={iconClass} />
      case 'barcode':
        return <ScanLine className={iconClass} />
      default:
        return <Square className={iconClass} />
    }
  }

  const getShapeName = (shape: Shape) => {
    switch (shape.type) {
      case 'rect':
        return 'مستطيل'
      case 'circle':
        return 'دائرة'
      case 'text':
        return (shape as any).text || 'نص' // eslint-disable-line @typescript-eslint/no-explicit-any
      case 'triangle':
        return 'مثلث'
      case 'image':
        return 'صورة'
      case 'person':
        return 'صورة شخصية'
      case 'qr':
        return 'رمز QR'
      case 'barcode':
        return 'باركود'
      default:
        return 'عنصر'
    }
  }

  const handleVisibilityToggle = (shapeId: string, visible: boolean) => {
    updateShape(shapeId, { visible: !visible })
  }

  const handleLockToggle = (shapeId: string, locked: boolean) => {
    updateShape(shapeId, { locked: !locked })
  }

  const handleMoveUp = (shapeId: string) => {
    const shape = shapes.find(s => s.id === shapeId)
    if (shape) {
      const maxZIndex = Math.max(...shapes.map(s => s.zIndex))
      updateShape(shapeId, { zIndex: Math.min(shape.zIndex + 1, maxZIndex) })
    }
  }

  const handleMoveDown = (shapeId: string) => {
    const shape = shapes.find(s => s.id === shapeId)
    if (shape) {
      const minZIndex = Math.min(...shapes.map(s => s.zIndex))
      updateShape(shapeId, { zIndex: Math.max(shape.zIndex - 1, minZIndex) })
    }
  }

  const handleMoveToTop = (shapeId: string) => {
    const maxZIndex = Math.max(...shapes.map(s => s.zIndex))
    updateShape(shapeId, { zIndex: maxZIndex + 1 })
  }

  const handleMoveToBottom = (shapeId: string) => {
    const minZIndex = Math.min(...shapes.map(s => s.zIndex))
    updateShape(shapeId, { zIndex: minZIndex - 1 })
  }

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 text-right">إدارة الطبقات</h3>
        <p className="text-sm text-gray-600 text-right mt-1">
          {shapes.length} عنصر
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedShapes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            لا توجد عناصر في التصميم
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedShapes.map((shape, index) => (
              <div
                key={shape.id}
                className={`
                  group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedShapeId === shape.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
                onClick={() => selectShape(shape.id)}
              >
                {/* Shape Icon and Name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <ShapePreview shape={shape} size={32} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate text-right">
                      {getShapeName(shape)}
                    </span>
                    <span className="text-xs text-gray-500 text-right">
                      {Math.round(shape.size.width)}×{Math.round(shape.size.height)}
                    </span>
                  </div>
                </div>

                {/* Layer Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Move Up/Down */}
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveUp(shape.id)
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      title="تحريك للأعلى"
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveDown(shape.id)
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      title="تحريك للأسفل"
                      disabled={index === sortedShapes.length - 1}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVisibilityToggle(shape.id, shape.visible)
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                    title={shape.visible ? 'إخفاء' : 'إظهار'}
                  >
                    {shape.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLockToggle(shape.id, shape.locked)
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                    title={shape.locked ? 'إلغاء القفل' : 'قفل'}
                  >
                    {shape.locked ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteShape(shape.id)
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-red-500 hover:text-red-700"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Layer Indicators */}
                <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                  {!shape.visible && (
                    <span className="bg-gray-100 px-1 rounded text-[10px]">مخفي</span>
                  )}
                  {shape.locked && (
                    <span className="bg-red-100 text-red-600 px-1 rounded text-[10px]">مقفل</span>
                  )}
                  <span className="text-[10px]">#{shape.zIndex}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {shapes.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-right mb-2">إجراءات سريعة</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (selectedShapeId) handleMoveToTop(selectedShapeId)
              }}
              disabled={!selectedShapeId}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              للمقدمة
            </button>
            <button
              onClick={() => {
                if (selectedShapeId) handleMoveToBottom(selectedShapeId)
              }}
              disabled={!selectedShapeId}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              للخلفية
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LayersPanel
