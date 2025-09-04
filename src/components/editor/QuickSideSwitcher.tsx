'use client'

import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { CreditCard, RotateCcw } from 'lucide-react'

interface QuickSideSwitcherProps {
  className?: string
}

export default function QuickSideSwitcher({ className = '' }: QuickSideSwitcherProps) {
  const { currentSide, switchToSide, frontSide, backSide } = useEditorStore()

  const handleSwitchSide = (side: 'front' | 'back') => {
    if (side !== currentSide) {
      switchToSide(side)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Front Side Button */}
      <button
        onClick={() => handleSwitchSide('front')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          currentSide === 'front'
            ? 'border-blue-500 bg-blue-50 text-blue-900'
            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
        }`}
        title={`التبديل إلى ${frontSide.name}`}
      >
        <CreditCard className="w-4 h-4" />
        <span className="text-sm font-medium">الوجه الأمامي</span>
        <span className="text-xs text-gray-500">({frontSide.shapes.length})</span>
      </button>

      {/* Back Side Button */}
      <button
        onClick={() => handleSwitchSide('back')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          currentSide === 'back'
            ? 'border-green-500 bg-green-50 text-green-900'
            : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
        }`}
        title={`التبديل إلى ${backSide.name}`}
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm font-medium">الوجه الخلفي</span>
        <span className="text-xs text-gray-500">({backSide.shapes.length})</span>
      </button>

      {/* Current Side Indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${
          currentSide === 'front' ? 'bg-blue-500' : 'bg-green-500'
        }`} />
        <span className="text-xs font-medium text-gray-700">
          {currentSide === 'front' ? 'أمامي' : 'خلفي'}
        </span>
      </div>
    </div>
  )
}
