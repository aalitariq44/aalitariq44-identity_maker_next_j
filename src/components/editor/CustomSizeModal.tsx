'use client'

import React, { useState } from 'react'
import { X, Ruler, RotateCw } from 'lucide-react'

interface CustomSizeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (size: { width: number; height: number; name?: string }) => void
  currentSize: { width: number; height: number }
}

const CustomSizeModal: React.FC<CustomSizeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentSize
}) => {
  const [width, setWidth] = useState(currentSize.width)
  const [height, setHeight] = useState(currentSize.height)
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'inch'>('px')
  const [customName, setCustomName] = useState('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(currentSize.width / currentSize.height)

  // Common preset sizes in different units
  const presetSizes = {
    'بطاقة هوية عادية': { width: 856, height: 540, unit: 'px' },
    'بطاقة ماستركارد': { width: 856, height: 540, unit: 'px' },
    'بطاقة أعمال': { width: 890, height: 510, unit: 'px' },
    'هوية مدرسية': { width: 900, height: 560, unit: 'px' },
    'A4 (عمودي)': { width: 2480, height: 3508, unit: 'px' },
    'A4 (أفقي)': { width: 3508, height: 2480, unit: 'px' },
    'بطاقة مربعة': { width: 600, height: 600, unit: 'px' },
    'بطاقة طويلة': { width: 1200, height: 400, unit: 'px' },
  }

  // Unit conversion functions
  const mmToPx = (mm: number) => Math.round(mm * 3.7795275591) // 96 DPI
  const cmToPx = (cm: number) => Math.round(cm * 37.795275591)
  const inchToPx = (inch: number) => Math.round(inch * 96)
  
  const pxToMm = (px: number) => Math.round((px / 3.7795275591) * 100) / 100
  const pxToCm = (px: number) => Math.round((px / 37.795275591) * 100) / 100
  const pxToInch = (px: number) => Math.round((px / 96) * 100) / 100

  const convertToPixels = (value: number, fromUnit: string) => {
    switch (fromUnit) {
      case 'mm': return mmToPx(value)
      case 'cm': return cmToPx(value)
      case 'inch': return inchToPx(value)
      default: return value
    }
  }

  const convertFromPixels = (value: number, toUnit: string) => {
    switch (toUnit) {
      case 'mm': return pxToMm(value)
      case 'cm': return pxToCm(value)
      case 'inch': return pxToInch(value)
      default: return value
    }
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const handleUnitChange = (newUnit: 'px' | 'mm' | 'cm' | 'inch') => {
    const widthInPx = convertToPixels(width, unit)
    const heightInPx = convertToPixels(height, unit)
    
    setWidth(Math.round(convertFromPixels(widthInPx, newUnit)))
    setHeight(Math.round(convertFromPixels(heightInPx, newUnit)))
    setUnit(newUnit)
  }

  const handlePresetSelect = (preset: keyof typeof presetSizes) => {
    const size = presetSizes[preset]
    setWidth(size.width)
    setHeight(size.height)
    setCustomName(preset)
  }

  const handleSwapDimensions = () => {
    const tempWidth = width
    setWidth(height)
    setHeight(tempWidth)
  }

  const handleApply = () => {
    const finalWidth = convertToPixels(width, unit)
    const finalHeight = convertToPixels(height, unit)
    
    onApply({
      width: finalWidth,
      height: finalHeight,
      name: customName || `${finalWidth}×${finalHeight}px`
    })
  }

  if (!isOpen) return null

  const displayWidth = unit === 'px' ? width : convertFromPixels(width, unit)
  const displayHeight = unit === 'px' ? height : convertFromPixels(height, unit)

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">حجم مخصص للبطاقة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">الأحجام المحددة مسبقاً</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(presetSizes).map(([name, size]) => (
                <button
                  key={name}
                  onClick={() => handlePresetSelect(name as keyof typeof presetSizes)}
                  className="p-3 text-right border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-600">{size.width}×{size.height} {size.unit}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">حجم مخصص</h3>
            
            {/* Custom Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الحجم (اختياري)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="مثال: بطاقة شخصية مخصصة"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unit Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوحدة
              </label>
              <div className="flex gap-2">
                {(['px', 'mm', 'cm', 'inch'] as const).map((unitOption) => (
                  <button
                    key={unitOption}
                    onClick={() => handleUnitChange(unitOption)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      unit === unitOption
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {unitOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العرض ({unit})
                </label>
                <input
                  type="number"
                  value={displayWidth}
                  onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                  min="1"
                  step={unit === 'px' ? '1' : '0.1'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الارتفاع ({unit})
                </label>
                <input
                  type="number"
                  value={displayHeight}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                  min="1"
                  step={unit === 'px' ? '1' : '0.1'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => {
                    setMaintainAspectRatio(e.target.checked)
                    if (e.target.checked) {
                      setAspectRatio(width / height)
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">الحفاظ على النسبة</span>
              </label>

              <button
                onClick={handleSwapDimensions}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                تبديل الأبعاد
              </button>
            </div>

            {/* Preview */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">معاينة الحجم:</div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <strong>بالبكسل:</strong> {convertToPixels(width, unit)}×{convertToPixels(height, unit)} px
                </div>
                <div className="text-sm">
                  <strong>النسبة:</strong> {(convertToPixels(width, unit) / convertToPixels(height, unit)).toFixed(2)}:1
                </div>
              </div>
              
              {/* Visual preview */}
              <div className="mt-3 flex justify-center">
                <div 
                  className="border-2 border-dashed border-gray-400 bg-white"
                  style={{
                    width: Math.min(convertToPixels(width, unit) / 4, 200),
                    height: Math.min(convertToPixels(height, unit) / 4, 120),
                    maxWidth: '200px',
                    maxHeight: '120px'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    معاينة
                  </div>
                </div>
              </div>
            </div>

            {/* Size recommendations */}
            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
              <div className="font-medium mb-1">توصيات الأحجام:</div>
              <ul className="space-y-1">
                <li>• بطاقة الهوية العادية: 85.6×54 ملم</li>
                <li>• بطاقة الأعمال: 89×51 ملم</li>
                <li>• للطباعة: استخدم 300 DPI كحد أدنى</li>
                <li>• للعرض الرقمي: 96-150 DPI كافي</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تطبيق الحجم
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomSizeModal
