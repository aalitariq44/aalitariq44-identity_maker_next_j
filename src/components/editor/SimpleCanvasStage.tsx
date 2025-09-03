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

  const {
    shapes,
    canvasSettings,
    selectShape,
    moveShape,
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

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked shape
    for (const shape of shapes) {
      if (isPointInShape({ x, y }, shape)) {
        setSelectedShapeId(shape.id)
        selectShape(shape.id)
        setIsDragging(true)
        setDragOffset({ x: x - shape.position.x, y: y - shape.position.y })
        return
      }
    }

    // No shape clicked, deselect
    setSelectedShapeId(null)
    selectShape(null)
  }, [shapes, isPointInShape, selectShape])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !isDragging || !selectedShapeId) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const shape = shapes.find(s => s.id === selectedShapeId)
    if (!shape) return

    let newX = x - dragOffset.x
    let newY = y - dragOffset.y

    if (canvasSettings.snapToGrid) {
      newX = snapToGrid(newX, canvasSettings.gridSize)
      newY = snapToGrid(newY, canvasSettings.gridSize)
    }

    moveShape(selectedShapeId, { x: newX, y: newY })
  }, [isDragging, selectedShapeId, shapes, dragOffset, canvasSettings.snapToGrid, canvasSettings.gridSize, moveShape])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Draw selection rectangle
  const drawSelection = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save()
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(shape.position.x - 5, shape.position.y - 5, shape.size.width + 10, shape.size.height + 10)
    ctx.restore()
  }, [])

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
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export default SimpleCanvasStage
