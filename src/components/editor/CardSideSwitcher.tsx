'use client'

import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { CreditCard, RotateCcw } from 'lucide-react'

interface CardSideSwitcherProps {
  className?: string
}

export default function CardSideSwitcher({ className = '' }: CardSideSwitcherProps) {
  const { currentSide, switchToSide, frontSide, backSide } = useEditorStore()

  const handleSwitchSide = (side: 'front' | 'back') => {
    if (side !== currentSide) {
      switchToSide(side)
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        وجهي البطاقة
      </h3>
      
      <div className="space-y-2">
        {/* Front Side Button */}
        <button
          onClick={() => handleSwitchSide('front')}
          className={`w-full text-right px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
            currentSide === 'front'
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{frontSide.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {frontSide.shapes.length} عنصر
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              currentSide === 'front' ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
          </div>
        </button>

        {/* Back Side Button */}
        <button
          onClick={() => handleSwitchSide('back')}
          className={`w-full text-right px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
            currentSide === 'back'
              ? 'border-green-500 bg-green-50 text-green-900'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{backSide.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {backSide.shapes.length} عنصر
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              currentSide === 'back' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
        </button>
      </div>

      {/* Quick Switch Button */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => handleSwitchSide(currentSide === 'front' ? 'back' : 'front')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          تبديل إلى {currentSide === 'front' ? 'الوجه الخلفي' : 'الوجه الأمامي'}
        </button>
      </div>

      {/* Current Side Indicator */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            currentSide === 'front' ? 'bg-blue-500' : 'bg-green-500'
          }`} />
          <span className="text-xs font-medium text-gray-700">
            يتم التحرير حالياً: {currentSide === 'front' ? 'الوجه الأمامي' : 'الوجه الخلفي'}
          </span>
        </div>
      </div>
    </div>
  )
}
