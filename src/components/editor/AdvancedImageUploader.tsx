'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Upload, X, User, Square, RectangleHorizontal, RectangleVertical, Camera } from 'lucide-react'
import NextImage from 'next/image'

interface AdvancedImageUploaderProps {
  isOpen: boolean
  onClose: () => void
}

interface ImageSizeOption {
  name: string
  width: number
  height: number
  aspectRatio: string
  description: string
  icon: React.ElementType
}

const IMAGE_SIZE_OPTIONS: ImageSizeOption[] = [
  {
    name: 'مربع 1:1',
    width: 200,
    height: 200,
    aspectRatio: '1:1',
    description: 'مثالي للصور الشخصية والبروفايل',
    icon: Square
  },
  {
    name: 'صورة شخصية 2:3',
    width: 160,
    height: 240,
    aspectRatio: '2:3',
    description: 'الحجم التقليدي للصور الشخصية',
    icon: RectangleVertical
  },
  {
    name: 'صورة شخصية 3:4',
    width: 180,
    height: 240,
    aspectRatio: '3:4',
    description: 'حجم شائع للهويات الرسمية',
    icon: RectangleVertical
  },
  {
    name: 'باسبورت 35×45',
    width: 140,
    height: 180,
    aspectRatio: '35:45',
    description: 'مقاس صورة الباسبورت القياسي',
    icon: RectangleVertical
  },
  {
    name: 'هوية 30×40',
    width: 120,
    height: 160,
    aspectRatio: '30:40',
    description: 'مقاس صورة الهوية الوطنية',
    icon: RectangleVertical
  },
  {
    name: 'أفقي 4:3',
    width: 240,
    height: 180,
    aspectRatio: '4:3',
    description: 'للشعارات والصور الأفقية',
    icon: RectangleHorizontal
  },
  {
    name: 'عريض 16:9',
    width: 320,
    height: 180,
    aspectRatio: '16:9',
    description: 'للبانرات والعناوين',
    icon: RectangleHorizontal
  },
  {
    name: 'حجم مخصص',
    width: 200,
    height: 200,
    aspectRatio: 'مخصص',
    description: 'اختر أي حجم تريده',
    icon: Camera
  }
]

