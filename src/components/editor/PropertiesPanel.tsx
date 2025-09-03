'use client'

import React, { useMemo } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape, PersonShape, QRShape, BarcodeShape } from '@/types/shapes'
import { SketchPicker } from 'react-color'

export const PropertiesPanel: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    updateShape,
    canvasSettings,
    updateCanvasSettings,
  } = useEditorStore()

  const selectedShape = useMemo(() => {
    return shapes.find((s) => s.id === selectedShapeId)
  }, [shapes, selectedShapeId])

  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  if (!selectedShape) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg font-medium">لوحة الخصائص</p>
          <p className="text-sm mt-2">اختر عنصرًا لتعديل خصائصه</p>
        </div>

        {/* Canvas Settings */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">إعدادات القماش</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العرض (بكسل)
              </label>
              <input
                type="number"
                value={canvasSettings.width}
                onChange={(e) => updateCanvasSettings({ width: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الارتفاع (بكسل)
              </label>
              <input
                type="number"
                value={canvasSettings.height}
                onChange={(e) => updateCanvasSettings({ height: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                لون الخلفية
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: canvasSettings.backgroundColor }}
                  onClick={() => setShowColorPicker('canvas-bg')}
                />
                <input
                  type="text"
                  value={canvasSettings.backgroundColor}
                  onChange={(e) => updateCanvasSettings({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {showColorPicker === 'canvas-bg' && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(null)}
                  />
                  <SketchPicker
                    color={canvasSettings.backgroundColor}
                    onChange={(color) => updateCanvasSettings({ backgroundColor: color.hex })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الخلفية
              </label>
              <input
                type="text"
                placeholder="رابط الصورة"
                value={canvasSettings.backgroundImage || ''}
                onChange={(e) => updateCanvasSettings({ backgroundImage: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {canvasSettings.backgroundImage && (
                <button
                  onClick={() => updateCanvasSettings({ backgroundImage: undefined })}
                  className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  حذف الصورة
                </button>
              )}
            </div>

            {canvasSettings.backgroundImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حجم صورة الخلفية
                </label>
                <select
                  value={canvasSettings.backgroundSize}
                  onChange={(e) => updateCanvasSettings({ 
                    backgroundSize: e.target.value as 'cover' | 'contain' | 'stretch' | 'tile' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cover">تغطية (Cover)</option>
                  <option value="contain">احتواء (Contain)</option>
                  <option value="stretch">تمديد (Stretch)</option>
                  <option value="tile">تكرار (Tile)</option>
                </select>
              </div>
            )}

            {canvasSettings.backgroundImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شفافية الخلفية
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={canvasSettings.backgroundOpacity}
                  onChange={(e) => updateCanvasSettings({ backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{Math.round(canvasSettings.backgroundOpacity * 100)}%</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حجم الشبكة
              </label>
              <input
                type="number"
                value={canvasSettings.gridSize}
                onChange={(e) => updateCanvasSettings({ gridSize: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الشبكة
              </label>
              <select
                value={canvasSettings.gridType}
                onChange={(e) => updateCanvasSettings({ 
                  gridType: e.target.value as 'lines' | 'dots' | 'crosses' | 'diagonal' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lines">خطوط</option>
                <option value="dots">نقاط</option>
                <option value="crosses">صلبان</option>
                <option value="diagonal">خطوط مائلة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نمط الخلفية
              </label>
              <select
                value={canvasSettings.backgroundPattern || ''}
                onChange={(e) => updateCanvasSettings({ 
                  backgroundPattern: e.target.value || undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">بدون نمط</option>
                <option value="dots">نقاط</option>
                <option value="lines">خطوط مائلة</option>
                <option value="grid">شبكة</option>
                <option value="stripes">خطوط عمودية</option>
              </select>
              {canvasSettings.backgroundPattern && (
                <button
                  onClick={() => updateCanvasSettings({ backgroundPattern: undefined })}
                  className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  حذف النمط
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderShapeProperties = () => {
    switch (selectedShape.type) {
      case 'rect':
        return <RectProperties shape={selectedShape as RectShape} />
      case 'circle':
        return <CircleProperties shape={selectedShape as CircleShape} />
      case 'text':
        return <TextProperties shape={selectedShape as TextShape} />
      case 'triangle':
        return <TriangleProperties shape={selectedShape as TriangleShape} />
      case 'person':
        return <PersonProperties shape={selectedShape as PersonShape} />
      case 'qr':
        return <QRProperties shape={selectedShape as QRShape} />
      case 'barcode':
        return <BarcodeProperties shape={selectedShape as BarcodeShape} />
      default:
        return null
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto max-h-screen">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800">خصائص العنصر</h3>
        <p className="text-sm text-gray-500 mt-1">
          {selectedShape.type === 'rect' && 'مستطيل'}
          {selectedShape.type === 'circle' && 'دائرة'}
          {selectedShape.type === 'text' && 'نص'}
          {selectedShape.type === 'triangle' && 'مثلث'}
          {selectedShape.type === 'person' && 'صورة شخصية'}
          {selectedShape.type === 'qr' && 'رمز QR'}
          {selectedShape.type === 'barcode' && 'باركود'}
        </p>
      </div>

      {/* Common Properties */}
      <CommonProperties shape={selectedShape} />

      {/* Shape-specific Properties */}
      {renderShapeProperties()}
    </div>
  )
}

const CommonProperties: React.FC<{ shape: Shape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4 mb-6">
      <h4 className="font-medium text-gray-700 border-b pb-2">الخصائص العامة</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
          <input
            type="number"
            value={shape.position.x}
            onChange={(e) => updateShape(shape.id, { 
              position: { ...shape.position, x: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
          <input
            type="number"
            value={shape.position.y}
            onChange={(e) => updateShape(shape.id, { 
              position: { ...shape.position, y: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العرض</label>
          <input
            type="number"
            value={shape.size.width}
            onChange={(e) => updateShape(shape.id, { 
              size: { ...shape.size, width: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الارتفاع</label>
          <input
            type="number"
            value={shape.size.height}
            onChange={(e) => updateShape(shape.id, { 
              size: { ...shape.size, height: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">دوران (درجة)</label>
        <input
          type="number"
          value={shape.rotation}
          onChange={(e) => updateShape(shape.id, { rotation: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الشفافية</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={shape.opacity}
          onChange={(e) => updateShape(shape.id, { opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{Math.round(shape.opacity * 100)}%</span>
      </div>
    </div>
  )
}

const RectProperties: React.FC<{ shape: RectShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص المستطيل</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون التعبئة</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.fill }}
            onClick={() => setShowColorPicker('fill')}
          />
          <input
            type="text"
            value={shape.fill}
            onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'fill' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.fill}
              onChange={(color) => updateShape(shape.id, { fill: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الحدود</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.stroke }}
            onClick={() => setShowColorPicker('stroke')}
          />
          <input
            type="text"
            value={shape.stroke}
            onChange={(e) => updateShape(shape.id, { stroke: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'stroke' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.stroke}
              onChange={(color) => updateShape(shape.id, { stroke: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سماكة الحدود</label>
        <input
          type="number"
          value={shape.strokeWidth}
          onChange={(e) => updateShape(shape.id, { strokeWidth: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">انحناء الزوايا</label>
        <input
          type="number"
          value={shape.cornerRadius}
          onChange={(e) => updateShape(shape.id, { cornerRadius: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

const CircleProperties: React.FC<{ shape: CircleShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص الدائرة</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نصف القطر</label>
        <input
          type="number"
          value={shape.radius}
          onChange={(e) => updateShape(shape.id, { radius: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون التعبئة</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.fill }}
            onClick={() => setShowColorPicker('fill')}
          />
          <input
            type="text"
            value={shape.fill}
            onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'fill' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.fill}
              onChange={(color) => updateShape(shape.id, { fill: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الحدود</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.stroke }}
            onClick={() => setShowColorPicker('stroke')}
          />
          <input
            type="text"
            value={shape.stroke}
            onChange={(e) => updateShape(shape.id, { stroke: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'stroke' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.stroke}
              onChange={(color) => updateShape(shape.id, { stroke: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سماكة الحدود</label>
        <input
          type="number"
          value={shape.strokeWidth}
          onChange={(e) => updateShape(shape.id, { strokeWidth: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

const TextProperties: React.FC<{ shape: TextShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص النص</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
        <textarea
          value={shape.text}
          onChange={(e) => updateShape(shape.id, { text: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">حجم الخط</label>
        <input
          type="number"
          value={shape.fontSize}
          onChange={(e) => updateShape(shape.id, { fontSize: parseFloat(e.target.value) || 16 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخط</label>
        <select
          value={shape.fontFamily}
          onChange={(e) => updateShape(shape.id, { fontFamily: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وزن الخط</label>
          <select
            value={shape.fontWeight}
            onChange={(e) => updateShape(shape.id, { fontWeight: e.target.value as 'normal' | 'bold' | 'lighter' })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="normal">عادي</option>
            <option value="bold">عريض</option>
            <option value="lighter">خفيف</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نمط الخط</label>
          <select
            value={shape.fontStyle}
            onChange={(e) => updateShape(shape.id, { fontStyle: e.target.value as 'normal' | 'italic' })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="normal">عادي</option>
            <option value="italic">مائل</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">محاذاة النص</label>
        <select
          value={shape.align}
          onChange={(e) => updateShape(shape.id, { align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="left">يسار</option>
          <option value="center">وسط</option>
          <option value="right">يمين</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون النص</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.fill }}
            onClick={() => setShowColorPicker('fill')}
          />
          <input
            type="text"
            value={shape.fill}
            onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'fill' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.fill}
              onChange={(color) => updateShape(shape.id, { fill: color.hex })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const TriangleProperties: React.FC<{ shape: TriangleShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص المثلث</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون التعبئة</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.fill }}
            onClick={() => setShowColorPicker('fill')}
          />
          <input
            type="text"
            value={shape.fill}
            onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'fill' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.fill}
              onChange={(color) => updateShape(shape.id, { fill: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الحدود</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.stroke }}
            onClick={() => setShowColorPicker('stroke')}
          />
          <input
            type="text"
            value={shape.stroke}
            onChange={(e) => updateShape(shape.id, { stroke: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'stroke' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.stroke}
              onChange={(color) => updateShape(shape.id, { stroke: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سماكة الحدود</label>
        <input
          type="number"
          value={shape.strokeWidth}
          onChange={(e) => updateShape(shape.id, { strokeWidth: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

const PersonProperties: React.FC<{ shape: PersonShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        updateShape(shape.id, { 
          src: imageUrl,
          placeholder: false
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص الصورة الشخصية</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة</label>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={shape.src || ''}
          onChange={(e) => updateShape(shape.id, { 
            src: e.target.value || undefined,
            placeholder: !e.target.value
          })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">أو رفع صورة</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {shape.src && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">معاينة الصورة</label>
          <div className="w-full h-32 border border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={shape.src}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={() => updateShape(shape.id, { placeholder: true })}
            />
          </div>
          <button
            onClick={() => updateShape(shape.id, { src: undefined, placeholder: true })}
            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            حذف الصورة
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نصف قطر الحواف</label>
        <input
          type="number"
          min="0"
          value={shape.borderRadius}
          onChange={(e) => updateShape(shape.id, { borderRadius: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سماكة الحدود</label>
        <input
          type="number"
          min="0"
          value={shape.borderWidth}
          onChange={(e) => updateShape(shape.id, { borderWidth: parseFloat(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الحدود</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.borderColor }}
            onClick={() => setShowColorPicker('border')}
          />
          <input
            type="text"
            value={shape.borderColor}
            onChange={(e) => updateShape(shape.id, { borderColor: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'border' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.borderColor}
              onChange={(color) => updateShape(shape.id, { borderColor: color.hex })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const QRProperties: React.FC<{ shape: QRShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص رمز QR</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">البيانات/الرابط</label>
        <textarea
          value={shape.data}
          onChange={(e) => updateShape(shape.id, { data: e.target.value })}
          placeholder="https://example.com أو أي نص"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الخلفية</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.backgroundColor }}
            onClick={() => setShowColorPicker('background')}
          />
          <input
            type="text"
            value={shape.backgroundColor}
            onChange={(e) => updateShape(shape.id, { backgroundColor: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'background' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.backgroundColor}
              onChange={(color) => updateShape(shape.id, { backgroundColor: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الرمز</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.foregroundColor }}
            onClick={() => setShowColorPicker('foreground')}
          />
          <input
            type="text"
            value={shape.foregroundColor}
            onChange={(e) => updateShape(shape.id, { foregroundColor: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'foreground' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.foregroundColor}
              onChange={(color) => updateShape(shape.id, { foregroundColor: color.hex })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const BarcodeProperties: React.FC<{ shape: BarcodeShape }> = ({ shape }) => {
  const { updateShape } = useEditorStore()
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 border-b pb-2">خصائص الباركود</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">البيانات</label>
        <input
          type="text"
          value={shape.data}
          onChange={(e) => updateShape(shape.id, { data: e.target.value })}
          placeholder="123456789012"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">نوع الباركود</label>
        <select
          value={shape.format}
          onChange={(e) => updateShape(shape.id, { format: e.target.value as '128' | 'CODE39' | 'EAN13' | 'UPC' })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="128">Code 128</option>
          <option value="CODE39">Code 39</option>
          <option value="EAN13">EAN-13</option>
          <option value="UPC">UPC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الخلفية</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.backgroundColor }}
            onClick={() => setShowColorPicker('background')}
          />
          <input
            type="text"
            value={shape.backgroundColor}
            onChange={(e) => updateShape(shape.id, { backgroundColor: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'background' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.backgroundColor}
              onChange={(color) => updateShape(shape.id, { backgroundColor: color.hex })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">لون الخطوط</label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: shape.lineColor }}
            onClick={() => setShowColorPicker('lines')}
          />
          <input
            type="text"
            value={shape.lineColor}
            onChange={(e) => updateShape(shape.id, { lineColor: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showColorPicker === 'lines' && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <SketchPicker
              color={shape.lineColor}
              onChange={(color) => updateShape(shape.id, { lineColor: color.hex })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertiesPanel
