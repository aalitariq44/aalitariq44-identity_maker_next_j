import { Shape } from '@/types/shapes'

export interface CanvasControls {
  pan: (deltaX: number, deltaY: number) => void
  zoom: (factor: number, centerX?: number, centerY?: number) => void
  resetView: () => void
  fitToScreen: () => void
  setZoom: (zoom: number) => void
}

export interface ViewportState {
  zoom: number
  panX: number
  panY: number
}

export interface CanvasContext {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  viewport: ViewportState
  controls: CanvasControls
}

// Enhanced selection utilities
export const createSelectionBounds = (shapes: Shape[]): { x: number, y: number, width: number, height: number } | null => {
  if (shapes.length === 0) return null
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  shapes.forEach(shape => {
    minX = Math.min(minX, shape.position.x)
    minY = Math.min(minY, shape.position.y)
    maxX = Math.max(maxX, shape.position.x + shape.size.width)
    maxY = Math.max(maxY, shape.position.y + shape.size.height)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Enhanced coordinate transformation utilities
export const screenToDocument = (
  screenX: number, 
  screenY: number, 
  panX: number, 
  panY: number, 
  zoom: number
): { x: number, y: number } => {
  return {
    x: (screenX - panX) / zoom,
    y: (screenY - panY) / zoom
  }
}

export const documentToScreen = (
  docX: number, 
  docY: number, 
  panX: number, 
  panY: number, 
  zoom: number
): { x: number, y: number } => {
  return {
    x: docX * zoom + panX,
    y: docY * zoom + panY
  }
}

// Grid and snapping utilities
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  color: string = '#e5e7eb',
  zoom: number = 1
) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.5 / zoom
  ctx.globalAlpha = 0.5

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.restore()
}

// Professional canvas tools
export const createProfessionalCanvasTools = () => {
  return {
    // Copy and paste functionality
    copy: (shapes: Shape[]): Shape[] => {
      return shapes.map(shape => ({ ...shape }))
    },
    
    paste: (copiedShapes: Shape[], offsetX: number = 20, offsetY: number = 20): Shape[] => {
      return copiedShapes.map(shape => ({
        ...shape,
        id: Math.random().toString(36).substr(2, 9),
        position: {
          x: shape.position.x + offsetX,
          y: shape.position.y + offsetY
        }
      }))
    },

    // Alignment tools
    alignLeft: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const minX = Math.min(...shapes.map(s => s.position.x))
      return shapes.map(shape => ({
        ...shape,
        position: { ...shape.position, x: minX }
      }))
    },

    alignCenter: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const bounds = createSelectionBounds(shapes)
      if (!bounds) return shapes
      
      const centerX = bounds.x + bounds.width / 2
      return shapes.map(shape => ({
        ...shape,
        position: { 
          ...shape.position, 
          x: centerX - shape.size.width / 2 
        }
      }))
    },

    alignRight: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const maxX = Math.max(...shapes.map(s => s.position.x + s.size.width))
      return shapes.map(shape => ({
        ...shape,
        position: { 
          ...shape.position, 
          x: maxX - shape.size.width 
        }
      }))
    },

    alignTop: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const minY = Math.min(...shapes.map(s => s.position.y))
      return shapes.map(shape => ({
        ...shape,
        position: { ...shape.position, y: minY }
      }))
    },

    alignMiddle: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const bounds = createSelectionBounds(shapes)
      if (!bounds) return shapes
      
      const centerY = bounds.y + bounds.height / 2
      return shapes.map(shape => ({
        ...shape,
        position: { 
          ...shape.position, 
          y: centerY - shape.size.height / 2 
        }
      }))
    },

    alignBottom: (shapes: Shape[]): Shape[] => {
      if (shapes.length === 0) return shapes
      const maxY = Math.max(...shapes.map(s => s.position.y + s.size.height))
      return shapes.map(shape => ({
        ...shape,
        position: { 
          ...shape.position, 
          y: maxY - shape.size.height 
        }
      }))
    },

    // Distribution tools
    distributeHorizontally: (shapes: Shape[]): Shape[] => {
      if (shapes.length < 3) return shapes
      
      const sorted = [...shapes].sort((a, b) => a.position.x - b.position.x)
      const leftmost = sorted[0]
      const rightmost = sorted[sorted.length - 1]
      
      const totalSpace = (rightmost.position.x + rightmost.size.width) - leftmost.position.x
      const shapesWidth = sorted.reduce((sum, shape) => sum + shape.size.width, 0)
      const availableSpace = totalSpace - shapesWidth
      const gap = availableSpace / (sorted.length - 1)
      
      let currentX = leftmost.position.x
      
      return sorted.map(shape => {
        const newShape = { ...shape, position: { ...shape.position, x: currentX } }
        currentX += shape.size.width + gap
        return newShape
      })
    },

    distributeVertically: (shapes: Shape[]): Shape[] => {
      if (shapes.length < 3) return shapes
      
      const sorted = [...shapes].sort((a, b) => a.position.y - b.position.y)
      const topmost = sorted[0]
      const bottommost = sorted[sorted.length - 1]
      
      const totalSpace = (bottommost.position.y + bottommost.size.height) - topmost.position.y
      const shapesHeight = sorted.reduce((sum, shape) => sum + shape.size.height, 0)
      const availableSpace = totalSpace - shapesHeight
      const gap = availableSpace / (sorted.length - 1)
      
      let currentY = topmost.position.y
      
      return sorted.map(shape => {
        const newShape = { ...shape, position: { ...shape.position, y: currentY } }
        currentY += shape.size.height + gap
        return newShape
      })
    }
  }
}

// Enhanced keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  PAN_MODE: 'Space',
  ZOOM_IN: 'Control+=',
  ZOOM_OUT: 'Control+-',
  RESET_ZOOM: 'Control+0',
  FIT_TO_SCREEN: 'Control+9',
  
  // Selection
  SELECT_ALL: 'Control+a',
  DESELECT: 'Escape',
  DELETE: 'Delete',
  
  // Clipboard
  COPY: 'Control+c',
  CUT: 'Control+x',
  PASTE: 'Control+v',
  DUPLICATE: 'Control+d',
  
  // History
  UNDO: 'Control+z',
  REDO: 'Control+y',
  
  // Layers
  BRING_FORWARD: 'Control+]',
  SEND_BACKWARD: 'Control+[',
  BRING_TO_FRONT: 'Control+Shift+]',
  SEND_TO_BACK: 'Control+Shift+[',
  
  // View
  TOGGLE_GRID: 'Control+;',
  TOGGLE_SNAP: 'Control+Shift+;',
  TOGGLE_RULERS: 'Control+r',
  
  // Tools
  RECTANGLE_TOOL: 'r',
  CIRCLE_TOOL: 'c',
  TEXT_TOOL: 't',
  SELECTION_TOOL: 'v',
  HAND_TOOL: 'h'
}

export default {
  createSelectionBounds,
  screenToDocument,
  documentToScreen,
  snapToGrid,
  drawGrid,
  createProfessionalCanvasTools,
  KEYBOARD_SHORTCUTS
}
