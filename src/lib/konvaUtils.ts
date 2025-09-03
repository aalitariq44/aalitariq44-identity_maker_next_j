import type { Shape, RectShape, CircleShape, TextShape, TriangleShape } from '@/types/shapes'

export const createDefaultRect = (x: number = 100, y: number = 100): Omit<RectShape, 'id'> => ({
  type: 'rect',
  position: { x, y },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 0,
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
  cornerRadius: 0,
})

export const createDefaultCircle = (x: number = 100, y: number = 100): Omit<CircleShape, 'id'> => ({
  type: 'circle',
  position: { x, y },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 0,
  fill: '#ef4444',
  stroke: '#dc2626',
  strokeWidth: 2,
  radius: 50,
})

export const createDefaultText = (x: number = 100, y: number = 100): Omit<TextShape, 'id'> => ({
  type: 'text',
  position: { x, y },
  size: { width: 200, height: 50 },
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  zIndex: 0,
  text: 'نص جديد',
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fill: '#000000',
  stroke: '',
  strokeWidth: 0,
  align: 'left',
  verticalAlign: 'top',
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
  zIndex: 0,
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
