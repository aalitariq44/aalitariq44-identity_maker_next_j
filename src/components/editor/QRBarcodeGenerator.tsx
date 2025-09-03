'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { X, QrCode, Scan, Link, Phone, Mail, Wifi, CreditCard, MapPin, Calendar, User, FileText } from 'lucide-react'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

interface QRBarcodeGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

interface QRTemplate {
  name: string
  icon: React.ElementType
  description: string
  template: string
  placeholder: string
  fields?: { name: string; label: string; type: string; placeholder: string }[]
}

const QR_TEMPLATES: QRTemplate[] = [
  {
    name: 'نص عادي',
    icon: FileText,
    description: 'أي نص تريد تحويله إلى QR',
    template: '{text}',
    placeholder: 'أدخل النص المراد تحويله',
    fields: [
      { name: 'text', label: 'النص', type: 'textarea', placeholder: 'أدخل النص هنا...' }
    ]
  },
  {
    name: 'رابط موقع',
    icon: Link,
    description: 'رابط لموقع إلكتروني',
    template: '{url}',
    placeholder: 'https://example.com',
    fields: [
      { name: 'url', label: 'الرابط', type: 'url', placeholder: 'https://example.com' }
    ]
  },
  {
    name: 'رقم هاتف',
    icon: Phone,
    description: 'رقم هاتف للاتصال المباشر',
    template: 'tel:{phone}',
    placeholder: '+966501234567',
    fields: [
      { name: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+966501234567' }
    ]
  },
  {
    name: 'بريد إلكتروني',
    icon: Mail,
    description: 'عنوان بريد إلكتروني',
    template: 'mailto:{email}?subject={subject}&body={body}',
    placeholder: 'user@example.com',
    fields: [
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'user@example.com' },
      { name: 'subject', label: 'موضوع الرسالة (اختياري)', type: 'text', placeholder: 'موضوع الرسالة' },
      { name: 'body', label: 'نص الرسالة (اختياري)', type: 'textarea', placeholder: 'نص الرسالة' }
    ]
  },
  {
    name: 'شبكة WiFi',
    icon: Wifi,
    description: 'معلومات الاتصال بشبكة WiFi',
    template: 'WIFI:T:{security};S:{ssid};P:{password};H:{hidden};;',
    placeholder: 'اسم الشبكة وكلمة المرور',
    fields: [
      { name: 'ssid', label: 'اسم الشبكة (SSID)', type: 'text', placeholder: 'اسم الشبكة' },
      { name: 'password', label: 'كلمة المرور', type: 'password', placeholder: 'كلمة المرور' },
      { name: 'security', label: 'نوع الأمان', type: 'select', placeholder: 'WPA' },
      { name: 'hidden', label: 'شبكة مخفية', type: 'checkbox', placeholder: 'false' }
    ]
  },
  {
    name: 'بطاقة شخصية',
    icon: User,
    description: 'معلومات شخصية vCard',
    template: 'BEGIN:VCARD\nVERSION:3.0\nFN:{fullName}\nORG:{organization}\nTITLE:{title}\nTEL:{phone}\nEMAIL:{email}\nURL:{website}\nEND:VCARD',
    placeholder: 'معلومات البطاقة الشخصية',
    fields: [
      { name: 'fullName', label: 'الاسم الكامل', type: 'text', placeholder: 'أحمد محمد علي' },
      { name: 'organization', label: 'الشركة/المؤسسة', type: 'text', placeholder: 'شركة المثال' },
      { name: 'title', label: 'المنصب', type: 'text', placeholder: 'مدير التسويق' },
      { name: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+966501234567' },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'ahmed@example.com' },
      { name: 'website', label: 'الموقع الإلكتروني', type: 'url', placeholder: 'https://example.com' }
    ]
  },
  {
    name: 'موقع جغرافي',
    icon: MapPin,
    description: 'إحداثيات GPS لموقع جغرافي',
    template: 'geo:{latitude},{longitude}?q={latitude},{longitude}({label})',
    placeholder: 'موقع GPS',
    fields: [
      { name: 'latitude', label: 'خط العرض', type: 'number', placeholder: '24.7136' },
      { name: 'longitude', label: 'خط الطول', type: 'number', placeholder: '46.6753' },
      { name: 'label', label: 'تسمية الموقع', type: 'text', placeholder: 'الرياض، السعودية' }
    ]
  },
  {
    name: 'حدث التقويم',
    icon: Calendar,
    description: 'حدث يمكن إضافته للتقويم',
    template: 'BEGIN:VEVENT\nSUMMARY:{summary}\nDTSTART:{startDate}\nDTEND:{endDate}\nDESCRIPTION:{description}\nLOCATION:{location}\nEND:VEVENT',
    placeholder: 'معلومات الحدث',
    fields: [
      { name: 'summary', label: 'عنوان الحدث', type: 'text', placeholder: 'اجتماع مهم' },
      { name: 'startDate', label: 'تاريخ البداية', type: 'datetime-local', placeholder: '' },
      { name: 'endDate', label: 'تاريخ النهاية', type: 'datetime-local', placeholder: '' },
      { name: 'description', label: 'وصف الحدث', type: 'textarea', placeholder: 'تفاصيل الحدث' },
      { name: 'location', label: 'مكان الحدث', type: 'text', placeholder: 'قاعة الاجتماعات' }
    ]
  }
]

const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'Code 128', description: 'الأكثر شيوعاً، يدعم كل الأحرف' },
  { value: 'CODE39', label: 'Code 39', description: 'يدعم الأحرف والأرقام' },
  { value: 'EAN13', label: 'EAN-13', description: 'للمنتجات التجارية (13 رقم)' },
  { value: 'EAN8', label: 'EAN-8', description: 'للمنتجات الصغيرة (8 أرقام)' },
  { value: 'UPC', label: 'UPC', description: 'النظام الأمريكي للمنتجات' },
  { value: 'ITF14', label: 'ITF-14', description: 'للشحن والتوزيع' }
]

