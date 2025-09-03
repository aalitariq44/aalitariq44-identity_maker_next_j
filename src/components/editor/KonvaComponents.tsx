'use client'

// This file dynamically imports Konva components only on the client side
import { ComponentType } from 'react'

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

// Function to dynamically load Konva components
const loadKonva = (): Promise<void> => {
  if (konvaPromise) return konvaPromise

  konvaPromise = new Promise((resolve, reject) => {
    // Only import Konva components if we're on the client side
    if (typeof window !== 'undefined') {
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

// Initialize Konva loading
loadKonva()

export { Stage, Layer, Rect, Circle, Text, Line, Transformer, Image, Konva, loadKonva }
