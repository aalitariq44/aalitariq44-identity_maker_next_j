'use client'

import React, { useState, useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  ChevronUp, 
  ChevronDown,
  MoreVertical,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Layers3,
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

interface AdvancedLayersPanelProps {
  className?: string
}

const AdvancedLayersPanel: React.FC<AdvancedLayersPanelProps> = ({ className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const {
    shapes,
    selectedShapeId,
    selectShape,
    deleteShape,
    updateShape,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    copyShape,
    pasteShape,
    duplicateShape,
  } = useEditorStore()

  // Sort shapes by z-index (highest first for display)
  const sortedShapes = [...shapes].sort((a, b) => b.zIndex - a.zIndex)

  // Filter shapes based on search and type filter
  const filteredShapes = sortedShapes.filter(shape => {
    const matchesSearch = searchTerm === '' || 
      getShapeName(shape).toLowerCase().includes(searchTerm.toLowerCase()) ||
      shape.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || shape.type === filterType
    
    return matchesSearch && matchesFilter
  })

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
        return (shape as any).text || 'نص'
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

  const handleLayerClick = (shapeId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedLayers(prev => 
        prev.includes(shapeId) 
          ? prev.filter(id => id !== shapeId)
          : [...prev, shapeId]
      )
    } else if (event.shiftKey && selectedLayers.length > 0) {
      // Range select with Shift
      const lastSelected = selectedLayers[selectedLayers.length - 1]
      const lastIndex = sortedShapes.findIndex(s => s.id === lastSelected)
      const currentIndex = sortedShapes.findIndex(s => s.id === shapeId)
      
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      
      const rangeIds = sortedShapes.slice(start, end + 1).map(s => s.id)
      setSelectedLayers(rangeIds)
    } else {
      // Single select
      setSelectedLayers([shapeId])
      selectShape(shapeId)
    }
  }

  const handleDragStart = (shapeId: string) => {
    setDraggedLayer(shapeId)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDropTarget(targetId)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (draggedLayer && draggedLayer !== targetId) {
      // Reorder layers by swapping z-indices
      const draggedShape = shapes.find(s => s.id === draggedLayer)
      const targetShape = shapes.find(s => s.id === targetId)
      
      if (draggedShape && targetShape) {
        const tempZIndex = draggedShape.zIndex
        updateShape(draggedLayer, { zIndex: targetShape.zIndex })
        updateShape(targetId, { zIndex: tempZIndex })
      }
    }
    
    setDraggedLayer(null)
    setDropTarget(null)
  }

  const handleBulkAction = (action: string) => {
    selectedLayers.forEach(layerId => {
      switch (action) {
        case 'delete':
          deleteShape(layerId)
          break
        case 'duplicate':
          duplicateShape(layerId)
          break
        case 'hide':
          updateShape(layerId, { visible: false })
          break
        case 'show':
          updateShape(layerId, { visible: true })
          break
        case 'lock':
          updateShape(layerId, { locked: true })
          break
        case 'unlock':
          updateShape(layerId, { locked: false })
          break
      }
    })
    setSelectedLayers([])
  }

  const shapeTypes = [...new Set(shapes.map(s => s.type))]

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">الطبقات</h3>
          </div>
          <span className="text-sm text-gray-500">{shapes.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الطبقات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل الأنواع</option>
            {shapeTypes.map(type => (
              <option key={type} value={type}>
                {getShapeName({ type } as Shape)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLayers.length > 1 && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="text-sm font-medium text-blue-800 mb-2">
            {selectedLayers.length} طبقات محددة
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('hide')}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              إخفاء الكل
            </button>
            <button
              onClick={() => handleBulkAction('show')}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              إظهار الكل
            </button>
            <button
              onClick={() => handleBulkAction('lock')}
              className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              قفل الكل
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              حذف الكل
            </button>
          </div>
        </div>
      )}
      
      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {filteredShapes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || filterType !== 'all' ? 'لا توجد نتائج' : 'لا توجد عناصر في التصميم'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredShapes.map((shape, index) => {
              const isSelected = selectedShapeId === shape.id || selectedLayers.includes(shape.id)
              const isDraggedOver = dropTarget === shape.id
              
              return (
                <div
                  key={shape.id}
                  draggable
                  onDragStart={() => handleDragStart(shape.id)}
                  onDragOver={(e) => handleDragOver(e, shape.id)}
                  onDrop={(e) => handleDrop(e, shape.id)}
                  className={`
                    group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                    ${isDraggedOver ? 'bg-blue-100' : ''}
                    ${shape.id === draggedLayer ? 'opacity-50' : ''}
                  `}
                  onClick={(e) => handleLayerClick(shape.id, e)}
                >
                  {/* Layer Number */}
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-600">
                    {sortedShapes.length - index}
                  </div>

                  {/* Shape Icon and Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-gray-600">
                      {getShapeIcon(shape)}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate text-right">
                        {getShapeName(shape)}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {Math.round(shape.size.width)}×{Math.round(shape.size.height)}
                        </span>
                        <span>Z:{shape.zIndex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Layer Order Controls */}
                    <div className="flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          bringForward(shape.id)
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
                          sendBackward(shape.id)
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                        title="تحريك للأسفل"
                        disabled={index === filteredShapes.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateShape(shape.id, { visible: !shape.visible })
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
                        updateShape(shape.id, { locked: !shape.locked })
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

                    {/* More Actions */}
                    <div className="relative group">
                      <button
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                        title="المزيد"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyShape(shape.id)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4" />
                          نسخ
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateShape(shape.id)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4" />
                          تكرار
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            bringToFront(shape.id)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <ArrowUp className="w-4 h-4" />
                          للمقدمة
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendToBack(shape.id)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <ArrowDown className="w-4 h-4" />
                          للخلفية
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteShape(shape.id)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Layer Status Indicators */}
                  <div className="flex flex-col items-end gap-1">
                    {!shape.visible && (
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">مخفي</span>
                    )}
                    {shape.locked && (
                      <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px]">مقفل</span>
                    )}
                    {selectedLayers.includes(shape.id) && (
                      <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">محدد</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {shapes.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-right mb-2">إجراءات سريعة</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (selectedShapeId) bringToFront(selectedShapeId)
              }}
              disabled={!selectedShapeId}
              className="px-3 py-2 text-xs bg-white border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              للمقدمة
            </button>
            <button
              onClick={() => {
                if (selectedShapeId) sendToBack(selectedShapeId)
              }}
              disabled={!selectedShapeId}
              className="px-3 py-2 text-xs bg-white border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              للخلفية
            </button>
          </div>
          
          {selectedShapeId && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              اسحب الطبقات لإعادة ترتيبها
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedLayersPanel
