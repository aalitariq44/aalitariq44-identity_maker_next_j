'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Upload, X, Image as ImageIcon, FileImage, Download } from 'lucide-react'

interface ImageUploaderProps {
  isOpen: boolean
  onClose: () => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addShape } = useEditorStore()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  // Process uploaded files
  const handleFiles = async (files: FileList) => {
    setUploading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت.`)
        continue
      }

      try {
        const imageUrl = await fileToBase64(file)
        newImages.push(imageUrl)
      } catch (error) {
        console.error('Error processing image:', error)
        alert(`خطأ في معالجة الصورة ${file.name}`)
      }
    }

    setUploadedImages(prev => [...prev, ...newImages])
    setUploading(false)
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Add image to canvas
  const addImageToCanvas = (imageUrl: string) => {
    // Create an image object to get dimensions
    const img = new Image()
    img.onload = () => {
      const maxWidth = 300
      const maxHeight = 300
      
      let { width, height } = img
      
      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        if (width > height) {
          width = maxWidth
          height = maxWidth / aspectRatio
        } else {
          height = maxHeight
          width = maxHeight * aspectRatio
        }
      }

      // Add image shape to canvas
      const imageShape = {
        type: 'image' as const,
        position: { x: 100, y: 100 },
        size: { width, height },
        rotation: 0,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0,
        visible: true,
        locked: false,
        zIndex: Date.now(),
        imageUrl,
        // Image-specific properties
        cropX: 0,
        cropY: 0,
        cropWidth: img.width,
        cropHeight: img.height,
        opacity: 1,
        cornerRadius: 0,
        filters: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          sepia: 0,
          grayscale: 0,
        }
      }

      addShape(imageShape)
    }
    img.src = imageUrl
    onClose()
  }

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Sample stock images (you can replace with actual stock image URLs)
  const stockImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b1fc?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=face',
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">إضافة صورة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Area */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">رفع صورة جديدة</h3>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">جاري رفع الصور...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    اسحب الصور هنا أو انقر للاختيار
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    يدعم JPG, PNG, GIF, WEBP (حتى 10 ميجابايت)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    اختيار الصور
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الصور المرفوعة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`صورة مرفوعة ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => addImageToCanvas(imageUrl)}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                      <span className="text-white text-sm font-medium">انقر للإضافة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">صور جاهزة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stockImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`صورة جاهزة ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => addImageToCanvas(imageUrl)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                    <span className="text-white text-xs font-medium">انقر للإضافة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">نصائح لاستخدام الصور:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• استخدم صور عالية الجودة للحصول على أفضل نتائج الطباعة</li>
              <li>• تأكد من أن الصور واضحة وغير ضبابية</li>
              <li>• للبطاقات الرسمية، استخدم صور خلفية بيضاء أو رمادية فاتحة</li>
              <li>• يمكنك تعديل حجم وموضع الصورة بعد إضافتها للقماش</li>
              <li>• استخدم تنسيق PNG للصور الشفافة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
