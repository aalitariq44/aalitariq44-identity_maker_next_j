'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'

interface SimpleCanvasStageProps {
  width: number
  height: number
}

export const SimpleCanvasStage: React.FC<SimpleCanvasStageProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  
  const { shapes, canvasSettings } = useEditorStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      setContext(ctx)
    }
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
    })
  }, [context, shapes, canvasSettings])

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
          maxHeight: '100%'
        }}
      />
    </div>
  )
}

export default SimpleCanvasStage
