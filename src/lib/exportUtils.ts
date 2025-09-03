import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf'
  quality?: number
  scale?: number
  filename?: string
}

export const exportCanvasAsImage = async (
  canvasElement: HTMLElement,
  options: ExportOptions
): Promise<void> => {
  const {
    format = 'png',
    quality = 1,
    scale = 2,
    filename = `identity-card-${Date.now()}`,
  } = options

  try {
    let dataUrl: string

    const exportOptions = {
      quality,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
    }

    if (format === 'png') {
      dataUrl = await toPng(canvasElement, exportOptions)
    } else {
      dataUrl = await toJpeg(canvasElement, {
        ...exportOptions,
        quality: quality * 0.9, // Slightly reduce quality for JPEG
      })
    }

    // Create download link
    const link = document.createElement('a')
    link.download = `${filename}.${format}`
    link.href = dataUrl
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting image:', error)
    throw new Error(`Failed to export as ${format.toUpperCase()}`)
  }
}

export const exportCanvasAsPDF = async (
  canvasElement: HTMLElement,
  options: {
    filename?: string
    scale?: number
    orientation?: 'portrait' | 'landscape'
    format?: 'a4' | 'a5' | 'credit-card'
  } = {}
): Promise<void> => {
  const {
    filename = `identity-card-${Date.now()}`,
    scale = 2,
    orientation = 'landscape',
    format = 'credit-card',
  } = options

  try {
    // Convert canvas to image
    const dataUrl = await toPng(canvasElement, {
      quality: 1,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
    })

    // Create PDF
    let pdf: jsPDF

    if (format === 'credit-card') {
      // Credit card dimensions: 85.60 × 53.98 mm
      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [85.6, 53.98],
      })
    } else if (format === 'a5') {
      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a5',
      })
    } else {
      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      })
    }

    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Add image to PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)

    // Save PDF
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw new Error('Failed to export as PDF')
  }
}

export const saveProjectAsJSON = (projectData: { shapes: unknown[]; canvasSettings: unknown }, filename?: string): void => {
  const dataStr = JSON.stringify(projectData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${filename || 'identity-project'}.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(link.href)
}

export const loadProjectFromJSON = (): Promise<{ shapes: unknown[]; canvasSettings: unknown }> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          resolve(data)
        } catch {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    }
    
    input.click()
  })
}

export const getOptimalExportSettings = (
  canvasWidth: number,
  canvasHeight: number
): { scale: number; quality: number } => {
  // Calculate optimal settings based on canvas size
  const totalPixels = canvasWidth * canvasHeight
  
  if (totalPixels > 1000000) {
    // Large canvas - reduce scale to prevent memory issues
    return { scale: 1.5, quality: 0.9 }
  } else if (totalPixels > 500000) {
    // Medium canvas
    return { scale: 2, quality: 0.95 }
  } else {
    // Small canvas - can afford higher quality
    return { scale: 3, quality: 1 }
  }
}

export const previewExport = async (
  canvasElement: HTMLElement,
  format: 'png' | 'jpg' = 'png'
): Promise<string> => {
  try {
    const dataUrl = format === 'png' 
      ? await toPng(canvasElement, { quality: 0.8, pixelRatio: 1 })
      : await toJpeg(canvasElement, { quality: 0.8, pixelRatio: 1 })
    
    return dataUrl
  } catch (error) {
    console.error('Error generating preview:', error)
    throw new Error('Failed to generate preview')
  }
}
