'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Shape, EditorState, CanvasSettings } from '@/types/shapes'
import { nanoid } from 'nanoid'
import { calculateTextDimensions } from '@/lib/konvaUtils'

interface EditorStore extends EditorState {
  // Actions
  addShape: (shape: Omit<Shape, 'id'>) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  deleteShape: (id: string) => void
  selectShape: (id: string | null) => void
  duplicateShape: (id: string) => void
  moveShape: (id: string, position: { x: number; y: number }) => void
  resizeShape: (id: string, size: { width: number; height: number }) => void
  
  // Canvas actions
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void
  setCanvasSize: (width: number, height: number) => void
  toggleOrientation: () => void
  setBackgroundImage: (imageUrl: string) => void
  removeBackgroundImage: () => void
  setBackgroundPattern: (pattern: string) => void
  removeBackgroundPattern: () => void
  
  // History actions
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Project actions
  saveProject: () => string
  loadProject: (jsonData: string) => void
  clearCanvas: () => void
  
  // Clipboard actions
  copyShape: (id: string) => void
  pasteShape: () => void
  
  // Enhanced layer actions with proper z-index management
  reorderLayers: (shapeIds: string[], newOrder: number[]) => void
  
  // Multi-selection actions
  selectMultiple: (shapeIds: string[]) => void
  getMultiSelection: () => string[]
  
  // Enhanced clipboard actions
  cutShapes: (shapeIds: string[]) => void
  copyShapes: (shapeIds: string[]) => void
  
  // Zoom and pan actions
  setZoom: (zoom: number) => void
  panCanvas: (deltaX: number, deltaY: number) => void
  resetView: () => void
  fitToScreen: () => void
}

