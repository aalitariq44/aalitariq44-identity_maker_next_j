'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface ClientSideCanvasStageProps {
  width: number
  height: number
}

// Dynamically import CanvasStage to avoid SSR issues with Konva
const CanvasStage = dynamic(() => import('./CanvasStage'), {
  ssr: false,
  loading: () => (
    <div 
      className="canvas-container border border-gray-300 bg-white shadow-lg overflow-hidden flex items-center justify-center"
      style={{ width: 800, height: 600 }}
    >
      <div className="text-gray-500">Loading Canvas...</div>
    </div>
  )
})

const ClientSideCanvasStage: React.FC<ClientSideCanvasStageProps> = ({ width, height }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        className="canvas-container border border-gray-300 bg-white shadow-lg overflow-hidden flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-gray-500">Initializing Canvas...</div>
      </div>
    )
  }

  return <CanvasStage width={width} height={height} />
}

export default ClientSideCanvasStage
