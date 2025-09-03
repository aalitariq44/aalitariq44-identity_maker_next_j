'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape, PersonShape, QRShape, BarcodeShape } from '@/types/shapes'
import { snapToGrid } from '@/lib/konvaUtils'

interface SimpleCanvasStageProps {
  width: number
  height: number
}

export const SimpleCanvasStage: React.FC<SimpleCanvasStageProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [initialShapeState, setInitialShapeState] = useState<{
    position: { x: number; y: number }
    size: { width: number; height: number }
    rotation: number
  } | null>(null)

  const {
    shapes,
    canvasSettings,
    selectShape,
    moveShape,
    updateShape,
    resizeShape,
    deleteShape,
    undo,
    redo,
  } = useEditorStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      setContext(ctx)
    }
  }, [])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // Only handle other keyboard events when we have a selected shape
      if (!selectedShapeId) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteShape(selectedShapeId)
      }

      // Handle Escape key to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        selectShape(null)
      }
    }

    // Add event listener to window to capture keyboard events globally
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, deleteShape, selectShape, undo, redo])

  // Function to check if point is inside shape
  const isPointInShape = useCallback((point: { x: number; y: number }, shape: Shape): boolean => {
    switch (shape.type) {
      case 'rect':
        return (
          point.x >= shape.position.x &&
          point.x <= shape.position.x + shape.size.width &&
          point.y >= shape.position.y &&
          point.y <= shape.position.y + shape.size.height
        )
      case 'circle':
        const centerX = shape.position.x + (shape as CircleShape).radius
        const centerY = shape.position.y + (shape as CircleShape).radius
        const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2)
        return distance <= (shape as CircleShape).radius
      case 'text':
        return (
          point.x >= shape.position.x &&
          point.x <= shape.position.x + shape.size.width &&
          point.y >= shape.position.y &&
          point.y <= shape.position.y + shape.size.height
        )
      case 'triangle':
        // Simple triangle bounds check
        return (
          point.x >= shape.position.x &&
          point.x <= shape.position.x + shape.size.width &&
          point.y >= shape.position.y &&
          point.y <= shape.position.y + shape.size.height
        )
      case 'person':
      case 'qr':
      case 'barcode':
        // Rectangle bounds check for identity elements
        return (
          point.x >= shape.position.x &&
          point.x <= shape.position.x + shape.size.width &&
          point.y >= shape.position.y &&
          point.y <= shape.position.y + shape.size.height
        )
      default:
        return false
    }
  }, [])

  // Function to get resize handles positions
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

  // Function to get rotation handle position
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

  // Function to check if point is in resize handle
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

  // Function to check if point is in rotation handle
  const isPointInRotationHandle = useCallback((point: { x: number; y: number }, shape: Shape) => {
    const handle = getRotationHandle(shape)

    return (
      point.x >= handle.x &&
      point.x <= handle.x + handle.width &&
      point.y >= handle.y &&
      point.y <= handle.y + handle.height
    )
  }, [getRotationHandle])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on selected shape's handles first
    if (selectedShapeId) {
      const shape = shapes.find(s => s.id === selectedShapeId)
      if (shape) {
        // Check rotation handle
        if (isPointInRotationHandle({ x, y }, shape)) {
          setIsRotating(true)
          setInitialShapeState({
            position: { ...shape.position },
            size: { ...shape.size },
            rotation: shape.rotation
          })
          return
        }

        // Check resize handles
        const resizeHandle = getResizeHandleAtPoint({ x, y }, shape)
        if (resizeHandle) {
          setIsResizing(true)
          setResizeHandle(resizeHandle)
          setInitialShapeState({
            position: { ...shape.position },
            size: { ...shape.size },
            rotation: shape.rotation
          })
          return
        }
      }
    }

    // Find clicked shape
    for (const shape of shapes) {
      if (isPointInShape({ x, y }, shape)) {
        setSelectedShapeId(shape.id)
        selectShape(shape.id)
        setIsDragging(true)
        setDragOffset({ x: x - shape.position.x, y: y - shape.position.y })
        setInitialShapeState({
          position: { ...shape.position },
          size: { ...shape.size },
          rotation: shape.rotation
        })
        return
      }
    }

    // No shape clicked, deselect
    setSelectedShapeId(null)
    selectShape(null)
  }, [shapes, isPointInShape, selectShape, selectedShapeId, isPointInRotationHandle, getResizeHandleAtPoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedShapeId || !initialShapeState) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const shape = shapes.find(s => s.id === selectedShapeId)
    if (!shape) return

    if (isRotating) {
      // Calculate rotation based on mouse position relative to shape center
      const centerX = initialShapeState.position.x + initialShapeState.size.width / 2
      const centerY = initialShapeState.position.y + initialShapeState.size.height / 2

      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)
      const newRotation = angle + 90 // Add 90 degrees to align with top

      // Update shape rotation
      updateShape(selectedShapeId, { rotation: newRotation })
      return
    }

    if (isResizing && resizeHandle) {
      const { position: initialPos, size: initialSize } = initialShapeState
      let newPosition = { ...initialPos }
      let newSize = { ...initialSize }

      const minSize = 10 // Minimum size constraint

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

      // Apply grid snapping if enabled
      if (canvasSettings.snapToGrid) {
        newPosition.x = snapToGrid(newPosition.x, canvasSettings.gridSize)
        newPosition.y = snapToGrid(newPosition.y, canvasSettings.gridSize)
        newSize.width = snapToGrid(newSize.width, canvasSettings.gridSize)
        newSize.height = snapToGrid(newSize.height, canvasSettings.gridSize)
      }

      // Update shape position and size
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
  }, [isDragging, selectedShapeId, shapes, dragOffset, canvasSettings.snapToGrid, canvasSettings.gridSize, moveShape, isResizing, isRotating, resizeHandle, initialShapeState, updateShape, resizeShape])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setResizeHandle(null)
    setInitialShapeState(null)
  }, [])

  // Draw selection rectangle with handles
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
    ctx.fillStyle = '#10b981' // Green color for rotation
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

    // Draw rotation icon (small arc)
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

    // Draw arrow head
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

  // Get cursor type based on mouse position
  const getCursorType = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedShapeId) return 'default'

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const shape = shapes.find(s => s.id === selectedShapeId)
    if (!shape) return 'default'

    // Check rotation handle
    if (isPointInRotationHandle({ x, y }, shape)) {
      return 'crosshair'
    }

    // Check resize handles
    const resizeHandle = getResizeHandleAtPoint({ x, y }, shape)
    if (resizeHandle) {
      const handles = getResizeHandles(shape)
      return handles[resizeHandle as keyof typeof handles].cursor
    }

    // Check if over shape
    if (isPointInShape({ x, y }, shape)) {
      return 'move'
    }

    return 'default'
  }, [selectedShapeId, shapes, isPointInRotationHandle, getResizeHandleAtPoint, getResizeHandles, isPointInShape])

  // Handle mouse move for cursor updates
  const handleMouseMoveForCursor = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const cursor = getCursorType(e)
    canvasRef.current.style.cursor = cursor
  }, [getCursorType])

  useEffect(() => {
    if (!context || !canvasRef.current) return

    const canvas = canvasRef.current
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw background
    context.fillStyle = canvasSettings.backgroundColor
    context.fillRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw grid if enabled
    if (canvasSettings.showGrid) {
      context.strokeStyle = canvasSettings.gridColor
      context.lineWidth = 1
      context.setLineDash([])
      
      // Vertical lines
      for (let x = 0; x <= canvasSettings.width; x += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvasSettings.height)
        context.stroke()
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvasSettings.height; y += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvasSettings.width, y)
        context.stroke()
      }
    }
    
    console.log('Drawing background:', canvasSettings.backgroundColor)
    console.log('Shapes to draw:', shapes.length)
    
    // Draw shapes
    shapes.forEach((shape, index) => {
      console.log(`Drawing shape ${index}:`, shape)
      
      context.save()
      context.translate(shape.position.x, shape.position.y)
      context.rotate((shape.rotation * Math.PI) / 180)
      context.globalAlpha = shape.opacity
      
      switch (shape.type) {
        case 'rect':
          context.fillStyle = (shape as any).fill
          context.strokeStyle = (shape as any).stroke
          context.lineWidth = (shape as any).strokeWidth
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
          context.lineWidth = (shape as any).strokeWidth
          if ((shape as any).strokeWidth > 0) {
            context.stroke()
          }
          break
          
        case 'text':
          const textShape = shape as any
          context.font = `${textShape.fontSize}px ${textShape.fontFamily}`
          context.fillStyle = textShape.fill
          context.fillText(textShape.text, 0, textShape.fontSize)
          break
          
        case 'triangle':
          const triangleShape = shape as any
          const points = triangleShape.points
          context.beginPath()
          context.moveTo(points[0], points[1])
          context.lineTo(points[2], points[3])
          context.lineTo(points[4], points[5])
          context.closePath()
          context.fillStyle = triangleShape.fill
          context.fill()
          context.strokeStyle = triangleShape.stroke
          context.lineWidth = triangleShape.strokeWidth
          if (triangleShape.strokeWidth > 0) {
            context.stroke()
          }
          break

        case 'person':
          const personShape = shape as PersonShape
          
          // Draw border/background
          context.fillStyle = '#f3f4f6'
          context.strokeStyle = personShape.borderColor
          context.lineWidth = personShape.borderWidth
          
          if (personShape.borderRadius > 0) {
            // Draw rounded rectangle
            const radius = Math.min(personShape.borderRadius, shape.size.width / 2, shape.size.height / 2)
            context.beginPath()
            context.roundRect(0, 0, shape.size.width, shape.size.height, radius)
            context.fill()
            if (personShape.borderWidth > 0) {
              context.stroke()
            }
          } else {
            context.fillRect(0, 0, shape.size.width, shape.size.height)
            if (personShape.borderWidth > 0) {
              context.strokeRect(0, 0, shape.size.width, shape.size.height)
            }
          }
          
          // Draw placeholder icon or image
          if (personShape.src && !personShape.placeholder) {
            // Create image element and draw it
            const img = new Image()
            img.onload = () => {
              context.save()
              
              // Clip to the shape bounds with border radius if needed
              if (personShape.borderRadius > 0) {
                const radius = Math.min(personShape.borderRadius, shape.size.width / 2, shape.size.height / 2)
                context.beginPath()
                context.roundRect(0, 0, shape.size.width, shape.size.height, radius)
                context.clip()
              }
              
              // Calculate how to fit the image within the shape
              const imgAspect = img.width / img.height
              const shapeAspect = shape.size.width / shape.size.height
              
              let drawWidth, drawHeight, drawX, drawY
              
              if (imgAspect > shapeAspect) {
                // Image is wider than shape, fit by height
                drawHeight = shape.size.height
                drawWidth = drawHeight * imgAspect
                drawX = (shape.size.width - drawWidth) / 2
                drawY = 0
              } else {
                // Image is taller than shape, fit by width
                drawWidth = shape.size.width
                drawHeight = drawWidth / imgAspect
                drawX = 0
                drawY = (shape.size.height - drawHeight) / 2
              }
              
              context.drawImage(img, drawX, drawY, drawWidth, drawHeight)
              context.restore()
            }
            img.src = personShape.src
          } else {
            // Draw person icon placeholder
            context.fillStyle = '#9ca3af'
            const iconSize = Math.min(shape.size.width, shape.size.height) * 0.5
            const iconX = (shape.size.width - iconSize) / 2
            const iconY = (shape.size.height - iconSize) / 2
            
            // Simple person icon (head + body)
            const headRadius = iconSize * 0.2
            const headX = iconX + iconSize / 2
            const headY = iconY + headRadius
            
            // Draw head
            context.beginPath()
            context.arc(headX, headY, headRadius, 0, 2 * Math.PI)
            context.fill()
            
            // Draw body
            const bodyWidth = iconSize * 0.6
            const bodyHeight = iconSize * 0.5
            const bodyX = iconX + (iconSize - bodyWidth) / 2
            const bodyY = headY + headRadius + 5
            
            context.fillRect(bodyX, bodyY, bodyWidth, bodyHeight)
          }
          break

        case 'qr':
          const qrShape = shape as QRShape
          
          // Draw background
          context.fillStyle = qrShape.backgroundColor
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          
          // Draw QR code pattern (simplified)
          context.fillStyle = qrShape.foregroundColor
          const qrSize = Math.min(shape.size.width, shape.size.height)
          const moduleSize = qrSize / 25 // 25x25 grid
          
          // Draw finder patterns (corners)
          const finderSize = moduleSize * 7
          
          // Top-left finder
          context.fillRect(0, 0, finderSize, finderSize)
          context.fillStyle = qrShape.backgroundColor
          context.fillRect(moduleSize, moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize)
          context.fillStyle = qrShape.foregroundColor
          context.fillRect(moduleSize * 2, moduleSize * 2, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize)
          
          // Top-right finder
          const topRightX = shape.size.width - finderSize
          context.fillRect(topRightX, 0, finderSize, finderSize)
          context.fillStyle = qrShape.backgroundColor
          context.fillRect(topRightX + moduleSize, moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize)
          context.fillStyle = qrShape.foregroundColor
          context.fillRect(topRightX + moduleSize * 2, moduleSize * 2, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize)
          
          // Bottom-left finder
          const bottomLeftY = shape.size.height - finderSize
          context.fillRect(0, bottomLeftY, finderSize, finderSize)
          context.fillStyle = qrShape.backgroundColor
          context.fillRect(moduleSize, bottomLeftY + moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize)
          context.fillStyle = qrShape.foregroundColor
          context.fillRect(moduleSize * 2, bottomLeftY + moduleSize * 2, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize)
          
          // Draw some random modules for QR appearance
          context.fillStyle = qrShape.foregroundColor
          for (let i = 0; i < 50; i++) {
            const randomX = Math.floor(Math.random() * (shape.size.width / moduleSize)) * moduleSize
            const randomY = Math.floor(Math.random() * (shape.size.height / moduleSize)) * moduleSize
            context.fillRect(randomX, randomY, moduleSize, moduleSize)
          }
          break

        case 'barcode':
          const barcodeShape = shape as BarcodeShape
          
          // Draw background
          context.fillStyle = barcodeShape.backgroundColor
          context.fillRect(0, 0, shape.size.width, shape.size.height)
          
          // Draw barcode lines
          context.fillStyle = barcodeShape.lineColor
          const lineWidth = shape.size.width / 50 // 50 bars
          
          for (let i = 0; i < 50; i++) {
            // Alternate thick and thin lines randomly for barcode appearance
            const currentLineWidth = Math.random() > 0.5 ? lineWidth : lineWidth * 0.5
            const x = i * lineWidth
            
            if (Math.random() > 0.4) { // Don't draw every line
              context.fillRect(x, 0, currentLineWidth, shape.size.height)
            }
          }
          
          // Draw text below if there's space
          if (shape.size.height > 30) {
            context.fillStyle = barcodeShape.lineColor
            context.font = '10px monospace'
            context.textAlign = 'center'
            context.fillText(
              barcodeShape.data, 
              shape.size.width / 2, 
              shape.size.height - 5
            )
          }
          break
      }
      
      context.restore()

      // Draw selection if this shape is selected
      if (shape.id === selectedShapeId) {
        drawSelection(context, shape)
      }
    })
  }, [context, shapes, canvasSettings, selectedShapeId, drawSelection])

  return (
    <div 
      className="canvas-container border border-gray-300 bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSettings.width}
        height={canvasSettings.height}
        style={{
          border: '2px solid #333',
          backgroundColor: canvasSettings.backgroundColor,
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: isDragging || isResizing || isRotating ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e)
          handleMouseMoveForCursor(e)
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        tabIndex={0} // Make canvas focusable
        onFocus={() => {
          // Optional: Add visual feedback when canvas is focused
        }}
        onBlur={() => {
          // Optional: Remove visual feedback when canvas loses focus
        }}
      />
    </div>
  )
}

export default SimpleCanvasStage