const initialCanvasSettings: CanvasSettings = {
  width: 856,
  height: 540,
  orientation: 'landscape',
  backgroundColor: '#ffffff',
  backgroundImage: undefined,
  backgroundSize: 'cover',
  backgroundPattern: undefined,
  backgroundOpacity: 1,
  gridSize: 20,
  showGrid: true,
  snapToGrid: false,
  zoom: 1,
  gridColor: '#e5e7eb',
  gridType: 'lines',
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      shapes: [],
      selectedShapeId: null,
      canvasSettings: initialCanvasSettings,
      history: {
        past: [],
        present: [],
        future: [],
      },
      clipboard: [],

      addShape: (shapeData: Omit<Shape, 'id'>) => {
        set((state) => {
          console.log('Store: Adding shape', shapeData)
          // Get the highest z-index and add 1
          const maxZIndex = state.shapes.length > 0 
            ? Math.max(...state.shapes.map((s) => s.zIndex))
            : 0
          
          const newShape = {
            ...shapeData,
            id: nanoid(),
            zIndex: maxZIndex + 1,
          } as Shape
          
          // If this is a text shape, ensure dimensions are correct
          if (newShape.type === 'text') {
            const textShape = newShape as { text: string; fontSize: number; fontFamily: string } & typeof newShape
            const dimensions = calculateTextDimensions(
              textShape.text,
              textShape.fontSize,
              textShape.fontFamily
            )
            newShape.size = dimensions
          }
          
          console.log('Store: New shape created', newShape)
          
          // Save current state to history before adding new shape
          state.history.past.push([...state.shapes])
          state.history.future = []
          
          // Add the new shape
          state.shapes.push(newShape)
          
          // Auto-select the new shape for immediate editing
          state.selectedShapeId = newShape.id
          
          console.log('Store: Shapes count now:', state.shapes.length)
          console.log('Store: Selected shape ID:', state.selectedShapeId)
        })
      },

      updateShape: (id: string, updates: Partial<Shape>) => {
        set((state) => {
          const shapeIndex = state.shapes.findIndex((s) => s.id === id)
          if (shapeIndex !== -1) {
            const shape = state.shapes[shapeIndex]
            
            // Save to history for significant changes (not for every small movement)
            const significantChanges = ['fill', 'stroke', 'strokeWidth', 'text', 'fontSize', 'fontFamily', 'visible', 'locked']
            const hasSignificantChange = significantChanges.some(key => key in updates)
            
            if (hasSignificantChange) {
              state.history.past.push([...state.shapes])
              state.history.future = []
            }
            
            // Update the shape
            Object.assign(state.shapes[shapeIndex], updates)
            
            // If this is a text shape and text/font properties changed, recalculate dimensions
            if (shape.type === 'text' && ('text' in updates || 'fontSize' in updates || 'fontFamily' in updates)) {
              const textShape = state.shapes[shapeIndex] as { text: string; fontSize: number; fontFamily: string } & typeof shape
              const dimensions = calculateTextDimensions(
                textShape.text,
                textShape.fontSize,
                textShape.fontFamily
              )
              state.shapes[shapeIndex].size = dimensions
            }
          }
        })
      },

      deleteShape: (id: string) => {
        set((state) => {
          state.history.past.push([...state.shapes])
          state.shapes = state.shapes.filter((s) => s.id !== id)
          if (state.selectedShapeId === id) {
            state.selectedShapeId = null
          }
          state.history.future = []
        })
      },

      selectShape: (id: string | null) => {
        set((state) => {
          state.selectedShapeId = id
        })
      },

      duplicateShape: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            const newShape = {
              ...shape,
              id: nanoid(),
              position: {
                x: shape.position.x + 20,
                y: shape.position.y + 20,
              },
            }
            state.shapes.push(newShape)
            state.selectedShapeId = newShape.id
            state.history.past.push([...state.shapes.slice(0, -1)])
            state.history.future = []
          }
        })
      },

      moveShape: (id: string, position: { x: number; y: number }) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            shape.position = position
          }
        })
      },

      resizeShape: (id: string, size: { width: number; height: number }) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            shape.size = size
          }
        })
      },

      updateCanvasSettings: (settings: Partial<CanvasSettings>) => {
        set((state) => {
          console.log('Store: Updating canvas settings', settings)
          Object.assign(state.canvasSettings, settings)
          console.log('Store: New canvas settings', state.canvasSettings)
        })
      },

      setCanvasSize: (width: number, height: number) => {
        set((state) => {
          state.canvasSettings.width = width
          state.canvasSettings.height = height
        })
      },

      toggleOrientation: () => {
        set((state) => {
          const { width, height } = state.canvasSettings
          state.canvasSettings.width = height
          state.canvasSettings.height = width
          state.canvasSettings.orientation =
            state.canvasSettings.orientation === 'portrait'
              ? 'landscape'
              : 'portrait'
          
          // Save to history
          state.history.past.push([...state.shapes])
          state.history.future = []
        })
      },

      setBackgroundImage: (imageUrl: string) => {
        set((state) => {
          state.canvasSettings.backgroundImage = imageUrl
        })
      },

      removeBackgroundImage: () => {
        set((state) => {
          state.canvasSettings.backgroundImage = undefined
        })
      },

      setBackgroundPattern: (pattern: string) => {
        set((state) => {
          state.canvasSettings.backgroundPattern = pattern
        })
      },

      removeBackgroundPattern: () => {
        set((state) => {
          state.canvasSettings.backgroundPattern = undefined
        })
      },

      undo: () => {
        set((state) => {
          if (state.history.past.length > 0) {
            const previous = state.history.past.pop()!
            state.history.future.unshift([...state.shapes])
            state.shapes = previous
            state.selectedShapeId = null
          }
        })
      },

      redo: () => {
        set((state) => {
          if (state.history.future.length > 0) {
            const next = state.history.future.shift()!
            state.history.past.push([...state.shapes])
            state.shapes = next
            state.selectedShapeId = null
          }
        })
      },

      saveToHistory: () => {
        set((state) => {
          state.history.past.push([...state.shapes])
          state.history.future = []
          // Keep only last 50 states
          if (state.history.past.length > 50) {
            state.history.past.shift()
          }
        })
      },

      saveProject: () => {
        const state = get()
        const projectData = {
          shapes: state.shapes,
          canvasSettings: state.canvasSettings,
          version: '1.0',
          createdAt: new Date().toISOString(),
        }
        return JSON.stringify(projectData, null, 2)
      },

      loadProject: (jsonData: string) => {
        try {
          const projectData = JSON.parse(jsonData)
          set((state) => {
            state.shapes = projectData.shapes || []
            
            // Recalculate text dimensions for all text shapes
            state.shapes.forEach(shape => {
              if (shape.type === 'text') {
                const textShape = shape as { text: string; fontSize: number; fontFamily: string } & typeof shape
                const dimensions = calculateTextDimensions(
                  textShape.text,
                  textShape.fontSize,
                  textShape.fontFamily
                )
                shape.size = dimensions
              }
            })
            
            state.canvasSettings = {
              ...initialCanvasSettings,
              ...projectData.canvasSettings,
            }
            state.selectedShapeId = null
            state.history = {
              past: [],
              present: [],
              future: [],
            }
          })
        } catch (error) {
          console.error('Error loading project:', error)
        }
      },

      clearCanvas: () => {
        set((state) => {
          state.history.past.push([...state.shapes])
          state.shapes = []
          state.selectedShapeId = null
          state.history.future = []
        })
      },

      copyShape: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            console.log('Copied shape:', shape)
            state.clipboard = [shape]
          }
        })
      },

      pasteShape: () => {
        set((state) => {
          if (state.clipboard.length > 0) {
            const shapeToPaste = state.clipboard[0]
            console.log('Pasting shape:', shapeToPaste)
            const newShape = {
              ...shapeToPaste,
              id: nanoid(),
              position: {
                x: shapeToPaste.position.x,
                y: shapeToPaste.position.y,
              },
            }
            state.shapes.push(newShape)
            state.selectedShapeId = newShape.id
            state.history.past.push([...state.shapes.slice(0, -1)])
            state.history.future = []
            console.log('Pasted new shape:', newShape)
          } else {
            console.log('No shape in clipboard to paste')
          }
        })
      },

      // Enhanced layer actions with proper z-index management
      reorderLayers: (shapeIds: string[], newOrder: number[]) => {
        set((state) => {
          state.history.past.push([...state.shapes])
          state.history.future = []
          
          shapeIds.forEach((id, index) => {
            const shape = state.shapes.find(s => s.id === id)
            if (shape) {
              shape.zIndex = newOrder[index]
            }
          })
          
          // Re-sort shapes array to maintain consistency
          state.shapes.sort((a, b) => a.zIndex - b.zIndex)
        })
      },
      
      // Multi-selection actions
      selectMultiple: () => {
        // This will be handled by the UI components
      },
      
      getMultiSelection: () => {
        // This will be handled by the UI components
        return []
      },
      
      // Enhanced clipboard actions
      cutShapes: (shapeIds: string[]) => {
        set((state) => {
          const shapesToCut = state.shapes.filter(s => shapeIds.includes(s.id))
          state.clipboard = shapesToCut
          
          // Remove the shapes from canvas
          state.history.past.push([...state.shapes])
          state.shapes = state.shapes.filter(s => !shapeIds.includes(s.id))
          state.selectedShapeId = null
          state.history.future = []
        })
      },
      
      copyShapes: (shapeIds: string[]) => {
        set((state) => {
          const shapesToCopy = state.shapes.filter(s => shapeIds.includes(s.id))
          state.clipboard = shapesToCopy
        })
      },
      
      // Zoom and pan actions
      setZoom: (zoom: number) => {
        set((state) => {
          state.canvasSettings.zoom = Math.max(0.1, Math.min(5, zoom))
        })
      },
      
      panCanvas: () => {
        // Pan offset can be stored in canvas settings if needed
        // For now, this will be handled by the canvas component
      },
      
      resetView: () => {
        set((state) => {
          state.canvasSettings.zoom = 1
          // Reset pan offset if stored in settings
        })
      },
      
      fitToScreen: () => {
        set((state) => {
          // Calculate zoom to fit all shapes in view
          if (state.shapes.length === 0) return
          
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          
          state.shapes.forEach(shape => {
            minX = Math.min(minX, shape.position.x)
            minY = Math.min(minY, shape.position.y)
            maxX = Math.max(maxX, shape.position.x + shape.size.width)
            maxY = Math.max(maxY, shape.position.y + shape.size.height)
          })
          
          const contentWidth = maxX - minX
          const contentHeight = maxY - minY
          
          const zoomX = state.canvasSettings.width / contentWidth
          const zoomY = state.canvasSettings.height / contentHeight
          
          state.canvasSettings.zoom = Math.min(zoomX, zoomY, 2) * 0.9 // Add some padding
        })
      },

      bringToFront: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            // Save to history before making changes
            state.history.past.push([...state.shapes])
            state.history.future = []
            
            const maxZIndex = Math.max(...state.shapes.map((s) => s.zIndex))
            shape.zIndex = maxZIndex + 1
            
            // Re-sort shapes array to maintain consistency
            state.shapes.sort((a, b) => a.zIndex - b.zIndex)
          }
        })
      },

      sendToBack: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            // Save to history before making changes
            state.history.past.push([...state.shapes])
            state.history.future = []
            
            const minZIndex = Math.min(...state.shapes.map((s) => s.zIndex))
            shape.zIndex = minZIndex - 1
            
            // Re-sort shapes array to maintain consistency
            state.shapes.sort((a, b) => a.zIndex - b.zIndex)
          }
        })
      },

      bringForward: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            // Save to history before making changes
            state.history.past.push([...state.shapes])
            state.history.future = []
            
            // Find the next higher z-index
            const currentIndex = shape.zIndex
            const higherShapes = state.shapes.filter(s => s.zIndex > currentIndex)
            
            if (higherShapes.length > 0) {
              const nextHigher = Math.min(...higherShapes.map(s => s.zIndex))
              
              // Swap z-indices
              const shapeToSwap = state.shapes.find(s => s.zIndex === nextHigher)
              if (shapeToSwap) {
                shape.zIndex = nextHigher
                shapeToSwap.zIndex = currentIndex
              }
              
              // Re-sort shapes array to maintain consistency
              state.shapes.sort((a, b) => a.zIndex - b.zIndex)
            }
          }
        })
      },

      sendBackward: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            // Save to history before making changes
            state.history.past.push([...state.shapes])
            state.history.future = []
            
            // Find the next lower z-index
            const currentIndex = shape.zIndex
            const lowerShapes = state.shapes.filter(s => s.zIndex < currentIndex)
            
            if (lowerShapes.length > 0) {
              const nextLower = Math.max(...lowerShapes.map(s => s.zIndex))
              
              // Swap z-indices
              const shapeToSwap = state.shapes.find(s => s.zIndex === nextLower)
              if (shapeToSwap) {
                shape.zIndex = nextLower
                shapeToSwap.zIndex = currentIndex
              }
              
              // Re-sort shapes array to maintain consistency
              state.shapes.sort((a, b) => a.zIndex - b.zIndex)
            }
          }
        })
      },
    }))
  )
)
