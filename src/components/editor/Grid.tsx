'use client'

import React from 'react'
import { Layer, Line, Circle, loadKonva } from './KonvaComponents'

interface GridProps {
  width: number
  height: number
  gridSize: number
  gridType?: 'lines' | 'dots' | 'crosses' | 'diagonal'
  color?: string
  visible?: boolean
}

export const Grid: React.FC<GridProps> = ({
  width,
  height,
  gridSize,
  gridType = 'lines',
  color = '#e5e7eb',
  visible = true,
}) => {
  if (!visible || gridSize <= 0 || !Layer || !Line || !Circle) {
    return null
  }

  const elements = []

  switch (gridType) {
    case 'lines':
      // Generate vertical lines
      for (let i = 0; i <= width; i += gridSize) {
        elements.push(
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
        elements.push(
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
      break

    case 'dots':
      // Generate dots at grid intersections
      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          elements.push(
            React.createElement(Circle, {
              key: `dot-${x}-${y}`,
              x: x,
              y: y,
              radius: 1,
              fill: color,
              opacity: 0.5,
              listening: false,
            })
          )
        }
      }
      break

    case 'crosses':
      // Generate crosses at grid intersections
      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          // Horizontal line of cross
          elements.push(
            React.createElement(Line, {
              key: `cross-h-${x}-${y}`,
              points: [x - 3, y, x + 3, y],
              stroke: color,
              strokeWidth: 0.5,
              opacity: 0.5,
              listening: false,
            })
          )
          // Vertical line of cross
          elements.push(
            React.createElement(Line, {
              key: `cross-v-${x}-${y}`,
              points: [x, y - 3, x, y + 3],
              stroke: color,
              strokeWidth: 0.5,
              opacity: 0.5,
              listening: false,
            })
          )
        }
      }
      break

    case 'diagonal':
      // Generate diagonal lines
      const diagonalSpacing = gridSize * 2

      // Top-left to bottom-right diagonals
      for (let i = -height; i <= width; i += diagonalSpacing) {
        elements.push(
          React.createElement(Line, {
            key: `diag1-${i}`,
            points: [i, 0, i + height, height],
            stroke: color,
            strokeWidth: 0.5,
            opacity: 0.3,
            listening: false,
          })
        )
      }

      // Top-right to bottom-left diagonals
      for (let i = 0; i <= width + height; i += diagonalSpacing) {
        elements.push(
          React.createElement(Line, {
            key: `diag2-${i}`,
            points: [i, 0, i - height, height],
            stroke: color,
            strokeWidth: 0.5,
            opacity: 0.3,
            listening: false,
          })
        )
      }
      break

    default:
      break
  }

  return React.createElement(Layer, {
    listening: false,
    children: elements
  })
}

export default Grid