const AdvancedImageUploader: React.FC<AdvancedImageUploaderProps> = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<ImageSizeOption>(IMAGE_SIZE_OPTIONS[0])
  const [customSize, setCustomSize] = useState({ width: 200, height: 200 })
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addShape } = useEditorStore()

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Resize image to specific dimensions
  const resizeImage = (imageUrl: string, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        // Calculate scaling to maintain aspect ratio and fill the target size
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        
        // Center the image
        const x = (targetWidth - scaledWidth) / 2
        const y = (targetHeight - scaledHeight) / 2
        
        // Fill background with white (for passport-style photos)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        
        // Draw the image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        resolve(canvas.toDataURL('image/png', 0.9))
      }
      img.src = imageUrl
    })
  }

  // Process uploaded files
  const handleFiles = useCallback(async (files: FileList) => {
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
  }, [])

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
  }, [handleFiles])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  // Show size selector for an image
  const selectImageForSizing = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setShowSizeSelector(true)
  }

  // Add image to canvas with selected size
  const addImageToCanvas = async (imageUrl: string, sizeOption: ImageSizeOption) => {
    const targetWidth = sizeOption.name === 'حجم مخصص' ? customSize.width : sizeOption.width
    const targetHeight = sizeOption.name === 'حجم مخصص' ? customSize.height : sizeOption.height

    try {
      // For person photos, resize to exact dimensions
      const finalImageUrl = sizeOption.name.includes('شخصية') || sizeOption.name.includes('باسبورت') || sizeOption.name.includes('هوية')
        ? await resizeImage(imageUrl, targetWidth, targetHeight)
        : imageUrl

      // Add image shape to canvas
      const imageShape = {
        type: 'image' as const,
        position: { x: 100, y: 100 },
        size: { width: targetWidth, height: targetHeight },
        rotation: 0,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0,
        visible: true,
        locked: false,
        zIndex: Date.now(),
        imageUrl: finalImageUrl,
        cropX: 0,
        cropY: 0,
        cropWidth: targetWidth,
        cropHeight: targetHeight,
        opacity: 1,
        cornerRadius: sizeOption.name.includes('شخصية') ? 8 : 0,
        filters: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          sepia: 0,
          grayscale: 0,
        },
        shadowEnabled: false,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      }

      addShape(imageShape)
      setShowSizeSelector(false)
      setCurrentImage(null)
      onClose()
    } catch (error) {
      console.error('Error adding image:', error)
      alert('خطأ في إضافة الصورة')
    }
  }

  // Quick add with default size
  const quickAddImage = (imageUrl: string) => {
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
        },
        shadowEnabled: false,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
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

  // Generate placeholder image for personal photos
  const generatePersonPlaceholder = (width: number, height: number): string => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = width
    canvas.height = height
    
    // Background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    
    // Border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, width - 2, height - 2)
    
    // Person icon
    const centerX = width / 2
    const centerY = height / 2
    const iconSize = Math.min(width, height) * 0.3
    
    ctx.fillStyle = '#9ca3af'
    
    // Head (circle)
    ctx.beginPath()
    ctx.arc(centerX, centerY - iconSize * 0.3, iconSize * 0.3, 0, 2 * Math.PI)
    ctx.fill()
    
    // Body (rounded rectangle)
    ctx.beginPath()
    ctx.roundRect(centerX - iconSize * 0.4, centerY + iconSize * 0.1, iconSize * 0.8, iconSize * 0.6, iconSize * 0.1)
    ctx.fill()
    
    // Text
    ctx.fillStyle = '#6b7280'
    ctx.font = `${Math.max(12, width * 0.08)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('صورة شخصية', centerX, height - 15)
    
    return canvas.toDataURL('image/png')
  }

  // Sample stock images
  const stockImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'https://www.marefa.org/w/images/thumb/4/48/Outdoors-man-portrait_(cropped).jpg/1200px-Outdoors-man-portrait_(cropped).jpg',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  ]

  if (!isOpen) return null

  // Size selector modal
  if (showSizeSelector && currentImage) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">اختر حجم الصورة</h2>
            <button
              onClick={() => setShowSizeSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {IMAGE_SIZE_OPTIONS.map((option, index) => {
                const IconComponent = option.icon
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedSize.name === option.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSize(option)}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <IconComponent className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-center text-gray-900 mb-1">
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-2">
                      {option.aspectRatio}
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      {option.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {selectedSize.name === 'حجم مخصص' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">تحديد الحجم المخصص</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العرض (بكسل)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="1000"
                      value={customSize.width}
                      onChange={(e) => setCustomSize(prev => ({
                        ...prev,
                        width: parseInt(e.target.value) || 200
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الارتفاع (بكسل)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="1000"
                      value={customSize.height}
                      onChange={(e) => setCustomSize(prev => ({
                        ...prev,
                        height: parseInt(e.target.value) || 200
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center mb-4">
              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <NextImage
                  src={currentImage}
                  alt="معاينة الصورة"
                  width={selectedSize.name === 'حجم مخصص' ? customSize.width : selectedSize.width}
                  height={selectedSize.name === 'حجم مخصص' ? customSize.height : selectedSize.height}
                  className="max-w-full max-h-full object-cover rounded"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSizeSelector(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => addImageToCanvas(currentImage, selectedSize)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إضافة الصورة
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main uploader modal
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">إضافة صورة متقدمة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Personal Photo Templates */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">قوالب الصور الشخصية الجاهزة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {IMAGE_SIZE_OPTIONS.slice(0, 5).map((option, index) => {
                const placeholderUrl = generatePersonPlaceholder(option.width, option.height)
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      const shape = {
                        type: 'person' as const,
                        position: { x: 100, y: 100 },
                        size: { width: option.width, height: option.height },
                        rotation: 0,
                        visible: true,
                        locked: false,
                        zIndex: Date.now(),
                        src: placeholderUrl,
                        placeholder: true,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: '#d1d5db',
                        opacity: 1,
                        shadowEnabled: false,
                        shadowColor: '#000000',
                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                      }
                      addShape(shape)
                      onClose()
                    }}
                  >
                    <div className="w-full aspect-[3/4] mb-2 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-xs text-center text-gray-900">
                      {option.name}
                    </h4>
                    <p className="text-xs text-gray-500 text-center">
                      {option.aspectRatio}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <NextImage
                      src={imageUrl}
                      alt={`صورة مرفوعة ${index + 1}`}
                      width={128}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                      <button
                        onClick={() => selectImageForSizing(imageUrl)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded mb-1 hover:bg-blue-600"
                      >
                        تحديد الحجم
                      </button>
                      <button
                        onClick={() => quickAddImage(imageUrl)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        إضافة سريعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">صور جاهزة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stockImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <NextImage
                    src={imageUrl}
                    alt={`صورة جاهزة ${index + 1}`}
                    width={128}
                    height={128}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                    <button
                      onClick={() => selectImageForSizing(imageUrl)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded mb-1 hover:bg-blue-600"
                    >
                      تحديد الحجم
                    </button>
                    <button
                      onClick={() => quickAddImage(imageUrl)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      إضافة سريعة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">نصائح لاستخدام الصور:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• اختر "تحديد الحجم" للصور الشخصية للحصول على المقاس المناسب</li>
              <li>• استخدم "إضافة سريعة" للصور العادية والشعارات</li>
              <li>• للبطاقات الرسمية، استخدم الأحجام القياسية المحددة مسبقاً</li>
              <li>• يمكن تعديل الصورة بعد الإضافة من خلال لوحة الخصائص</li>
              <li>• استخدم صور عالية الجودة للحصول على أفضل نتائج</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedImageUploader
