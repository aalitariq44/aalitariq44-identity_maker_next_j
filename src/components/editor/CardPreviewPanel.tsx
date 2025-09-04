'use client'

import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { CreditCard, Eye, Edit3 } from 'lucide-react'

interface CardPreviewPanelProps {
  className?: string
}

export default function CardPreviewPanel({ className = '' }: CardPreviewPanelProps) {
  const { currentSide, switchToSide, frontSide, backSide } = useEditorStore()

  const handleSwitchSide = (side: 'front' | 'back') => {
    if (side !== currentSide) {
      switchToSide(side)
    }
  }

  const getSidePreview = (side: 'front' | 'back') => {
    const sideData = side === 'front' ? frontSide : backSide
    const isActive = currentSide === side
    
    return (
      <div
        key={side}
        className={`relative group cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'ring-2 ring-blue-500 shadow-lg' 
            : 'hover:ring-2 hover:ring-gray-300 hover:shadow-md'
        }`}
        onClick={() => handleSwitchSide(side)}
      >
        {/* Mini Canvas Preview */}
        <div 
          className={`aspect-[85.6/54] w-full max-w-[171px] border-2 rounded-lg ${
            isActive ? 'border-blue-500' : 'border-gray-300'
          }`}
          style={{ 
            backgroundColor: sideData.canvasSettings.backgroundColor,
            backgroundImage: sideData.canvasSettings.backgroundImage 
              ? `url(${sideData.canvasSettings.backgroundImage})` 
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Simplified shapes representation */}
          <div className="w-full h-full relative overflow-hidden rounded-lg">
            {sideData.shapes.map((shape, index) => (
              <div
                key={shape.id}
                className="absolute"
                style={{
                  left: `${(shape.position.x / sideData.canvasSettings.width) * 100}%`,
                  top: `${(shape.position.y / sideData.canvasSettings.height) * 100}%`,
                  width: `${(shape.size.width / sideData.canvasSettings.width) * 100}%`,
                  height: `${(shape.size.height / sideData.canvasSettings.height) * 100}%`,
                  transform: `rotate(${shape.rotation}deg)`,
                  opacity: shape.opacity,
                  zIndex: shape.zIndex,
                }}
              >
                {shape.type === 'rect' && (
                  <div 
                    className="w-full h-full border"
                    style={{ 
                      backgroundColor: (shape as any).fill,
                      borderColor: (shape as any).stroke,
                      borderWidth: Math.max(1, (shape as any).strokeWidth / 4),
                      borderRadius: `${(shape as any).cornerRadius / 4}px`
                    }}
                  />
                )}
                {shape.type === 'circle' && (
                  <div 
                    className="w-full h-full border rounded-full"
                    style={{ 
                      backgroundColor: (shape as any).fill,
                      borderColor: (shape as any).stroke,
                      borderWidth: Math.max(1, (shape as any).strokeWidth / 4)
                    }}
                  />
                )}
                {shape.type === 'text' && (
                  <div 
                    className="w-full h-full flex items-center justify-center text-xs font-bold overflow-hidden"
                    style={{ 
                      color: (shape as any).fill,
                      fontSize: `${Math.max(6, (shape as any).fontSize / 8)}px`
                    }}
                  >
                    {(shape as any).text?.substring(0, 10)}
                  </div>
                )}
                {shape.type === 'image' && (
                  <div className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                    <Eye className="w-2 h-2 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Empty state */}
            {sideData.shapes.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <CreditCard className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>

        {/* Side Label */}
        <div className={`mt-2 text-center ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
          <div className="flex items-center justify-center gap-1">
            {isActive && <Edit3 className="w-3 h-3" />}
            <span className="text-xs font-medium">{sideData.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {sideData.shapes.length} عنصر
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        معاينة الوجهين
      </h3>
      
      <div className="flex gap-4 justify-center">
        {getSidePreview('front')}
        {getSidePreview('back')}
      </div>

      {/* Quick switch button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => handleSwitchSide(currentSide === 'front' ? 'back' : 'front')}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          تبديل إلى {currentSide === 'front' ? 'الوجه الخلفي' : 'الوجه الأمامي'}
        </button>
      </div>
    </div>
  )
}
