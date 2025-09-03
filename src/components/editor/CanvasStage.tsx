'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Circle, Text, Line, Transformer, Image, Konva, useKonva } from './KonvaComponents'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape } from '@/types/shapes'
import Grid from './Grid'
import { snapToGrid } from '@/lib/konvaUtils'

interface CanvasStageProps {
  width: number
  height: number
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ width, height }) => {
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { isLoaded: isKonvaLoaded } = useKonva()
  const [backgroundImageObj, setBackgroundImageObj] = useState<HTMLImageElement | null>(null)

  const {
    shapes,
    canvasSettings,
    selectedShapeId,
    selectShape,
    updateShape,
    moveShape,
    resizeShape,
  } = useEditorStore()

  useEffect(() => {
    // Wait for Konva to load
    if (isKonvaLoaded) {
      console.log('Konva loaded successfully')
    } else {
      console.log('Waiting for Konva to load...')
    }
  }, [isKonvaLoaded])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected shape with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        e.preventDefault()
        const selectedShape = shapes.find(s => s.id === selectedShapeId)
        if (selectedShape && !selectedShape.locked) {
          const { deleteShape } = useEditorStore.getState()
          deleteShape(selectedShapeId)
        }
      }
      
      // Escape key to deselect
      if (e.key === 'Escape') {
        setSelectedId(null)
        selectShape(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, shapes, selectShape])

  // Debug canvas settings changes
  useEffect(() => {
    console.log('Canvas settings changed:', canvasSettings)
  }, [canvasSettings])

  // Debug shapes changes
  useEffect(() => {
    console.log('Shapes changed:', shapes)
  }, [shapes])

  // Load background image when it changes
  useEffect(() => {
    if (canvasSettings.backgroundImage) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        console.log('Background image loaded')
        setBackgroundImageObj(img)
      }
      img.onerror = () => {
        console.error('Failed to load background image')
        setBackgroundImageObj(null)
      }
      img.src = canvasSettings.backgroundImage
    } else {
      setBackgroundImageObj(null)
    }
  }, [canvasSettings.backgroundImage])

  const checkDeselect = useCallback((e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      setSelectedId(null)
      selectShape(null)
    }
  }, [selectShape])

  useEffect(() => {
    setSelectedId(selectedShapeId)
  }, [selectedShapeId])

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      // Wait a bit for the shape to be rendered
      setTimeout(() => {
        const selectedNode = stageRef.current?.findOne(`#${selectedId}`)
        if (selectedNode && transformerRef.current) {
          console.log('Attaching transformer to shape:', selectedId)
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
        }
      }, 50)
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [selectedId, shapes.length])

  const handleShapeSelect = useCallback((id: string) => {
    console.log('Shape selected:', id)
    setSelectedId(id)
    selectShape(id)
    
    // Force transformer update after selection
    setTimeout(() => {
      if (transformerRef.current && stageRef.current) {
        const selectedNode = stageRef.current.findOne(`#${id}`)
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
        }
      }
    }, 10)
  }, [selectShape])

  const handleShapeDragEnd = useCallback((e: any, shapeId: string) => {
    const node = e.target
    let newX = node.x()
    let newY = node.y()

    if (canvasSettings.snapToGrid) {
      newX = snapToGrid(newX, canvasSettings.gridSize)
      newY = snapToGrid(newY, canvasSettings.gridSize)
      node.position({ x: newX, y: newY })
    }

    moveShape(shapeId, { x: newX, y: newY })
  }, [moveShape, canvasSettings.snapToGrid, canvasSettings.gridSize])

  const handleShapeTransform = useCallback((e: any, shapeId: string) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    let newWidth = Math.max(10, node.width() * scaleX)
    let newHeight = Math.max(10, node.height() * scaleY)

    if (canvasSettings.snapToGrid) {
      newWidth = snapToGrid(newWidth, canvasSettings.gridSize)
      newHeight = snapToGrid(newHeight, canvasSettings.gridSize)
    }

    // Reset scale to 1 and update width/height instead
    node.scaleX(1)
    node.scaleY(1)
    node.width(newWidth)
    node.height(newHeight)

    // Update shape size in store
    resizeShape(shapeId, { width: newWidth, height: newHeight })
    
    // Also update rotation if it changed
    const rotation = node.rotation()
    updateShape(shapeId, { rotation })
  }, [resizeShape, updateShape, canvasSettings.snapToGrid, canvasSettings.gridSize])

  const getBackgroundImageProps = () => {
    if (!backgroundImageObj) return null

    const { width: imgWidth, height: imgHeight } = backgroundImageObj
    const { width: canvasWidth, height: canvasHeight } = canvasSettings

    let scaleX = 1
    let scaleY = 1
    let x = 0
    let y = 0

    switch (canvasSettings.backgroundSize) {
      case 'cover': {
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
        scaleX = scaleY = scale
        x = (canvasWidth - imgWidth * scale) / 2
        y = (canvasHeight - imgHeight * scale) / 2
        break
      }
      case 'contain': {
        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
        scaleX = scaleY = scale
        x = (canvasWidth - imgWidth * scale) / 2
        y = (canvasHeight - imgHeight * scale) / 2
        break
      }
      case 'stretch': {
        scaleX = canvasWidth / imgWidth
        scaleY = canvasHeight / imgHeight
        break
      }
    }

    return {
      image: backgroundImageObj,
      x,
      y,
      scaleX,
      scaleY,
      opacity: canvasSettings.backgroundOpacity,
      listening: false,
    }
  }

  const renderShape = (shape: Shape) => {
    if (!Rect || !Circle || !Text || !Line) {
      console.log('Konva components not available yet')
      return null
    }

    console.log('Rendering shape:', shape.type, shape.id)

    const commonProps = {
      id: shape.id,
      x: shape.position.x,
      y: shape.position.y,
      rotation: shape.rotation,
      opacity: shape.opacity,
      visible: shape.visible,
      draggable: !shape.locked,
      onClick: () => handleShapeSelect(shape.id),
      onTap: () => handleShapeSelect(shape.id),
      onDragEnd: (e: any) => handleShapeDragEnd(e, shape.id),
      onTransformEnd: (e: any) => handleShapeTransform(e, shape.id),
      onMouseEnter: (e: any) => {
        // Change cursor to move when hovering over shapes
        const container = e.target.getStage().container()
        if (shape.locked) {
          container.style.cursor = 'not-allowed'
        } else {
          container.style.cursor = 'move'
        }
      },
      onMouseLeave: (e: any) => {
        // Reset cursor when leaving shape
        const container = e.target.getStage().container()
        container.style.cursor = 'default'
      },
    }

    try {
      switch (shape.type) {
        case 'rect': {
          const rectShape = shape as RectShape
          return React.createElement(Rect, {
            key: shape.id,
            ...commonProps,
            width: shape.size.width,
            height: shape.size.height,
            fill: rectShape.fill,
            stroke: rectShape.stroke,
            strokeWidth: rectShape.strokeWidth,
            cornerRadius: rectShape.cornerRadius,
          })
        }

        case 'circle': {
          const circleShape = shape as CircleShape
          return React.createElement(Circle, {
            key: shape.id,
            ...commonProps,
            radius: circleShape.radius,
            fill: circleShape.fill,
            stroke: circleShape.stroke,
            strokeWidth: circleShape.strokeWidth,
          })
        }

        case 'text': {
          const textShape = shape as TextShape
          return React.createElement(Text, {
            key: shape.id,
            ...commonProps,
            width: shape.size.width,
            height: shape.size.height,
            text: textShape.text,
            fontSize: textShape.fontSize,
            fontFamily: textShape.fontFamily,
            fontStyle: textShape.fontWeight === 'bold' ? 'bold' : 'normal',
            fontVariant: textShape.fontStyle === 'italic' ? 'italic' : 'normal',
            fill: textShape.fill,
            stroke: textShape.stroke,
            strokeWidth: textShape.strokeWidth,
            align: textShape.align,
            verticalAlign: textShape.verticalAlign,
            lineHeight: textShape.lineHeight,
            letterSpacing: textShape.letterSpacing,
          })
        }

        case 'triangle': {
          const triangleShape = shape as TriangleShape
          return React.createElement(Line, {
            key: shape.id,
            ...commonProps,
            points: triangleShape.points,
            fill: triangleShape.fill,
            stroke: triangleShape.stroke,
            strokeWidth: triangleShape.strokeWidth,
            closed: true,
          })
        }

        default:
          return null
      }
    } catch (error) {
      console.error('Error rendering shape:', error)
      return null
    }
  }

  if (!isKonvaLoaded) {
    return (
      <div 
        className="canvas-container border border-gray-300 bg-white shadow-lg overflow-hidden flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-gray-500">تحميل الكانفاس...</div>
      </div>
    )
  }

  if (!Stage || !Layer) {
    return (
      <div 
        className="canvas-container border border-gray-300 bg-white shadow-lg overflow-hidden flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-red-500">خطأ في تحميل Konva</div>
      </div>
    )
  }

  const backgroundImageProps = getBackgroundImageProps()

  console.log('Rendering canvas with:', {
    canvasSettings,
    shapesCount: shapes.length,
    backgroundImageProps,
    isKonvaLoaded
  })

  return (
    <div 
      className="canvas-container border border-gray-300 bg-gray-100 shadow-lg overflow-hidden"
      style={{ width, height }}
    >
      {React.createElement(Stage, {
        ref: stageRef,
        width: canvasSettings.width,
        height: canvasSettings.height,
        onMouseDown: checkDeselect,
        onTouchStart: checkDeselect,
        style: { backgroundColor: '#f3f4f6' },
        children: [
          // Background Layer
          React.createElement(Layer, {
            key: 'background',
            children: [
              // Base background color
              Rect && React.createElement(Rect, {
                key: 'background-color',
                x: 0,
                y: 0,
                width: canvasSettings.width,
                height: canvasSettings.height,
                fill: canvasSettings.backgroundColor,
                listening: false,
              }),
              
              // Background image if present
              backgroundImageProps && Image && React.createElement(Image, {
                key: 'background-image',
                ...backgroundImageProps,
              }),
            ].filter(Boolean)
          }),
          
          // Grid Layer
          canvasSettings.showGrid && React.createElement(Layer, {
            key: 'grid-layer',
            listening: false,
            children: React.createElement(Grid, {
              width: canvasSettings.width,
              height: canvasSettings.height,
              gridSize: canvasSettings.gridSize,
              color: canvasSettings.gridColor,
              visible: true,
            })
          }),
          
          // Shapes Layer
          React.createElement(Layer, {
            key: 'shapes',
            children: [
              ...shapes
                .sort((a, b) => a.zIndex - b.zIndex)
                .map(renderShape)
                .filter(Boolean),
              
              // Transformer
              Transformer && React.createElement(Transformer, {
                ref: transformerRef,
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
                borderStroke: "#0ea5e9",
                borderStrokeWidth: 2,
                borderDash: [0],
                anchorFill: "#ffffff",
                anchorStroke: "#0ea5e9",
                anchorStrokeWidth: 2,
                anchorSize: 12,
                anchorCornerRadius: 6,
                rotateAnchorOffset: 40,
                rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
                centeredScaling: false,
                ignoreStroke: false,
                padding: 8,
                // Add visual feedback
                onTransformStart: () => {
                  // Could add animation or visual feedback here
                },
                onTransformEnd: () => {
                  // Could add completion feedback here
                },
              })
            ]
          })
        ].filter(Boolean)
      })}
    </div>
  )
}

export default CanvasStage
