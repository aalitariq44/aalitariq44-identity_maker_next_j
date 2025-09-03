import type { Shape, RectShape, CircleShape, TextShape, TriangleShape } from '@/types/shapes'

export const createDefaultRect = (x: number = 100, y: number = 100): Omit<RectShape, 'id'> => ({
  type: 'rect',
  position: { x, y },
  size: { width: 120, height: 80 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 1,
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
  cornerRadius: 8,
})

export const createDefaultCircle = (x: number = 100, y: number = 100): Omit<CircleShape, 'id'> => ({
  type: 'circle',
  position: { x, y },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 1,
  fill: '#ef4444',
  stroke: '#dc2626',
  strokeWidth: 2,
  radius: 50,
})

export const createDefaultText = (x: number = 100, y: number = 100): Omit<TextShape, 'id'> => ({
  type: 'text',
  position: { x, y },
  size: { width: 200, height: 60 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 1,
  text: 'نص جديد',
  fontSize: 18,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fill: '#1f2937',
  stroke: '',
  strokeWidth: 0,
  align: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  letterSpacing: 0,
})

export const createDefaultTriangle = (x: number = 100, y: number = 100): Omit<TriangleShape, 'id'> => ({
  type: 'triangle',
  position: { x, y },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 1,
  fill: '#10b981',
  stroke: '#059669',
  strokeWidth: 2,
  points: [50, 0, 0, 100, 100, 100],
})

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const getShapeBounds = (shape: Shape) => {
  return {
    x: shape.position.x,
    y: shape.position.y,
    width: shape.size.width,
    height: shape.size.height,
    right: shape.position.x + shape.size.width,
    bottom: shape.position.y + shape.size.height,
  }
}

export const isPointInShape = (point: { x: number; y: number }, shape: Shape): boolean => {
  const bounds = getShapeBounds(shape)
  return (
    point.x >= bounds.x &&
    point.x <= bounds.right &&
    point.y >= bounds.y &&
    point.y <= bounds.bottom
  )
}

export const getTransformerConfig = () => ({
  keepRatio: false,
  enabledAnchors: [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'middle-left',
  ],
  borderStroke: '#0ea5e9',
  borderStrokeWidth: 1,
  anchorFill: '#0ea5e9',
  anchorStroke: '#0369a1',
  anchorSize: 8,
  anchorCornerRadius: 2,
})

export const calculateCanvasScale = (
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): { scale: number; offsetX: number; offsetY: number } => {
  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

  const scaledWidth = canvasWidth * scale
  const scaledHeight = canvasHeight * scale

  const offsetX = (containerWidth - scaledWidth) / 2
  const offsetY = (containerHeight - scaledHeight) / 2

  return { scale, offsetX, offsetY }
}

// Create pattern backgrounds
export const createPattern = (patternType: string, color1: string = '#ffffff', color2: string = '#e5e7eb') => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  switch (patternType) {
    case 'dots': {
      canvas.width = 20
      canvas.height = 20
      ctx.fillStyle = color1
      ctx.fillRect(0, 0, 20, 20)
      ctx.fillStyle = color2
      ctx.beginPath()
      ctx.arc(10, 10, 3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'lines': {
      canvas.width = 20
      canvas.height = 20
      ctx.fillStyle = color1
      ctx.fillRect(0, 0, 20, 20)
      ctx.strokeStyle = color2
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 20)
      ctx.stroke()
      break
    }
    case 'grid': {
      canvas.width = 20
      canvas.height = 20
      ctx.fillStyle = color1
      ctx.fillRect(0, 0, 20, 20)
      ctx.strokeStyle = color2
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 0)
      ctx.lineTo(20, 20)
      ctx.lineTo(0, 20)
      ctx.closePath()
      ctx.stroke()
      break
    }
    case 'stripes': {
      canvas.width = 20
      canvas.height = 20
      ctx.fillStyle = color1
      ctx.fillRect(0, 0, 20, 20)
      ctx.fillStyle = color2
      ctx.fillRect(0, 0, 10, 20)
      break
    }
    default:
      return null
  }

  return canvas
}
