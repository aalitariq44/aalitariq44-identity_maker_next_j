'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Shape, EditorState, CanvasSettings } from '@/types/shapes'
import { nanoid } from 'nanoid'

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
  
  // Layer actions
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
}

const initialCanvasSettings: CanvasSettings = {
  width: 856,
  height: 540,
  orientation: 'landscape',
  backgroundColor: '#ffffff',
  gridSize: 20,
  showGrid: true,
  snapToGrid: false,
  zoom: 1,
  gridColor: '#e5e7eb',
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
          const newShape = {
            ...shapeData,
            id: nanoid(),
          } as Shape
          
          state.shapes.push(newShape)
          state.selectedShapeId = newShape.id
          state.history.past.push([...state.shapes.slice(0, -1)])
          state.history.future = []
        })
      },

      updateShape: (id: string, updates: Partial<Shape>) => {
        set((state) => {
          const shapeIndex = state.shapes.findIndex((s) => s.id === id)
          if (shapeIndex !== -1) {
            Object.assign(state.shapes[shapeIndex], updates)
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
          Object.assign(state.canvasSettings, settings)
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
            state.clipboard = [shape]
          }
        })
      },

      pasteShape: () => {
        set((state) => {
          if (state.clipboard.length > 0) {
            const shapeToPaste = state.clipboard[0]
            const newShape = {
              ...shapeToPaste,
              id: nanoid(),
              position: {
                x: shapeToPaste.position.x + 20,
                y: shapeToPaste.position.y + 20,
              },
            }
            state.shapes.push(newShape)
            state.selectedShapeId = newShape.id
            state.history.past.push([...state.shapes.slice(0, -1)])
            state.history.future = []
          }
        })
      },

      bringToFront: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            const maxZIndex = Math.max(...state.shapes.map((s) => s.zIndex))
            shape.zIndex = maxZIndex + 1
          }
        })
      },

      sendToBack: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            const minZIndex = Math.min(...state.shapes.map((s) => s.zIndex))
            shape.zIndex = minZIndex - 1
          }
        })
      },

      bringForward: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            shape.zIndex += 1
          }
        })
      },

      sendBackward: (id: string) => {
        set((state) => {
          const shape = state.shapes.find((s) => s.id === id)
          if (shape) {
            shape.zIndex -= 1
          }
        })
      },
    }))
  )
)
