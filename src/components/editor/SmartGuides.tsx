'use client'

import React from 'react'
import { Layer, Line, Circle, Rect } from 'react-konva'

interface SmartGuidesProps {
  width: number
  height: number
  showGrid: boolean
  gridSize: number
  gridColor: string
  snapToGrid: boolean
  guides: {
    vertical: number[]
    horizontal: number[]
  }
  selectedShape?: {
    x: number
    y: number
    width: number
    height: number
  }
}

const SmartGuides: React.FC<SmartGuidesProps> = ({
  width,
  height,
  showGrid,
  gridSize,
  gridColor,
  snapToGrid,
  guides,
  selectedShape
}) => {
  // Generate grid lines
  const gridLines = React.useMemo(() => {
    const lines: JSX.Element[] = []
    
    if (showGrid) {
      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        lines.push(
          <Line
            key={`v-${x}`}
            points={[x, 0, x, height]}
            stroke={gridColor}
            strokeWidth={0.5}
            opacity={0.3}
            listening={false}
          />
        )
      }
      
      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        lines.push(
          <Line
            key={`h-${y}`}
            points={[0, y, width, y]}
            stroke={gridColor}
            strokeWidth={0.5}
            opacity={0.3}
            listening={false}
          />
        )
      }
    }
    
    return lines
  }, [width, height, showGrid, gridSize, gridColor])

  // Generate smart guides
  const smartGuides = React.useMemo(() => {
    const lines: JSX.Element[] = []
    
    // Vertical guides
    guides.vertical.forEach((x, index) => {
      lines.push(
        <Line
          key={`guide-v-${index}`}
          points={[x, 0, x, height]}
          stroke="#FF6B6B"
          strokeWidth={1}
          opacity={0.8}
          listening={false}
          dash={[5, 5]}
        />
      )
    })
    
    // Horizontal guides
    guides.horizontal.forEach((y, index) => {
      lines.push(
        <Line
          key={`guide-h-${index}`}
          points={[0, y, width, y]}
          stroke="#FF6B6B"
          strokeWidth={1}
          opacity={0.8}
          listening={false}
          dash={[5, 5]}
        />
      )
    })
    
    return lines
  }, [guides, width, height])

  // Generate ruler marks
  const rulerMarks = React.useMemo(() => {
    const marks: JSX.Element[] = []
    const majorStep = 100
    const minorStep = 20
    
    // Top ruler (horizontal)
    for (let x = 0; x <= width; x += minorStep) {
      const isMajor = x % majorStep === 0
      const markHeight = isMajor ? 10 : 5
      
      marks.push(
        <Line
          key={`ruler-h-${x}`}
          points={[x, 0, x, markHeight]}
          stroke="#666"
          strokeWidth={0.5}
          listening={false}
        />
      )
      
      if (isMajor && x > 0) {
        marks.push(
          <Circle
            key={`ruler-text-h-${x}`}
            x={x}
            y={15}
            radius={2}
            fill="#666"
            listening={false}
          />
        )
      }
    }
    
    // Left ruler (vertical)
    for (let y = 0; y <= height; y += minorStep) {
      const isMajor = y % majorStep === 0
      const markWidth = isMajor ? 10 : 5
      
      marks.push(
        <Line
          key={`ruler-v-${y}`}
          points={[0, y, markWidth, y]}
          stroke="#666"
          strokeWidth={0.5}
          listening={false}
        />
      )
      
      if (isMajor && y > 0) {
        marks.push(
          <Circle
            key={`ruler-text-v-${y}`}
            x={15}
            y={y}
            radius={2}
            fill="#666"
            listening={false}
          />
        )
      }
    }
    
    return marks
  }, [width, height])

  // Generate snap indicators
  const snapIndicators = React.useMemo(() => {
    if (!snapToGrid || !selectedShape) return []
    
    const indicators: JSX.Element[] = []
    const snapX = Math.round(selectedShape.x / gridSize) * gridSize
    const snapY = Math.round(selectedShape.y / gridSize) * gridSize
    
    // Show snap points
    indicators.push(
      <Circle
        key="snap-tl"
        x={snapX}
        y={snapY}
        radius={3}
        fill="#00D9FF"
        stroke="#0066CC"
        strokeWidth={1}
        listening={false}
      />
    )
    
    indicators.push(
      <Circle
        key="snap-tr"
        x={snapX + selectedShape.width}
        y={snapY}
        radius={3}
        fill="#00D9FF"
        stroke="#0066CC"
        strokeWidth={1}
        listening={false}
      />
    )
    
    indicators.push(
      <Circle
        key="snap-bl"
        x={snapX}
        y={snapY + selectedShape.height}
        radius={3}
        fill="#00D9FF"
        stroke="#0066CC"
        strokeWidth={1}
        listening={false}
      />
    )
    
    indicators.push(
      <Circle
        key="snap-br"
        x={snapX + selectedShape.width}
        y={snapY + selectedShape.height}
        radius={3}
        fill="#00D9FF"
        stroke="#0066CC"
        strokeWidth={1}
        listening={false}
      />
    )
    
    return indicators
  }, [snapToGrid, selectedShape, gridSize])

  // Generate center guides
  const centerGuides = React.useMemo(() => {
    const lines: JSX.Element[] = []
    
    // Canvas center lines
    const centerX = width / 2
    const centerY = height / 2
    
    lines.push(
      <Line
        key="center-v"
        points={[centerX, 0, centerX, height]}
        stroke="#9333EA"
        strokeWidth={1}
        opacity={0.3}
        listening={false}
        dash={[10, 10]}
      />
    )
    
    lines.push(
      <Line
        key="center-h"
        points={[0, centerY, width, centerY]}
        stroke="#9333EA"
        strokeWidth={1}
        opacity={0.3}
        listening={false}
        dash={[10, 10]}
      />
    )
    
    // Third lines (rule of thirds)
    const thirdX1 = width / 3
    const thirdX2 = (width * 2) / 3
    const thirdY1 = height / 3
    const thirdY2 = (height * 2) / 3
    
    lines.push(
      <Line
        key="third-v1"
        points={[thirdX1, 0, thirdX1, height]}
        stroke="#10B981"
        strokeWidth={0.5}
        opacity={0.2}
        listening={false}
        dash={[5, 15]}
      />
    )
    
    lines.push(
      <Line
        key="third-v2"
        points={[thirdX2, 0, thirdX2, height]}
        stroke="#10B981"
        strokeWidth={0.5}
        opacity={0.2}
        listening={false}
        dash={[5, 15]}
      />
    )
    
    lines.push(
      <Line
        key="third-h1"
        points={[0, thirdY1, width, thirdY1]}
        stroke="#10B981"
        strokeWidth={0.5}
        opacity={0.2}
        listening={false}
        dash={[5, 15]}
      />
    )
    
    lines.push(
      <Line
        key="third-h2"
        points={[0, thirdY2, width, thirdY2]}
        stroke="#10B981"
        strokeWidth={0.5}
        opacity={0.2}
        listening={false}
        dash={[5, 15]}
      />
    )
    
    return lines
  }, [width, height])

  return (
    <Layer listening={false}>
      {/* Grid lines */}
      {gridLines}
      
      {/* Center and thirds guides */}
      {centerGuides}
      
      {/* Ruler marks */}
      {rulerMarks}
      
      {/* Smart alignment guides */}
      {smartGuides}
      
      {/* Snap indicators */}
      {snapIndicators}
      
      {/* Canvas border */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke="#E5E7EB"
        strokeWidth={2}
        fill="transparent"
        listening={false}
      />
    </Layer>
  )
}

export default SmartGuides