const QRBarcodeGenerator: React.FC<QRBarcodeGeneratorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr')
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(QR_TEMPLATES[0])
  const [qrData, setQrData] = useState('')
  const [qrOptions, setQrOptions] = useState({
    size: 200,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H'
  })
  const [barcodeData, setBarcodeData] = useState('')
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128')
  const [barcodeOptions, setBarcodeOptions] = useState({
    width: 300,
    height: 100,
    fontSize: 14,
    textMargin: 2,
    displayValue: true,
    background: '#FFFFFF',
    lineColor: '#000000'
  })
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { addShape } = useEditorStore()

  // Generate QR Code
  const generateQR = useCallback(async (data: string) => {
    if (!data.trim()) return null
    
    try {
      const qrCodeUrl = await QRCode.toDataURL(data, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      })
      return qrCodeUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }, [qrOptions])

  // Generate Barcode
  const generateBarcode = useCallback((data: string) => {
    if (!data.trim()) return null
    
    try {
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, data, {
        format: barcodeFormat,
        width: 2,
        height: barcodeOptions.height,
        fontSize: barcodeOptions.fontSize,
        textMargin: barcodeOptions.textMargin,
        displayValue: barcodeOptions.displayValue,
        background: barcodeOptions.background,
        lineColor: barcodeOptions.lineColor
      })
      
      // Resize canvas to exact width
      const finalCanvas = document.createElement('canvas')
      const ctx = finalCanvas.getContext('2d')!
      finalCanvas.width = barcodeOptions.width
      finalCanvas.height = barcodeOptions.height + (barcodeOptions.displayValue ? barcodeOptions.fontSize + barcodeOptions.textMargin * 2 : 0)
      
      ctx.fillStyle = barcodeOptions.background
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)
      
      // Center the barcode
      const x = (finalCanvas.width - canvas.width) / 2
      ctx.drawImage(canvas, x, 0)
      
      return finalCanvas.toDataURL()
    } catch (error) {
      console.error('Error generating barcode:', error)
      return null
    }
  }, [barcodeFormat, barcodeOptions])

  // Process template with form data
  const processTemplate = useCallback((template: QRTemplate) => {
    let result = template.template
    
    if (template.fields) {
      template.fields.forEach(field => {
        const value = formData[field.name] || ''
        
        // Special handling for different field types
        if (field.type === 'datetime-local' && value) {
          // Convert to YYYYMMDDTHHMMSS format for calendar events
          const date = new Date(value)
          const formatted = date.toISOString().replace(/[-:]/g, '').split('.')[0]
          result = result.replace(`{${field.name}}`, formatted)
        } else if (field.type === 'checkbox') {
          result = result.replace(`{${field.name}}`, value === 'true' ? 'true' : 'false')
        } else if (field.type === 'select' && field.name === 'security') {
          result = result.replace(`{${field.name}}`, value || 'WPA')
        } else {
          result = result.replace(`{${field.name}}`, value)
        }
      })
    } else {
      result = result.replace('{text}', formData.text || '')
    }
    
    return result
  }, [formData])

  // Update QR when data changes
  useEffect(() => {
    if (activeTab === 'qr') {
      const data = selectedTemplate.name === 'نص عادي' ? qrData : processTemplate(selectedTemplate)
      if (data.trim()) {
        generateQR(data).then(setGeneratedQR)
      } else {
        setGeneratedQR(null)
      }
    }
  }, [activeTab, qrData, selectedTemplate, formData, processTemplate, generateQR])

  // Update barcode when data changes
  useEffect(() => {
    if (activeTab === 'barcode' && barcodeData.trim()) {
      const result = generateBarcode(barcodeData)
      setGeneratedBarcode(result)
    } else {
      setGeneratedBarcode(null)
    }
  }, [activeTab, barcodeData, barcodeFormat, barcodeOptions, generateBarcode])

  // Add QR to canvas
  const addQRToCanvas = () => {
    if (!generatedQR) return
    
    const shape = {
      type: 'qr' as const,
      position: { x: 100, y: 100 },
      size: { width: qrOptions.size, height: qrOptions.size },
      rotation: 0,
      visible: true,
      locked: false,
      zIndex: Date.now(),
      data: selectedTemplate.name === 'نص عادي' ? qrData : processTemplate(selectedTemplate),
      backgroundColor: qrOptions.color.light,
      foregroundColor: qrOptions.color.dark,
      opacity: 1,
      src: generatedQR
    }
    
    addShape(shape)
    onClose()
  }

  // Add barcode to canvas
  const addBarcodeToCanvas = () => {
    if (!generatedBarcode) return
    
    const shape = {
      type: 'barcode' as const,
      position: { x: 100, y: 100 },
      size: { width: barcodeOptions.width, height: barcodeOptions.height + (barcodeOptions.displayValue ? barcodeOptions.fontSize + barcodeOptions.textMargin * 2 : 0) },
      rotation: 0,
      visible: true,
      locked: false,
      zIndex: Date.now(),
      data: barcodeData,
      format: barcodeFormat,
      backgroundColor: barcodeOptions.background,
      lineColor: barcodeOptions.lineColor,
      opacity: 1,
      src: generatedBarcode
    }
    
    addShape(shape)
    onClose()
  }

  // Handle form field change
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">مولد QR والباركود المتقدم</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'qr'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <QrCode className="w-5 h-5 inline-block ml-2" />
              QR Code
            </button>
            <button
              onClick={() => setActiveTab('barcode')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'barcode'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Scan className="w-5 h-5 inline-block ml-2" />
              Barcode
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div>
              {activeTab === 'qr' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات QR Code</h3>
                  
                  {/* QR Templates */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المحتوى
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {QR_TEMPLATES.map((template, index) => {
                        const IconComponent = template.icon
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              selectedTemplate.name === template.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <div className="flex items-center">
                              <IconComponent className="w-5 h-5 text-gray-600 ml-2" />
                              <div>
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <p className="text-xs text-gray-500">{template.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Template Fields */}
                  <div className="mb-6">
                    {selectedTemplate.name === 'نص عادي' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          النص المراد تحويله
                        </label>
                        <textarea
                          value={qrData}
                          onChange={(e) => setQrData(e.target.value)}
                          placeholder={selectedTemplate.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                        />
                      </div>
                    ) : selectedTemplate.fields ? (
                      <div className="space-y-4">
                        {selectedTemplate.fields.map((field, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                value={formData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                              />
                            ) : field.type === 'select' && field.name === 'security' ? (
                              <select
                                value={formData[field.name] || 'WPA'}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">بدون كلمة مرور</option>
                              </select>
                            ) : field.type === 'checkbox' ? (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData[field.name] === 'true'}
                                  onChange={(e) => handleFieldChange(field.name, e.target.checked.toString())}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="mr-2 text-sm text-gray-700">شبكة مخفية</span>
                              </div>
                            ) : (
                              <input
                                type={field.type}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* QR Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">خيارات التصميم</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الحجم: {qrOptions.size}px
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="400"
                          value={qrOptions.size}
                          onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الهامش: {qrOptions.margin}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={qrOptions.margin}
                          onChange={(e) => setQrOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          لون الأمام
                        </label>
                        <input
                          type="color"
                          value={qrOptions.color.dark}
                          onChange={(e) => setQrOptions(prev => ({ 
                            ...prev, 
                            color: { ...prev.color, dark: e.target.value } 
                          }))}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          لون الخلفية
                        </label>
                        <input
                          type="color"
                          value={qrOptions.color.light}
                          onChange={(e) => setQrOptions(prev => ({ 
                            ...prev, 
                            color: { ...prev.color, light: e.target.value } 
                          }))}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        مستوى تصحيح الأخطاء
                      </label>
                      <select
                        value={qrOptions.errorCorrectionLevel}
                        onChange={(e) => setQrOptions(prev => ({ 
                          ...prev, 
                          errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="L">منخفض (7%)</option>
                        <option value="M">متوسط (15%)</option>
                        <option value="Q">عالي (25%)</option>
                        <option value="H">أعلى (30%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات Barcode</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البيانات المراد ترميزها
                    </label>
                    <input
                      type="text"
                      value={barcodeData}
                      onChange={(e) => setBarcodeData(e.target.value)}
                      placeholder="123456789012"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الباركود
                    </label>
                    <div className="space-y-2">
                      {BARCODE_FORMATS.map((format, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            barcodeFormat === format.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBarcodeFormat(format.value)}
                        >
                          <h4 className="font-medium">{format.label}</h4>
                          <p className="text-sm text-gray-500">{format.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barcode Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">خيارات التصميم</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          العرض: {barcodeOptions.width}px
                        </label>
                        <input
                          type="range"
                          min="200"
                          max="500"
                          value={barcodeOptions.width}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الارتفاع: {barcodeOptions.height}px
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={barcodeOptions.height}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          لون الخطوط
                        </label>
                        <input
                          type="color"
                          value={barcodeOptions.lineColor}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, lineColor: e.target.value }))}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          لون الخلفية
                        </label>
                        <input
                          type="color"
                          value={barcodeOptions.background}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, background: e.target.value }))}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={barcodeOptions.displayValue}
                        onChange={(e) => setBarcodeOptions(prev => ({ ...prev, displayValue: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="mr-2 text-sm text-gray-700">عرض النص أسفل الباركود</span>
                    </div>

                    {barcodeOptions.displayValue && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          حجم الخط: {barcodeOptions.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={barcodeOptions.fontSize}
                          onChange={(e) => setBarcodeOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة النتيجة</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                {activeTab === 'qr' ? (
                  generatedQR ? (
                    <div>
                      <img
                        src={generatedQR}
                        alt="QR Code"
                        className="mx-auto mb-4 border border-gray-200 rounded"
                        style={{ width: Math.min(qrOptions.size, 200), height: Math.min(qrOptions.size, 200) }}
                      />
                      <button
                        onClick={addQRToCanvas}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        إضافة QR للتصميم
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>أدخل البيانات لإنتاج QR Code</p>
                    </div>
                  )
                ) : (
                  generatedBarcode ? (
                    <div>
                      <img
                        src={generatedBarcode}
                        alt="Barcode"
                        className="mx-auto mb-4 border border-gray-200 rounded"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                      <button
                        onClick={addBarcodeToCanvas}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        إضافة Barcode للتصميم
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Scan className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>أدخل البيانات لإنتاج Barcode</p>
                    </div>
                  )
                )}
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">نصائح مهمة:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {activeTab === 'qr' ? (
                    <>
                      <li>• تأكد من اختبار QR Code قبل الطباعة</li>
                      <li>• استخدم مستوى تصحيح أخطاء أعلى للطباعة</li>
                      <li>• تجنب الألوان المتقاربة للأمام والخلفية</li>
                      <li>• احتفظ بالهامش حول QR Code</li>
                    </>
                  ) : (
                    <>
                      <li>• تأكد من صحة البيانات وتطابقها مع النوع المختار</li>
                      <li>• EAN-13 يتطلب 13 رقم بالضبط</li>
                      <li>• Code 128 يدعم كل الأحرف والأرقام</li>
                      <li>• استخدم خلفية فاتحة وخطوط داكنة</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRBarcodeGenerator
