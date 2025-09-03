'use client'

import React from 'react'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape, ImageShape } from '@/types/shapes'

interface ShapePreviewProps {
  shape: Shape
  size?: number
}

const ShapePreview: React.FC<ShapePreviewProps> = ({ shape, size = 40 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Set up scaling to fit shape in preview
    const scaleX = (size - 8) / Math.max(shape.size.width, 1)
    const scaleY = (size - 8) / Math.max(shape.size.height, 1)
    const scale = Math.min(scaleX, scaleY, 1)

    const offsetX = (size - shape.size.width * scale) / 2
    const offsetY = (size - shape.size.height * scale) / 2

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)
    ctx.globalAlpha = shape.opacity

    // Draw shape based on type
    switch (shape.type) {
      case 'rect':
        const rectShape = shape as RectShape
        ctx.fillStyle = rectShape.fill
        ctx.strokeStyle = rectShape.stroke
        ctx.lineWidth = rectShape.strokeWidth / scale
        ctx.fillRect(0, 0, shape.size.width, shape.size.height)
        if (rectShape.strokeWidth > 0) {
          ctx.strokeRect(0, 0, shape.size.width, shape.size.height)
        }
        break

      case 'circle':
        const circleShape = shape as CircleShape
        const radius = circleShape.radius
        ctx.beginPath()
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
        ctx.fillStyle = circleShape.fill
        ctx.fill()
        ctx.strokeStyle = circleShape.stroke
        ctx.lineWidth = circleShape.strokeWidth / scale
        if (circleShape.strokeWidth > 0) {
          ctx.stroke()
        }
        break

      case 'text':
        const textShape = shape as TextShape
        ctx.font = `${textShape.fontSize * scale}px ${textShape.fontFamily}`
        ctx.fillStyle = textShape.fill
        ctx.fillText(textShape.text.substring(0, 10), 0, textShape.fontSize * scale)
        break

      case 'triangle':
        const triangleShape = shape as TriangleShape
        const points = triangleShape.points
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        ctx.lineTo(points[2], points[3])
        ctx.lineTo(points[4], points[5])
        ctx.closePath()
        ctx.fillStyle = triangleShape.fill
        ctx.fill()
        break

      case 'person':
        // Draw simplified person preview
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, shape.size.width, shape.size.height)
        ctx.fillStyle = '#9ca3af'
        const iconSize = Math.min(shape.size.width, shape.size.height) * 0.5
        const iconX = (shape.size.width - iconSize) / 2
        const iconY = (shape.size.height - iconSize) / 2
        const headRadius = iconSize * 0.2
        const headX = iconX + iconSize / 2
        const headY = iconY + headRadius
        ctx.beginPath()
        ctx.arc(headX, headY, headRadius, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'qr':
        const qrShape = shape as { backgroundColor: string; foregroundColor: string } & Shape
        ctx.fillStyle = qrShape.backgroundColor
        ctx.fillRect(0, 0, shape.size.width, shape.size.height)
        ctx.fillStyle = qrShape.foregroundColor
        // Draw simplified QR pattern
        const qrSize = Math.min(shape.size.width, shape.size.height)
        const moduleSize = qrSize / 10
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(i * moduleSize * 3, j * moduleSize * 3, moduleSize, moduleSize)
            }
          }
        }
        break

      case 'barcode':
        const barcodeShape = shape as { backgroundColor: string; lineColor: string } & Shape
        ctx.fillStyle = barcodeShape.backgroundColor
        ctx.fillRect(0, 0, shape.size.width, shape.size.height)
        ctx.fillStyle = barcodeShape.lineColor
        const lineWidth = shape.size.width / 10
        for (let i = 0; i < 10; i += 2) {
          ctx.fillRect(i * lineWidth, 0, lineWidth * 0.5, shape.size.height)
        }
        break

      default:
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(0, 0, shape.size.width, shape.size.height)
        break
    }

    ctx.restore()
  }, [shape, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-gray-200 rounded bg-white"
    />
  )
}

export default ShapePreview
