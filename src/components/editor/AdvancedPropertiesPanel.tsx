'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Settings,
  Grid3X3,
  Palette,
  Eye,
  EyeOff,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Type,
  Square
} from 'lucide-react'

interface AdvancedPropertiesPanelProps {
  className?: string
}

const AdvancedPropertiesPanel: React.FC<AdvancedPropertiesPanelProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'canvas' | 'appearance'>('properties')

  const {
    shapes,
    selectedShapeId,
    canvasSettings,
    updateShape,
    updateCanvasSettings,
  } = useEditorStore()

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  const handleShapeUpdate = (updates: any) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, updates)
    }
  }

  const handleCanvasUpdate = (updates: any) => {
    updateCanvasSettings(updates)
  }

  const renderShapeProperties = () => {
    if (!selectedShape) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Square className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>اختر عنصراً لتحرير خصائصه</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Position */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الموضع والحجم</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedShape.position.x)}
                onChange={(e) => handleShapeUpdate({
                  position: { ...selectedShape.position, x: Number(e.target.value) }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedShape.position.y)}
                onChange={(e) => handleShapeUpdate({
                  position: { ...selectedShape.position, y: Number(e.target.value) }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">العرض</label>
              <input
                type="number"
                value={Math.round(selectedShape.size.width)}
                onChange={(e) => handleShapeUpdate({
                  size: { ...selectedShape.size, width: Number(e.target.value) }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">الارتفاع</label>
              <input
                type="number"
                value={Math.round(selectedShape.size.height)}
                onChange={(e) => handleShapeUpdate({
                  size: { ...selectedShape.size, height: Number(e.target.value) }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">التدوير</h4>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              value={selectedShape.rotation || 0}
              onChange={(e) => handleShapeUpdate({ rotation: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={Math.round(selectedShape.rotation || 0)}
              onChange={(e) => handleShapeUpdate({ rotation: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">°</span>
          </div>
        </div>

        {/* Opacity */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الشفافية</h4>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedShape.opacity || 1}
              onChange={(e) => handleShapeUpdate({ opacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-12">
              {Math.round((selectedShape.opacity || 1) * 100)}%
            </span>
          </div>
        </div>

        {/* Quick Border Toggle */}
        {(selectedShape.type === 'rect' || selectedShape.type === 'circle' || selectedShape.type === 'triangle') && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">الحدود السريعة</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">سمك الحدود</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={(selectedShape as any).strokeWidth || 0}
                    onChange={(e) => handleShapeUpdate({ strokeWidth: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 opacity-0">زر</label>
                  <button
                    onClick={() => {
                      const currentStrokeWidth = (selectedShape as any).strokeWidth || 0
                      const newStrokeWidth = currentStrokeWidth > 0 ? 0 : 2
                      handleShapeUpdate({ strokeWidth: newStrokeWidth })
                    }}
                    className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                      ((selectedShape as any).strokeWidth || 0) > 0
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {((selectedShape as any).strokeWidth || 0) > 0 ? 'إلغاء' : 'تفعيل'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shape-specific properties */}
        {selectedShape.type === 'rect' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">مستطيل</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون التعبئة</label>
                <input
                  type="color"
                  value={(selectedShape as any).fill || '#000000'}
                  onChange={(e) => handleShapeUpdate({ fill: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الحدود</label>
                <input
                  type="color"
                  value={(selectedShape as any).stroke || '#000000'}
                  onChange={(e) => handleShapeUpdate({ stroke: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Universal Shadow Properties */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الظل والتأثيرات</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">تفعيل الظل</span>
              <input
                type="checkbox"
                checked={selectedShape.shadowEnabled || false}
                onChange={(e) => handleShapeUpdate({ shadowEnabled: e.target.checked })}
                className="rounded"
              />
            </div>

            {selectedShape.shadowEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">لون الظل</label>
                  <input
                    type="color"
                    value={selectedShape.shadowColor || 'rgba(0, 0, 0, 0.3)'}
                    onChange={(e) => handleShapeUpdate({ shadowColor: e.target.value })}
                    className="w-full h-6 border border-gray-200 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">الإزاحة X</label>
                    <input
                      type="number"
                      min="-50"
                      max="50"
                      value={selectedShape.shadowOffsetX || 5}
                      onChange={(e) => handleShapeUpdate({ shadowOffsetX: Number(e.target.value) })}
                      className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">الإزاحة Y</label>
                    <input
                      type="number"
                      min="-50"
                      max="50"
                      value={selectedShape.shadowOffsetY || 5}
                      onChange={(e) => handleShapeUpdate({ shadowOffsetY: Number(e.target.value) })}
                      className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    انتشار الظل ({selectedShape.shadowBlur || 10}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedShape.shadowBlur || 10}
                    onChange={(e) => handleShapeUpdate({ shadowBlur: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                  💡 يمكنك استخدام قيم سالبة للإزاحة لتحريك الظل في الاتجاه المعاكس
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedShape.type === 'circle' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">دائرة</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">نصف القطر</label>
                <input
                  type="number"
                  value={(selectedShape as any).radius || 50}
                  onChange={(e) => handleShapeUpdate({ radius: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون التعبئة</label>
                <input
                  type="color"
                  value={(selectedShape as any).fill || '#000000'}
                  onChange={(e) => handleShapeUpdate({ fill: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الحدود</label>
                <input
                  type="color"
                  value={(selectedShape as any).stroke || '#000000'}
                  onChange={(e) => handleShapeUpdate({ stroke: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'triangle' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">مثلث</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون التعبئة</label>
                <input
                  type="color"
                  value={(selectedShape as any).fill || '#000000'}
                  onChange={(e) => handleShapeUpdate({ fill: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الحدود</label>
                <input
                  type="color"
                  value={(selectedShape as any).stroke || '#000000'}
                  onChange={(e) => handleShapeUpdate({ stroke: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'text' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">نص</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">النص</label>
                <textarea
                  value={(selectedShape as any).text || ''}
                  onChange={(e) => handleShapeUpdate({ text: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">حجم الخط</label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={(selectedShape as any).fontSize || 16}
                  onChange={(e) => handleShapeUpdate({ fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">نوع الخط</label>
                <select
                  value={(selectedShape as any).fontFamily || 'Arial'}
                  onChange={(e) => handleShapeUpdate({ fontFamily: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Impact">Impact</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Cairo, sans-serif">Cairo (عربي)</option>
                  <option value="Amiri, serif">Amiri (عربي)</option>
                  <option value="Tajawal, sans-serif">Tajawal (عربي)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون النص</label>
                <input
                  type="color"
                  value={(selectedShape as any).fill || '#000000'}
                  onChange={(e) => handleShapeUpdate({ fill: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'image' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">صورة</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">نصف قطر الزوايا</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={(selectedShape as any).cornerRadius || 0}
                  onChange={(e) => handleShapeUpdate({ cornerRadius: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">السطوع</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={(selectedShape as any).filters?.brightness || 1}
                  onChange={(e) => handleShapeUpdate({
                    filters: {
                      ...((selectedShape as any).filters || {}),
                      brightness: Number(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">التباين</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={(selectedShape as any).filters?.contrast || 1}
                  onChange={(e) => handleShapeUpdate({
                    filters: {
                      ...((selectedShape as any).filters || {}),
                      contrast: Number(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">التشبع</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={(selectedShape as any).filters?.saturation || 1}
                  onChange={(e) => handleShapeUpdate({
                    filters: {
                      ...((selectedShape as any).filters || {}),
                      saturation: Number(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'person' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">صورة شخصية</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">نصف قطر الحدود</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={(selectedShape as any).borderRadius || 8}
                  onChange={(e) => handleShapeUpdate({ borderRadius: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">سمك الحدود</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={(selectedShape as any).borderWidth || 2}
                  onChange={(e) => handleShapeUpdate({ borderWidth: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الحدود</label>
                <input
                  type="color"
                  value={(selectedShape as any).borderColor || '#6b7280'}
                  onChange={(e) => handleShapeUpdate({ borderColor: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'qr' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">رمز QR</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">البيانات</label>
                <textarea
                  value={(selectedShape as any).data || ''}
                  onChange={(e) => handleShapeUpdate({ data: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الأمام</label>
                <input
                  type="color"
                  value={(selectedShape as any).foregroundColor || '#000000'}
                  onChange={(e) => handleShapeUpdate({ foregroundColor: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الخلفية</label>
                <input
                  type="color"
                  value={(selectedShape as any).backgroundColor || '#ffffff'}
                  onChange={(e) => handleShapeUpdate({ backgroundColor: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'barcode' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">باركود</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">البيانات</label>
                <input
                  type="text"
                  value={(selectedShape as any).data || ''}
                  onChange={(e) => handleShapeUpdate({ data: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">نوع الباركود</label>
                <select
                  value={(selectedShape as any).format || '128'}
                  onChange={(e) => handleShapeUpdate({ format: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="128">Code 128</option>
                  <option value="CODE39">Code 39</option>
                  <option value="EAN13">EAN-13</option>
                  <option value="UPC">UPC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الخطوط</label>
                <input
                  type="color"
                  value={(selectedShape as any).lineColor || '#000000'}
                  onChange={(e) => handleShapeUpdate({ lineColor: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">لون الخلفية</label>
                <input
                  type="color"
                  value={(selectedShape as any).backgroundColor || '#ffffff'}
                  onChange={(e) => handleShapeUpdate({ backgroundColor: e.target.value })}
                  className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCanvasProperties = () => {
    return (
      <div className="space-y-4">
        {/* Canvas Size */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">حجم القماش</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">العرض</label>
              <input
                type="number"
                value={canvasSettings.width}
                onChange={(e) => handleCanvasUpdate({ width: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">الارتفاع</label>
              <input
                type="number"
                value={canvasSettings.height}
                onChange={(e) => handleCanvasUpdate({ height: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الخلفية</h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">لون الخلفية</label>
              <input
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) => handleCanvasUpdate({ backgroundColor: e.target.value })}
                className="w-full h-8 border border-gray-200 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الشبكة</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">إظهار الشبكة</label>
              <input
                type="checkbox"
                checked={canvasSettings.showGrid}
                onChange={(e) => handleCanvasUpdate({ showGrid: e.target.checked })}
                className="rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">حجم الشبكة</label>
              <input
                type="number"
                min="5"
                max="50"
                value={canvasSettings.gridSize}
                onChange={(e) => handleCanvasUpdate({ gridSize: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">لون الشبكة</label>
              <input
                type="color"
                value={canvasSettings.gridColor}
                onChange={(e) => handleCanvasUpdate({ gridColor: e.target.value })}
                className="w-full h-8 border border-gray-200 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">التقاط للشبكة</label>
              <input
                type="checkbox"
                checked={canvasSettings.snapToGrid}
                onChange={(e) => handleCanvasUpdate({ snapToGrid: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header with Tabs */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-right">الخصائص</h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
              activeTab === 'properties'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            العنصر
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
              activeTab === 'canvas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            القماش
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-16">
        {activeTab === 'properties' && renderShapeProperties()}
        {activeTab === 'canvas' && renderCanvasProperties()}
      </div>
    </div>
  )
}

export default AdvancedPropertiesPanel
