'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape } from '@/types/shapes'

interface EnhancedCanvasStageProps {
  width?: number
  height?: number
}

export const EnhancedCanvasStage: React.FC<EnhancedCanvasStageProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    active: boolean
  } | null>(null)
  const [multiSelection, setMultiSelection] = useState<string[]>([])
  // Resource caches (images, qr codes, barcodes)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const qrCache = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const barcodeCache = useRef<Map<string, HTMLCanvasElement>>(new Map())
  
  // Enhanced pan and zoom states
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [documentPan, setDocumentPan] = useState({ x: 100, y: 100 }) // Start with some offset
  const [lastWheelTime, setLastWheelTime] = useState(0)

  // Resizing states
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [resizeLocalStart, setResizeLocalStart] = useState({ x: 0, y: 0 })

  const {
    shapes,
    selectedShapeId,
    canvasSettings,
    selectShape,
    moveShape,
    updateShape,
    resizeShape,
    deleteShape,
    undo,
    redo,
    saveToHistory,
    setZoom,
    updateCanvasSettings,
  } = useEditorStore()

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        setContext(ctx)
        // Enable high-DPI support
        const devicePixelRatio = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
        ctx.scale(devicePixelRatio, devicePixelRatio)
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
      }
    }
  }, [])

  // Resize canvas when container changes
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        
        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(devicePixelRatio, devicePixelRatio)
          canvas.style.width = rect.width + 'px'
          canvas.style.height = rect.height + 'px'
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Enhanced wheel handler with better zoom and pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const now = Date.now()
    if (now - lastWheelTime < 16) return // Throttle to ~60fps
    setLastWheelTime(now)

    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check if middle mouse button for panning document
    if (e.buttons === 4 || isMiddleMousePanning) {
      const deltaX = e.deltaX * 0.5
      const deltaY = e.deltaY * 0.5
      setDocumentPan(prev => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }))
      return
    }

    // Zoom
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, canvasSettings.zoom * scaleFactor))

    // Calculate zoom point for smooth zooming around cursor
    const zoomPoint = {
      x: (mouseX - documentPan.x) / canvasSettings.zoom,
      y: (mouseY - documentPan.y) / canvasSettings.zoom
    }

    const newOffset = {
      x: mouseX - zoomPoint.x * newZoom,
      y: mouseY - zoomPoint.y * newZoom
    }

    setZoom(newZoom)
    setDocumentPan(newOffset)
  }, [canvasSettings.zoom, documentPan, setZoom, lastWheelTime, isMiddleMousePanning])

  // Reset view function
  const resetView = useCallback(() => {
    setZoom(1)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDocumentPan({ 
        x: (rect.width - canvasSettings.width) / 2,
        y: (rect.height - canvasSettings.height) / 2
      })
    }
  }, [setZoom, canvasSettings.width, canvasSettings.height])

  // Fit to screen function
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width - 80 // padding
    const containerHeight = containerRect.height - 80 // padding
    
    const scaleX = containerWidth / canvasSettings.width
    const scaleY = containerHeight / canvasSettings.height
    const newZoom = Math.min(scaleX, scaleY, 2) * 0.9 // Add some padding and limit max zoom
    
    const offsetX = (containerRect.width - canvasSettings.width * newZoom) / 2
    const offsetY = (containerRect.height - canvasSettings.height * newZoom) / 2
    
    setZoom(newZoom)
    setDocumentPan({ x: offsetX, y: offsetY })
  }, [canvasSettings.width, canvasSettings.height, setZoom])

  // Add global event listeners for fit to screen
  useEffect(() => {
    const handleFitToScreen = () => {
      fitToScreen()
    }

    window.addEventListener('fitToScreen', handleFitToScreen)
    return () => window.removeEventListener('fitToScreen', handleFitToScreen)
  }, [fitToScreen])

  // Enhanced keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      
      if (e.code === 'Space' && !isSpacePressed && !isInputField) {
        e.preventDefault()
        setIsSpacePressed(true)
        return
      }

      // Zoom controls
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetView()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '9') {
        e.preventDefault()
        fitToScreen()
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        const newZoom = Math.min(5, canvasSettings.zoom * 1.2)
        setZoom(newZoom)
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        const newZoom = Math.max(0.1, canvasSettings.zoom * 0.8)
        setZoom(newZoom)
        return
      }

      // History controls
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault()
        redo()
        return
      }

      // Delete
      if (e.key === 'Delete') {
        e.preventDefault()
        if (multiSelection.length > 0) {
          multiSelection.forEach(id => deleteShape(id))
          setMultiSelection([])
        } else if (selectedShapeId) {
          deleteShape(selectedShapeId)
        }
        return
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        selectShape(null)
        setMultiSelection([])
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      
      if (e.code === 'Space' && !isInputField) {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedShapeId, multiSelection, shapes, deleteShape, selectShape, undo, redo, isSpacePressed, canvasSettings.zoom, setZoom, resetView, fitToScreen])

  // Point in shape detection with document coordinates
  const isPointInShape = useCallback((point: { x: number; y: number }, shape: Shape): boolean => {
    if (!shape.visible || shape.locked) return false

    // Convert screen -> document coords
    const docPt = {
      x: (point.x - documentPan.x) / canvasSettings.zoom,
      y: (point.y - documentPan.y) / canvasSettings.zoom,
    }
    // Center of shape
    const cx = shape.position.x + shape.size.width / 2
    const cy = shape.position.y + shape.size.height / 2
    // Translate to center
    const dx = docPt.x - cx
    const dy = docPt.y - cy
    // Inverse rotate
    const rad = (-shape.rotation * Math.PI) / 180
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad)
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad)
    // Check inside unrotated bounds
    return (
      rx >= -shape.size.width / 2 &&
      rx <= shape.size.width / 2 &&
      ry >= -shape.size.height / 2 &&
      ry <= shape.size.height / 2
    )
  }, [documentPan, canvasSettings.zoom])

  // Helper to compute rotated handle positions in screen space
  const getShapeScreenHandles = useCallback((shape: Shape) => {
    const points: { key: string; x: number; y: number }[] = []
    const cx = shape.position.x + shape.size.width / 2
    const cy = shape.position.y + shape.size.height / 2
    const rad = (shape.rotation * Math.PI) / 180
    const corners = [
      { key: 'tl', x: -shape.size.width / 2, y: -shape.size.height / 2 },
      { key: 'tr', x: shape.size.width / 2, y: -shape.size.height / 2 },
      { key: 'bl', x: -shape.size.width / 2, y: shape.size.height / 2 },
      { key: 'br', x: shape.size.width / 2, y: shape.size.height / 2 },
      { key: 'tm', x: 0, y: -shape.size.height / 2 },
      { key: 'bm', x: 0, y: shape.size.height / 2 },
      { key: 'ml', x: -shape.size.width / 2, y: 0 },
      { key: 'mr', x: shape.size.width / 2, y: 0 },
    ]
    corners.forEach(c => {
      const rx = c.x * Math.cos(rad) - c.y * Math.sin(rad) + cx
      const ry = c.x * Math.sin(rad) + c.y * Math.cos(rad) + cy
      points.push({ key: c.key, x: rx * canvasSettings.zoom + documentPan.x, y: ry * canvasSettings.zoom + documentPan.y })
    })
    // rotation handle (above top middle)
    const rotLocal = { x: 0, y: -shape.size.height / 2 - 30 }
    const rrx = rotLocal.x * Math.cos(rad) - rotLocal.y * Math.sin(rad) + cx
    const rry = rotLocal.x * Math.sin(rad) + rotLocal.y * Math.cos(rad) + cy
    points.push({ key: 'rotate', x: rrx * canvasSettings.zoom + documentPan.x, y: rry * canvasSettings.zoom + documentPan.y })
    return points
  }, [canvasSettings.zoom, documentPan])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle middle mouse button for panning
    if (e.button === 1) {
      e.preventDefault()
      setIsMiddleMousePanning(true)
      setPanOffset({ x, y })
      return
    }

    // Handle panning with space key
    if (isSpacePressed) {
      setIsPanning(true)
      setPanOffset({ x, y })
      return
    }

    // Convert screen coordinates to document coordinates
    const docX = (x - documentPan.x) / canvasSettings.zoom
    const docY = (y - documentPan.y) / canvasSettings.zoom

    // Check if we're clicking inside the document bounds
    if (!(docX >= 0 && docX <= canvasSettings.width && docY >= 0 && docY <= canvasSettings.height)) {
      selectShape(null)
      setMultiSelection([])
      return
    }

    // First check existing selection handles for resize / rotate
    if (selectedShape) {
      const handles = getShapeScreenHandles(selectedShape)
      const hitHandle = handles.find(h => {
        return Math.abs(h.x - x) <= 8 && Math.abs(h.y - y) <= 8
      })
      if (hitHandle) {
        if (hitHandle.key === 'rotate') {
          setIsRotating(true)
        } else {
          setIsResizing(true)
          setResizeHandle(hitHandle.key)
          // Calculate local coordinates for resizing start
          const cx = selectedShape.position.x + selectedShape.size.width / 2
          const cy = selectedShape.position.y + selectedShape.size.height / 2
          const dx = docX - cx
          const dy = docY - cy
          const rad = (-selectedShape.rotation * Math.PI) / 180
          const lx = dx * Math.cos(rad) - dy * Math.sin(rad)
          const ly = dx * Math.sin(rad) + dy * Math.cos(rad)
          setInitialSize({ width: selectedShape.size.width, height: selectedShape.size.height })
          setResizeLocalStart({ x: lx, y: ly })
        }
        return
      }
    }

    // Find clicked shape (topmost)
    const sortedShapes = [...shapes]
      .filter(shape => shape.visible && !shape.locked)
      .sort((a, b) => b.zIndex - a.zIndex)
    let clickedShape: Shape | null = null
    for (const shape of sortedShapes) {
      if (isPointInShape({ x, y }, shape)) { clickedShape = shape; break }
    }
    if (clickedShape) {
      if (e.ctrlKey || e.metaKey) {
        if (multiSelection.includes(clickedShape.id)) setMultiSelection(prev => prev.filter(id => id !== clickedShape.id))
        else setMultiSelection(prev => [...prev, clickedShape.id])
      } else {
        selectShape(clickedShape.id)
        setMultiSelection([])
        setIsDragging(true)
        setDragOffset({ x: docX - clickedShape.position.x, y: docY - clickedShape.position.y })
      }
      return
    }

    // No shape clicked - deselect or start selection box
    if (!e.ctrlKey && !e.metaKey) {
      selectShape(null)
      setMultiSelection([])
    }

    setSelectionBox({
      start: { x: docX, y: docY },
      end: { x: docX, y: docY },
      active: true
    })
  }, [shapes, isPointInShape, selectShape, multiSelection, isSpacePressed, documentPan, canvasSettings])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Dynamic cursor for resize/rotate handles and move
    const canvas = canvasRef.current
    if (selectedShape && !isDragging && !isResizing && !isRotating && !isPanning && !isMiddleMousePanning && !selectionBox?.active) {
      const handles = getShapeScreenHandles(selectedShape)
      const hitHandle = handles.find(h => Math.abs(h.x - x) <= 8 && Math.abs(h.y - y) <= 8)
      if (hitHandle) {
        let cursorType = 'default'
        switch (hitHandle.key) {
          case 'rotate':
            cursorType = 'crosshair'; break
          case 'tl': case 'br':
            cursorType = 'nwse-resize'; break
          case 'tr': case 'bl':
            cursorType = 'nesw-resize'; break
          case 'tm': case 'bm':
            cursorType = 'ns-resize'; break
          case 'ml': case 'mr':
            cursorType = 'ew-resize'; break
          default:
            cursorType = 'default'
        }
        canvas.style.cursor = cursorType
        return
      }
      // Over shape for moving
      if (isPointInShape({ x, y }, selectedShape)) {
        canvas.style.cursor = 'move'
        return
      }
    }

    // Handle panning
    if ((isPanning && isSpacePressed) || isMiddleMousePanning) {
      const deltaX = x - panOffset.x
      const deltaY = y - panOffset.y
      setDocumentPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setPanOffset({ x, y })
      return
    }

    // Handle selection box
    if (selectionBox?.active) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      
      setSelectionBox(prev => prev ? {
        ...prev,
        end: { x: docX, y: docY }
      } : null)
      return
    }

    // Handle rotation
    if (isRotating && selectedShape) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      const cx = selectedShape.position.x + selectedShape.size.width / 2
      const cy = selectedShape.position.y + selectedShape.size.height / 2
      const angle = Math.atan2(docY - cy, docX - cx) * 180 / Math.PI + 90 // +90 so top is 0°
      updateShape(selectedShape.id, { rotation: angle })
      return
    }

    // Handle resizing
    if (isResizing && selectedShape && resizeHandle) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      const shape = selectedShape
      const cx = shape.position.x + shape.size.width / 2
      const cy = shape.position.y + shape.size.height / 2
      // Convert pointer into local (inverse rotation)
      const dx = docX - cx
      const dy = docY - cy
      const rad = (-shape.rotation * Math.PI) / 180
      const lx = dx * Math.cos(rad) - dy * Math.sin(rad)
      const ly = dx * Math.sin(rad) + dy * Math.cos(rad)
      
      const delta_lx = lx - resizeLocalStart.x
      const delta_ly = ly - resizeLocalStart.y
      
      let newW = initialSize.width
      let newH = initialSize.height
      const min = 10
      
      if (resizeHandle.includes('l')) newW = Math.max(min, initialSize.width - delta_lx * 2)
      if (resizeHandle.includes('r')) newW = Math.max(min, initialSize.width + delta_lx * 2)
      if (resizeHandle.includes('t')) newH = Math.max(min, initialSize.height - delta_ly * 2)
      if (resizeHandle.includes('b')) newH = Math.max(min, initialSize.height + delta_ly * 2)
      
      let nx = cx - newW / 2
      let ny = cy - newH / 2
      // Snap
      if (canvasSettings.snapToGrid) {
        nx = Math.round(nx / canvasSettings.gridSize) * canvasSettings.gridSize
        ny = Math.round(ny / canvasSettings.gridSize) * canvasSettings.gridSize
      }

      if (shape.type === 'circle') {
        // Keep circle width == height
        const side = Math.max(newW, newH)
        updateShape(shape.id, {
          size: { width: side, height: side },
          position: { x: cx - side/2, y: cy - side/2 },
          radius: side/2
        } as any) // Cast to any to allow radius property
      } else {
        updateShape(shape.id, {
          size: { width: newW, height: newH },
          position: { x: nx, y: ny }
        })
      }
      return
    }

    // Handle shape dragging
    if (isDragging && selectedShapeId) {
      const docX = (x - documentPan.x) / canvasSettings.zoom
      const docY = (y - documentPan.y) / canvasSettings.zoom
      
      let newX = docX - dragOffset.x
      let newY = docY - dragOffset.y

      if (canvasSettings.snapToGrid) {
        newX = Math.round(newX / canvasSettings.gridSize) * canvasSettings.gridSize
        newY = Math.round(newY / canvasSettings.gridSize) * canvasSettings.gridSize
      }

      moveShape(selectedShapeId, { x: newX, y: newY })
    }
  }, [isPanning, isSpacePressed, isMiddleMousePanning, selectionBox, isDragging, isResizing, isRotating, selectedShape, getShapeScreenHandles, isPointInShape, documentPan, canvasSettings, dragOffset, moveShape, initialSize, resizeLocalStart, resizeHandle, updateShape])

  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    if (e?.button === 1) {
      setIsMiddleMousePanning(false)
      return
    }

    if (selectionBox?.active) {
      // Handle selection box completion
      const selectedIds = shapes
        .filter(shape => {
          if (!shape.visible || shape.locked) return false
          
          const left = Math.min(selectionBox.start.x, selectionBox.end.x)
          const right = Math.max(selectionBox.start.x, selectionBox.end.x)
          const top = Math.min(selectionBox.start.y, selectionBox.end.y)
          const bottom = Math.max(selectionBox.start.y, selectionBox.end.y)

          return (
            shape.position.x >= left &&
            shape.position.x + shape.size.width <= right &&
            shape.position.y >= top &&
            shape.position.y + shape.size.height <= bottom
          )
        })
        .map(shape => shape.id)

      if (selectedIds.length > 0) {
        setMultiSelection(selectedIds)
        if (selectedIds.length === 1) {
          selectShape(selectedIds[0])
        }
      }
      setSelectionBox(null)
    }

  if (isDragging || isResizing || isRotating) {
      saveToHistory()
    }

    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setIsPanning(false)
    setIsMiddleMousePanning(false)
    setResizeHandle(null)
    setInitialSize({ width: 0, height: 0 })
    setResizeLocalStart({ x: 0, y: 0 })
  }, [selectionBox, shapes, isDragging, isResizing, isRotating, saveToHistory, setMultiSelection, selectShape])

  // Enhanced drawing function
  // Generate QR & barcode & load images when shapes change
  useEffect(() => {
    shapes.forEach(shape => {
      if (shape.type === 'image') {
        const s: any = shape
        if (s.imageUrl && !imageCache.current.has(s.imageUrl)) {
          const img = new Image()
            ;(img as any).crossOrigin = 'anonymous'
          img.onload = () => {
            imageCache.current.set(s.imageUrl, img)
            setContext(prev => prev) // trigger redraw
          }
          img.src = s.imageUrl
        }
      }
      if (shape.type === 'qr') {
        if (!qrCache.current.has(shape.id)) {
          const canvas = document.createElement('canvas')
          QRCode.toCanvas(canvas, (shape as any).data || '', { width: shape.size.width, margin: 0, color: { dark: (shape as any).foregroundColor, light: (shape as any).backgroundColor } }, (err) => {
            if (!err) {
              qrCache.current.set(shape.id, canvas)
              setContext(prev => prev)
            }
          })
        }
      }
      if (shape.type === 'barcode') {
        if (!barcodeCache.current.has(shape.id)) {
          const canvas = document.createElement('canvas')
          try {
            JsBarcode(canvas, (shape as any).data || '123456', { format: 'CODE128', lineColor: (shape as any).lineColor || '#000', background: (shape as any).backgroundColor || '#fff', width: 2, height: shape.size.height - 4, displayValue: false, margin: 0 })
            barcodeCache.current.set(shape.id, canvas)
            setContext(prev => prev)
          } catch (e) {
            console.error('Barcode generation failed', e)
          }
        }
      }
    })
  }, [shapes])

  useEffect(() => {
    if (!context || !canvasRef.current) return

    const canvas = canvasRef.current
    
    // Clear canvas
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    
  // Apply transformations
    context.save()
    context.translate(documentPan.x, documentPan.y)
    context.scale(canvasSettings.zoom, canvasSettings.zoom)
  // Clip to document area so shapes outside hidden
  context.save()
  context.beginPath()
  context.rect(0, 0, canvasSettings.width, canvasSettings.height)
  context.clip()
    
    // Draw document background
    context.fillStyle = canvasSettings.backgroundColor
    context.fillRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw document border
    context.strokeStyle = '#333'
    context.lineWidth = 2
    context.strokeRect(0, 0, canvasSettings.width, canvasSettings.height)
    
    // Draw grid if enabled
    if (canvasSettings.showGrid) {
      context.strokeStyle = canvasSettings.gridColor || '#e5e7eb'
      context.lineWidth = 0.5
      context.globalAlpha = 0.5

      for (let x = 0; x <= canvasSettings.width; x += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, canvasSettings.height)
        context.stroke()
      }

      for (let y = 0; y <= canvasSettings.height; y += canvasSettings.gridSize) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(canvasSettings.width, y)
        context.stroke()
      }

      context.globalAlpha = 1
    }
    
    // Sort and draw shapes
    const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
    
    sortedShapes.forEach((shape) => {
      if (!shape.visible) return
      
      context.save()
      // Center-based rotation
      const cx = shape.position.x + shape.size.width / 2
      const cy = shape.position.y + shape.size.height / 2
      context.translate(cx, cy)
      context.rotate((shape.rotation * Math.PI) / 180)
      context.globalAlpha = shape.opacity
      
      switch (shape.type) {
        case 'rect':
          const rectShape = shape as any
          context.fillStyle = rectShape.fill
          context.strokeStyle = rectShape.stroke
          context.lineWidth = rectShape.strokeWidth
          context.fillRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          if (rectShape.strokeWidth > 0) context.strokeRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          break
          
        case 'circle':
          const circleShape = shape as any
          const radius = circleShape.radius
          context.beginPath()
          context.arc(0, 0, radius, 0, 2 * Math.PI)
            context.fillStyle = circleShape.fill
          context.fill()
          if (circleShape.strokeWidth > 0) {
            context.strokeStyle = circleShape.stroke
            context.lineWidth = circleShape.strokeWidth
            context.stroke()
          }
          break
          
        case 'text':
          const textShape = shape as any
          // Keep text size consistent with zoom level
          context.font = `${textShape.fontSize}px ${textShape.fontFamily}`
          context.fillStyle = textShape.fill
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(textShape.text, 0, 0)
          break
          
        case 'triangle':
          const triangleShape = shape as any
          context.beginPath()
          context.moveTo(0, -shape.size.height/2)
          context.lineTo(-shape.size.width/2, shape.size.height/2)
          context.lineTo(shape.size.width/2, shape.size.height/2)
          context.closePath()
          context.fillStyle = triangleShape.fill
          context.fill()
          context.strokeStyle = triangleShape.stroke
          context.lineWidth = triangleShape.strokeWidth
          if (triangleShape.strokeWidth > 0) {
            context.stroke()
          }
          break

        case 'image': {
          const imgShape = shape as any
          const img = imageCache.current.get(imgShape.imageUrl)
          if (img) {
            context.drawImage(img, -shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
            if (imgShape.strokeWidth > 0) {
              context.strokeStyle = imgShape.stroke || '#000'
              context.lineWidth = imgShape.strokeWidth
              context.strokeRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
            }
          } else {
            context.fillStyle = '#ddd'
            context.fillRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          }
          break
        }

        case 'qr': {
          const qrCanvas = qrCache.current.get(shape.id)
          if (qrCanvas) {
            context.drawImage(qrCanvas, -shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          } else {
            context.fillStyle = '#eee'
            context.fillRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          }
          break
        }

        case 'barcode': {
          const bCanvas = barcodeCache.current.get(shape.id)
          if (bCanvas) {
            context.drawImage(bCanvas, -shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          } else {
            context.fillStyle = '#eee'
            context.fillRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          }
          break
        }
          
        default:
          context.fillStyle = '#cccccc'
          context.fillRect(-shape.size.width/2, -shape.size.height/2, shape.size.width, shape.size.height)
          break
      }
      
      context.restore()
    })

    // Restore clip but keep outer transform for selection overlays
    context.restore() // end clip
    context.restore() // end pan/zoom

    // Draw multi-selection (axis-aligned for now)
    if (multiSelection.length > 1) {
      context.strokeStyle = '#f59e0b'
      context.lineWidth = 2
      context.setLineDash([5, 5])

      multiSelection.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          const x = shape.position.x * canvasSettings.zoom + documentPan.x - 3
          const y = shape.position.y * canvasSettings.zoom + documentPan.y - 3
          const width = shape.size.width * canvasSettings.zoom + 6
          const height = shape.size.height * canvasSettings.zoom + 6
          context.strokeRect(x, y, width, height)
        }
      })
    }

    // Draw single selection
    if (selectedShape && multiSelection.length <= 1) {
      const handles = getShapeScreenHandles(selectedShape)
      // Calculate bounding box for rotated shape
      const xs = handles.filter(h => ['tl','tr','br','bl'].includes(h.key)).map(h => h.x)
      const ys = handles.filter(h => ['tl','tr','br','bl'].includes(h.key)).map(h => h.y)
      const minX = Math.min(...xs) - 3
      const maxX = Math.max(...xs) + 3
      const minY = Math.min(...ys) - 3
      const maxY = Math.max(...ys) + 3
      
      // Draw bounding box
      context.strokeStyle = '#0ea5e9'
      context.lineWidth = 2
      context.setLineDash([5,5])
      context.strokeRect(minX, minY, maxX - minX, maxY - minY)
      
      // Handles
      context.setLineDash([])
      context.fillStyle = '#0ea5e9'
      context.strokeStyle = '#fff'
      handles.forEach(h => {
        const size = h.key === 'rotate' ? 10 : 8
        context.fillRect(h.x - size/2, h.y - size/2, size, size)
        context.strokeRect(h.x - size/2, h.y - size/2, size, size)
      })
      // Draw line to rotation handle
      const tm = handles.find(h=>h.key==='tm')
      const rot = handles.find(h=>h.key==='rotate')
      if (tm && rot) {
        context.strokeStyle = '#0ea5e9'
        context.beginPath()
        context.moveTo(tm.x, tm.y)
        context.lineTo(rot.x, rot.y)
        context.stroke()
      }
    }

    // Draw selection box
  if (selectionBox?.active) {
      context.save()
      context.translate(documentPan.x, documentPan.y)
      context.scale(canvasSettings.zoom, canvasSettings.zoom)
      
      context.strokeStyle = '#0ea5e9'
      context.fillStyle = 'rgba(14, 165, 233, 0.1)'
      context.lineWidth = 1
      context.setLineDash([3, 3])

      const width = selectionBox.end.x - selectionBox.start.x
      const height = selectionBox.end.y - selectionBox.start.y

      context.fillRect(selectionBox.start.x, selectionBox.start.y, width, height)
      context.strokeRect(selectionBox.start.x, selectionBox.start.y, width, height)

      context.restore()
    }

  }, [context, shapes, canvasSettings, selectedShape, multiSelection, selectionBox, documentPan, getShapeScreenHandles])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-200 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isSpacePressed ? 'grab' : isPanning || isMiddleMousePanning ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={0}
      />

      {/* Document outline indicator */}
      <div 
        className="absolute border-2 border-gray-800 pointer-events-none shadow-2xl"
        style={{
          left: documentPan.x,
          top: documentPan.y,
          width: canvasSettings.width * canvasSettings.zoom,
          height: canvasSettings.height * canvasSettings.zoom,
          backgroundColor: 'transparent',
        }}
      />
      
      {/* Enhanced Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-4 py-3 rounded-lg text-sm font-mono shadow-xl">
        <div className="space-y-1">
          <div>Zoom: {Math.round(canvasSettings.zoom * 100)}%</div>
          <div>
            {multiSelection.length > 0 
              ? `Selected: ${multiSelection.length} objects` 
              : selectedShape 
                ? 'Selected: 1 object' 
                : 'No selection'
            }
          </div>
          <div className="text-gray-300 text-xs">
            {isSpacePressed && '⚡ Space: Pan Mode'}
            {isMiddleMousePanning && '🖱️ Middle Mouse: Panning'}
          </div>
        </div>
      </div>
      
      {/* Document Info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 text-gray-800 px-4 py-3 rounded-lg text-sm shadow-lg border">
        <div className="space-y-1">
          <div className="font-semibold">Document: {canvasSettings.width}×{canvasSettings.height}px</div>
          <div className="text-gray-600">Pan: {Math.round(documentPan.x)}, {Math.round(documentPan.y)}</div>
        </div>
      </div>
      
      {/* Enhanced Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(5, canvasSettings.zoom * 1.2))}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Zoom In (Ctrl/Cmd + +)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <button
          onClick={() => setZoom(Math.max(0.1, canvasSettings.zoom * 0.8))}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Zoom Out (Ctrl/Cmd + -)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        <button
          onClick={resetView}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Reset View (Ctrl/Cmd + 0)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <button
          onClick={fitToScreen}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-xl p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          title="Fit to Screen (Ctrl/Cmd + 9)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Controls Guide */}
      {isSpacePressed && (
        <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-xl">
          <div className="text-sm font-semibold mb-3">🎯 Navigation Controls:</div>
          <div className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Space</span>
              <span>+ Drag to pan around</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Wheel</span>
              <span>Middle button + drag to pan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Scroll</span>
              <span>Zoom in/out at cursor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Ctrl+0</span>
              <span>Reset view</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded font-mono text-xs">Ctrl+9</span>
              <span>Fit to screen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedCanvasStage
