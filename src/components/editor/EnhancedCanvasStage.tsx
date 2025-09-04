'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape } from '@/types/shapes'

interface EnhancedCanvasStageProps {
  width?: number
  height?: number
}

export const EnhancedCanvasStage: React.FC<EnhancedCanvasStageProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    active: boolean
  } | null>(null)
  const [multiSelection, setMultiSelection] = useState<string[]>([])
  
  // Enhanced pan and zoom states
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [documentPan, setDocumentPan] = useState({ x: 100, y: 100 }) // Start with some offset
  const [lastWheelTime, setLastWheelTime] = useState(0)

  const {
    shapes,
    selectedShapeId,
    canvasSettings,
    selectShape,
    moveShape,
    updateShape,
    resizeShape,
    deleteShape,
    undo,
    redo,
    saveToHistory,
    setZoom,
    updateCanvasSettings,
  } = useEditorStore()

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        setContext(ctx)
        // Enable high-DPI support
        const devicePixelRatio = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
        ctx.scale(devicePixelRatio, devicePixelRatio)
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
      }
    }
  }, [])

  // Resize canvas when container changes
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        
        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(devicePixelRatio, devicePixelRatio)
          canvas.style.width = rect.width + 'px'
          canvas.style.height = rect.height + 'px'
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Enhanced wheel handler with better zoom and pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const now = Date.now()
    if (now - lastWheelTime < 16) return // Throttle to ~60fps
    setLastWheelTime(now)

    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check if middle mouse button for panning document
    if (e.buttons === 4 || isMiddleMousePanning) {
      const deltaX = e.deltaX * 0.5
      const deltaY = e.deltaY * 0.5
      setDocumentPan(prev => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }))
      return
    }

    // Zoom
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, canvasSettings.zoom * scaleFactor))

    // Calculate zoom point for smooth zooming around cursor
    const zoomPoint = {
      x: (mouseX - documentPan.x) / canvasSettings.zoom,
      y: (mouseY - documentPan.y) / canvasSettings.zoom
    }

    const newOffset = {
      x: mouseX - zoomPoint.x * newZoom,
      y: mouseY - zoomPoint.y * newZoom
    }

    setZoom(newZoom)
    setDocumentPan(newOffset)
  }, [canvasSettings.zoom, documentPan, setZoom, lastWheelTime, isMiddleMousePanning])

  // Reset view function
  const resetView = useCallback(() => {
    setZoom(1)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDocumentPan({ 
        x: (rect.width - canvasSettings.width) / 2,
        y: (rect.height - canvasSettings.height) / 2
      })
    }
  }, [setZoom, canvasSettings.width, canvasSettings.height])

  // Fit to screen function
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width - 80 // padding
    const containerHeight = containerRect.height - 80 // padding
    
    const scaleX = containerWidth / canvasSettings.width
    const scaleY = containerHeight / canvasSettings.height
    const newZoom = Math.min(scaleX, scaleY, 2) * 0.9 // Add some padding and limit max zoom
    
    const offsetX = (containerRect.width - canvasSettings.width * newZoom) / 2
    const offsetY = (containerRect.height - canvasSettings.height * newZoom) / 2
    
    setZoom(newZoom)
    setDocumentPan({ x: offsetX, y: offsetY })
  }, [canvasSettings.width, canvasSettings.height, setZoom])

  // Add global event listeners for fit to screen
  useEffect(() => {
    const handleFitToScreen = () => {
      fitToScreen()
    }

    window.addEventListener('fitToScreen', handleFitToScreen)
    return () => window.removeEventListener('fitToScreen', handleFitToScreen)
  }, [fitToScreen])

  // Enhanced keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      
      if (e.code === 'Space' && !isSpacePressed && !isInputField) {
        e.preventDefault()
        setIsSpacePressed(true)
        return
      }

      // Zoom controls
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetView()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '9') {
        e.preventDefault()
        fitToScreen()
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        const newZoom = Math.min(5, canvasSettings.zoom * 1.2)
        setZoom(newZoom)
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        const newZoom = Math.max(0.1, canvasSettings.zoom * 0.8)
        setZoom(newZoom)
        return
      }

      // History controls
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault()
        redo()
        return
      }

      // Delete
      if (e.key === 'Delete') {
        e.preventDefault()
        if (multiSelection.length > 0) {
          multiSelection.forEach(id => deleteShape(id))
          setMultiSelection([])
        } else if (selectedShapeId) {
          deleteShape(selectedShapeId)
        }
        return
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        selectShape(null)
        setMultiSelection([])
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      
      if (e.code === 'Space' && !isInputField) {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedShapeId, multiSelection, shapes, deleteShape, selectShape, undo, redo, isSpacePressed, canvasSettings.zoom, setZoom, resetView, fitToScreen])

  // Point in shape detection with document coordinates
  const isPointInShape = useCallback((point: { x: number; y: number }, shape: Shape): boolean => {
    if (!shape.visible || shape.locked) return false

    const adjustedPoint = {
      x: (point.x - documentPan.x) / canvasSettings.zoom,
      y: (point.y - documentPan.y) / canvasSettings.zoom
    }

    return (
      adjustedPoint.x >= shape.position.x &&
      adjustedPoint.x <= shape.position.x + shape.size.width &&
      adjustedPoint.y >= shape.position.y &&
      adjustedPoint.y <= shape.position.y + shape.size.height
    )
  }, [documentPan, canvasSettings.zoom])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle middle mouse button for panning
    if (e.button === 1) {
      e.preventDefault()
      setIsMiddleMousePanning(true)
      setPanOffset({ x, y })
      return
    }

    // Handle panning with space key
    if (isSpacePressed) {
      setIsPanning(true)
      setPanOffset({ x, y })
      return
    }

    // Convert screen coordinates to document coordinates
    const docX = (x - documentPan.x) / canvasSettings.zoom
    const docY = (y - documentPan.y) / canvasSettings.zoom

    // Check if we're clicking inside the document bounds
    if (!(docX >= 0 && docX <= canvasSettings.width && docY >= 0 && docY <= canvasSettings.height)) {
      selectShape(null)
      setMultiSelection([])
      return
    }

    // Find clicked shape
    const sortedShapes = [...shapes]
      .filter(shape => shape.visible && !shape.locked)
      .sort((a, b) => b.zIndex - a.zIndex)
    
    let clickedShape: Shape | null = null
    for (const shape of sortedShapes) {
      if (isPointInShape({ x, y }, shape)) {
        clickedShape = shape
        break
      }
    }

    if (clickedShape) {
      if (e.ctrlKey || e.metaKey) {
        if (multiSelection.includes(clickedShape.id)) {
          setMultiSelection(prev => prev.filter(id => id !== clickedShape.id))
        } else {
          setMultiSelection(prev => [...prev, clickedShape.id])
        }
      } else {
        selectShape(clickedShape.id)
        setMultiSelection([])
        setIsDragging(true)
        setDragOffset({ x: docX - clickedShape.position.x, y: docY - clickedShape.position.y })
      }
      return
    }

    // No shape clicked - deselect or start selection box
    if (!e.ctrlKey && !e.metaKey) {
      selectShape(null)
      setMultiSelection([])
    }

    setSelectionBox({
      start: { x: docX, y: docY },
      end: { x: docX, y: docY },
      active: true
    })
  }, [shapes, isPointInShape, selectShape, multiSelection, isSpacePressed, documentPan, canvasSettings])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle panning
    if ((isPanning && isSpacePressed) || isMiddleMousePanning) {
      const deltaX = x - panOffset.x
      const deltaY = y - panOffset.y
      setDocumentPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setPanOffset({ x, y })
      return
    }

    // Handle selection box
    if (selectionBox?.active) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      
      setSelectionBox(prev => prev ? {
        ...prev,
        end: { x: docX, y: docY }
      } : null)
      return
    }

    // Handle shape dragging
    if (isDragging && selectedShapeId) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      
      let newX = docX - dragOffset.x
      let newY = docY - dragOffset.y

      if (canvasSettings.snapToGrid) {
        newX = Math.round(newX / canvasSettings.gridSize) * canvasSettings.gridSize
        newY = Math.round(newY / canvasSettings.gridSize) * canvasSettings.gridSize
      }

      moveShape(selectedShapeId, { x: newX, y: newY })
    }
  }, [isPanning, isSpacePressed, isMiddleMousePanning, selectionBox, isDragging, selectedShapeId, documentPan, canvasSettings, dragOffset, moveShape])

  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    if (e?.button === 1) {
      setIsMiddleMousePanning(false)
      return
    }

    if (selectionBox?.active) {
      // Handle selection box completion
      const selectedIds = shapes
        .filter(shape => {
          if (!shape.visible || shape.locked) return false
          
          const left = Math.min(selectionBox.start.x, selectionBox.end.x)
          const right = Math.max(selectionBox.start.x, selectionBox.end.x)
          const top = Math.min(selectionBox.start.y, selectionBox.end.y)
          const bottom = Math.max(selectionBox.start.y, selectionBox.end.y)

          return (
            shape.position.x >= left &&
            shape.position.x + shape.size.width <= right &&
            shape.position.y >= top &&
            shape.position.y + shape.size.height <= bottom
          )
        })
        .map(shape => shape.id)

      if (selectedIds.length > 0) {
        setMultiSelection(selectedIds)
        if (selectedIds.length === 1) {
          selectShape(selectedIds[0])
        }
      }
      setSelectionBox(null)
    }

    if (isDragging || isResizing || isRotating) {
      saveToHistory()
    }

    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setIsPanning(false)
    setIsMiddleMousePanning(false)
    setResizeHandle(null)
  }, [selectionBox, shapes, isDragging, isResizing, isRotating, saveToHistory, setMultiSelection, selectShape])

  // Enhanced drawing function
  useEffect(() => {
    if (!context || !canvasRef.current) return

    const canvas = canvasRef.current
    
    // Clear canvas
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    
    // Apply transformations
    context.save()
    context.translate(documentPan.x, documentPan.y)
    context.scale(canvasSettings.zoom, canvasSettings.zoom)
    
    // Draw document background
    context.fillStyle = canvasSettings.backgroundColor
    context.fillRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw document border
    context.strokeStyle = '#333'
    context.lineWidth = 2 / canvasSettings.zoom
    context.strokeRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw grid if enabled
    if (canvasSettings.showGrid) {
      context.strokeStyle = canvasSettings.gridColor || '#e5e7eb'
      context.lineWidth = 0.5 / canvasSettings.zoom
      context.globalAlpha = 0.5

      for (let x = 0; x <= canvasSettings.width; x += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvasSettings.height)
        context.stroke()
      }

      for (let y = 0; y <= canvasSettings.height; y += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvasSettings.width, y)
        context.stroke()
      }

      context.globalAlpha = 1
    }
    
    // Sort and draw shapes
    const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
    
    sortedShapes.forEach((shape) => {
      if (!shape.visible) return
      
      context.save()
      context.translate(shape.position.x, shape.position.y)
      context.rotate((shape.rotation * Math.PI) / 180)
      context.globalAlpha = shape.opacity
      
      switch (shape.type) {
        case 'rect':
          const rectShape = shape as any
          context.fillStyle = rectShape.fill
          context.strokeStyle = rectShape.stroke
          context.lineWidth = rectShape.strokeWidth
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          if (rectShape.strokeWidth > 0) {
            context.strokeRect(0, 0, shape.size.width, shape.size.height)
          }
          break
          
        case 'circle':
          const circleShape = shape as any
          const radius = circleShape.radius
          context.beginPath()
          context.arc(radius, radius, radius, 0, 2 * Math.PI)
          context.fillStyle = circleShape.fill
          context.fill()
          context.strokeStyle = circleShape.stroke
          context.lineWidth = circleShape.strokeWidth
          if (circleShape.strokeWidth > 0) {
            context.stroke()
          }
          break
          
        case 'text':
          const textShape = shape as any
          // Keep text size consistent with zoom level
          context.font = `${textShape.fontSize}px ${textShape.fontFamily}`
          context.fillStyle = textShape.fill
          context.textAlign = 'left'
          context.textBaseline = 'top'
          context.fillText(textShape.text, 0, 0)
          break
          
        case 'triangle':
          const triangleShape = shape as any
          context.beginPath()
          context.moveTo(shape.size.width / 2, 0)
          context.lineTo(0, shape.size.height)
          context.lineTo(shape.size.width, shape.size.height)
          context.closePath()
          context.fillStyle = triangleShape.fill
          context.fill()
          context.strokeStyle = triangleShape.stroke
          context.lineWidth = triangleShape.strokeWidth / canvasSettings.zoom
          if (triangleShape.strokeWidth > 0) {
            context.stroke()
          }
          break
          
        default:
          // Default rectangle for unknown types
          context.fillStyle = '#cccccc'
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          break
      }
      
      context.restore()
    })

    // Draw selections (outside of transformations)
    context.restore()

    // Draw multi-selection
    if (multiSelection.length > 1) {
      context.strokeStyle = '#f59e0b'
      context.lineWidth = 2
      context.setLineDash([5, 5])

      multiSelection.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const x = shape.position.x * canvasSettings.zoom + documentPan.x - 3
          const y = shape.position.y * canvasSettings.zoom + documentPan.y - 3
          const width = shape.size.width * canvasSettings.zoom + 6
          const height = shape.size.height * canvasSettings.zoom + 6
          context.strokeRect(x, y, width, height)
        }
      })
    }

    // Draw single selection
    if (selectedShape && multiSelection.length <= 1) {
      context.strokeStyle = '#0ea5e9'
      context.lineWidth = 2
      context.setLineDash([5, 5])
      
      const x = selectedShape.position.x * canvasSettings.zoom + documentPan.x - 5
      const y = selectedShape.position.y * canvasSettings.zoom + documentPan.y - 5
      const width = selectedShape.size.width * canvasSettings.zoom + 10
      const height = selectedShape.size.height * canvasSettings.zoom + 10
      
      context.strokeRect(x, y, width, height)
      
      // Draw resize handles
      const handles = [
        { x: x, y: y }, // top-left
        { x: x + width, y: y }, // top-right
        { x: x, y: y + height }, // bottom-left
        { x: x + width, y: y + height }, // bottom-right
        { x: x + width/2, y: y }, // top-center
        { x: x + width/2, y: y + height }, // bottom-center
        { x: x, y: y + height/2 }, // left-center
        { x: x + width, y: y + height/2 }, // right-center
      ]
      
      context.fillStyle = '#0ea5e9'
      context.strokeStyle = '#ffffff'
      context.lineWidth = 1
      context.setLineDash([])
      
      handles.forEach(handle => {
        context.fillRect(handle.x - 4, handle.y - 4, 8, 8)
        context.strokeRect(handle.x - 4, handle.y - 4, 8, 8)
      })
    }

    // Draw selection box
    if (selectionBox?.active) {
      context.save()
      context.translate(documentPan.x, documentPan.y)
      context.scale(canvasSettings.zoom, canvasSettings.zoom)
      
      context.strokeStyle = '#0ea5e9'
      context.fillStyle = 'rgba(14, 165, 233, 0.1)'
      context.lineWidth = 1 / canvasSettings.zoom
      context.setLineDash([3, 3])

      const width = selectionBox.end.x - selectionBox.start.x
      const height = selectionBox.end.y - selectionBox.start.y

      context.fillRect(selectionBox.start.x, selectionBox.start.y, width, height)
      context.strokeRect(selectionBox.start.x, selectionBox.start.y, width, height)

      context.restore()
    }

  }, [context, shapes, canvasSettings, selectedShape, multiSelection, selectionBox, documentPan])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-200 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isSpacePressed ? 'grab' : isPanning || isMiddleMousePanning ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={0}
      />

      {/* Document outline indicator */}
      <div 
        className="absolute border-2 border-gray-800 pointer-events-none shadow-2xl"
        style={{
          left: documentPan.x,
          top: documentPan.y,
          width: canvasSettings.width * canvasSettings.zoom,
          height: canvasSettings.height * canvasSettings.zoom,
          backgroundColor: 'transparent',
        }}
      />
      
      {/* Enhanced Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-4 py-3 rounded-lg text-sm font-mono shadow-xl">
        <div className="space-y-1">
          <div>Zoom: {Math.round(canvasSettings.zoom * 100)}%</div>
          <div>
            {multiSelection.length > 0 
              ? `Selected: ${multiSelection.length} objects` 
              : selectedShape 
                ? 'Selected: 1 object' 
                : 'No selection'
            }
          </div>
          <div className="text-gray-300 text-xs">
            {isSpacePressed && '⚡ Space: Pan Mode'}
            {isMiddleMousePanning && '🖱️ Middle Mouse: Panning'}
          </div>
        </div>
      </div>
      
      {/* Document Info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 text-gray-800 px-4 py-3 rounded-lg text-sm shadow-lg border">
        <div className="space-y-1">
          <div className="font-semibold">Document: {canvasSettings.width}×{canvasSettings.height}px</div>
          <div className="text-gray-600">Pan: {Math.round(documentPan.x)}, {Math.round(documentPan.y)}</div>
        </div>
      </div>
      
      {/* Enhanced Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(5, canvasSettings.zoom * 1.2))}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Zoom In (Ctrl/Cmd + +)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <button
          onClick={() => setZoom(Math.max(0.1, canvasSettings.zoom * 0.8))}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Zoom Out (Ctrl/Cmd + -)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        <button
          onClick={resetView}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Reset View (Ctrl/Cmd + 0)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <button
          onClick={fitToScreen}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Fit to Screen (Ctrl/Cmd + 9)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Controls Guide */}
      {isSpacePressed && (
        <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-xl">
          <div className="text-sm font-semibold mb-3">🎯 Navigation Controls:</div>
          <div className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Space</span>
              <span>+ Drag to pan around</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Wheel</span>
              <span>Middle button + drag to pan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Scroll</span>
              <span>Zoom in/out at cursor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Ctrl+0</span>
              <span>Reset view</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Ctrl+9</span>
              <span>Fit to screen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedCanvasStage
