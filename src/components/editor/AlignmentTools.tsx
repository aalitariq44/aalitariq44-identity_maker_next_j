'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  MoveHorizontal,
  MoveVertical,
  Group,
  Ungroup,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface AlignmentToolsProps {
  className?: string
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({ className = '' }) => {
  const {
    shapes,
    selectedShapeId,
    updateShape,
    deleteShape,
    duplicateShape,
    copyShape,
    pasteShape,
    clipboard,
    canvasSettings
  } = useEditorStore()

  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [multiSelectMode, setMultiSelectMode] = useState(false)

  const selectedShape = shapes.find(s => s.id === selectedShapeId)
  const hasSelection = selectedShapeId || selectedShapes.length > 0
  const hasMultipleSelection = selectedShapes.length > 1
  const hasClipboard = clipboard.length > 0

  // Get bounds of selected shapes
  const getShapesBounds = (shapeIds: string[]) => {
    const targetShapes = shapes.filter(s => shapeIds.includes(s.id))
    if (targetShapes.length === 0) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    targetShapes.forEach(shape => {
      minX = Math.min(minX, shape.position.x)
      minY = Math.min(minY, shape.position.y)
      maxX = Math.max(maxX, shape.position.x + shape.size.width)
      maxY = Math.max(maxY, shape.position.y + shape.size.height)
    })

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
  }

  // Alignment functions
  const alignLeft = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    const bounds = getShapesBounds(targetIds)
    if (!bounds) return

    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        updateShape(id, { position: { ...shape.position, x: bounds.minX } })
      }
    })
  }

  const alignCenter = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    if (targetIds.length === 1) {
      // Align to canvas center
      const shape = shapes.find(s => s.id === targetIds[0])
      if (shape) {
        const centerX = (canvasSettings.width - shape.size.width) / 2
        updateShape(shape.id, { position: { ...shape.position, x: centerX } })
      }
    } else {
      // Align to selection center
      const bounds = getShapesBounds(targetIds)
      if (!bounds) return

      const centerX = bounds.minX + bounds.width / 2

      targetIds.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const shapeCenter = centerX - shape.size.width / 2
          updateShape(id, { position: { ...shape.position, x: shapeCenter } })
        }
      })
    }
  }

  const alignRight = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    if (targetIds.length === 1) {
      // Align to canvas right
      const shape = shapes.find(s => s.id === targetIds[0])
      if (shape) {
        const rightX = canvasSettings.width - shape.size.width
        updateShape(shape.id, { position: { ...shape.position, x: rightX } })
      }
    } else {
      // Align to selection right
      const bounds = getShapesBounds(targetIds)
      if (!bounds) return

      targetIds.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const rightX = bounds.maxX - shape.size.width
          updateShape(id, { position: { ...shape.position, x: rightX } })
        }
      })
    }
  }

  const alignTop = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    const bounds = getShapesBounds(targetIds)
    if (!bounds) return

    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        updateShape(id, { position: { ...shape.position, y: bounds.minY } })
      }
    })
  }

  const alignMiddle = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    if (targetIds.length === 1) {
      // Align to canvas middle
      const shape = shapes.find(s => s.id === targetIds[0])
      if (shape) {
        const centerY = (canvasSettings.height - shape.size.height) / 2
        updateShape(shape.id, { position: { ...shape.position, y: centerY } })
      }
    } else {
      // Align to selection middle
      const bounds = getShapesBounds(targetIds)
      if (!bounds) return

      const centerY = bounds.minY + bounds.height / 2

      targetIds.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const shapeCenter = centerY - shape.size.height / 2
          updateShape(id, { position: { ...shape.position, y: shapeCenter } })
        }
      })
    }
  }

  const alignBottom = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    if (targetIds.length === 0) return

    if (targetIds.length === 1) {
      // Align to canvas bottom
      const shape = shapes.find(s => s.id === targetIds[0])
      if (shape) {
        const bottomY = canvasSettings.height - shape.size.height
        updateShape(shape.id, { position: { ...shape.position, y: bottomY } })
      }
    } else {
      // Align to selection bottom
      const bounds = getShapesBounds(targetIds)
      if (!bounds) return

      targetIds.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const bottomY = bounds.maxY - shape.size.height
          updateShape(id, { position: { ...shape.position, y: bottomY } })
        }
      })
    }
  }

  const distributeHorizontally = () => {
    if (selectedShapes.length < 3) return

    const targetShapes = shapes.filter(s => selectedShapes.includes(s.id))
      .sort((a, b) => a.position.x - b.position.x)

    if (targetShapes.length < 3) return

    const leftmost = targetShapes[0]
    const rightmost = targetShapes[targetShapes.length - 1]
    const totalSpace = (rightmost.position.x + rightmost.size.width) - leftmost.position.x
    const availableSpace = totalSpace - targetShapes.reduce((sum, shape) => sum + shape.size.width, 0)
    const spacing = availableSpace / (targetShapes.length - 1)

    let currentX = leftmost.position.x + leftmost.size.width

    for (let i = 1; i < targetShapes.length - 1; i++) {
      currentX += spacing
      updateShape(targetShapes[i].id, { 
        position: { ...targetShapes[i].position, x: currentX } 
      })
      currentX += targetShapes[i].size.width
    }
  }

  const distributeVertically = () => {
    if (selectedShapes.length < 3) return

    const targetShapes = shapes.filter(s => selectedShapes.includes(s.id))
      .sort((a, b) => a.position.y - b.position.y)

    if (targetShapes.length < 3) return

    const topmost = targetShapes[0]
    const bottommost = targetShapes[targetShapes.length - 1]
    const totalSpace = (bottommost.position.y + bottommost.size.height) - topmost.position.y
    const availableSpace = totalSpace - targetShapes.reduce((sum, shape) => sum + shape.size.height, 0)
    const spacing = availableSpace / (targetShapes.length - 1)

    let currentY = topmost.position.y + topmost.size.height

    for (let i = 1; i < targetShapes.length - 1; i++) {
      currentY += spacing
      updateShape(targetShapes[i].id, { 
        position: { ...targetShapes[i].position, y: currentY } 
      })
      currentY += targetShapes[i].size.height
    }
  }

  const flipHorizontally = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        // For now, we'll use rotation. In a full implementation, you'd flip the actual shape
        const newRotation = (shape.rotation || 0) + 180
        updateShape(id, { rotation: newRotation % 360 })
      }
    })
  }

  const flipVertically = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        // For now, we'll use rotation. In a full implementation, you'd flip the actual shape
        const newRotation = (shape.rotation || 0) + 180
        updateShape(id, { rotation: newRotation % 360 })
      }
    })
  }

  const rotateClockwise = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        const newRotation = (shape.rotation || 0) + 90
        updateShape(id, { rotation: newRotation % 360 })
      }
    })
  }

  const rotateCounterClockwise = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        const newRotation = (shape.rotation || 0) - 90
        updateShape(id, { rotation: newRotation < 0 ? newRotation + 360 : newRotation })
      }
    })
  }

  const bringToFront = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    const maxZIndex = Math.max(...shapes.map(s => s.zIndex))
    
    targetIds.forEach((id, index) => {
      updateShape(id, { zIndex: maxZIndex + index + 1 })
    })
  }

  const sendToBack = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    const minZIndex = Math.min(...shapes.map(s => s.zIndex))
    
    targetIds.forEach((id, index) => {
      updateShape(id, { zIndex: minZIndex - targetIds.length + index })
    })
  }

  const bringForward = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        const higherShapes = shapes.filter(s => s.zIndex > shape.zIndex)
        if (higherShapes.length > 0) {
          const nextHigherZ = Math.min(...higherShapes.map(s => s.zIndex))
          updateShape(id, { zIndex: nextHigherZ + 1 })
        }
      }
    })
  }

  const sendBackward = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    
    targetIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        const lowerShapes = shapes.filter(s => s.zIndex < shape.zIndex)
        if (lowerShapes.length > 0) {
          const nextLowerZ = Math.max(...lowerShapes.map(s => s.zIndex))
          updateShape(id, { zIndex: Math.max(nextLowerZ - 1, 0) })
        }
      }
    })
  }

  const duplicateSelection = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      duplicateShape(id)
    })
  }

  const deleteSelection = () => {
    const targetIds = hasMultipleSelection ? selectedShapes : selectedShapeId ? [selectedShapeId] : []
    targetIds.forEach(id => {
      deleteShape(id)
    })
    setSelectedShapes([])
  }

  const toggleVisibility = () => {
    if (selectedShape) {
      updateShape(selectedShape.id, { visible: !selectedShape.visible })
    }
  }

  const toggleLock = () => {
    if (selectedShape) {
      updateShape(selectedShape.id, { locked: !selectedShape.locked })
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="space-y-4">
        {/* Alignment Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">المحاذاة</h3>
          
          {/* Horizontal Alignment */}
          <div className="flex items-center gap-1 mb-2">
            <button
              onClick={alignLeft}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={alignCenter}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة للوسط"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={alignRight}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة لليمين"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vertical Alignment */}
          <div className="flex items-center gap-1">
            <button
              onClick={alignTop}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة للأعلى"
            >
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button
              onClick={alignMiddle}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة للوسط"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button
              onClick={alignBottom}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="محاذاة للأسفل"
            >
              <AlignEndVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Distribution Section */}
        {hasMultipleSelection && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">التوزيع</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={distributeHorizontally}
                disabled={selectedShapes.length < 3}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="توزيع أفقي"
              >
                <MoveHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={distributeVertically}
                disabled={selectedShapes.length < 3}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="توزيع عمودي"
              >
                <MoveVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Transform Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">التحويل</h3>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={flipHorizontally}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="قلب أفقي"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={flipVertically}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="قلب عمودي"
            >
              <FlipVertical className="w-4 h-4" />
            </button>
            <button
              onClick={rotateClockwise}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="دوران يمين"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={rotateCounterClockwise}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="دوران يسار"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layer Order Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">ترتيب الطبقات</h3>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={bringToFront}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="إحضار للمقدمة"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={bringForward}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="إحضار للأمام"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={sendBackward}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="إرسال للخلف"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={sendToBack}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="إرسال للخلفية"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">الإجراءات</h3>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={duplicateSelection}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="تكرار"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={deleteSelection}
              disabled={!hasSelection}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-red-600"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Object Properties */}
        {selectedShape && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">خصائص العنصر</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleVisibility}
                className={`p-2 rounded ${selectedShape.visible ? 'text-gray-600 hover:bg-gray-100' : 'text-red-600 bg-red-50'}`}
                title={selectedShape.visible ? 'إخفاء' : 'إظهار'}
              >
                {selectedShape.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleLock}
                className={`p-2 rounded ${selectedShape.locked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100'}`}
                title={selectedShape.locked ? 'إلغاء القفل' : 'قفل'}
              >
                {selectedShape.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Selection Info */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          {hasMultipleSelection ? (
            <span>{selectedShapes.length} عناصر محددة</span>
          ) : selectedShape ? (
            <span>محدد: {selectedShape.type}</span>
          ) : (
            <span>لا يوجد تحديد</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlignmentTools
