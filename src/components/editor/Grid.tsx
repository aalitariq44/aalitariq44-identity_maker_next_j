'use client'

import React from 'react'
import { Layer, Line, loadKonva } from './KonvaComponents'

interface GridProps {
  width: number
  height: number
  gridSize: number
  color?: string
  visible?: boolean
}

export const Grid: React.FC<GridProps> = ({
  width,
  height,
  gridSize,
  color = '#e5e7eb',
  visible = true,
}) => {
  if (!visible || gridSize <= 0 || !Layer || !Line) {
    return null
  }

  const verticalLines = []
  const horizontalLines = []

  // Generate vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    verticalLines.push(
      React.createElement(Line, {
        key: `v-${i}`,
        points: [i, 0, i, height],
        stroke: color,
        strokeWidth: 0.5,
        opacity: 0.5,
        listening: false,
      })
    )
  }

  // Generate horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    horizontalLines.push(
      React.createElement(Line, {
        key: `h-${i}`,
        points: [0, i, width, i],
        stroke: color,
        strokeWidth: 0.5,
        opacity: 0.5,
        listening: false,
      })
    )
  }

  return React.createElement(Layer, {
    listening: false,
    children: [...verticalLines, ...horizontalLines]
  })
}

export default Grid
