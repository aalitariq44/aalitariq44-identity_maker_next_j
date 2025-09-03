'use client'

// This file dynamically imports Konva components only on the client side
import { ComponentType, useEffect, useState } from 'react'

let Stage: ComponentType<any> | null = null
let Layer: ComponentType<any> | null = null
let Rect: ComponentType<any> | null = null
let Circle: ComponentType<any> | null = null
let Text: ComponentType<any> | null = null
let Line: ComponentType<any> | null = null
let Transformer: ComponentType<any> | null = null
let Image: ComponentType<any> | null = null
let Konva: any = null

// Create a promise to track when Konva is loaded
let konvaPromise: Promise<void> | null = null
let isLoading = false

// Function to dynamically load Konva components
const loadKonva = (): Promise<void> => {
  if (konvaPromise) return konvaPromise
  if (isLoading) return Promise.resolve()

  isLoading = true

  konvaPromise = new Promise((resolve, reject) => {
    // Only import Konva components if we're on the client side
    if (typeof window !== 'undefined') {
      // Use requestAnimationFrame to ensure React is fully initialized
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Promise.all([
            import('react-konva'),
            import('konva')
          ])
            .then(([reactKonva, konvaModule]) => {
              console.log('Loading Konva components...')
              Stage = reactKonva.Stage
              Layer = reactKonva.Layer
              Rect = reactKonva.Rect
              Circle = reactKonva.Circle
              Text = reactKonva.Text
              Line = reactKonva.Line
              Transformer = reactKonva.Transformer
              Image = reactKonva.Image
              Konva = konvaModule.default || konvaModule
              console.log('Konva components loaded successfully')
              resolve()
            })
            .catch((error) => {
              console.error('Failed to load Konva:', error)
              reject(error)
            })
        })
      })
    } else {
      // Server-side fallbacks
      const Fallback = () => null
      Stage = Fallback
      Layer = Fallback
      Rect = Fallback
      Circle = Fallback
      Text = Fallback
      Line = Fallback
      Transformer = Fallback
      Image = Fallback
      Konva = {}
      resolve()
    }
  })

  return konvaPromise
}

// Hook to load Konva components
export const useKonva = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadKonva().then(() => {
        setIsLoaded(true)
      }).catch((error) => {
        console.error('Failed to load Konva in hook:', error)
      })
    }
  }, [])

  return { isLoaded }
}

export { Stage, Layer, Rect, Circle, Text, Line, Transformer, Image, Konva, loadKonva }
