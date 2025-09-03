'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Circle, Text, Line, Transformer } from 'react-konva'
import Konva from 'konva'
import { useEditorStore } from '@/store/useEditorStore'
import type { Shape, RectShape, CircleShape, TextShape, TriangleShape } from '@/types/shapes'
import Grid from './Grid'
import { snapToGrid } from '@/lib/konvaUtils'

interface CanvasStageProps {
  width: number
  height: number
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ width, height }) => {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    shapes,
    canvasSettings,
    selectedShapeId,
    selectShape,
    updateShape,
    moveShape,
    resizeShape,
  } = useEditorStore()

  const checkDeselect = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
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
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer()?.batchDraw()
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [selectedId])

  const handleShapeSelect = useCallback((id: string) => {
    setSelectedId(id)
    selectShape(id)
  }, [selectShape])

  const handleShapeDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, shapeId: string) => {
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

  const handleShapeTransform = useCallback((e: Konva.KonvaEventObject<Event>, shapeId: string) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    let newWidth = Math.max(5, node.width() * scaleX)
    let newHeight = Math.max(5, node.height() * scaleY)

    if (canvasSettings.snapToGrid) {
      newWidth = snapToGrid(newWidth, canvasSettings.gridSize)
      newHeight = snapToGrid(newHeight, canvasSettings.gridSize)
    }

    node.scaleX(1)
    node.scaleY(1)
    node.width(newWidth)
    node.height(newHeight)

    resizeShape(shapeId, { width: newWidth, height: newHeight })
  }, [resizeShape, canvasSettings.snapToGrid, canvasSettings.gridSize])

  const renderShape = (shape: Shape) => {
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
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleShapeDragEnd(e, shape.id),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleShapeTransform(e, shape.id),
    }

    switch (shape.type) {
      case 'rect': {
        const rectShape = shape as RectShape
        return (
          <Rect
            key={shape.id}
            {...commonProps}
            width={shape.size.width}
            height={shape.size.height}
            fill={rectShape.fill}
            stroke={rectShape.stroke}
            strokeWidth={rectShape.strokeWidth}
            cornerRadius={rectShape.cornerRadius}
          />
        )
      }

      case 'circle': {
        const circleShape = shape as CircleShape
        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={circleShape.radius}
            fill={circleShape.fill}
            stroke={circleShape.stroke}
            strokeWidth={circleShape.strokeWidth}
          />
        )
      }

      case 'text': {
        const textShape = shape as TextShape
        return (
          <Text
            key={shape.id}
            {...commonProps}
            width={shape.size.width}
            height={shape.size.height}
            text={textShape.text}
            fontSize={textShape.fontSize}
            fontFamily={textShape.fontFamily}
            fontStyle={textShape.fontWeight === 'bold' ? 'bold' : 'normal'}
            fontVariant={textShape.fontStyle === 'italic' ? 'italic' : 'normal'}
            fill={textShape.fill}
            stroke={textShape.stroke}
            strokeWidth={textShape.strokeWidth}
            align={textShape.align}
            verticalAlign={textShape.verticalAlign}
            lineHeight={textShape.lineHeight}
            letterSpacing={textShape.letterSpacing}
          />
        )
      }

      case 'triangle': {
        const triangleShape = shape as TriangleShape
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={triangleShape.points.map((point, index) => 
              index % 2 === 0 ? point + shape.position.x : point + shape.position.y
            )}
            fill={triangleShape.fill}
            stroke={triangleShape.stroke}
            strokeWidth={triangleShape.strokeWidth}
            closed
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <div 
      className="canvas-container border border-gray-300 bg-white shadow-lg overflow-hidden"
      style={{ width, height }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        {/* Background */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasSettings.width}
            height={canvasSettings.height}
            fill={canvasSettings.backgroundColor}
            listening={false}
          />
        </Layer>

        {/* Grid */}
        <Grid
          width={canvasSettings.width}
          height={canvasSettings.height}
          gridSize={canvasSettings.gridSize}
          color={canvasSettings.gridColor}
          visible={canvasSettings.showGrid}
        />

        {/* Shapes */}
        <Layer>
          {shapes
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderShape)}
          
          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            keepRatio={false}
            enabledAnchors={[
              'top-left',
              'top-center', 
              'top-right',
              'middle-right',
              'bottom-right',
              'bottom-center',
              'bottom-left',
              'middle-left',
            ]}
            borderStroke="#0ea5e9"
            borderStrokeWidth={1}
            anchorFill="#0ea5e9"
            anchorStroke="#0369a1"
            anchorSize={8}
            anchorCornerRadius={2}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default CanvasStage
