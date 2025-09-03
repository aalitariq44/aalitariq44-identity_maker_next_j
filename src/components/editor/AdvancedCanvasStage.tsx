'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape, PersonShape, QRShape, BarcodeShape } from '@/types/shapes'
import { snapToGrid } from '@/lib/konvaUtils'

interface AdvancedCanvasStageProps {
  width: number
  height: number
}

export const AdvancedCanvasStage: React.FC<AdvancedCanvasStageProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [initialShapeState, setInitialShapeState] = useState<{
    position: { x: number; y: number }
    size: { width: number; height: number }
    rotation: number
  } | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    active: boolean
  } | null>(null)
  const [multiSelection, setMultiSelection] = useState<string[]>([])
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

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
  } = useEditorStore()

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      setContext(ctx)
    }
  }, [])

  // Enhanced keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip handling space key if user is typing in an input field
      const activeElement = document.activeElement;
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      
      // Handle space key for panning (only if not in input field)
      if (e.code === 'Space' && !isSpacePressed && !isInputField) {
        e.preventDefault()
        setIsSpacePressed(true)
        return
      }

      // Handle Ctrl+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Handle Ctrl+Y or Ctrl+Shift+Z (Redo)
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault()
        redo()
        return
      }

      // Handle Ctrl+A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        setMultiSelection(shapes.map(s => s.id))
        return
      }

      // Only handle other keyboard events when we have a selected shape
      if (!selectedShapeId && multiSelection.length === 0) return

      // Handle Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        if (multiSelection.length > 0) {
          multiSelection.forEach(id => deleteShape(id))
          setMultiSelection([])
        } else if (selectedShapeId) {
          deleteShape(selectedShapeId)
        }
        return
      }

      // Handle Escape key to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        selectShape(null)
        setMultiSelection([])
        return
      }

      // Handle arrow keys for precise movement
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        let deltaX = 0, deltaY = 0

        switch (e.key) {
          case 'ArrowUp': deltaY = -step; break
          case 'ArrowDown': deltaY = step; break
          case 'ArrowLeft': deltaX = -step; break
          case 'ArrowRight': deltaX = step; break
        }

        const shapesToMove = multiSelection.length > 0 ? multiSelection : (selectedShapeId ? [selectedShapeId] : [])
        
        shapesToMove.forEach(shapeId => {
          const shape = shapes.find(s => s.id === shapeId)
          if (shape) {
            moveShape(shapeId, {
              x: shape.position.x + deltaX,
              y: shape.position.y + deltaY
            })
          }
        })
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Skip handling space key if user is typing in an input field
      const activeElement = document.activeElement;
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      
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
  }, [selectedShapeId, multiSelection, shapes, deleteShape, selectShape, undo, redo, moveShape, isSpacePressed])

  // Function to check if point is inside shape with improved precision
  const isPointInShape = useCallback((point: { x: number; y: number }, shape: Shape): boolean => {
    // Don't select hidden or locked shapes
    if (!shape.visible || shape.locked) return false

    // Apply canvas offset
    const adjustedPoint = {
      x: point.x - canvasOffset.x,
      y: point.y - canvasOffset.y
    }

    switch (shape.type) {
      case 'rect':
        return (
          adjustedPoint.x >= shape.position.x &&
          adjustedPoint.x <= shape.position.x + shape.size.width &&
          adjustedPoint.y >= shape.position.y &&
          adjustedPoint.y <= shape.position.y + shape.size.height
        )
      case 'circle':
        const centerX = shape.position.x + (shape as CircleShape).radius
        const centerY = shape.position.y + (shape as CircleShape).radius
        const distance = Math.sqrt((adjustedPoint.x - centerX) ** 2 + (adjustedPoint.y - centerY) ** 2)
        return distance <= (shape as CircleShape).radius
      case 'text':
      case 'triangle':
      case 'person':
      case 'qr':
      case 'barcode':
        return (
          adjustedPoint.x >= shape.position.x &&
          adjustedPoint.x <= shape.position.x + shape.size.width &&
          adjustedPoint.y >= shape.position.y &&
          adjustedPoint.y <= shape.position.y + shape.size.height
        )
      default:
        return false
    }
  }, [canvasOffset])

  // Enhanced resize handles
  const getResizeHandles = useCallback((shape: Shape) => {
    const { position, size } = shape
    const handleSize = 8
    const offset = handleSize / 2

    return {
      topLeft: {
        x: position.x - offset,
        y: position.y - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'nw-resize'
      },
      topRight: {
        x: position.x + size.width - offset,
        y: position.y - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'ne-resize'
      },
      bottomLeft: {
        x: position.x - offset,
        y: position.y + size.height - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'sw-resize'
      },
      bottomRight: {
        x: position.x + size.width - offset,
        y: position.y + size.height - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'se-resize'
      },
      top: {
        x: position.x + size.width / 2 - offset,
        y: position.y - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'n-resize'
      },
      bottom: {
        x: position.x + size.width / 2 - offset,
        y: position.y + size.height - offset,
        width: handleSize,
        height: handleSize,
        cursor: 's-resize'
      },
      left: {
        x: position.x - offset,
        y: position.y + size.height / 2 - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'w-resize'
      },
      right: {
        x: position.x + size.width - offset,
        y: position.y + size.height / 2 - offset,
        width: handleSize,
        height: handleSize,
        cursor: 'e-resize'
      }
    }
  }, [])

  // Enhanced rotation handle
  const getRotationHandle = useCallback((shape: Shape) => {
    const { position, size } = shape
    const handleSize = 12
    const offset = handleSize / 2

    return {
      x: position.x + size.width / 2 - offset,
      y: position.y - 30 - offset,
      width: handleSize,
      height: handleSize,
      cursor: 'crosshair'
    }
  }, [])

  const getResizeHandleAtPoint = useCallback((point: { x: number; y: number }, shape: Shape) => {
    const handles = getResizeHandles(shape)

    for (const [key, handle] of Object.entries(handles)) {
      if (
        point.x >= handle.x &&
        point.x <= handle.x + handle.width &&
        point.y >= handle.y &&
        point.y <= handle.y + handle.height
      ) {
        return key
      }
    }

    return null
  }, [getResizeHandles])

  const isPointInRotationHandle = useCallback((point: { x: number; y: number }, shape: Shape) => {
    const handle = getRotationHandle(shape)

    return (
      point.x >= handle.x &&
      point.x <= handle.x + handle.width &&
      point.y >= handle.y &&
      point.y <= handle.y + handle.height
    )
  }, [getRotationHandle])

  // Selection box functions
  const getShapesInSelectionBox = useCallback((box: { start: { x: number; y: number }, end: { x: number; y: number } }) => {
    const left = Math.min(box.start.x, box.end.x)
    const right = Math.max(box.start.x, box.end.x)
    const top = Math.min(box.start.y, box.end.y)
    const bottom = Math.max(box.start.y, box.end.y)

    return shapes.filter(shape => {
      if (!shape.visible || shape.locked) return false
      
      return (
        shape.position.x >= left &&
        shape.position.x + shape.size.width <= right &&
        shape.position.y >= top &&
        shape.position.y + shape.size.height <= bottom
      )
    }).map(shape => shape.id)
  }, [shapes])

  // Enhanced mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle panning with space key
    if (isSpacePressed) {
      setIsPanning(true)
      setPanOffset({ x, y })
      return
    }

    // Check if clicking on selected shape's handles first
    if (selectedShape) {
      // Check rotation handle
      if (isPointInRotationHandle({ x, y }, selectedShape)) {
        setIsRotating(true)
        setInitialShapeState({
          position: { ...selectedShape.position },
          size: { ...selectedShape.size },
          rotation: selectedShape.rotation
        })
        return
      }

      // Check resize handles
      const resizeHandle = getResizeHandleAtPoint({ x, y }, selectedShape)
      if (resizeHandle) {
        setIsResizing(true)
        setResizeHandle(resizeHandle)
        setInitialShapeState({
          position: { ...selectedShape.position },
          size: { ...selectedShape.size },
          rotation: selectedShape.rotation
        })
        return
      }
    }

    // Find clicked shape (check from top to bottom - highest z-index first)
    const sortedShapesForSelection = [...shapes]
      .filter(shape => shape.visible && !shape.locked)
      .sort((a, b) => b.zIndex - a.zIndex)
    
    let clickedShape: Shape | null = null
    for (const shape of sortedShapesForSelection) {
      if (isPointInShape({ x, y }, shape)) {
        clickedShape = shape
        break
      }
    }

    if (clickedShape) {
      // Handle multi-selection
      if (e.ctrlKey || e.metaKey) {
        if (multiSelection.includes(clickedShape.id)) {
          setMultiSelection(prev => prev.filter(id => id !== clickedShape.id))
        } else {
          setMultiSelection(prev => [...prev, clickedShape.id])
        }
      } else if (e.shiftKey && selectedShapeId) {
        // Range selection (simplified)
        const selectedIndex = sortedShapesForSelection.findIndex(s => s.id === selectedShapeId)
        const clickedIndex = sortedShapesForSelection.findIndex(s => s.id === clickedShape.id)
        
        const start = Math.min(selectedIndex, clickedIndex)
        const end = Math.max(selectedIndex, clickedIndex)
        
        const rangeIds = sortedShapesForSelection.slice(start, end + 1).map(s => s.id)
        setMultiSelection(rangeIds)
      } else {
        // Single selection
        selectShape(clickedShape.id)
        setMultiSelection([])
        setIsDragging(true)
        setDragOffset({ x: x - clickedShape.position.x, y: y - clickedShape.position.y })
        setInitialShapeState({
          position: { ...clickedShape.position },
          size: { ...clickedShape.size },
          rotation: clickedShape.rotation
        })
      }
      return
    }

    // No shape clicked - start selection box or deselect
    if (!e.ctrlKey && !e.metaKey) {
      selectShape(null)
      setMultiSelection([])
    }

    // Start selection box
    setSelectionBox({
      start: { x, y },
      end: { x, y },
      active: true
    })
  }, [shapes, isPointInShape, selectShape, selectedShape, selectedShapeId, multiSelection, isSpacePressed, isPointInRotationHandle, getResizeHandleAtPoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle panning
    if (isPanning && isSpacePressed) {
      const deltaX = x - panOffset.x
      const deltaY = y - panOffset.y
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setPanOffset({ x, y })
      return
    }

    // Handle selection box
    if (selectionBox?.active) {
      setSelectionBox(prev => prev ? {
        ...prev,
        end: { x, y }
      } : null)
      return
    }

    // Handle shape interactions
    if (!selectedShapeId || !initialShapeState) return

    const shape = shapes.find(s => s.id === selectedShapeId)
    if (!shape) return

    if (isRotating) {
      const centerX = initialShapeState.position.x + initialShapeState.size.width / 2
      const centerY = initialShapeState.position.y + initialShapeState.size.height / 2

      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)
      const newRotation = angle + 90

      updateShape(selectedShapeId, { rotation: newRotation })
      return
    }

    if (isResizing && resizeHandle) {
      const { position: initialPos, size: initialSize } = initialShapeState
      let newPosition = { ...initialPos }
      let newSize = { ...initialSize }

      const minSize = 10

      switch (resizeHandle) {
        case 'topLeft':
          newSize.width = Math.max(minSize, initialSize.width + (initialPos.x - x))
          newSize.height = Math.max(minSize, initialSize.height + (initialPos.y - y))
          newPosition.x = initialPos.x + (initialSize.width - newSize.width)
          newPosition.y = initialPos.y + (initialSize.height - newSize.height)
          break
        case 'topRight':
          newSize.width = Math.max(minSize, x - initialPos.x)
          newSize.height = Math.max(minSize, initialSize.height + (initialPos.y - y))
          newPosition.y = initialPos.y + (initialSize.height - newSize.height)
          break
        case 'bottomLeft':
          newSize.width = Math.max(minSize, initialSize.width + (initialPos.x - x))
          newSize.height = Math.max(minSize, y - initialPos.y)
          newPosition.x = initialPos.x + (initialSize.width - newSize.width)
          break
        case 'bottomRight':
          newSize.width = Math.max(minSize, x - initialPos.x)
          newSize.height = Math.max(minSize, y - initialPos.y)
          break
        case 'top':
          newSize.height = Math.max(minSize, initialSize.height + (initialPos.y - y))
          newPosition.y = initialPos.y + (initialSize.height - newSize.height)
          break
        case 'bottom':
          newSize.height = Math.max(minSize, y - initialPos.y)
          break
        case 'left':
          newSize.width = Math.max(minSize, initialSize.width + (initialPos.x - x))
          newPosition.x = initialPos.x + (initialSize.width - newSize.width)
          break
        case 'right':
          newSize.width = Math.max(minSize, x - initialPos.x)
          break
      }

      if (canvasSettings.snapToGrid) {
        newPosition.x = snapToGrid(newPosition.x, canvasSettings.gridSize)
        newPosition.y = snapToGrid(newPosition.y, canvasSettings.gridSize)
        newSize.width = snapToGrid(newSize.width, canvasSettings.gridSize)
        newSize.height = snapToGrid(newSize.height, canvasSettings.gridSize)
      }

      moveShape(selectedShapeId, newPosition)
      resizeShape(selectedShapeId, newSize)
      return
    }

    if (isDragging) {
      let newX = x - dragOffset.x
      let newY = y - dragOffset.y

      if (canvasSettings.snapToGrid) {
        newX = snapToGrid(newX, canvasSettings.gridSize)
        newY = snapToGrid(newY, canvasSettings.gridSize)
      }

      moveShape(selectedShapeId, { x: newX, y: newY })
    }
  }, [isDragging, selectedShapeId, shapes, dragOffset, canvasSettings.snapToGrid, canvasSettings.gridSize, moveShape, isResizing, isRotating, resizeHandle, initialShapeState, updateShape, resizeShape, selectionBox, isPanning, isSpacePressed, panOffset])

  const handleMouseUp = useCallback(() => {
    // Handle selection box completion
    if (selectionBox?.active) {
      const selectedIds = getShapesInSelectionBox(selectionBox)
      if (selectedIds.length > 0) {
        setMultiSelection(selectedIds)
        if (selectedIds.length === 1) {
          selectShape(selectedIds[0])
        }
      }
      setSelectionBox(null)
    }

    // Save to history if we made significant changes
    if (isDragging || isResizing || isRotating) {
      saveToHistory()
    }

    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setIsPanning(false)
    setResizeHandle(null)
    setInitialShapeState(null)
  }, [selectionBox, getShapesInSelectionBox, setMultiSelection, selectShape, isDragging, isResizing, isRotating, saveToHistory])

  // Enhanced drawing function with selection effects
  const drawSelection = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save()

    // Draw selection rectangle
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(shape.position.x - 5, shape.position.y - 5, shape.size.width + 10, shape.size.height + 10)
    ctx.restore()

    // Draw resize handles
    const handles = getResizeHandles(shape)
    ctx.fillStyle = '#0ea5e9'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1

    Object.values(handles).forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handle.width, handle.height)
      ctx.strokeRect(handle.x, handle.y, handle.width, handle.height)
    })

    // Draw rotation handle
    const rotationHandle = getRotationHandle(shape)
    ctx.fillStyle = '#10b981'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1

    // Draw line from shape to rotation handle
    ctx.beginPath()
    ctx.moveTo(shape.position.x + shape.size.width / 2, shape.position.y)
    ctx.lineTo(shape.position.x + shape.size.width / 2, shape.position.y - 20)
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw rotation handle circle
    ctx.beginPath()
    ctx.arc(
      rotationHandle.x + rotationHandle.width / 2,
      rotationHandle.y + rotationHandle.height / 2,
      rotationHandle.width / 2,
      0,
      2 * Math.PI
    )
    ctx.fill()
    ctx.stroke()

    // Draw rotation icon
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(
      rotationHandle.x + rotationHandle.width / 2,
      rotationHandle.y + rotationHandle.height / 2,
      rotationHandle.width / 4,
      0,
      1.5 * Math.PI
    )
    ctx.stroke()

    const centerX = rotationHandle.x + rotationHandle.width / 2
    const centerY = rotationHandle.y + rotationHandle.height / 2
    const arrowSize = rotationHandle.width / 6

    ctx.beginPath()
    ctx.moveTo(centerX + arrowSize, centerY - arrowSize)
    ctx.lineTo(centerX + arrowSize * 1.5, centerY)
    ctx.lineTo(centerX + arrowSize, centerY + arrowSize)
    ctx.stroke()

    ctx.restore()
  }, [getResizeHandles, getRotationHandle])

  // Multi-selection drawing
  const drawMultiSelection = useCallback((ctx: CanvasRenderingContext2D, shapeIds: string[]) => {
    ctx.save()
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    shapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        ctx.strokeRect(shape.position.x - 3, shape.position.y - 3, shape.size.width + 6, shape.size.height + 6)
      }
    })

    ctx.restore()
  }, [shapes])

  // Selection box drawing
  const drawSelectionBox = useCallback((ctx: CanvasRenderingContext2D, box: { start: { x: number; y: number }, end: { x: number; y: number } }) => {
    ctx.save()
    ctx.strokeStyle = '#0ea5e9'
    ctx.fillStyle = 'rgba(14, 165, 233, 0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    const width = box.end.x - box.start.x
    const height = box.end.y - box.start.y

    ctx.fillRect(box.start.x, box.start.y, width, height)
    ctx.strokeRect(box.start.x, box.start.y, width, height)

    ctx.restore()
  }, [])

  // Get cursor type based on context
  const getCursorType = useCallback((e: React.MouseEvent) => {
    if (isSpacePressed) return 'grab'
    if (isPanning) return 'grabbing'
    if (!canvasRef.current || !selectedShape) return 'default'

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isPointInRotationHandle({ x, y }, selectedShape)) {
      return 'crosshair'
    }

    const resizeHandle = getResizeHandleAtPoint({ x, y }, selectedShape)
    if (resizeHandle) {
      const handles = getResizeHandles(selectedShape)
      return handles[resizeHandle as keyof typeof handles].cursor
    }

    if (isPointInShape({ x, y }, selectedShape)) {
      return 'move'
    }

    return 'default'
  }, [selectedShape, isSpacePressed, isPanning, isPointInRotationHandle, getResizeHandleAtPoint, getResizeHandles, isPointInShape])

  // Main render effect
  useEffect(() => {
    if (!context || !canvasRef.current) return

    const canvas = canvasRef.current
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply canvas transformations
    context.save()
    context.translate(canvasOffset.x, canvasOffset.y)
    context.scale(canvasSettings.zoom, canvasSettings.zoom)
    
    // Draw background
    context.fillStyle = canvasSettings.backgroundColor
    context.fillRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw grid if enabled
    if (canvasSettings.showGrid) {
      context.strokeStyle = canvasSettings.gridColor
      context.lineWidth = 0.5 / canvasSettings.zoom
      context.setLineDash([])
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
    
    // Sort shapes by z-index (lowest first for proper drawing order)
    const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
    
    // Draw shapes in correct z-index order
    sortedShapes.forEach((shape) => {
      // Skip hidden shapes
      if (!shape.visible) return
      
      context.save()
      context.translate(shape.position.x, shape.position.y)
      context.rotate((shape.rotation * Math.PI) / 180)
      context.globalAlpha = shape.opacity
      
      // Enhanced shape drawing with better rendering...
      switch (shape.type) {
        case 'rect':
          context.fillStyle = (shape as any).fill
          context.strokeStyle = (shape as any).stroke
          context.lineWidth = (shape as any).strokeWidth / canvasSettings.zoom
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          if ((shape as any).strokeWidth > 0) {
            context.strokeRect(0, 0, shape.size.width, shape.size.height)
          }
          break
          
        case 'circle':
          const radius = (shape as any).radius
          context.beginPath()
          context.arc(radius, radius, radius, 0, 2 * Math.PI)
          context.fillStyle = (shape as any).fill
          context.fill()
          context.strokeStyle = (shape as any).stroke
          context.lineWidth = (shape as any).strokeWidth / canvasSettings.zoom
          if ((shape as any).strokeWidth > 0) {
            context.stroke()
          }
          break
          
        case 'text':
          const textShape = shape as any
          context.font = `${textShape.fontSize / canvasSettings.zoom}px ${textShape.fontFamily}`
          context.fillStyle = textShape.fill
          context.fillText(textShape.text, 0, textShape.fontSize / canvasSettings.zoom)
          break
          
        // ... other shape types remain the same
        
        default:
          // Default rectangle for unknown types
          context.fillStyle = '#cccccc'
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          break
      }
      
      context.restore()
    })

    // Draw selections and UI elements (these should not be affected by zoom)
    context.restore()

    // Draw multi-selection
    if (multiSelection.length > 1) {
      drawMultiSelection(context, multiSelection)
    }

    // Draw single selection
    if (selectedShape && multiSelection.length <= 1) {
      drawSelection(context, selectedShape)
    }

    // Draw selection box
    if (selectionBox?.active) {
      drawSelectionBox(context, selectionBox)
    }

  }, [context, shapes, canvasSettings, selectedShape, multiSelection, selectionBox, canvasOffset, drawSelection, drawMultiSelection, drawSelectionBox])

  return (
    <div 
      className="canvas-container border border-gray-300 bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center relative"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={Math.max(canvasSettings.width * canvasSettings.zoom + Math.abs(canvasOffset.x) * 2, width)}
        height={Math.max(canvasSettings.height * canvasSettings.zoom + Math.abs(canvasOffset.y) * 2, height)}
        style={{
          border: '2px solid #333',
          backgroundColor: canvasSettings.backgroundColor,
          cursor: getCursorType({} as React.MouseEvent),
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        tabIndex={0}
      />
      
      {/* Canvas Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        Zoom: {Math.round(canvasSettings.zoom * 100)}% | 
        {multiSelection.length > 0 ? ` Selected: ${multiSelection.length}` : selectedShape ? ' Selected: 1' : ' No selection'} |
        {isSpacePressed ? ' Pan Mode' : ''}
      </div>
    </div>
  )
}

export default AdvancedCanvasStage
