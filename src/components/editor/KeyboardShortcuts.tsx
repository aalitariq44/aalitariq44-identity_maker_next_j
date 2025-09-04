'use client'

import React, { useState, useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { 
  Keyboard, 
  Info, 
  Eye, 
  EyeOff, 
  Zap,
  Navigation,
  Move,
  RotateCw,
  Copy,
  Layers,
  Grid3X3,
  MousePointer2
} from 'lucide-react'

interface KeyboardShortcutsProps {
  isVisible: boolean
  onToggle: () => void
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isVisible, onToggle }) => {
  const shortcuts = [
    {
      category: "Navigation",
      icon: <Navigation className="w-4 h-4" />,
      items: [
        { key: "Space + Drag", action: "Pan around canvas" },
        { key: "Middle Mouse + Drag", action: "Pan document" },
        { key: "Scroll Wheel", action: "Zoom in/out at cursor" },
        { key: "Ctrl + 0", action: "Reset zoom to 100%" },
        { key: "Ctrl + 9", action: "Fit document to screen" },
        { key: "Ctrl + +", action: "Zoom in" },
        { key: "Ctrl + -", action: "Zoom out" }
      ]
    },
    {
      category: "Selection",
      icon: <MousePointer2 className="w-4 h-4" />,
      items: [
        { key: "Click", action: "Select single object" },
        { key: "Ctrl + Click", action: "Multi-select objects" },
        { key: "Shift + Click", action: "Range select" },
        { key: "Drag", action: "Selection box" },
        { key: "Ctrl + A", action: "Select all" },
        { key: "Escape", action: "Deselect all" },
        { key: "Delete", action: "Delete selected" }
      ]
    },
    {
      category: "Clipboard",
      icon: <Copy className="w-4 h-4" />,
      items: [
        { key: "Ctrl + C", action: "Copy selection" },
        { key: "Ctrl + X", action: "Cut selection" },
        { key: "Ctrl + V", action: "Paste" },
        { key: "Ctrl + D", action: "Duplicate selection" }
      ]
    },
    {
      category: "History",
      icon: <RotateCw className="w-4 h-4" />,
      items: [
        { key: "Ctrl + Z", action: "Undo last action" },
        { key: "Ctrl + Y", action: "Redo action" },
        { key: "Ctrl + Shift + Z", action: "Redo action (alternative)" }
      ]
    },
    {
      category: "Layers",
      icon: <Layers className="w-4 h-4" />,
      items: [
        { key: "Ctrl + ]", action: "Bring forward" },
        { key: "Ctrl + [", action: "Send backward" },
        { key: "Ctrl + Shift + ]", action: "Bring to front" },
        { key: "Ctrl + Shift + [", action: "Send to back" }
      ]
    },
    {
      category: "View",
      icon: <Grid3X3 className="w-4 h-4" />,
      items: [
        { key: "Ctrl + ;", action: "Toggle grid" },
        { key: "Ctrl + Shift + ;", action: "Toggle snap to grid" },
        { key: "Ctrl + R", action: "Toggle rulers" }
      ]
    },
    {
      category: "Movement",
      icon: <Move className="w-4 h-4" />,
      items: [
        { key: "Arrow Keys", action: "Move selection by 1px" },
        { key: "Shift + Arrow Keys", action: "Move selection by 10px" },
        { key: "Drag", action: "Move selected objects" }
      ]
    }
  ]

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:shadow-xl z-50"
        title="Show Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Keyboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600">Professional canvas controls and shortcuts</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((category, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-blue-600">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{category.category}</h3>
              </div>
              
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.action}</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-800 shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              💡 Tip: Hold <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Space</kbd> to see this guide while panning
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ShortcutsButton: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Show shortcuts on space key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showShortcuts) {
        const activeElement = document.activeElement
        const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
        
        if (!isInputField) {
          // Don't show immediately on space, only if held
          const timer = setTimeout(() => {
            setShowShortcuts(true)
          }, 1000) // Show after 1 second of holding space
          
          const handleKeyUp = () => {
            clearTimeout(timer)
            window.removeEventListener('keyup', handleKeyUp)
          }
          
          window.addEventListener('keyup', handleKeyUp)
        }
      }
      
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showShortcuts])

  return (
    <KeyboardShortcuts 
      isVisible={showShortcuts}
      onToggle={() => setShowShortcuts(!showShortcuts)}
    />
  )
}

export default ShortcutsButton
