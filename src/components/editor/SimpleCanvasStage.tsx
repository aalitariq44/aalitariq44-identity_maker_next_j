'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape } from '@/types/shapes'
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
  } = useEditorStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      setContext(ctx)
    }
  }, [])

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
      />
    </div>
  )
}

export default SimpleCanvasStage
