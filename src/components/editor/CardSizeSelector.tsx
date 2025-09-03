'use client'

import React from 'react'
import { CARD_SIZES, type CardSize } from '@/types/shapes'
import { CreditCard, FileText, Sparkles } from 'lucide-react'

interface CardSizeSelectorProps {
  selectedSize: { width: number; height: number }
  onSizeChange: (size: CardSize) => void
  onClose: () => void
}

const getIcon = (name: string) => {
  if (name.includes('ماستركارد') || name.includes('أعمال')) {
    return <CreditCard className="w-6 h-6" />
  }
  if (name.includes('مدرسية')) {
    return <FileText className="w-6 h-6" />
  }
  return <Sparkles className="w-6 h-6" />
}

export const CardSizeSelector: React.FC<CardSizeSelectorProps> = ({
  selectedSize,
  onSizeChange,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          اختر حجم البطاقة
        </h3>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {CARD_SIZES.map((size) => {
            const isSelected = 
              selectedSize.width === size.width && 
              selectedSize.height === size.height

            return (
              <button
                key={size.name}
                onClick={() => onSizeChange(size)}
                className={`p-6 border-2 rounded-xl text-right transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getIcon(size.name)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 mb-1">
                      {size.name}
                    </div>
                    <div className="text-gray-600 mb-2">
                      {size.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {size.width} × {size.height} بكسل
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardSizeSelector
